"use client";
import { useEffect, useState } from "react";

const LINKS = [["/#camere", "Camere"], ["/#esperienza", "Esperienza"], ["/#servizi", "Servizi"], ["/#posizione", "Posizione"]];

export default function Nav({ solid = false }: { solid?: boolean }) {
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
  return (
    <header className={`nav ${s || open ? "solid" : ""} ${open ? "open" : ""}`}>
      <div className="wrap">
        <a href="/" className="logo" onClick={() => setOpen(false)}>Bei Sogni<small>Luxury · Cosenza</small></a>
        <nav>
          {LINKS.map(([h, l]) => <a key={h} href={h} className="hide-m link">{l}</a>)}
          <a href="/prenota" className="btn sm">Prenota</a>
          <button className="burger" aria-label={open ? "Chiudi menu" : "Apri menu"} aria-expanded={open} onClick={() => setOpen(!open)}><span /><span /><span /></button>
        </nav>
      </div>
      <div className="mmenu" aria-hidden={!open}>
        {LINKS.map(([h, l]) => <a key={h} href={h} onClick={() => setOpen(false)}>{l}</a>)}
        <a href="/prenota" onClick={() => setOpen(false)}><em>Prenota ora</em></a>
        <div className="meta">Via Pompilio Rodotà 12, Cosenza<br />+39 350 0643760</div>
      </div>
    </header>
  );
}
