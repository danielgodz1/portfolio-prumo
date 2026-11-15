"use client";
import { useEffect, useState } from "react";
import { CAMARAS } from "../lib/dados";
import { S } from "../lib/store";
import { tocarNaviHey } from "../lib/som";

/** Balão tático acoplado à IA Mascote 3D ("PRUMO-NAVI"). */
export default function NaviHud() {
  const [camara, setCamara] = useState(0);
  const [segredo, setSegredo] = useState(false);
  const [minimizado, setMinimizado] = useState(true);
  const [transmitindo, setTransmitindo] = useState(false);

  useEffect(() => {
    const onJauEgg = () => {
      setMinimizado(false);
      setSegredo(true);
    };
    window.addEventListener("prumo:jau-easter-egg", onJauEgg);
    return () => window.removeEventListener("prumo:jau-easter-egg", onJauEgg);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (S.camara !== camara) {
        setCamara(S.camara);
        setSegredo(false);
      }
    }, 140);

    const onNaviClick = () => {
      setMinimizado(false);
      setSegredo((v) => !v);
    };
    const onTransmit = () => {
      setMinimizado(false);
      setTransmitindo(true);
      window.setTimeout(() => setTransmitindo(false), 3200);
    };

    window.addEventListener("navi:click", onNaviClick);
    window.addEventListener("navi:transmit", onTransmit);
    const ct = document.querySelector("#contato");
    const io = ct
      ? new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) setMinimizado(true);
          },
          { threshold: 0.2 },
        )
      : null;
    if (ct && io) io.observe(ct);

    return () => {
      window.clearInterval(id);
      window.removeEventListener("navi:click", onNaviClick);
      window.removeEventListener("navi:transmit", onTransmit);
      io?.disconnect();
    };
  }, [camara]);

  const info = CAMARAS[camara] ?? CAMARAS[0];
  const texto = transmitindo
    ? "Sinal autenticado! Fazendo reverência e preparando canal de transmissão com Daniel..."
    : segredo
      ? info.naviSegredo
      : info.naviFala;

  const acionarNavi = () => {
    S.naviSpin += Math.PI * 2;
    S.naviBurst = 1;
    tocarNaviHey();
    setSegredo((v) => !v);
    setMinimizado(false);
  };

  return (
    <div
      className={`navi-hud${minimizado ? " is-min" : ""}`}
      style={{ "--navi-cor": info.cor } as React.CSSProperties}
      role="region"
      aria-label="Assistente PRUMO-NAVI"
    >
      {!minimizado ? (
        <div className="navi-hud__balao">
          <div className="navi-hud__topo">
            <span className="navi-hud__id cota">
              <i aria-hidden="true" /> PRUMO-NAVI · {info.curto}
            </span>
            <button
              type="button"
              className="navi-hud__min cota"
              onClick={() => setMinimizado(true)}
              aria-label="Minimizar balão da assistente PRUMO-NAVI"
            >
              _
            </button>
          </div>
          <p className="navi-hud__txt">{texto}</p>
          <div className="navi-hud__acoes">
            <button type="button" className="navi-hud__btn cota" onClick={acionarNavi}>
              {segredo ? "Hey! Voltar ao guia" : "Hey! Listen! (Dica técnica)"}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="navi-hud__orb-btn cota"
          onClick={acionarNavi}
          aria-label="Abrir balão da assistente PRUMO-NAVI"
        >
          <i aria-hidden="true" /> PRUMO-NAVI
        </button>
      )}
    </div>
  );
}
