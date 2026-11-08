import { env } from "@/lib/env";
import { isAdmin, unauthorized } from "@/lib/auth";
import { validDate, nightsBetween } from "@/lib/dates";

export async function POST(req: Request) {
  if (!(await isAdmin(req))) return unauthorized();
  const { roomId, from, to, reason } = (await req.json()) as Record<string, string>;
  if (!validDate(from) || !validDate(to) || nightsBetween(from, to) < 1) return Response.json({ error: "Date non valide" }, { status: 400 });
  await env().DB.prepare("INSERT INTO blocks (room_id,from_date,to_date,reason) VALUES (?,?,?,?)").bind(roomId, from, to, (reason ?? "").slice(0, 200)).run();
  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!(await isAdmin(req))) return unauthorized();
  const { id } = (await req.json()) as { id: number };
  await env().DB.prepare("DELETE FROM blocks WHERE id=?").bind(id).run();
  return Response.json({ ok: true });
}
