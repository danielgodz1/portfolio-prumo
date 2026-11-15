"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { S } from "../lib/store";
import CtaWhatsApp from "./CtaWhatsApp";

gsap.registerPlugin(ScrollTrigger);

const FASES = [
  { id: 0, label: "01 Planta baixa", faixa: "0.0 - 0.3" },
  { id: 1, label: "02 Extrusão 3D", faixa: "0.3 - 0.7" },
  { id: 2, label: "03 LED 2700K", faixa: "0.7 - 1.0" },
];

/**
 * Da planta ao quarto (Império Móveis Planejados) integrado ao canvas único persistente.
 * Controla o estágio semântico e sincroniza S.quartoActive / S.quartoProgress.
 */
export default function Cena3D() {
  const ref = useRef<HTMLElement>(null);
  const [semWebgl, setSemWebgl] = useState(false);
  const [fase, setFase] = useState(0);
  const [motionRev, setMotionRev] = useState(0);

  useEffect(() => {
    const onMotion = () => setMotionRev((v) => v + 1);
    const onModo2D = () => setMotionRev((v) => v + 1);
    window.addEventListener("prumo:motion", onMotion);
    window.addEventListener("prumo:modo2d", onModo2D);
    return () => {
      window.removeEventListener("prumo:motion", onMotion);
      window.removeEventListener("prumo:modo2d", onModo2D);
    };
  }, []);

  useEffect(() => {
    const sec = ref.current;
    if (!sec) return;
    if (!S.webgl) {
      const t = setTimeout(() => {
        if (!S.webgl) setSemWebgl(true);
      }, 900);
      return () => clearTimeout(t);
    }

    if (S.reduced || S.modo2D) {
      const io = new IntersectionObserver(
        ([e]) => {
          S.quartoActive = e.isIntersecting ? 1 : 0;
          S.quartoProgress = 1;
          setFase(2);
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
        const entra = Math.min(1, Math.max(0, p / 0.14));
        const sai = Math.min(1, Math.max(0, (1 - p) / 0.14));
        S.quartoActive = Math.min(entra, sai);
        const qp = Math.min(1, Math.max(0, (p - 0.12) / 0.74));
        S.quartoProgress = qp;
        const nextFase = qp < 0.3 ? 0 : qp < 0.7 ? 1 : 2;
        setFase((prev) => (prev === nextFase ? prev : nextFase));
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
  }, [motionRev]);

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
          <p className="cota">Cota +9,00 m · Império Móveis Planejados</p>
          <h3 id="c3-t" className="disp">Da planta ao quarto.</h3>
          <p className="cena3d__leg">A linha da planta baixa sobe em wireframe, fecha os módulos de marcenaria e acende os perfis de LED 2700K no mesmo canvas contínuo.</p>
          <ol className="cena3d__fases cota" aria-label="Etapas da montagem 3D">
            {FASES.map((f) => (
              <li key={f.id} className={fase === f.id ? "ativo" : fase > f.id ? "feita" : ""}>
                {f.label}
              </li>
            ))}
          </ol>
          <div className="cena3d__cta" data-only="empresa">
            <CtaWhatsApp
              camara="imperio"
              compacto
              mensagem="Oi Daniel! Vi a maquete 3D da Império e quero ver como apresentar meu negócio assim."
            />
          </div>
        </div>
      </div>
    </section>
  );
}
