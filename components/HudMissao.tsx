"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { S } from "../lib/store";
import { definirSom, lerSomPreferencia, tocarIgnicao } from "../lib/som";

/** Barra minimalista de telemetria planetária, cota e acessibilidade (movimento e som). */
export default function HudMissao() {
  const [som, setSom] = useState(false);
  const [reduzido, setReduzido] = useState(false);
  const [oculto, setOculto] = useState(false);
  const planetaRef = useRef({ idx: 0, nome: "Terra · Jaú/SP" });
  const [cotaTexto, setCotaTexto] = useState("+0,00 m · PLANETA 01/08 · TERRA · JAÚ/SP");
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
      const m = S.cotaMeters;
      const numStr = String(planetaRef.current.idx + 1).padStart(2, "0");
      const next = `+${m.toFixed(2).replace(".", ",")} m · PLANETA ${numStr}/08 · ${planetaRef.current.nome.toUpperCase()}`;
      setCotaTexto((prev) => (prev === next ? prev : next));
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

  return (
    <aside className={`hud-min cota${oculto ? " is-oculto" : ""}`} aria-label="Telemetria espacial, cota e acessibilidade">
      <span className="hud-min__cota" aria-live="off">
        {cotaTexto}
      </span>
      <span className="sr-only" role="status" aria-live="polite">
        {cotaAnuncio}
      </span>
      <div className="hud-min__ctrls">
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
          aria-label={som ? "Silenciar áudio espacial e propulsão" : "Ativar áudio espacial e som do foguete"}
        >
          {som ? "Som: On" : "Som: Off"}
        </button>
      </div>
    </aside>
  );
}
