import { env } from "@/lib/env";

export async function GET(_: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!/^[\w-]+\.(jpg|png|webp|mp4)$/.test(key)) return new Response("Not found", { status: 404 });
  const o = await env().PHOTOS.get(key);
  if (!o) return new Response("Not found", { status: 404 });
  return new Response(o.body, { headers: { "Content-Type": o.httpMetadata?.contentType ?? "image/jpeg", "Cache-Control": "public, max-age=31536000, immutable" } });
}
