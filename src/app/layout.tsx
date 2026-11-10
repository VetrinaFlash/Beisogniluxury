import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BRAND } from "@/lib/brand";
import { T } from "@/lib/i18n";

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.domain),
  title: { default: T.it.meta.title, template: `%s | ${BRAND.fullName}` },
  description: T.it.meta.desc,
  keywords: ["B&B Positano", "bed and breakfast Positano", "Positano vista mare", "Fornillo", "Venus Inn Positano", "camere Positano", "Costiera Amalfitana"],
  icons: { icon: "/icon-192.png", apple: "/icon-192.png" },
  openGraph: { type: "website", siteName: BRAND.fullName, locale: "it_IT", alternateLocale: ["en_GB"], title: T.it.meta.title, description: T.it.meta.desc, images: [BRAND.img.hero] },
  twitter: { card: "summary_large_image", images: [BRAND.img.hero] },
};
export const viewport: Viewport = { themeColor: "#0c2133", width: "device-width", initialScale: 1 };

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BedAndBreakfast",
  name: BRAND.fullName,
  url: BRAND.domain,
  image: [BRAND.img.hero, BRAND.img.intro, BRAND.img.breakfast],
  logo: BRAND.logoBlue,
  telephone: BRAND.phoneRaw,
  email: BRAND.email,
  identifier: { "@type": "PropertyValue", propertyID: "CIN", value: BRAND.cin },
  address: { "@type": "PostalAddress", streetAddress: BRAND.street, postalCode: BRAND.zip, addressLocality: BRAND.city, addressRegion: BRAND.province, addressCountry: "IT" },
  checkinTime: "12:00", checkoutTime: "10:30",
  petsAllowed: false,
  amenityFeature: ["Colazione inclusa", "Terrazzo vista mare", "WiFi gratuito", "Aria condizionata", "Self check-in", "Deposito bagagli"].map((name) => ({ "@type": "LocationFeatureSpecification", name, value: true })),
  sameAs: Object.values(BRAND.social),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@400;500;600&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js');if(location.pathname.startsWith('/en'))document.documentElement.lang='en'" }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
