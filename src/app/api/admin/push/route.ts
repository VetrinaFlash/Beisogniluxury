import { env } from "@/lib/env";
import { cfg } from "@/lib/config";
import { isAdmin, unauthorized } from "@/lib/auth";

export async function GET(req: Request) {
  if (!(await isAdmin(req))) return unauthorized();
  return Response.json({ publicKey: (await cfg()).VAPID_PUBLIC_KEY });
}

export async function POST(req: Request) {
  if (!(await isAdmin(req))) return unauthorized();
  const sub = (await req.json()) as { endpoint?: string };
  if (!sub?.endpoint) return Response.json({ error: "Sottoscrizione non valida" }, { status: 400 });
  await env().DB.prepare("INSERT OR REPLACE INTO push_subscriptions (endpoint,subscription) VALUES (?,?)").bind(sub.endpoint, JSON.stringify(sub)).run();
  return Response.json({ ok: true });
}

/** Notifica di prova a tutti i dispositivi registrati. */
export async function PUT(req: Request) {
  if (!(await isAdmin(req))) return unauthorized();
  const { pushToAdmins } = await import("@/lib/notify");
  await pushToAdmins("Bei Sogni Luxury", "Notifiche attive: riceverai qui le nuove richieste.");
  return Response.json({ ok: true });
}
