"use client";
import { useEffect, useRef, useState } from "react";
import { BRAND } from "@/lib/brand";

/** Logo del cliente; se l'immagine non carica (anche prima dell'idratazione) mostra il nome in testo. */
export default function Logo({ variant = "white", className = "logo-img" }: { variant?: "white" | "blue"; className?: string }) {
  const [ok, setOk] = useState(true);
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => { const i = ref.current; if (i && i.complete && i.naturalWidth === 0) setOk(false); }, []);
  if (!ok) return <span className="logo-txt">{BRAND.name}<small>{BRAND.tagline}</small></span>;
  return <img ref={ref} className={className} src={variant === "white" ? BRAND.logoWhite : BRAND.logoBlue} alt={BRAND.fullName} onError={() => setOk(false)} />;
}
