import { env } from "@/lib/env";
import { isAdmin, unauthorized } from "@/lib/auth";

const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export async function POST(req: Request) {
  if (!(await isAdmin(req))) return unauthorized();
  const file = (await req.formData()).get("file");
  if (!(file instanceof File) || !TYPES[file.type]) return Response.json({ error: "Usa JPG, PNG o WebP" }, { status: 400 });
  if (file.size > 8 * 1024 * 1024) return Response.json({ error: "Foto troppo grande (max 8 MB)" }, { status: 400 });
  const key = `${crypto.randomUUID()}.${TYPES[file.type]}`;
  await env().PHOTOS.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
  return Response.json({ url: `/api/photos/${key}` });
}
