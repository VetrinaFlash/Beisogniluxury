import { env } from "@/lib/env";
import { isAdmin, unauthorized } from "@/lib/auth";
import { getSite, IMAGE_KEYS } from "@/lib/site";

const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "video/mp4": "mp4" };

/** Copia su R2 le foto/video ancora collegati al vecchio sito, così il nuovo sito non dipende più da lì. */
async function copy(url: string): Promise<string | null> {
  if (!/^https:\/\//.test(url)) return null;
  const r = await fetch(url, { headers: { "User-Agent": "VenusInn-Importer/1.0" } });
  if (!r.ok || !r.body) throw new Error(`${r.status} ${url.split("/").pop()}`);
  const type = (r.headers.get("content-type") ?? "").split(";")[0].trim();
  const ext = EXT[type] ?? (url.match(/\.(jpe?g|png|webp|mp4)(\?|$)/i)?.[1]?.toLowerCase().replace("jpeg", "jpg"));
  if (!ext) throw new Error(`Formato non supportato: ${url.split("/").pop()}`);
  const key = `${crypto.randomUUID()}.${ext}`;
  await env().PHOTOS.put(key, r.body, { httpMetadata: { contentType: type || (ext === "mp4" ? "video/mp4" : `image/${ext}`) } });
  return `/api/photos/${key}`;
}

export async function POST(req: Request) {
  if (!(await isAdmin(req))) return unauthorized();
  const db = env().DB;
  const errors: string[] = [];
  let copied = 0;
  const done = new Map<string, string>();
  const one = async (u: string) => {
    if (!/^https:\/\//.test(u)) return u;
    if (done.has(u)) return done.get(u)!;
    try { const n = await copy(u); if (n) { done.set(u, n); copied++; return n; } } catch (e) { errors.push((e as Error).message); }
    return u;
  };
  const rooms = await db.prepare("SELECT id,photos FROM rooms").all<{ id: string; photos: string }>();
  for (const r of rooms.results) {
    const ph: string[] = JSON.parse(r.photos);
    const out = [];
    for (const p of ph) out.push(await one(p));
    if (JSON.stringify(out) !== r.photos) await db.prepare("UPDATE rooms SET photos=? WHERE id=?").bind(JSON.stringify(out), r.id).run();
  }
  const site = await getSite();
  for (const k of IMAGE_KEYS) {
    const v = site[k];
    const n = await one(v);
    if (n !== v) await db.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)").bind(`site:${k}`, n).run();
  }
  return Response.json({ ok: true, copied, errors });
}
