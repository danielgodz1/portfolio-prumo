"use client";
import { useEffect, useState } from "react";
import { S } from "../lib/store";

export default function NavegacaoTopo() {
  const [modo2D, setModo2D] = useState(false);

  useEffect(() => {
    setModo2D(document.documentElement.classList.contains("modo-2d"));
  }, []);

  const alternarModo2D = () => {
    const prox = !modo2D;
    S.modo2D = prox;
    setModo2D(prox);
    document.documentElement.classList.toggle("modo-2d", prox);
    window.dispatchEvent(new CustomEvent("prumo:modo2d", { detail: { modo2D: prox } }));
  };

  return (
    <header className="topo">
      <a href="#topo" className="topo__marca" data-cursor="hover" data-swap>
        Daniel dos Santos
      </a>
      <nav aria-label="Navegação principal">
        <a href="#camara-01" data-cursor="hover" data-swap>
          Sistemas
        </a>
        <a href="#camara-02" data-cursor="hover" data-swap>
          Império 3D
        </a>
        <a href="#camara-03" data-cursor="hover" data-swap>
          10 Modelos
        </a>
        <a href="#camara-04" data-cursor="hover" data-swap>
          Infra &amp; Sobre
        </a>
        <a href="#contato" data-cursor="hover" data-swap>
          Contato
        </a>
      </nav>
      <button
        type="button"
        className={`topo__modo cota${modo2D ? " ativo" : ""}`}
        onClick={alternarModo2D}
        aria-pressed={modo2D}
        aria-label={modo2D ? "Voltar ao modo de viagem 3D contínua" : "Ativar Acesso Rápido 2D para leitura direta"}
      >
        {modo2D ? "Modo 3D Completo" : "Acesso Rápido 2D"}
      </button>
    </header>
  );
}
