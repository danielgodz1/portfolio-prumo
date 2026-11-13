"use client";
import { useEffect, useState } from "react";
import { S } from "../lib/store";
import { definirSom } from "../lib/som";

const atoAtual = (p: number) => {
  if (p < 0.12) return "ATO 00 BASE";
  if (p < 0.42) return "ATO 01 DECOLAGEM";
  if (p < 0.72) return "ATO 02 ÓRBITA";
  return "ATO 03 REENTRADA";
};

/** HUD técnico discreto da missão + botão de áudio opcional (desligado por padrão). */
export default function HudMissao() {
  const [som, setSom] = useState(false);
  const [oculto, setOculto] = useState(false);
  const [tele, setTele] = useState({ ato: "ATO 00 BASE", alt: "000", vel: "0.0", konami: false });

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = setInterval(() => {
      const alt = Math.round(S.progress * 420);
      const vel = Math.min(28.4, Math.abs(S.vel) * 0.42 + (S.progress > 0.1 && S.progress < 0.88 ? 7.8 : 0));
      setTele({
        ato: atoAtual(S.progress),
        alt: String(alt).padStart(3, "0"),
        vel: vel.toFixed(1),
        konami: S.konami,
      });
    }, 120);

    const ct = document.querySelector("#contato");
    const io = ct
      ? new IntersectionObserver(([e]) => setOculto(e.isIntersecting), { threshold: 0.02 })
      : null;
    if (io && ct) io.observe(ct);

    return () => {
      clearInterval(id);
      io?.disconnect();
    };
  }, []);

  const alternarSom = () => {
    const prox = !som;
    S.sound = definirSom(prox);
    setSom(prox);
  };

  return (
    <aside className={`hud-missao cota${oculto ? " is-oculto" : ""}`} aria-label="Telemetria da missão">
      <div className="hud-missao__dados">
        <span>MISSÃO 01</span>
        <span>{tele.ato}</span>
        <span>ALT {tele.alt} km</span>
        <span>VEL {tele.vel} km/s</span>
        {tele.konami && <span className="hud-missao__konami">ÓRBITA LIBERADA</span>}
      </div>
      <button type="button" className="hud-missao__som" onClick={alternarSom} aria-pressed={som}>
        {som ? "SOM: ON" : "SOM: OFF"}
      </button>
    </aside>
  );
}

