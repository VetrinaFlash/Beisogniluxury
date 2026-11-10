"use client";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import { BRAND } from "@/lib/brand";
import { T, type Lang, bookPath } from "@/lib/i18n";

export default function Nav({ solid = false, lang = "it", alt }: { solid?: boolean; lang?: Lang; alt?: { it: string; en: string } }) {
  const t = T[lang].nav;
  const home = lang === "en" ? "/en" : "/";
  const links: [string, string][] = [[`${home}#camere`, t.rooms], [`${home}#colazione`, t.breakfast], [`${home}#dintorni`, t.around], [`${home}#posizione`, t.location]];
  const [s, setS] = useState(solid);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (solid) return;
    const f = () => setS(window.scrollY > 60);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, [solid]);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; }, [open]);
  const sw = alt ?? { it: "/", en: "/en" };
  const Switch = () => <span className="lang"><a href={sw.it} className={lang === "it" ? "on" : ""} hrefLang="it">IT</a><a href={sw.en} className={lang === "en" ? "on" : ""} hrefLang="en">EN</a></span>;
  return (
    <header className={`nav ${s || open ? "solid" : ""} ${open ? "open" : ""}`}>
      <div className="wrap">
        <a href={home} aria-label={BRAND.fullName} onClick={() => setOpen(false)}><Logo /></a>
        <nav>
          {links.map(([h, l]) => <a key={h} href={h} className="hide-m link">{l}</a>)}
          <span className="hide-m"><Switch /></span>
          <a href={bookPath(lang)} className="btn sm">{t.book}</a>
          <button className="burger" aria-label={open ? t.menuClose : t.menuOpen} aria-expanded={open} onClick={() => setOpen(!open)}><span /><span /><span /></button>
        </nav>
      </div>
      <div className="mmenu" aria-hidden={!open}>
        {links.map(([h, l]) => <a key={h} href={h} onClick={() => setOpen(false)}>{l}</a>)}
        <a href={bookPath(lang)} onClick={() => setOpen(false)}><em>{t.book}</em></a>
        <div className="meta"><Switch /><br /><br />{BRAND.street}, {BRAND.city}<br />{BRAND.phone}</div>
      </div>
    </header>
  );
}
