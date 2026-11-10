"use client";
import { Icon } from "./Icons";

export function RailNav({ target, labels = ["Precedente", "Successiva"], item = ".room" }: { target: string; labels?: [string, string] | string[]; item?: string }) {
  const go = (d: number) => {
    const el = document.getElementById(target);
    if (!el) return;
    const card = el.querySelector<HTMLElement>(item);
    el.scrollBy({ left: d * ((card?.offsetWidth ?? 340) + 22), behavior: "smooth" });
  };
  return (
    <div className="railnav">
      <button aria-label={labels[0]} onClick={() => go(-1)}><Icon n="arrowL" /></button>
      <button aria-label={labels[1]} onClick={() => go(1)}><Icon n="arrowR" /></button>
    </div>
  );
}
