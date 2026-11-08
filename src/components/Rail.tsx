"use client";
import { Icon } from "./Icons";

export function RailNav({ target }: { target: string }) {
  const go = (d: number) => {
    const el = document.getElementById(target);
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".room");
    el.scrollBy({ left: d * ((card?.offsetWidth ?? 360) + 22), behavior: "smooth" });
  };
  return (
    <div className="railnav">
      <button aria-label="Precedente" onClick={() => go(-1)}><Icon n="arrowL" /></button>
      <button aria-label="Successiva" onClick={() => go(1)}><Icon n="arrowR" /></button>
    </div>
  );
}

