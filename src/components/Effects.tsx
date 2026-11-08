"use client";
import { useEffect } from "react";

/** Animazioni di comparsa allo scroll + barra mobile che appare dopo l'hero. */
export default function Effects() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".rv,.ben");
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    els.forEach((el) => io.observe(el));
    const bar = document.querySelector(".mbar");
    const f = () => bar?.classList.toggle("show", window.scrollY > window.innerHeight * 0.6);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => { io.disconnect(); window.removeEventListener("scroll", f); };
  }, []);
  return null;
}
