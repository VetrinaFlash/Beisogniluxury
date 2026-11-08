import { env } from "@/lib/env";
import { isAdmin, unauthorized } from "@/lib/auth";
import { getSite, SITE_DEFAULTS } from "@/lib/site";

export async function GET(req: Request) {
  if (!(await isAdmin(req))) return unauthorized();
  return Response.json({ site: await getSite() });
}

export async function PUT(req: Request) {
  if (!(await isAdmin(req))) return unauthorized();
  const b = (await req.json()) as Record<string, string>;
  const db = env().DB;
  const stmts = [];
  for (const k of Object.keys(SITE_DEFAULTS)) {
    if (typeof b[k] !== "string") continue;
    let v = b[k].trim().slice(0, 600);
    if (k === "whatsapp") v = v.replace(/[^\d]/g, "");
    if ((k === "heroImage" || k === "introImage") && v && !/^(https:\/\/|\/api\/photos\/)/.test(v)) return Response.json({ error: "Immagine non valida" }, { status: 400 });
    stmts.push(v ? db.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)").bind(`site:${k}`, v) : db.prepare("DELETE FROM settings WHERE key=?").bind(`site:${k}`));
  }
  if (stmts.length) await db.batch(stmts);
  return Response.json({ ok: true });
}
