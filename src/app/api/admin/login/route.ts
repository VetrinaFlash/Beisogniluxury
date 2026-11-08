import { checkPassword, makeSession } from "@/lib/auth";
import { adminHash } from "@/lib/config";

export async function GET() {
  return Response.json({ needsSetup: !(await adminHash()) });
}

export async function POST(req: Request) {
  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  if (!password || !(await checkPassword(password))) {
    await new Promise((r) => setTimeout(r, 600));
    return Response.json({ error: "Password errata" }, { status: 401 });
  }
  const token = await makeSession();
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json", "Set-Cookie": `admin=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 86400}` },
  });
}

export async function DELETE() {
  return new Response(JSON.stringify({ ok: true }), { headers: { "Set-Cookie": "admin=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0" } });
}
