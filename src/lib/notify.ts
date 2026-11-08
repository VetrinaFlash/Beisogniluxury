import { buildPushPayload } from "@block65/webcrypto-web-push";
import { env } from "./env";
import { cfg } from "./config";

export async function pushToAdmins(title: string, body: string, url = "/admin/dashboard") {
  const e = env();
  const c = await cfg();
  const subs = await e.DB.prepare("SELECT endpoint,subscription FROM push_subscriptions").all<{ endpoint: string; subscription: string }>();
  await Promise.all(
    subs.results.map(async (s) => {
      try {
        const payload = await buildPushPayload(
          { data: JSON.stringify({ title, body, url }), options: { ttl: 86400, urgency: "high" } },
          JSON.parse(s.subscription),
          { subject: e.VAPID_SUBJECT || `mailto:${e.OWNER_EMAIL}`, publicKey: c.VAPID_PUBLIC_KEY, privateKey: c.VAPID_PRIVATE_KEY }
        );
        const res = await fetch(s.endpoint, payload as RequestInit);
        if (res.status === 404 || res.status === 410) await e.DB.prepare("DELETE FROM push_subscriptions WHERE endpoint=?").bind(s.endpoint).run();
      } catch {
        /* una sottoscrizione rotta non deve bloccare le altre */
      }
    })
  );
}

export async function sendEmail(to: string, subject: string, html: string) {
  const e = env();
  const key = (await cfg()).RESEND_API_KEY;
  if (!key) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: e.EMAIL_FROM, to, subject, html }),
    });
  } catch {
    /* email best-effort */
  }
}
