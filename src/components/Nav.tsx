"use client";
import { useEffect, useState } from "react";

export default function Nav({ solid = false }: { solid?: boolean }) {
  const [s, setS] = useState(solid);
  useEffect(() => {
    if (solid) return;
    const f = () => setS(window.scrollY > 40);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, [solid]);
  return (
    <header className={`nav ${s ? "solid" : ""}`}>
      <div className="wrap">
        <a href="/" className="logo">Bei Sogni <b>Luxury</b></a>
        <nav>
          <a href="/#camere">Camere</a>
          <a href="/#servizi">Servizi</a>
          <a href="/#posizione">Posizione</a>
          <a href="/#contatti">Contatti</a>
          <a href="/prenota" className="btn sm">Prenota</a>
        </nav>
      </div>
    </header>
  );
}
