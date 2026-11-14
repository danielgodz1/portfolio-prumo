"use client";
import { useState } from "react";
import { CONTATO } from "../lib/dados";
import { S } from "../lib/store";
import { tocarTransmissao } from "../lib/som";

export default function ContatoCanal() {
  const [copiado, setCopiado] = useState(false);
  const [nome, setNome] = useState("");
  const [assunto, setAssunto] = useState("");

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

  const abrirWhatsApp = () => {
    dispararReverenciaNavi();
    const texto = encodeURIComponent(
      `Oi Daniel! Vi seu portfólio${nome ? ` (sou ${nome})` : ""} e quero conversar sobre ${assunto.trim() || "um projeto web / vaga"}.`,
    );
    const num = process.env.NEXT_PUBLIC_WHATSAPP?.replace(/\D/g, "") ?? "";
    const url = num ? `https://wa.me/${num}?text=${texto}` : `https://wa.me/?text=${texto}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const abrirMensagem = (e: React.FormEvent) => {
    e.preventDefault();
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
            Canal de transmissão · Jaú/SP · Pronto para envio
          </p>
          <a
            className="cta disp"
            href={`mailto:${CONTATO.email}`}
            onClick={dispararReverenciaNavi}
            data-mag
            data-cursor="hover"
            aria-label="Vamos conversar: enviar e-mail para Daniel dos Santos"
          >
            Vamos conversar
          </a>

          <div className="contato__email-linha">
            <span className="contato__email cota">{CONTATO.email}</span>
            <button
              type="button"
              className={`contato__copiar cota${copiado ? " ok" : ""}`}
              onClick={copiarEmail}
              aria-label="Copiar endereço de e-mail para a área de transferência"
            >
              {copiado ? "Copiado para a área de transferência [OK]" : "Copiar E-mail"}
            </button>
            <button
              type="button"
              className="contato__whats cota"
              onClick={abrirWhatsApp}
              data-mag
              aria-label="Chamar no WhatsApp com mensagem pronta"
            >
              Chamar no WhatsApp ↗
            </button>
          </div>
          <p className="sr-only" role="status" aria-live="polite">
            {copiado ? "E-mail copiado para a área de transferência." : ""}
          </p>

          <div className="contato__redes">
            <a href={CONTATO.github} onClick={dispararReverenciaNavi} target="_blank" rel="noopener noreferrer" data-cursor="hover" data-swap>
              GitHub · danielgodz1 ↗
            </a>
            <a href={CONTATO.linkedin} onClick={dispararReverenciaNavi} target="_blank" rel="noopener noreferrer" data-cursor="hover" data-swap>
              LinkedIn · danieldossantos-ti ↗
            </a>
          </div>
        </div>

        <form className="contato__rapido painel-chanfrado" onSubmit={abrirMensagem} aria-label="Mensagem rápida">
          <p className="cota">TRANSMISSÃO DIRETA // 0xTX</p>
          <label className="contato__campo">
            <span>Seu nome ou empresa</span>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Ricardo · Marcenaria ou Tech Lead"
              maxLength={80}
            />
          </label>
          <label className="contato__campo">
            <span>O que você precisa tirar do papel</span>
            <textarea
              rows={3}
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
              placeholder="Sistema corporativo, infraestrutura, site 3D ou vaga."
              maxLength={400}
            />
          </label>
          <button type="submit" className="contato__enviar cota" data-mag>
            Abrir rascunho no e-mail →
          </button>
        </form>
      </div>
    </section>
  );
}
