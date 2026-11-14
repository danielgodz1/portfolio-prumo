"use client";
import { useCallback, useEffect, useState } from "react";
import { CAMARAS } from "../lib/dados";
import { S } from "../lib/store";
import { definirSom } from "../lib/som";

const MARCOS = [
  { seletor: "#topo", camara: 0 },
  { seletor: "#camara-01", camara: 1 },
  { seletor: "#camara-02", camara: 2 },
  { seletor: "#camara-03", camara: 3 },
  { seletor: "#camara-04", camara: 4 },
];

function detectarCamaraAtual(): number {
  const yRef = window.scrollY + window.innerHeight * 0.4;
  let ativa = 0;
  for (const m of MARCOS) {
    const el = document.querySelector<HTMLElement>(m.seletor);
    if (el && yRef >= el.offsetTop) {
      ativa = m.camara;
    }
  }
  return ativa;
}

/** HUD técnico discreto mostrando Câmara 3D atual, velocidade de scroll, coordenada e controles. */
export default function HudMissao() {
  const [som, setSom] = useState(false);
  const [reduzido, setReduzido] = useState(false);
  const [oculto, setOculto] = useState(false);
  const [tele, setTele] = useState({
    camaraNome: CAMARAS[0].nome,
    tracao: "0.00",
    konami: false,
  });

  useEffect(() => {
    setReduzido(document.documentElement.classList.contains("reduzir"));

    const onMotionEvent = (e: Event) => {
      const custom = e as CustomEvent<{ reduced: boolean }>;
      setReduzido(Boolean(custom.detail?.reduced));
    };
    window.addEventListener("prumo:motion", onMotionEvent);

    const id = window.setInterval(() => {
      const cam = detectarCamaraAtual();
      S.camara = cam;
      const tracaoVal = Math.min(18.5, Math.abs(S.vel) * 0.22);
      const info = CAMARAS[cam] ?? CAMARAS[0];

      const next = {
        camaraNome: info.nome,
        tracao: tracaoVal.toFixed(2),
        konami: S.konami,
      };

      setTele((prev) =>
        prev.camaraNome === next.camaraNome && prev.tracao === next.tracao && prev.konami === next.konami ? prev : next,
      );
    }, 95);

    const ct = document.querySelector("#contato");
    const io = ct ? new IntersectionObserver(([e]) => setOculto(e.isIntersecting), { threshold: 0.04 }) : null;
    if (io && ct) io.observe(ct);

    return () => {
      window.clearInterval(id);
      window.removeEventListener("prumo:motion", onMotionEvent);
      io?.disconnect();
    };
  }, []);

  const alternarSom = useCallback(() => {
    const prox = !som;
    S.sound = definirSom(prox);
    setSom(prox);
  }, [som]);

  const alternarMovimento = useCallback(() => {
    const proxReduzido = !reduzido;
    S.reduced = proxReduzido;
    S.motionOverride = proxReduzido ? "reduzido" : "ativo";
    try {
      localStorage.setItem("prumo-motion", S.motionOverride);
    } catch {
      // ignora
    }
    const html = document.documentElement;
    html.classList.toggle("reduzir", proxReduzido);
    html.classList.toggle("js", !proxReduzido);
    html.classList.toggle("movimento-forcado", !proxReduzido);
    setReduzido(proxReduzido);
    window.dispatchEvent(new CustomEvent("prumo:motion", { detail: { reduced: proxReduzido } }));
  }, [reduzido]);

  return (
    <aside className={`hud-missao cota${oculto ? " is-oculto" : ""}`} aria-label="Telemetria da missão">
      <div className="hud-missao__dados" aria-live="off">
        <span className="hud-missao__cota">{tele.camaraNome}</span>
        <span>TRAÇÃO {tele.tracao} m/s</span>
        <span className="hud-missao__coord">22°17&apos;47&quot;S 48°33&apos;28&quot;W · JAÚ/SP</span>
        {tele.konami && <span className="hud-missao__konami">TRIFORCE KERNEL 100%</span>}
      </div>
      <div className="hud-missao__controles">
        <button
          type="button"
          className="hud-missao__ctrl"
          onClick={alternarMovimento}
          aria-pressed={!reduzido}
          aria-label={reduzido ? "Ativar animações e movimento contínuo" : "Ativar modo de movimento reduzido"}
        >
          {reduzido ? "[MOVIMENTO: REDUZIDO]" : "[MOVIMENTO: ATIVO]"}
        </button>
        <button
          type="button"
          className="hud-missao__ctrl"
          onClick={alternarSom}
          aria-pressed={som}
          aria-label={som ? "Desativar áudio sintetizado" : "Ativar áudio sintetizado"}
        >
          {som ? "[SOM: ON]" : "[SOM: OFF]"}
        </button>
      </div>
    </aside>
  );
}
