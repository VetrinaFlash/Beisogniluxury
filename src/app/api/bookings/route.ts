import { env } from "@/lib/env";
import { ensureSchema } from "@/lib/config";
import { validDate, nightsBetween, todayISO, eur } from "@/lib/dates";
import { activeRooms, insertBookingIfFree, quote } from "@/lib/availability";
import { pushToAdmins, sendEmail } from "@/lib/notify";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

export async function POST(req: Request) {
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return Response.json({ error: "Richiesta non valida" }, { status: 400 }); }
  const { roomId, checkIn, checkOut, name, email, phone } = b as Record<string, string>;
  const guests = Number(b.guests);
  const notes = String(b.notes ?? "").slice(0, 1000);
  if (b.website) return Response.json({ ok: true }); // honeypot
  if (!validDate(checkIn) || !validDate(checkOut) || checkIn < todayISO() || nightsBetween(checkIn, checkOut) < 1 || nightsBetween(checkIn, checkOut) > 60)
    return Response.json({ error: "Date non valide" }, { status: 400 });
  if (!name?.trim() || name.length > 100 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email ?? "") || !/^[+\d\s()-]{6,20}$/.test(phone ?? "") || !Number.isInteger(guests) || guests < 1)
    return Response.json({ error: "Controlla i dati inseriti" }, { status: 400 });
  const e = env();
  await ensureSchema();
  const room = (await activeRooms(e.DB)).find((r) => r.id === roomId);
  if (!room || guests > room.capacity) return Response.json({ error: "Camera non disponibile" }, { status: 400 });
  const q = await quote(e.DB, room, checkIn, checkOut);
  if (q.nights < q.min_nights) return Response.json({ error: `Soggiorno minimo ${q.min_nights} notti per queste date` }, { status: 400 });
  const id = crypto.randomUUID().slice(0, 8).toUpperCase();
  const ok = await insertBookingIfFree(e.DB, {
    id, room_id: room.id, check_in: checkIn, check_out: checkOut, guests,
    guest_name: name.trim(), guest_email: email.trim(), guest_phone: phone.trim(), notes, total_cents: q.total_cents,
  });
  if (!ok) return Response.json({ error: "La camera non è più disponibile per queste date" }, { status: 409 });
  await Promise.all([
    pushToAdmins("Nuova richiesta di prenotazione", `${name.trim()} · ${room.name} · ${checkIn} → ${checkOut}`),
    sendEmail(email.trim(), `Richiesta ricevuta ${id} - ${e.SITE_NAME}`,
      `<p>Grazie ${esc(name.trim())}, abbiamo ricevuto la tua richiesta per <b>${esc(room.name)}</b> dal ${checkIn} al ${checkOut} (${eur(q.total_cents)}).</p><p>Ti confermeremo a breve. Codice: <b>${id}</b></p>`),
    sendEmail(e.OWNER_EMAIL, `Nuova richiesta ${id}`,
      `<p>${esc(name)} (${esc(email)}, ${esc(phone)}) ha richiesto ${esc(room.name)} dal ${checkIn} al ${checkOut}, ${guests} ospiti, ${eur(q.total_cents)}.</p><p>${esc(notes)}</p>`),
  ]);
  return Response.json({ ok: true, id, total_cents: q.total_cents });
}
