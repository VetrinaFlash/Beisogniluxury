import { env } from "./env";
import { ensureSchema } from "./config";
import { BRAND } from "./brand";

export const SITE_DEFAULTS = {
  heroImage: BRAND.img.hero,
  heroVideo: BRAND.img.heroVideo,
  introImage: BRAND.img.intro,
  hostImage: BRAND.img.host,
  heroSubtitle: "Un piccolo B&B a conduzione familiare tra il centro di Positano e la spiaggia di Fornillo, con terrazzi affacciati sul mare e la colazione servita con vista.",
  heroSubtitle_en: "A small family-run B&B between the centre of Positano and Fornillo beach, with terraces overlooking the sea and breakfast served with a view.",
  introText: "Camere silenziose, terrazzi sul mare e un padrone di casa che ti accoglie come un amico.",
  introText_en: "Quiet rooms, terraces over the sea and a host who welcomes you like a friend.",
  whatsapp: BRAND.whatsapp,
};
export type SiteSettings = typeof SITE_DEFAULTS;
export const IMAGE_KEYS = ["heroImage", "heroVideo", "introImage", "hostImage"] as const;

export async function getSite(): Promise<SiteSettings> {
  try {
    await ensureSchema();
    const r = await env().DB.prepare("SELECT key,value FROM settings WHERE key LIKE 'site:%'").all<{ key: string; value: string }>();
    const out: Record<string, string> = { ...SITE_DEFAULTS };
    for (const x of r.results) if (x.key.slice(5) in SITE_DEFAULTS && x.value.trim()) out[x.key.slice(5)] = x.value.trim();
    if (out.heroVideo === "none") out.heroVideo = "";
    return out as SiteSettings;
  } catch {
    return SITE_DEFAULTS;
  }
}
