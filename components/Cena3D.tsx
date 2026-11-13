"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { S } from "../lib/store";

gsap.registerPlugin(ScrollTrigger);

/**
 * Da planta ao quarto (Império Móveis Planejados) integrado ao canvas único persistente.
 * Este componente controla apenas o estágio semântico e atualiza S.quartoActive / S.quartoProgress.
 */
export default function Cena3D() {
  const ref = useRef<HTMLElement>(null);
  const [semWebgl, setSemWebgl] = useState(false);

  useEffect(() => {
    const sec = ref.current;
    if (!sec) return;
    if (!S.webgl) {
      // Verifica após a pintura inicial se o canvas principal inicializou WebGL
      const t = setTimeout(() => {
        if (!S.webgl) setSemWebgl(true);
      }, 900);
      return () => clearTimeout(t);
    }

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const io = new IntersectionObserver(
        ([e]) => {
          S.quartoActive = e.isIntersecting ? 1 : 0;
          S.quartoProgress = 1;
        },
        { threshold: 0.15 },
      );
      io.observe(sec);
      return () => {
        io.disconnect();
        S.quartoActive = 0;
      };
    }

    const st = ScrollTrigger.create({
      trigger: sec,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        const p = self.progress;
        // Entrada suave (0..0.14), palco ativo (0.14..0.86), saída suave (0.86..1)
        const entra = Math.min(1, Math.max(0, p / 0.14));
        const sai = Math.min(1, Math.max(0, (1 - p) / 0.14));
        S.quartoActive = Math.min(entra, sai);
        S.quartoProgress = Math.min(1, Math.max(0, (p - 0.12) / 0.72));
      },
      onLeave: () => {
        S.quartoActive = 0;
      },
      onLeaveBack: () => {
        S.quartoActive = 0;
      },
    });
    ScrollTrigger.refresh();
    return () => {
      st.kill();
      S.quartoActive = 0;
    };
  }, []);

  return (
    <section ref={ref} className={`cena3d${semWebgl ? " cena3d--fallback" : ""}`} id="quarto" aria-labelledby="c3-t">
      <div className="cena3d__palco">
        {semWebgl && (
          <div className="cena3d__falha" aria-hidden="true">
            <svg viewBox="0 0 600 520" className="cena3d__svg">
              <rect x="40" y="40" width="520" height="440" fill="none" stroke="#dce6ff" strokeWidth="6" />
              <rect x="46" y="84" width="72" height="272" fill="#f3f5fb" stroke="#0F2C7A" strokeWidth="3" />
              <rect x="284" y="48" width="188" height="52" fill="#f3f5fb" stroke="#0F2C7A" strokeWidth="3" />
              <rect x="338" y="196" width="210" height="166" fill="#f3f5fb" stroke="#0F2C7A" strokeWidth="3" />
              <line x1="120" y1="84" x2="120" y2="356" stroke="#FFD23F" strokeWidth="5" />
              <line x1="284" y1="104" x2="472" y2="104" stroke="#FFD23F" strokeWidth="5" />
              <line x1="334" y1="196" x2="334" y2="362" stroke="#FFD23F" strokeWidth="5" />
            </svg>
          </div>
        )}
        <div className="cena3d__texto">
          <p className="cota">Império Móveis Planejados</p>
          <h3 id="c3-t" className="disp">Da planta ao quarto.</h3>
          <p className="cena3d__leg">A mesma linha vira parede, o desenho vira móvel e o LED acende por último. Esta cena é 3D de verdade, no mesmo canvas contínuo.</p>
        </div>
      </div>
    </section>
  );
}
