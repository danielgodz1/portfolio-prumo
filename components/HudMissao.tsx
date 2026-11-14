"use client";
import { useCallback, useEffect, useState } from "react";
import { S } from "../lib/store";
import { definirSom } from "../lib/som";

interface MarcoCota {
  seletor: string;
  cota: number;
  rotulo: string;
}

const MARCOS: MarcoCota[] = [
  { seletor: "#topo", cota: 0, rotulo: "FUNDAÇÃO" },
  { seletor: "#proj-flowcheck", cota: 3, rotulo: "FLOWCHECK" },
  { seletor: "#proj-flowrequest", cota: 6, rotulo: "FLOWREQUEST" },
  { seletor: "#proj-imperio", cota: 9, rotulo: "IMPÉRIO 3D" },
  { seletor: "#modelos", cota: 12, rotulo: "MODELOS" },
  { seletor: "#contato", cota: 15, rotulo: "TOPO" },
];

const rotuloPorCota = (m: number) => {
  if (m < 1.5) return "FUNDAÇÃO";
  if (m < 4.5) return "FLOWCHECK";
  if (m < 7.5) return "FLOWREQUEST";
  if (m < 10.5) return "IMPÉRIO 3D";
  if (m < 13.5) return "MODELOS";
  return "TOPO";
};

const formatarCota = (m: number) => {
  const txt = m.toFixed(2).replace(".", ",");
  return m >= 0.01 ? `+${txt} m` : "0,00 m";
};

/** Calcula a cota contínua (0,00 m a +15,00 m) com base na posição real dos andares no documento. */
function calcularCotaAtual(): { metros: number; rotulo: string } {
  const yRef = window.scrollY + window.innerHeight * 0.35;
  const pontos: { y: number; cota: number }[] = [];

  for (const m of MARCOS) {
    const el = document.querySelector<HTMLElement>(m.seletor);
    if (el) {
      pontos.push({ y: el.offsetTop, cota: m.cota });
    }
  }

  if (pontos.length < 2) {
    const m = Math.max(0, Math.min(15, S.progress * 15));
    return { metros: m, rotulo: rotuloPorCota(m) };
  }

  if (yRef <= pontos[0].y) {
    return { metros: 0, rotulo: "FUNDAÇÃO" };
  }
  const ultimo = pontos[pontos.length - 1];
  if (yRef >= ultimo.y) {
    return { metros: 15, rotulo: "TOPO" };
  }

  for (let i = 0; i < pontos.length - 1; i++) {
    const a = pontos[i];
    const b = pontos[i + 1];
    if (yRef >= a.y && yRef <= b.y) {
      const span = Math.max(1, b.y - a.y);
      const t = Math.min(1, Math.max(0, (yRef - a.y) / span));
      const metros = a.cota + (b.cota - a.cota) * t;
      return { metros, rotulo: rotuloPorCota(metros) };
    }
  }

  const m = Math.max(0, Math.min(15, S.progress * 15));
  return { metros: m, rotulo: rotuloPorCota(m) };
}

/** HUD técnico de engenharia e prumo laser + controles de movimento e áudio. */
export default function HudMissao() {
  const [som, setSom] = useState(false);
  const [reduzido, setReduzido] = useState(false);
  const [oculto, setOculto] = useState(false);
  const [tele, setTele] = useState({
    cota: "0,00 m",
    andar: "FUNDAÇÃO",
    tracao: "0.00",
    desvio: "0.00",
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
      const { metros, rotulo } = calcularCotaAtual();
      S.cotaMeters = metros;
      S.cotaLabel = rotulo;

      // Velocidade de tração em m/s calculada direto da velocity do Lenis
      const tracaoVal = Math.min(18.5, Math.abs(S.vel) * 0.22);
      // Desvio de eixo: combina física real do pêndulo (quando 3D ativo) + oscilação pela velocidade
      const desvioBase = Math.abs(S.desvioGraus) > 0.01 ? S.desvioGraus : Math.sin(performance.now() * 0.008) * Math.min(4.2, Math.abs(S.vel) * 0.14);
      const desvioLimpo = Math.abs(desvioBase) < 0.03 && Math.abs(S.vel) < 0.05 ? 0 : desvioBase;

      const next = {
        cota: formatarCota(metros),
        andar: rotulo,
        tracao: tracaoVal.toFixed(2),
        desvio: `${Math.abs(desvioLimpo).toFixed(2)}`,
        konami: S.konami,
      };

      setTele((prev) =>
        prev.cota === next.cota &&
        prev.andar === next.andar &&
        prev.tracao === next.tracao &&
        prev.desvio === next.desvio &&
        prev.konami === next.konami
          ? prev
          : next,
      );
    }, 90);

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
      // ignora se storage estiver bloqueado
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
        <span className="hud-missao__cota">
          COTA {tele.cota} ({tele.andar})
        </span>
        <span>TRAÇÃO {tele.tracao} m/s</span>
        <span>DESVIO {tele.desvio}°</span>
        <span className="hud-missao__coord">22°17&apos;47&quot;S 48°33&apos;28&quot;W · JAÚ/SP</span>
        {tele.konami && <span className="hud-missao__konami">EIXO CALIBRADO 100%</span>}
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
