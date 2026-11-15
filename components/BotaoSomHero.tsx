"use client";
import { useCallback, useEffect, useState } from "react";
import { S } from "../lib/store";
import { definirSom, lerSomPreferencia, tocarIgnicao } from "../lib/som";

/**
 * Botão claro no Hero para ativar a trilha sonora espacial + propulsão reativa à rolagem.
 * Sincronizado com o botão de som do HUD via evento customizado `prumo:som`.
 */
export default function BotaoSomHero() {
  const [som, setSom] = useState(false);

  useEffect(() => {
    setSom(lerSomPreferencia());
    const onSomEvent = (e: Event) => {
      const custom = e as CustomEvent<{ som: boolean }>;
      setSom(Boolean(custom.detail?.som));
    };
    window.addEventListener("prumo:som", onSomEvent);
    return () => window.removeEventListener("prumo:som", onSomEvent);
  }, []);

  const alternar = useCallback(() => {
    const prox = !som;
    S.sound = definirSom(prox);
    setSom(prox);
    if (prox) {
      tocarIgnicao();
    }
    window.dispatchEvent(new CustomEvent("prumo:som", { detail: { som: prox } }));
  }, [som]);

  return (
    <button
      type="button"
      className={`hero-som-btn cota${som ? " is-ativo" : ""}`}
      onClick={alternar}
      aria-pressed={som}
      aria-label={som ? "Silenciar áudio espacial e propulsor" : "Ativar áudio espacial e som do foguete"}
    >
      <span className="hero-som-btn__led" aria-hidden="true" />
      {som ? "Áudio espacial: Ligado" : "Ativar áudio espacial"}
    </button>
  );
}
