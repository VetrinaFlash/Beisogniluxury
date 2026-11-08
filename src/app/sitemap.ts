import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.beisogniluxury.it";
  return [{ url: base, priority: 1 }, { url: `${base}/prenota`, priority: 0.9 }, { url: `${base}/privacy`, priority: 0.2 }];
}
