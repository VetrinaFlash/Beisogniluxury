import { env } from "@/lib/env";
import { isAdmin, unauthorized } from "@/lib/auth";
import { validDate, nightsBetween } from "@/lib/dates";

export async function GET(req: Request) {
  if (!(await isAdmin(req))) return unauthorized();
  const r = await env().DB.prepare("SELECT * FROM season_prices ORDER BY from_date").all();
  return Response.json({ seasons: r.results });
}

export async function POST(req: Request) {
  if (!(await isAdmin(req))) return unauthorized();
  const b = (await req.json()) as { roomId: string; from: string; to: string; price: number; minNights?: number };
  if (!validDate(b.from) || !validDate(b.to) || nightsBetween(b.from, b.to) < 1) return Response.json({ error: "Date non valide" }, { status: 400 });
  const cents = Math.round(Number(b.price) * 100);
  if (!Number.isFinite(cents) || cents <= 0) return Response.json({ error: "Prezzo non valido" }, { status: 400 });
  const db = env().DB;
  const rooms = b.roomId === "all" ? (await db.prepare("SELECT id FROM rooms").all<{ id: string }>()).results.map((x) => x.id) : [b.roomId];
  await db.batch(rooms.map((id) => db.prepare("INSERT INTO season_prices (room_id,from_date,to_date,price_cents,min_nights) VALUES (?,?,?,?,?)").bind(id, b.from, b.to, cents, b.minNights && b.minNights > 1 ? b.minNights : null)));
  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!(await isAdmin(req))) return unauthorized();
  const { id } = (await req.json()) as { id: number };
  await env().DB.prepare("DELETE FROM season_prices WHERE id=?").bind(id).run();
  return Response.json({ ok: true });
}
