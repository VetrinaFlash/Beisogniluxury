import { env } from "./env";
import { ensureSchema } from "./config";

export const SITE_DEFAULTS = {
  heroImage: "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=2000",
  introImage: "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=1200",
  heroSubtitle: "Camere di design e comfort esclusivi, a due passi da Corso Mazzini. Prenota direttamente da noi, senza intermediari.",
  introText: "Camere luminose, letti comodi e una posizione che permette di vivere Cosenza a piedi.",
  whatsapp: "393500643760",
};
export type SiteSettings = typeof SITE_DEFAULTS;

export async function getSite(): Promise<SiteSettings> {
  try {
    await ensureSchema();
    const r = await env().DB.prepare("SELECT key,value FROM settings WHERE key LIKE 'site:%'").all<{ key: string; value: string }>();
    const out: Record<string, string> = { ...SITE_DEFAULTS };
    for (const x of r.results) if (x.value.trim()) out[x.key.slice(5)] = x.value.trim();
    return out as SiteSettings;
  } catch {
    return SITE_DEFAULTS;
  }
}
