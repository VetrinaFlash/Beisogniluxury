import { claimAdminPassword } from "@/lib/config";
import { hashPassword, makeSession } from "@/lib/auth";

/** Primo accesso: imposta la password admin (una sola volta). */
export async function POST(req: Request) {
  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  if (!password || password.length < 10) return Response.json({ error: "Almeno 10 caratteri" }, { status: 400 });
  const salt = [...crypto.getRandomValues(new Uint8Array(16))].map((x) => x.toString(16).padStart(2, "0")).join("");
  const ok = await claimAdminPassword(`${salt}:${await hashPassword(password, salt)}`);
  if (!ok) return Response.json({ error: "Password già impostata" }, { status: 409 });
  return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json", "Set-Cookie": `admin=${await makeSession()}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 86400}` } });
}
