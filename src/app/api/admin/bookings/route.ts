import { env } from "@/lib/env";
import { isAdmin, unauthorized } from "@/lib/auth";
import { sendEmail } from "@/lib/notify";
import { eur } from "@/lib/dates";

const esc = (s: string) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

export async function GET(req: Request) {
  if (!(await isAdmin(req))) return unauthorized();
  const db = env().DB;
  const [bookings, rooms, blocks] = await Promise.all([
    db.prepare("SELECT b.*, r.name AS room_name FROM bookings b JOIN rooms r ON r.id=b.room_id ORDER BY b.created_at DESC LIMIT 300").all(),
    db.prepare("SELECT id,name FROM rooms ORDER BY sort").all(),
    db.prepare("SELECT * FROM blocks ORDER BY from_date").all(),
  ]);
  return Response.json({ bookings: bookings.results, rooms: rooms.results, blocks: blocks.results });
}

export async function PATCH(req: Request) {
  if (!(await isAdmin(req))) return unauthorized();
  const { id, status } = (await req.json()) as { id: string; status: string };
  if (!["confirmed", "rejected", "cancelled", "pending"].includes(status)) return Response.json({ error: "Stato non valido" }, { status: 400 });
  const e = env();
  const b = await e.DB.prepare("SELECT b.*, r.name AS room_name FROM bookings b JOIN rooms r ON r.id=b.room_id WHERE b.id=?").bind(id).first<any>();
  if (!b) return Response.json({ error: "Non trovata" }, { status: 404 });
  const active = (x: string) => x === "pending" || x === "confirmed";
  if (active(status) && b.status !== status) {
    // una prenotazione che torna attiva (o viene confermata) non deve sovrapporsi ad altre o a date bloccate
    const statuses = active(b.status) ? "('confirmed')" : "('pending','confirmed')";
    const clash = await e.DB.prepare(
      `SELECT (SELECT COUNT(*) FROM bookings WHERE room_id=?1 AND id<>?2 AND status IN ${statuses} AND ?3 < check_out AND ?4 > check_in) +
              (SELECT COUNT(*) FROM blocks WHERE room_id=?1 AND ?3 < to_date AND ?4 > from_date) AS n`
    ).bind(b.room_id, id, b.check_in, b.check_out).first<{ n: number }>();
    if (clash && clash.n > 0) return Response.json({ error: "Date già occupate da un'altra prenotazione o da un blocco" }, { status: 409 });
  }
  await e.DB.prepare("UPDATE bookings SET status=? WHERE id=?").bind(status, id).run();
  if (status === "confirmed")
    await sendEmail(b.guest_email, `Prenotazione confermata ${id} - ${e.SITE_NAME}`, `<p>Ciao ${esc(b.guest_name)}, la tua prenotazione di <b>${esc(b.room_name)}</b> dal ${b.check_in} al ${b.check_out} è <b>confermata</b>. Totale ${eur(b.total_cents)}, da saldare in struttura.</p>`);
  if (status === "rejected")
    await sendEmail(b.guest_email, `Richiesta ${id} non disponibile - ${e.SITE_NAME}`, `<p>Ciao ${esc(b.guest_name)}, purtroppo non riusciamo a confermare le date richieste. Contattaci su WhatsApp per trovare un'alternativa.</p>`);
  return Response.json({ ok: true });
}
