import { env } from "@/lib/env";
import { isAdmin, unauthorized } from "@/lib/auth";

export async function GET(req: Request) {
  if (!(await isAdmin(req))) return unauthorized();
  const r = await env().DB.prepare("SELECT * FROM rooms ORDER BY sort").all();
  return Response.json({ rooms: r.results });
}

export async function PATCH(req: Request) {
  if (!(await isAdmin(req))) return unauthorized();
  const b = (await req.json()) as { id: string; name?: string; description?: string; base_price_cents?: number; min_nights?: number; photos?: string[]; active?: number };
  const cur = await env().DB.prepare("SELECT * FROM rooms WHERE id=?").bind(b.id).first<any>();
  if (!cur) return Response.json({ error: "Camera non trovata" }, { status: 404 });
  const price = b.base_price_cents ?? cur.base_price_cents;
  if (!Number.isInteger(price) || price < 0) return Response.json({ error: "Prezzo non valido" }, { status: 400 });
  await env().DB.prepare("UPDATE rooms SET name=?,description=?,base_price_cents=?,min_nights=?,photos=?,active=? WHERE id=?")
    .bind(b.name ?? cur.name, b.description ?? cur.description, price, b.min_nights ?? cur.min_nights, JSON.stringify(b.photos ?? JSON.parse(cur.photos)), b.active ?? cur.active, b.id).run();
  return Response.json({ ok: true });
}
