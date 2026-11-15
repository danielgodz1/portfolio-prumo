"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { S } from "../lib/store";
import { definirSom, lerSomPreferencia, tocarIgnicao } from "../lib/som";

/** HUD tático de engenharia: Cota (+0,00 a +15,00 m), Tração Lenis, Tensão do Cabo e Prumo. */
export default function HudMissao() {
  const [som, setSom] = useState(false);
  const [reduzido, setReduzido] = useState(false);
  const [oculto, setOculto] = useState(false);
  const planetaRef = useRef({ idx: 0, nome: "Terra · Jaú/SP" });
  const [telemetria, setTelemetria] = useState({
    cota: "+0,00 m · FUNDAÇÃO GLOBAL",
    tracao: "0.0 m/s",
    tensao: "98.4 N",
    status: "PLANETA 01/08 · TERRA · JAÚ/SP",
  });
  const [cotaAnuncio, setCotaAnuncio] = useState("");

  useEffect(() => {
    const prefSom = lerSomPreferencia();
    S.sound = definirSom(prefSom, true);
    setSom(prefSom);
    setReduzido(document.documentElement.classList.contains("reduzir"));

    const onMotionEvent = (e: Event) => {
      const custom = e as CustomEvent<{ reduced: boolean }>;
      setReduzido(Boolean(custom.detail?.reduced));
    };
    const onCotaEvent = (e: Event) => {
      const custom = e as CustomEvent<{ degrau: number; texto: string }>;
      if (custom.detail?.texto) setCotaAnuncio(custom.detail.texto);
    };
    const onPlanetaEvent = (e: Event) => {
      const custom = e as CustomEvent<{ idx: number; nome: string; papel: string }>;
      if (typeof custom.detail?.idx === "number") {
        planetaRef.current = { idx: custom.detail.idx, nome: custom.detail.nome };
      }
    };
    const onSomEvent = (e: Event) => {
      const custom = e as CustomEvent<{ som: boolean }>;
      setSom(Boolean(custom.detail?.som));
    };

    window.addEventListener("prumo:motion", onMotionEvent);
    window.addEventListener("prumo:cota", onCotaEvent);
    window.addEventListener("prumo:planeta", onPlanetaEvent);
    window.addEventListener("prumo:som", onSomEvent);

    const id = window.setInterval(() => {
      const cotaFmt = `+${S.cotaMeters.toFixed(2).replace(".", ",")} m · ${S.cotaLabel}`;
      const velFmt = `${Math.abs(S.vel).toFixed(1)} m/s`;
      const tensaoFmt = `${S.wireTension.toFixed(1)} N`;
      const numStr = String(planetaRef.current.idx + 1).padStart(2, "0");
      const statusFmt = `PLANETA ${numStr}/08 · ${planetaRef.current.nome.toUpperCase()}`;

      setTelemetria((prev) =>
        prev.cota === cotaFmt && prev.tracao === velFmt && prev.tensao === tensaoFmt && prev.status === statusFmt
          ? prev
          : { cota: cotaFmt, tracao: velFmt, tensao: tensaoFmt, status: statusFmt },
      );
    }, 110);

    const ct = document.querySelector("#contato");
    const io = ct ? new IntersectionObserver(([e]) => setOculto(e.isIntersecting), { threshold: 0.05 }) : null;
    if (io && ct) io.observe(ct);

    return () => {
      window.clearInterval(id);
      window.removeEventListener("prumo:motion", onMotionEvent);
      window.removeEventListener("prumo:cota", onCotaEvent);
      window.removeEventListener("prumo:planeta", onPlanetaEvent);
      window.removeEventListener("prumo:som", onSomEvent);
      io?.disconnect();
    };
  }, []);

  const alternarSom = useCallback(() => {
    const prox = !som;
    S.sound = definirSom(prox);
    setSom(prox);
    if (prox) tocarIgnicao();
    window.dispatchEvent(new CustomEvent("prumo:som", { detail: { som: prox } }));
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

  const soltarPrumo = useCallback(() => {
    window.dispatchEvent(new CustomEvent("prumo:soltar-peso"));
  }, []);

  return (
    <aside className={`hud-min cota${oculto ? " is-oculto" : ""}`} aria-label="Telemetria de engenharia, cota e acessibilidade">
      <div className="hud-min__dados" aria-live="off">
        <span className="hud-min__cota">COTA ATUAL: {telemetria.cota}</span>
        <span className="hud-min__sep">TRAÇÃO_SCROLL: {telemetria.tracao}</span>
        <span className="hud-min__sep">TENSÃO_CABO: {telemetria.tensao}</span>
        <span className="hud-min__sep hud-min__status">{telemetria.status}</span>
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {cotaAnuncio}
      </span>
      <div className="hud-min__ctrls">
        <button
          type="button"
          className="hud-min__btn hud-min__btn--prumo"
          onClick={soltarPrumo}
          aria-label="Soltar o peso do prumo em queda livre no mundo 3D"
        >
          Soltar Prumo
        </button>
        <button
          type="button"
          className="hud-min__btn"
          onClick={alternarMovimento}
          aria-pressed={!reduzido}
          aria-label={reduzido ? "Ativar animações 3D" : "Reduzir animações"}
        >
          {reduzido ? "Movimento: Reduzido" : "Movimento: 3D"}
        </button>
        <button
          type="button"
          className="hud-min__btn"
          onClick={alternarSom}
          aria-pressed={som}
          aria-label={som ? "Silenciar áudio espacial e cliques por cota" : "Ativar áudio espacial e cliques por cota"}
        >
          {som ? "Som: On" : "Som: Off"}
        </button>
      </div>
    </aside>
  );
}
