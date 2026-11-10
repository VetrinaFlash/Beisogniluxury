import { env } from "@/lib/env";
import { ensureSchema } from "@/lib/config";
import { validDate, nightsBetween, todayISO } from "@/lib/dates";
import { activeRooms, insertBookingIfFree, quote } from "@/lib/availability";
import { pushToAdmins, sendEmail } from "@/lib/notify";
import { guestEmail, ownerEmail } from "@/lib/emails";
import { roomName } from "@/lib/i18n";

export async function POST(req: Request) {
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return Response.json({ error: "Richiesta non valida" }, { status: 400 }); }
  const lang = b.lang === "en" ? "en" : "it";
  const en = lang === "en";
  const { roomId, checkIn, checkOut, name, email, phone } = b as Record<string, string>;
  const guests = Number(b.guests);
  const notes = String(b.notes ?? "").slice(0, 1000);
  if (b.website) return Response.json({ ok: true }); // honeypot
  if (!validDate(checkIn) || !validDate(checkOut) || checkIn < todayISO() || nightsBetween(checkIn, checkOut) < 1 || nightsBetween(checkIn, checkOut) > 60)
    return Response.json({ error: en ? "Invalid dates" : "Date non valide" }, { status: 400 });
  if (typeof name !== "string" || !name.trim() || name.length > 100 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email ?? "") || !/^[+\d\s()-]{6,20}$/.test(phone ?? "") || !Number.isInteger(guests) || guests < 1)
    return Response.json({ error: en ? "Please check your details" : "Controlla i dati inseriti" }, { status: 400 });
  const e = env();
  await ensureSchema();
  const recent = await e.DB.prepare("SELECT COUNT(*) n FROM bookings WHERE (guest_email=?1 OR guest_phone=?2) AND created_at > datetime('now','-1 hour')").bind(email.trim(), phone.trim()).first<{ n: number }>();
  if ((recent?.n ?? 0) >= 4) return Response.json({ error: en ? "Too many requests: please message us on WhatsApp" : "Troppe richieste ravvicinate: scrivici su WhatsApp" }, { status: 429 });
  const room = (await activeRooms(e.DB)).find((r) => r.id === roomId);
  if (!room || guests > room.capacity) return Response.json({ error: en ? "Room not available" : "Camera non disponibile" }, { status: 400 });
  const q = await quote(e.DB, room, checkIn, checkOut);
  if (q.nights < q.min_nights) return Response.json({ error: en ? `Minimum stay ${q.min_nights} nights for these dates` : `Soggiorno minimo ${q.min_nights} notti per queste date` }, { status: 400 });
  const id = crypto.randomUUID().slice(0, 8).toUpperCase();
  const row = { id, room_id: room.id, check_in: checkIn, check_out: checkOut, guests, guest_name: name.trim(), guest_email: email.trim(), guest_phone: phone.trim(), notes, total_cents: q.total_cents, lang };
  const ok = await insertBookingIfFree(e.DB, row);
  if (!ok) return Response.json({ error: en ? "This room is no longer available for these dates" : "La camera non è più disponibile per queste date" }, { status: 409 });
  const data = { ...row, room_name: room.name };
  const g = guestEmail("received", { ...data, room_name: roomName(room.name, lang) });
  const o = ownerEmail(data);
  await Promise.all([
    pushToAdmins("Nuova richiesta di prenotazione", `${row.guest_name} · ${room.name} · ${checkIn} → ${checkOut}`),
    sendEmail(row.guest_email, g.subject, g.html),
    sendEmail(e.OWNER_EMAIL, o.subject, o.html),
  ]);
  return Response.json({ ok: true, id, total_cents: q.total_cents });
}
