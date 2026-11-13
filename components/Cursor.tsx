"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

/** Cursor próprio: segue com inércia e muda de estado conforme data-cursor (hover | view | drag). */
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !matchMedia("(hover:hover) and (pointer:fine)").matches) return;
    const x = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3" });
    const y = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3" });
    const mover = (e: PointerEvent) => { x(e.clientX); y(e.clientY); };
    const estado = (e: PointerEvent) => {
      const alvo = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-cursor]");
      const tipo = alvo?.dataset.cursor ?? "";
      el.classList.toggle("is-hover", tipo === "hover");
      el.classList.toggle("is-view", tipo === "view");
      el.classList.toggle("is-drag", tipo === "drag");
      el.textContent = tipo === "view" ? "ver" : tipo === "drag" ? "arraste" : "";
    };
    addEventListener("pointermove", mover);
    addEventListener("pointerover", estado);
    return () => { removeEventListener("pointermove", mover); removeEventListener("pointerover", estado); };
  }, []);
  return <div ref={ref} className="cursor" aria-hidden="true" />;
}
