import HomePage from "@/components/HomePage";
import { T } from "@/lib/i18n";
import { BRAND } from "@/lib/brand";

export const dynamic = "force-dynamic";
export const metadata = {
  title: { absolute: T.en.meta.title },
  description: T.en.meta.desc,
  alternates: { canonical: "/en", languages: { it: "/", en: "/en" } },
  openGraph: { locale: "en_GB", siteName: BRAND.fullName, title: T.en.meta.title, description: T.en.meta.desc, images: [BRAND.img.hero] },
};

export default function HomeEn() {
  return <HomePage lang="en" />;
}
