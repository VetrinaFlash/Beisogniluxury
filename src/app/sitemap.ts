import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";

export default function sitemap(): MetadataRoute.Sitemap {
  const b = BRAND.domain;
  const pair = (it: string, en: string, priority: number) => [
    { url: b + it, priority, alternates: { languages: { it: b + it, en: b + en } } },
    { url: b + en, priority, alternates: { languages: { it: b + it, en: b + en } } },
  ];
  return [...pair("/", "/en", 1), ...pair("/prenota", "/en/book", 0.9), ...pair("/privacy", "/en/privacy", 0.2)];
}
