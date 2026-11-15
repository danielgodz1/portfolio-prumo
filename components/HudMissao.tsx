"use client";
import { useCallback, useEffect, useState } from "react";
import { S } from "../lib/store";
import { definirSom, lerSomPreferencia } from "../lib/som";

/** Barra minimalista de cota e controles de acessibilidade (movimento e som). */
export default function HudMissao() {
  const [som, setSom] = useState(false);
  const [reduzido, setReduzido] = useState(false);
  const [oculto, setOculto] = useState(false);
  const [cotaTexto, setCotaTexto] = useState("+0,00 m · INÍCIO");
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
    window.addEventListener("prumo:motion", onMotionEvent);
    window.addEventListener("prumo:cota", onCotaEvent);

    const id = window.setInterval(() => {
      const p = S.progress;
      const m = S.cotaMeters;
      const ato =
        p < 0.2 ? "INÍCIO" : p < 0.44 ? "ATO 01 · JAÚ" : p < 0.66 ? "ATO 02 · SISTEMAS" : p < 0.86 ? "ATO 03 · 3D" : "ATO 04 · MODELOS";
      const next = `+${m.toFixed(2).replace(".", ",")} m · ${ato}`;
      setCotaTexto((prev) => (prev === next ? prev : next));
    }, 110);

    const ct = document.querySelector("#contato");
    const io = ct ? new IntersectionObserver(([e]) => setOculto(e.isIntersecting), { threshold: 0.05 }) : null;
    if (io && ct) io.observe(ct);

    return () => {
      window.clearInterval(id);
      window.removeEventListener("prumo:motion", onMotionEvent);
      window.removeEventListener("prumo:cota", onCotaEvent);
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
    <aside className={`hud-min cota${oculto ? " is-oculto" : ""}`} aria-label="Cota e controles de acessibilidade">
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
          aria-label={som ? "Silenciar cliques por cota" : "Ativar som sutil por cota"}
        >
          {som ? "Som: On" : "Som: Off"}
        </button>
      </div>
    </aside>
  );
}
