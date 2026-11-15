"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { S } from "../lib/store";

gsap.registerPlugin(ScrollTrigger);

/** Ponte visual entre os exemplos e o contato (shader líquido GLSL com fallback CSS sem WebGL). */
export default function TransicaoLiquida() {
  const ref = useRef<HTMLDivElement>(null);
  const [fallbackCss, setFallbackCss] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (!S.webgl || S.reduced || S.modo2D) setFallbackCss(true);
    }, 650);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || S.reduced || S.modo2D) {
      S.liquidMix = 0;
      return;
    }

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        const p = Math.min(1, Math.max(0, self.progress));
        S.liquidMix = Math.sin(p * Math.PI);
      },
      onLeave: () => {
        S.liquidMix = 0;
      },
      onLeaveBack: () => {
        S.liquidMix = 0;
      },
    });
    return () => {
      st.kill();
      S.liquidMix = 0;
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transicao-liquida${fallbackCss ? " is-fallback" : ""}`}
      data-only="empresa"
      aria-hidden="true"
    >
      <div className="transicao-liquida__linha cota">
        <span>PRÓXIMO PASSO · ORÇAMENTO DIRETO EM JAÚ/SP</span>
      </div>
    </div>
  );
}
