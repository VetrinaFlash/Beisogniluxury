import { Suspense } from "react";
import Nav from "./Nav";
import Footer from "./Footer";
import Booking from "./Booking";
import { T, type Lang } from "@/lib/i18n";

export default function BookingPage({ lang }: { lang: Lang }) {
  const t = T[lang].book;
  return (
    <>
      <Nav solid lang={lang} alt={{ it: "/prenota", en: "/en/book" }} />
      <main className="page"><div className="wrap" style={{ maxWidth: 940 }}>
        <div className="page-head">
          <span className="eyebrow">{t.eyebrow}</span>
          <h1>{t.title[0]} <em>{t.title[1]}</em></h1>
        </div>
        <Suspense fallback={<div className="skel" />}><Booking lang={lang} /></Suspense>
      </div></main>
      <Footer lang={lang} />
    </>
  );
}

