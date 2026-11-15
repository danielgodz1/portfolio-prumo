"use client";
import { useState } from "react";
import { CONTATO } from "../lib/dados";
import { linkWhatsApp, MODELOS_BASE_URL, registrarCliqueWhatsApp } from "../lib/site";
import { S } from "../lib/store";
import { tocarTransmissao } from "../lib/som";

const ASSUNTOS_RAPIDOS = [
  "Quero um site/sistema para minha empresa",
  "Oportunidade / Recrutamento TI & Dev",
  "Projeto sob medida / Integração",
] as const;

export default function ContatoCanal() {
  const [copiado, setCopiado] = useState(false);
  const [nome, setNome] = useState("");
  const [assunto, setAssunto] = useState("");
  const [assuntoPreset, setAssuntoPreset] = useState<string>(ASSUNTOS_RAPIDOS[0]);

  const dispararReverenciaNavi = () => {
    S.naviTransmit = 1;
    S.naviSpin += Math.PI * 2;
    S.naviBurst = 1;
    tocarTransmissao();
    window.dispatchEvent(new CustomEvent("navi:transmit"));
  };

  const copiarEmail = async () => {
    dispararReverenciaNavi();
    try {
      await navigator.clipboard.writeText(CONTATO.email);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 3200);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = CONTATO.email;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 3200);
    }
  };

  const textoAssunto = assunto.trim() || assuntoPreset;

  const urlWhatsAppPadrao = linkWhatsApp({
    camara: "contato",
    mensagem: `Oi Daniel! Vi seu portfólio${nome ? ` (sou ${nome})` : ""} e o assunto é: ${textoAssunto}.`,
  });

  const abrirWhatsApp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    dispararReverenciaNavi();
    registrarCliqueWhatsApp("contato", S.audiencia);
    window.open(urlWhatsAppPadrao, "_blank", "noopener,noreferrer");
  };

  const enviarEmail = () => {
    dispararReverenciaNavi();
    const subject = encodeURIComponent(nome ? `Projeto · ${nome}` : "Projeto web · Contato pelo portfólio");
    const body = encodeURIComponent(assunto.trim() || "Oi Daniel, quero conversar sobre um projeto ou vaga.");
    window.location.href = `mailto:${CONTATO.email}?subject=${subject}&body=${body}`;
  };

  return (
    <section className="contato" id="contato" aria-labelledby="t-contato">
      <div className="contato__grade">
        <div className="contato__principal painel-chanfrado">
          <p id="t-contato" className="cota">
            Canal direto · Jaú/SP · Resposta rápida
          </p>
          <div className="contato__assuntos" role="group" aria-label="Escolha o assunto em 1 clique">
            {ASSUNTOS_RAPIDOS.map((item) => {
              const ativo = assuntoPreset === item;
              return (
                <button
                  key={item}
                  type="button"
                  className={`contato__assunto-btn cota${ativo ? " ativo" : ""}`}
                  aria-pressed={ativo}
                  onClick={() => {
                    setAssuntoPreset(item);
                    setAssunto(item);
                  }}
                >
                  {item}
                </button>
              );
            })}
          </div>
          <a
            className="cta cta--whats disp"
            href={urlWhatsAppPadrao}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              dispararReverenciaNavi();
              registrarCliqueWhatsApp("contato", S.audiencia);
            }}
            data-mag
            data-cursor="hover"
            aria-label="Quero ver o meu negócio assim: abrir conversa no WhatsApp com Daniel dos Santos"
          >
            <span>Quero ver o meu negócio assim</span>
            <small className="cota">Resposta pelo WhatsApp</small>
          </a>

          <div className="contato__email-linha">
            <span className="contato__alt cota">Ou mande por e-mail:</span>
            <a className="contato__email cota" href={`mailto:${CONTATO.email}`} onClick={dispararReverenciaNavi}>
              {CONTATO.email}
            </a>
            <button
              type="button"
              className={`contato__copiar cota${copiado ? " ok" : ""}`}
              onClick={copiarEmail}
              aria-label="Copiar endereço de e-mail para a área de transferência"
            >
              {copiado ? "Copiado para a área de transferência [OK]" : "Copiar E-mail"}
            </button>
          </div>
          <p className="sr-only" role="status" aria-live="polite">
            {copiado ? "E-mail copiado para a área de transferência." : ""}
          </p>

          <div className="contato__redes">
            <a href={CONTATO.github} onClick={dispararReverenciaNavi} target="_blank" rel="noopener noreferrer" data-cursor="hover" data-swap>
              GitHub · danielgodz1
            </a>
            <a href={CONTATO.linkedin} onClick={dispararReverenciaNavi} target="_blank" rel="noopener noreferrer" data-cursor="hover" data-swap>
              LinkedIn · danieldossantos-ti
            </a>
            <a
              href={`${MODELOS_BASE_URL}/`}
              onClick={dispararReverenciaNavi}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="view"
            >
              Catálogo · 13 Modelos
            </a>
          </div>
        </div>

        <form className="contato__rapido painel-chanfrado" onSubmit={abrirWhatsApp} aria-label="Mensagem rápida">
          <p className="cota">CONVERSA RÁPIDA · WHATSAPP OU E-MAIL</p>
          <label className="contato__campo">
            <span>Seu nome ou empresa</span>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Ricardo · Loja em Jaú ou Tech Lead"
              maxLength={80}
            />
          </label>
          <label className="contato__campo">
            <span>O que você precisa tirar do papel</span>
            <textarea
              rows={3}
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
              placeholder="Site para empresa, sistema sob medida ou vaga."
              maxLength={400}
            />
          </label>
          <div className="contato__form-acoes">
            <button type="submit" className="contato__enviar cota" data-mag>
              Enviar pelo WhatsApp
            </button>
            <button type="button" className="contato__sec-email cota" onClick={enviarEmail}>
              Prefiro enviar por e-mail
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
