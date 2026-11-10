import { env } from "@/lib/env";
import { isAdmin, unauthorized } from "@/lib/auth";

export async function GET(req: Request) {
  if (!(await isAdmin(req))) return unauthorized();
  const r = await env().DB.prepare("SELECT * FROM rooms ORDER BY sort").all();
  return Response.json({ rooms: r.results });
}

export async function PATCH(req: Request) {
  if (!(await isAdmin(req))) return unauthorized();
  const b = (await req.json()) as { id: string; capacity?: number; name?: string; description?: string; description_en?: string; base_price_cents?: number; min_nights?: number; photos?: string[]; active?: number };
  const cur = await env().DB.prepare("SELECT * FROM rooms WHERE id=?").bind(b.id).first<any>();
  if (!cur) return Response.json({ error: "Camera non trovata" }, { status: 404 });
  const price = b.base_price_cents ?? cur.base_price_cents;
  if (!Number.isInteger(price) || price < 0) return Response.json({ error: "Prezzo non valido" }, { status: 400 });
  await env().DB.prepare("UPDATE rooms SET name=?,description=?,description_en=?,base_price_cents=?,min_nights=?,photos=?,active=?,capacity=? WHERE id=?")
    .bind(b.name ?? cur.name, b.description ?? cur.description, (b.description_en ?? cur.description_en ?? "").slice(0, 2000), price, b.min_nights ?? cur.min_nights, JSON.stringify(b.photos ?? JSON.parse(cur.photos)), b.active ?? cur.active, Math.min(12, Math.max(1, Math.round(b.capacity ?? cur.capacity))), b.id).run();
  return Response.json({ ok: true });
}

export async function POST(req: Request) {
  if (!(await isAdmin(req))) return unauthorized();
  const { name } = (await req.json()) as { name?: string };
  if (!name?.trim()) return Response.json({ error: "Inserisci un nome" }, { status: 400 });
  const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "camera";
  const db = env().DB;
  const id = `${slug}-${crypto.randomUUID().slice(0, 4)}`;
  const max = await db.prepare("SELECT COALESCE(MAX(sort),0) m FROM rooms").first<{ m: number }>();
  await db.prepare("INSERT INTO rooms (id,name,description,capacity,base_price_cents,sort) VALUES (?,?,?,?,?,?)").bind(id, name.trim().slice(0, 80), "Descrizione della camera.", 2, 8000, (max?.m ?? 0) + 1).run();
  return Response.json({ ok: true, id });
}

export async function DELETE(req: Request) {
  if (!(await isAdmin(req))) return unauthorized();
  const { id } = (await req.json()) as { id: string };
  const db = env().DB;
  const used = await db.prepare("SELECT COUNT(*) n FROM bookings WHERE room_id=?").bind(id).first<{ n: number }>();
  if (used && used.n > 0) {
    await db.prepare("UPDATE rooms SET active=0 WHERE id=?").bind(id).run();
    return Response.json({ ok: true, hidden: true });
  }
  await db.batch([
    db.prepare("DELETE FROM season_prices WHERE room_id=?").bind(id),
    db.prepare("DELETE FROM blocks WHERE room_id=?").bind(id),
    db.prepare("DELETE FROM rooms WHERE id=?").bind(id),
  ]);
  return Response.json({ ok: true, deleted: true });
}
