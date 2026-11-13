"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Da planta ao quarto: a mesma planta vira volume (paredes sobem, móveis crescem, o LED acende por último).
 * O código da cena (three puro) só é baixado quando a seção chega perto da tela.
 */
export default function Cena3D() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const sec = ref.current!; let feito = false;
    const iniciar = async () => {
      if (feito) return; feito = true;
      const { iniciarCena3D } = await import("../lib/cena3d.js");
      iniciarCena3D({ palco: sec.querySelector(".cena3d__palco"), canvas: sec.querySelector(".cena3d__tela"), gsap, ScrollTrigger, reduce: matchMedia("(prefers-reduced-motion: reduce)").matches });
      ScrollTrigger.refresh();
    };
    const io = new IntersectionObserver((e) => { if (e.some((x) => x.isIntersecting)) { iniciar(); io.disconnect(); } }, { rootMargin: "1200px 0px" });
    io.observe(sec);
    return () => io.disconnect();
  }, []);
  return (
    <section ref={ref} className="cena3d" id="quarto" aria-labelledby="c3-t">
      <div className="cena3d__palco">
        <canvas className="cena3d__tela" aria-hidden="true" />
        <div className="cena3d__texto">
          <p className="cota">Império Móveis Planejados</p>
          <h3 id="c3-t" className="disp">Da planta ao quarto.</h3>
          <p className="cena3d__leg">A mesma linha vira parede, o desenho vira móvel e o LED acende por último. Esta cena é 3D de verdade, feita com Three.js.</p>
        </div>
      </div>
    </section>
  );
}
