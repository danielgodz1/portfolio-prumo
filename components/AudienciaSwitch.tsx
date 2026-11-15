"use client";
import { useEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { S } from "../lib/store";

export type Audiencia = "empresa" | "dev";

function lerAudienciaInicial(): Audiencia {
  if (typeof window === "undefined") return "empresa";
  const urlPara = new URLSearchParams(window.location.search).get("para");
  if (urlPara === "empresa" || urlPara === "dev") return urlPara;
  try {
    const salvo = localStorage.getItem("prumo-para");
    if (salvo === "empresa" || salvo === "dev") return salvo;
  } catch {
    // ignora
  }
  return "empresa";
}

function aplicarAudienciaDOM(val: Audiencia, atualizarUrl = true) {
  S.audiencia = val;
  document.documentElement.dataset.para = val;
  try {
    localStorage.setItem("prumo-para", val);
  } catch {
    // ignora
  }
  if (atualizarUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set("para", val);
    window.history.replaceState(null, "", url.toString());
  }
  window.dispatchEvent(new CustomEvent("prumo:audiencia", { detail: { audiencia: val } }));
  window.requestAnimationFrame(() => ScrollTrigger.refresh());
}

/** Seletor de perfil ("Tenho uma empresa" vs "Sou recrutador ou dev") + atalho Leitura Rápida 2D. */
export default function AudienciaSwitch() {
  const [audiencia, setAudiencia] = useState<Audiencia>("empresa");
  const [modo2D, setModo2D] = useState(false);

  useEffect(() => {
    const inicial = lerAudienciaInicial();
    setAudiencia(inicial);
    aplicarAudienciaDOM(inicial, false);
    setModo2D(document.documentElement.classList.contains("modo-2d"));

    const onAud = (e: Event) => {
      const next = (e as CustomEvent<{ audiencia: Audiencia }>).detail?.audiencia;
      if (next === "empresa" || next === "dev") setAudiencia(next);
    };
    const onModo2D = (e: Event) => {
      const flag = Boolean((e as CustomEvent<{ modo2D: boolean }>).detail?.modo2D);
      setModo2D(flag);
    };
    window.addEventListener("prumo:audiencia", onAud);
    window.addEventListener("prumo:modo2d", onModo2D);
    return () => {
      window.removeEventListener("prumo:audiencia", onAud);
      window.removeEventListener("prumo:modo2d", onModo2D);
    };
  }, []);

  const escolher = (val: Audiencia) => {
    setAudiencia(val);
    aplicarAudienciaDOM(val, true);
  };

  const alternar2D = () => {
    const prox = !modo2D;
    S.modo2D = prox;
    setModo2D(prox);
    try {
      sessionStorage.setItem("prumo-modo2d", prox ? "1" : "0");
    } catch {
      // ignora
    }
    document.documentElement.classList.toggle("modo-2d", prox);
    window.dispatchEvent(new CustomEvent("prumo:modo2d", { detail: { modo2D: prox } }));
  };

  return (
    <div className="audiencia-barra entra">
      <div className="audiencia-switch" role="tablist" aria-label="Escolha como navegar no portfólio">
        <button
          type="button"
          role="tab"
          aria-selected={audiencia === "empresa"}
          className={`audiencia-tab${audiencia === "empresa" ? " is-ativa" : ""}`}
          onClick={() => escolher("empresa")}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") escolher("dev");
          }}
        >
          Tenho uma empresa
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={audiencia === "dev"}
          className={`audiencia-tab${audiencia === "dev" ? " is-ativa" : ""}`}
          onClick={() => escolher("dev")}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") escolher("empresa");
          }}
        >
          Sou recrutador ou dev
        </button>
      </div>
      <button
        type="button"
        className={`audiencia-2d cota${modo2D ? " is-ativa" : ""}`}
        onClick={alternar2D}
        aria-pressed={modo2D}
        aria-label={modo2D ? "Voltar para viagem 3D contínua" : "Ativar leitura rápida em 2D sem animações de rolagem"}
      >
        {modo2D ? "Voltar ao 3D" : "Leitura rápida (2D)"}
      </button>
    </div>
  );
}
