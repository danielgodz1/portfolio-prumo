"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { S } from "../lib/store";

gsap.registerPlugin(ScrollTrigger);

interface Props {
  id?: string;
  ato: string;
  titulo: string;
  subtitulo: string;
  children?: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

/**
 * Palco editorial com efeito real de texto vindo da profundidade Z:
 * entra pequeno e desfocado ao fundo (-680px), trava em nitidez no centro (0px)
 * e atravessa a câmera (+280px) conforme o visitante avança na história.
 */
export default function AtoProfundidadeZ({ id, ato, titulo, subtitulo, children, className = "", ariaLabel }: Props) {
  const secRef = useRef<HTMLElement>(null);
  const camRef = useRef<HTMLDivElement>(null);
  const [motionRev, setMotionRev] = useState(0);

  useEffect(() => {
    const sync = () => setMotionRev((v) => v + 1);
    window.addEventListener("prumo:motion", sync);
    window.addEventListener("prumo:modo2d", sync);
    return () => {
      window.removeEventListener("prumo:motion", sync);
      window.removeEventListener("prumo:modo2d", sync);
    };
  }, []);

  useEffect(() => {
    const sec = secRef.current;
    const cam = camRef.current;
    if (!sec || !cam) return;

    if (S.reduced || S.modo2D) {
      cam.style.transform = "";
      cam.style.opacity = "1";
      cam.style.filter = "";
      return;
    }

    const st = ScrollTrigger.create({
      trigger: sec,
      start: "top bottom",
      end: "bottom top",
      scrub: 0.45,
      onUpdate: (self) => {
        const p = self.progress; // 0 = entra embaixo, 0.5 = foco absoluto, 1 = atravessa a câmera
        let z = 0;
        let s = 1;
        let op = 1;
        let blur = 0;

        if (p < 0.34) {
          const k = 1 - Math.min(1, p / 0.34);
          z = -680 * k;
          s = 1 - 0.36 * k;
          op = Math.max(0.06, 1 - k * 0.94);
          blur = 8 * k;
        } else if (p > 0.7) {
          const k = Math.min(1, (p - 0.7) / 0.3);
          z = 260 * k;
          s = 1 + 0.28 * k;
          op = Math.max(0, 1 - k * 1.15);
          blur = 6 * k;
        }

        cam.style.transform = `perspective(1200px) translate3d(0, 0, ${z.toFixed(1)}px) scale(${s.toFixed(3)})`;
        cam.style.opacity = op.toFixed(3);
        cam.style.filter = blur > 0.25 ? `blur(${blur.toFixed(1)}px)` : "none";
      },
    });

    return () => {
      st.kill();
      if (cam) {
        cam.style.transform = "";
        cam.style.opacity = "";
        cam.style.filter = "";
      }
    };
  }, [motionRev]);

  return (
    <section ref={secRef} id={id} className={`ato-z ${className}`} aria-label={ariaLabel ?? titulo}>
      <div className="ato-z__palco">
        <div ref={camRef} className="ato-z__profundidade">
          <header className="ato-z__cabecalho">
            <span className="ato-z__kicker cota">{ato}</span>
            <h2 className="ato-z__titulo disp">{titulo}</h2>
            <p className="ato-z__sub">{subtitulo}</p>
          </header>
          {children && <div className="ato-z__conteudo">{children}</div>}
        </div>
      </div>
    </section>
  );
}
