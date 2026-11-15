"use client";
import { S } from "../lib/store";
import { linkWhatsApp, registrarCliqueWhatsApp } from "../lib/site";
import { tocarTransmissao } from "../lib/som";

interface Props {
  camara: string;
  mensagem?: string;
  rotulo?: string;
  microcopy?: string;
  compacto?: boolean;
}

/** CTA principal unificado para WhatsApp com UTM por câmara e telemetria anônima. */
export default function CtaWhatsApp({
  camara,
  mensagem,
  rotulo = "Quero ver o meu negócio assim",
  microcopy = "Resposta pelo WhatsApp",
  compacto = false,
}: Props) {
  const href = linkWhatsApp({ camara, mensagem });

  const onClick = () => {
    S.naviTransmit = 1;
    S.naviSpin += Math.PI * 2;
    S.naviBurst = 1;
    tocarTransmissao();
    window.dispatchEvent(new CustomEvent("navi:transmit"));
    registrarCliqueWhatsApp(camara, S.audiencia);
  };

  return (
    <div className={`cta-whats-wrap${compacto ? " is-compacto" : ""}`}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="cta-whats"
        onClick={onClick}
        data-mag={compacto ? undefined : ""}
        data-cursor="hover"
      >
        <span>{rotulo}</span>
        <small className="cota">{microcopy}</small>
      </a>
    </div>
  );
}
