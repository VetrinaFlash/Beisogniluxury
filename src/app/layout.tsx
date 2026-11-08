import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.beisogniluxury.it"),
  title: { default: "B&B Cosenza Centro | Bei Sogni Luxury – Parcheggio e WiFi", template: "%s | Bei Sogni Luxury" },
  description: "Soggiorno di lusso nel cuore di Cosenza, a due passi da Corso Mazzini. Camere di design, WiFi gratuito, parcheggio in convenzione. Prenota direttamente.",
  keywords: ["B&B Cosenza", "Bed and Breakfast Cosenza centro", "B&B Corso Mazzini", "alloggio Cosenza", "parcheggio Cosenza centro"],
  openGraph: { type: "website", locale: "it_IT", title: "Bei Sogni Luxury – B&B Cosenza Centro", description: "Camere di design e comfort esclusivi a due passi da Corso Mazzini." },
};
export const viewport: Viewport = { themeColor: "#14110f", width: "device-width", initialScale: 1 };

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BedAndBreakfast",
  name: "Bei Sogni Luxury",
  telephone: "+393500643760",
  email: "deisogniluxury@libero.it",
  address: { "@type": "PostalAddress", streetAddress: "Via Pompilio Rodotà 12", postalCode: "87100", addressLocality: "Cosenza", addressRegion: "CS", addressCountry: "IT" },
  amenityFeature: [{ "@type": "LocationFeatureSpecification", name: "WiFi gratuito", value: true }, { "@type": "LocationFeatureSpecification", name: "Parcheggio in convenzione", value: true }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
