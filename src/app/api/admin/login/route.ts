import { checkPassword, makeSession } from "@/lib/auth";
import { adminHash, ensureSchema } from "@/lib/config";
import { env } from "@/lib/env";

export async function GET() {
  return Response.json({ needsSetup: !(await adminHash()) });
}

export async function POST(req: Request) {
  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  await ensureSchema();
  const db = env().DB;
  const st = await db.prepare("SELECT value FROM settings WHERE key='login_fail'").first<{ value: string }>();
  const [cnt, since] = (st?.value ?? "0:0").split(":").map(Number);
  const fresh = Date.now() - since < 15 * 60 * 1000;
  if (fresh && cnt >= 8) return Response.json({ error: "Troppi tentativi, riprova tra qualche minuto" }, { status: 429 });
  if (!password || !(await checkPassword(password))) {
    await db.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES ('login_fail',?)").bind(`${fresh ? cnt + 1 : 1}:${fresh ? since : Date.now()}`).run();
    await new Promise((r) => setTimeout(r, 600));
    return Response.json({ error: "Password errata" }, { status: 401 });
  }
  await db.prepare("DELETE FROM settings WHERE key='login_fail'").run();
  const token = await makeSession();
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json", "Set-Cookie": `admin=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 86400}` },
  });
}

export async function DELETE() {
  return new Response(JSON.stringify({ ok: true }), { headers: { "Set-Cookie": "admin=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0" } });
}
