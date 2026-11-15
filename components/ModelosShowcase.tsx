"use client";
import { useEffect, useRef, useState } from "react";
import { MODELOS, type SetorModelo } from "../lib/dados";
import { MODELOS_BASE_URL, MODELO_CUSTOM_ATIVO } from "../lib/site";
import { S } from "../lib/store";
import CtaWhatsApp from "./CtaWhatsApp";

/** Preview vetorial exclusivo por modelo, ativado no hover/foco do card. */
function MicroPreview({ slug }: { slug: string }) {
  switch (slug) {
    case "academia":
      return (
        <svg viewBox="0 0 180 72" className="mod-svg mod-svg--academia" aria-hidden="true">
          <line x1="20" y1="36" x2="160" y2="36" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <rect className="anilha-e1" x="34" y="20" width="9" height="32" rx="2" fill="currentColor" />
          <rect className="anilha-e2" x="22" y="24" width="8" height="24" rx="2" fill="#FFD23F" />
          <rect className="anilha-d1" x="137" y="20" width="9" height="32" rx="2" fill="currentColor" />
          <rect className="anilha-d2" x="150" y="24" width="8" height="24" rx="2" fill="#FFD23F" />
        </svg>
      );
    case "roupas":
      return (
        <svg viewBox="0 0 180 72" className="mod-svg mod-svg--roupas" aria-hidden="true">
          <g className="cabide">
            <path d="M90 12c0-4 6-6 6 0 0 3-6 4-6 8l-28 16h56L90 20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
            <rect className="peca" x="66" y="36" width="48" height="24" rx="3" fill="none" stroke="#FFD23F" strokeWidth="2.2" />
          </g>
          <circle className="swatch s1" cx="144" cy="24" r="5" fill="#ECEEF0" />
          <circle className="swatch s2" cx="144" cy="39" r="5" fill="#FFD23F" />
          <circle className="swatch s3" cx="144" cy="54" r="5" fill="#4f75ff" />
        </svg>
      );
    case "perfumes":
      return (
        <svg viewBox="0 0 180 72" className="mod-svg mod-svg--perfumes" aria-hidden="true">
          <polygon points="90,10 56,62 124,62" fill="none" stroke="currentColor" strokeWidth="2" />
          <line className="nota n1" x1="76" y1="28" x2="104" y2="28" stroke="#FFD23F" strokeWidth="2.4" />
          <line className="nota n2" x1="68" y1="44" x2="112" y2="44" stroke="currentColor" strokeWidth="2.2" />
          <circle className="onda" cx="90" cy="38" r="14" fill="none" stroke="#FFD23F" strokeWidth="1.4" />
        </svg>
      );
    case "beleza":
      return (
        <svg viewBox="0 0 180 72" className="mod-svg mod-svg--beleza" aria-hidden="true">
          <path d="M36 42 Q90 14 144 42 Q90 60 36 42 Z" fill="none" stroke="currentColor" strokeWidth="2.2" />
          <circle cx="90" cy="40" r="8" fill="none" stroke="#FFD23F" strokeWidth="2" />
          <g className="cilios" stroke="#FFD23F" strokeWidth="2" strokeLinecap="round">
            <line x1="60" y1="29" x2="54" y2="17" />
            <line x1="75" y1="24" x2="72" y2="11" />
            <line x1="90" y1="22" x2="90" y2="9" />
            <line x1="105" y1="24" x2="108" y2="11" />
            <line x1="120" y1="29" x2="126" y2="17" />
          </g>
        </svg>
      );
    case "restaurante":
      return (
        <svg viewBox="0 0 180 72" className="mod-svg mod-svg--restaurante" aria-hidden="true">
          <ellipse cx="90" cy="56" rx="48" ry="8" fill="none" stroke="currentColor" strokeWidth="2.2" />
          <rect className="camada c1" x="62" y="42" width="56" height="8" rx="4" fill="currentColor" opacity="0.5" />
          <rect className="camada c2" x="70" y="31" width="40" height="8" rx="4" fill="#FFD23F" />
          <circle className="camada c3" cx="90" cy="21" r="6" fill="none" stroke="#ECEEF0" strokeWidth="2" />
        </svg>
      );
    case "hamburgueria":
      return (
        <svg viewBox="0 0 180 72" className="mod-svg mod-svg--burger" aria-hidden="true">
          <path className="b-topo" d="M58 26 C58 14 122 14 122 26 Z" fill="none" stroke="currentColor" strokeWidth="2.2" />
          <path className="b-queijo" d="M56 34 L124 34 L112 40 L96 34 L80 40 L56 34" fill="none" stroke="#FFD23F" strokeWidth="2.2" />
          <rect className="b-carne" x="58" y="43" width="64" height="8" rx="4" fill="currentColor" opacity="0.65" />
          <rect className="b-base" x="60" y="55" width="60" height="7" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "pizzaria":
      return (
        <svg viewBox="0 0 180 72" className="mod-svg mod-svg--pizza" aria-hidden="true">
          <circle cx="90" cy="38" r="24" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="116 36" />
          <g className="fatia">
            <path d="M90 38 L114 26 A26 26 0 0 1 114 50 Z" fill="none" stroke="#FFD23F" strokeWidth="2.4" />
            <circle cx="105" cy="38" r="2.5" fill="#FFD23F" />
          </g>
        </svg>
      );
    case "arquitetura":
      return (
        <svg viewBox="0 0 180 72" className="mod-svg mod-svg--arq" aria-hidden="true">
          <polygon className="laje l1" points="48,54 90,42 132,54 90,64" fill="none" stroke="currentColor" strokeWidth="2" />
          <polygon className="laje l2" points="54,38 90,26 126,38 90,48" fill="none" stroke="#FFD23F" strokeWidth="2" />
          <polygon className="laje l3" points="64,22 90,12 116,22 90,32" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "marcenaria":
      return (
        <svg viewBox="0 0 180 72" className="mod-svg mod-svg--marcenaria" aria-hidden="true">
          <rect x="54" y="14" width="72" height="46" fill="none" stroke="currentColor" strokeWidth="2" />
          <line x1="90" y1="14" x2="90" y2="60" stroke="currentColor" strokeWidth="1.4" strokeDasharray="3 3" />
          <polygon className="porta-e" points="54,14 90,14 90,60 54,60" fill="rgb(255 210 63 / .16)" stroke="#FFD23F" strokeWidth="2" />
          <polygon className="porta-d" points="90,14 126,14 126,60 90,60" fill="rgb(255 210 63 / .16)" stroke="#FFD23F" strokeWidth="2" />
        </svg>
      );
    case "metalurgica":
      return (
        <svg viewBox="0 0 180 72" className="mod-svg mod-svg--metal" aria-hidden="true">
          <rect x="28" y="44" width="124" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
          <polyline points="40,44 64,22 108,22 132,44" fill="none" stroke="#FFD23F" strokeWidth="2.2" />
          <circle cx="90" cy="33" r="5" fill="#FFD23F" />
        </svg>
      );
    case "empresa":
      return (
        <svg viewBox="0 0 180 72" className="mod-svg mod-svg--empresa" aria-hidden="true">
          <rect x="70" y="14" width="40" height="46" rx="3" fill="rgb(255 210 63 / .1)" stroke="#FFD23F" strokeWidth="2.2" />
          <rect x="44" y="26" width="20" height="34" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
          <rect x="116" y="26" width="20" height="34" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "calcados":
      return (
        <svg viewBox="0 0 180 72" className="mod-svg mod-svg--calcados" aria-hidden="true">
          <path d="M40 46 C62 24 94 26 116 38 L142 44 L142 52 L40 52 Z" fill="none" stroke="currentColor" strokeWidth="2.2" />
          <line x1="40" y1="56" x2="144" y2="56" stroke="#FFD23F" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 180 72" className="mod-svg mod-svg--engenharia" aria-hidden="true">
          <line x1="36" y1="60" x2="144" y2="60" stroke="currentColor" strokeWidth="2" />
          <rect className="andar a1" x="62" y="46" width="56" height="14" fill="none" stroke="currentColor" strokeWidth="2" />
          <rect className="andar a2" x="62" y="32" width="56" height="14" fill="none" stroke="currentColor" strokeWidth="2" />
          <rect className="andar a3" x="62" y="18" width="56" height="14" fill="none" stroke="#FFD23F" strokeWidth="2.2" />
        </svg>
      );
  }
}

const SETORES: ("Todos" | SetorModelo)[] = [
  "Todos",
  "Gastronomia & Delivery",
  "Moda & Beleza",
  "Engenharia & Indústria",
  "Serviços",
];

export default function ModelosShowcase() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ ativo: boolean; startX: number; scrollLeft: number; moveu: boolean }>({
    ativo: false,
    startX: 0,
    scrollLeft: 0,
    moveu: false,
  });
  const [setorAtivo, setSetorAtivo] = useState<"Todos" | SetorModelo>("Todos");
  const [modoGrade, setModoGrade] = useState(false);
  const [ativoIdx, setAtivoIdx] = useState(0);
  const [progPct, setProgPct] = useState(0);
  const [empNome, setEmpNome] = useState("");
  const [empCor, setEmpCor] = useState("#0F2C7A");
  const [empWhats, setEmpWhats] = useState("");
  const [empSlug, setEmpSlug] = useState(MODELOS[0]?.slug ?? "academia");

  const modelosVisiveis = setorAtivo === "Todos" ? MODELOS : MODELOS.filter((m) => m.setor === setorAtivo);

  useEffect(() => {
    const vp = viewportRef.current;
    if (vp) vp.scrollLeft = 0;
    setAtivoIdx(0);
    setProgPct(0);
  }, [setorAtivo, modoGrade]);

  const atualizarProgresso = () => {
    const vp = viewportRef.current;
    if (!vp) return;
    const max = Math.max(1, vp.scrollWidth - vp.clientWidth);
    const pct = Math.round((vp.scrollLeft / max) * 100);
    const total = modelosVisiveis.length;
    const idx = Math.min(total - 1, Math.floor((vp.scrollLeft / max) * total));
    setProgPct(Math.max(0, Math.min(100, pct)));
    setAtivoIdx((prev) => (prev === idx ? prev : idx));
  };

  const irParaCard = (delta: number) => {
    const vp = viewportRef.current;
    if (!vp) return;
    const total = modelosVisiveis.length + 1;
    const alvo = Math.max(0, Math.min(total - 1, ativoIdx + delta));
    setAtivoIdx(alvo);
    const cards = vp.querySelectorAll<HTMLElement>(".mod-card");
    const targetCard = cards[alvo];
    if (targetCard) {
      vp.scrollTo({
        left: Math.max(0, targetCard.offsetLeft - 8),
        behavior: S.reduced ? "auto" : "smooth",
      });
    }
  };

  const onDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    if (modoGrade || e.button !== 0 || (e.target as HTMLElement).closest("a,button,input,select")) return;
    const vp = viewportRef.current;
    if (!vp) return;
    dragRef.current = { ativo: true, startX: e.clientX, scrollLeft: vp.scrollLeft, moveu: false };
    vp.classList.add("is-dragging");
  };

  const onDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.ativo) return;
    const vp = viewportRef.current;
    if (!vp) return;
    const dx = e.clientX - dragRef.current.startX;
    if (Math.abs(dx) > 5) dragRef.current.moveu = true;
    vp.scrollLeft = dragRef.current.scrollLeft - dx;
  };

  const onDragEnd = () => {
    if (!dragRef.current.ativo) return;
    dragRef.current.ativo = false;
    viewportRef.current?.classList.remove("is-dragging");
  };

  const onCardMove = (e: React.MouseEvent<HTMLElement>) => {
    if (S.reduced) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-ny * 10).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(nx * 12).toFixed(2)}deg`);
    el.style.setProperty("--mx", `${((nx + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty("--my", `${((ny + 0.5) * 100).toFixed(1)}%`);
  };

  const onCardLeave = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <section className="modelos-sec" id="camara-03" aria-labelledby="t-modelos">
      <div className="modelos-palco">
        <header className="modelos-cabecalho">
          <div>
            <p className="cota" data-only="dev">Cota +12,00 m · Portal dos 13 Modelos · Arraste ou use os botões</p>
            <p className="cota" data-only="empresa">Modelos prontos para adaptar ao seu negócio · 13 segmentos</p>
            <h2 id="t-modelos" className="disp">
              Exemplos por área de atuação
            </h2>
          </div>
          <div className="modelos-ctrls">
            <span className="cota" aria-live="polite">
              {String(Math.min(modelosVisiveis.length, ativoIdx + 1)).padStart(2, "0")} / {modelosVisiveis.length}
            </span>
            <button type="button" className="modelos-btn cota" onClick={() => irParaCard(-1)} aria-label="Modelo anterior">
              Anterior
            </button>
            <button type="button" className="modelos-btn cota" onClick={() => irParaCard(1)} aria-label="Próximo modelo">
              Próximo
            </button>
            <button
              type="button"
              className={`modelos-btn cota${modoGrade ? " ativo" : ""}`}
              aria-pressed={modoGrade}
              onClick={() => setModoGrade((v) => !v)}
            >
              {modoGrade ? "Modo carrossel" : "Ver todos (13)"}
            </button>
          </div>
        </header>

        <div className="modelos-filtros" role="group" aria-label="Filtrar modelos por setor">
          {SETORES.map((setor) => {
            const ativo = setorAtivo === setor;
            return (
              <button
                key={setor}
                type="button"
                className={`modelos-filtro cota${ativo ? " ativo" : ""}`}
                aria-pressed={ativo}
                onClick={() => setSetorAtivo(setor)}
              >
                {setor}
              </button>
            );
          })}
        </div>

        <div
          ref={viewportRef}
          className={`modelos-vp${modoGrade ? " is-grade" : ""}`}
          tabIndex={0}
          onScroll={atualizarProgresso}
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          onPointerLeave={onDragEnd}
          onClickCapture={(e) => {
            if (dragRef.current.moveu) {
              e.preventDefault();
              dragRef.current.moveu = false;
            }
          }}
          aria-label="Galeria dos 13 modelos de site. Role horizontalmente, arraste ou use as setas esquerda e direita."
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              irParaCard(-1);
            } else if (e.key === "ArrowRight") {
              e.preventDefault();
              irParaCard(1);
            }
          }}
        >
          <div ref={trackRef} className={`modelos-trilha${modoGrade ? " is-grade" : ""}`}>
            {modelosVisiveis.map((m, i) => (
              <article
                key={m.slug}
                className="mod-card mod-card--tilt"
                onMouseMove={onCardMove}
                onMouseLeave={onCardLeave}
              >
                <a
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="view"
                  aria-label={`Modelo ${String(i + 1).padStart(2, "0")} ${m.nome}: ${m.conceito} Abrir demonstração`}
                >
                  <div className="mod-card__topo">
                    <span className="mod-card__num disp" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="mod-card__badge cota">{m.mecanica}</span>
                  </div>
                  <div className="mod-card__preview">
                    <MicroPreview slug={m.slug} />
                  </div>
                  <div className="mod-card__base">
                    <h3 className="mod-card__nome disp">{m.nome}</h3>
                    <p className="mod-card__conc">{m.conceito}</p>
                    <span className="mod-card__acao cota">Abrir demonstração</span>
                  </div>
                </a>
              </article>
            ))}

            <article className="mod-card mod-card--cta mod-card--tilt" onMouseMove={onCardMove} onMouseLeave={onCardLeave}>
              <div className="mod-card__cta-inner">
                <span className="cota">SOB MEDIDA · JAÚ/SP PARA QUALQUER CIDADE</span>
                <h3 className="disp">Quer ver um site desse porte com o nome e as fotos da sua empresa?</h3>
                <p>Sem template genérico: estrutura clara para vender no WhatsApp e Google, com carregamento rápido.</p>
                <CtaWhatsApp
                  camara="modelos"
                  compacto
                  mensagem="Oi Daniel! Vi os 13 modelos no seu portfólio e quero conversar sobre um site para a minha empresa."
                />
                <a
                  href={`${MODELOS_BASE_URL}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mod-card__todos cota"
                >
                  Abrir vitrine completa de modelos
                </a>
              </div>
            </article>
          </div>
        </div>

        <div className="modelos-demo-barra painel-chanfrado">
          <p>
            Quer ver um desses <strong>13 sistemas funcionando agora</strong> com o nome e as cores da sua empresa?
          </p>
          <div className="modelos-demo-barra__acoes">
            <a
              href={`${MODELOS_BASE_URL}/demo/`}
              target="_blank"
              rel="noopener noreferrer"
              className="link-giz"
              data-cursor="view"
            >
              Testar com o nome da minha loja (1 min)
            </a>
            <a
              href={`${MODELOS_BASE_URL}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="modelos-btn cota"
            >
              Ver tabela de pacotes e preços
            </a>
          </div>
        </div>

        {MODELO_CUSTOM_ATIVO && (
          <form
            className="modelo-custom painel-chanfrado"
            onSubmit={(e) => {
              e.preventDefault();
              const u = new URL(`${MODELOS_BASE_URL}/${empSlug}/`);
              if (empNome.trim()) u.searchParams.set("n", empNome.trim());
              if (empCor) u.searchParams.set("c", empCor);
              if (empWhats.replace(/\D/g, "")) u.searchParams.set("w", empWhats.replace(/\D/g, ""));
              window.open(u.toString(), "_blank", "noopener,noreferrer");
            }}
          >
            <span className="cota">TESTE COM SUA MARCA</span>
            <strong>Ver no nome da minha empresa</strong>
            <input
              type="text"
              placeholder="Nome da sua empresa"
              value={empNome}
              onChange={(e) => setEmpNome(e.target.value)}
              aria-label="Nome da sua empresa"
            />
            <select value={empSlug} onChange={(e) => setEmpSlug(e.target.value)} aria-label="Escolha um modelo">
              {MODELOS.map((m) => (
                <option key={m.slug} value={m.slug}>
                  {m.nome}
                </option>
              ))}
            </select>
            <input
              type="color"
              value={empCor}
              onChange={(e) => setEmpCor(e.target.value)}
              aria-label="Cor principal da marca"
            />
            <input
              type="tel"
              placeholder="WhatsApp (opcional)"
              value={empWhats}
              onChange={(e) => setEmpWhats(e.target.value)}
              aria-label="WhatsApp opcional"
            />
            <button type="submit" className="link-giz">
              Abrir demonstração personalizada
            </button>
          </form>
        )}

        <div className="modelos-barra" aria-hidden="true">
          <span style={{ width: `${progPct}%` }} />
        </div>
      </div>
    </section>
  );
}
