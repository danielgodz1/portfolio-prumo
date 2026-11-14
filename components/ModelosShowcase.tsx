"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MODELOS } from "../lib/dados";
import { S } from "../lib/store";

gsap.registerPlugin(ScrollTrigger);

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

export default function ModelosShowcase() {
  const secRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [ativoIdx, setAtivoIdx] = useState(0);
  const [progPct, setProgPct] = useState(0);
  const [motionRev, setMotionRev] = useState(0);

  useEffect(() => {
    const onMotion = () => setMotionRev((v) => v + 1);
    const onModo2D = () => setMotionRev((v) => v + 1);
    window.addEventListener("prumo:motion", onMotion);
    window.addEventListener("prumo:modo2d", onModo2D);
    return () => {
      window.removeEventListener("prumo:motion", onMotion);
      window.removeEventListener("prumo:modo2d", onModo2D);
    };
  }, []);

  useEffect(() => {
    const sec = secRef.current;
    const vp = viewportRef.current;
    const track = trackRef.current;
    if (!sec || !vp || !track) return;

    const isDesktop = () => window.innerWidth >= 900 && !S.modo2D;

    if (S.reduced || !isDesktop()) {
      track.style.transform = "";
      sec.style.height = "";
      return;
    }

    const totalCards = MODELOS.length + 1;
    const setup = () => {
      const dist = Math.max(0, track.scrollWidth - vp.clientWidth);
      sec.style.height = `${Math.max(180, Math.round((dist / window.innerHeight) * 100 + 120))}vh`;
      return dist;
    };

    let dist = setup();
    let skewNow = 0;

    const st = ScrollTrigger.create({
      trigger: sec,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.45,
      invalidateOnRefresh: true,
      onRefresh: () => {
        dist = setup();
      },
      onUpdate: (self) => {
        const x = -dist * self.progress;
        const targetSkew = Math.max(-5, Math.min(5, S.vel * -0.16));
        skewNow += (targetSkew - skewNow) * 0.25;
        track.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0) skewX(${skewNow.toFixed(2)}deg)`;
        const idx = Math.min(totalCards - 1, Math.floor(self.progress * totalCards));
        setAtivoIdx((prev) => (prev === idx ? prev : idx));
        setProgPct(Math.round(self.progress * 100));
      },
    });

    const onResize = () => {
      if (!isDesktop()) {
        st.disable();
        track.style.transform = "";
        sec.style.height = "";
      } else {
        st.enable();
        ScrollTrigger.refresh();
      }
    };
    window.addEventListener("resize", onResize);
    ScrollTrigger.refresh();

    return () => {
      window.removeEventListener("resize", onResize);
      st.kill();
      track.style.transform = "";
      sec.style.height = "";
    };
  }, [motionRev]);

  const irParaCard = (delta: number) => {
    const vp = viewportRef.current;
    const sec = secRef.current;
    const total = MODELOS.length + 1;
    const alvo = Math.max(0, Math.min(total - 1, ativoIdx + delta));
    setAtivoIdx(alvo);

    if (window.innerWidth < 900 || S.reduced) {
      if (vp) {
        const cards = vp.querySelectorAll<HTMLElement>(".mod-card");
        cards[alvo]?.scrollIntoView({ behavior: S.reduced ? "auto" : "smooth", inline: "center", block: "nearest" });
      }
      return;
    }
    if (sec) {
      const span = Math.max(1, sec.offsetHeight - window.innerHeight);
      const frac = alvo / Math.max(1, total - 1);
      window.scrollTo({ top: sec.offsetTop + span * frac, behavior: "smooth" });
    }
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
    <section ref={secRef} className="modelos-sec" id="camara-03" aria-labelledby="t-modelos">
      <div className="modelos-palco">
        <header className="modelos-cabecalho">
          <div>
            <p className="cota">Câmara 03 · O Portal dos 10 Modelos · Cartuchos Interativos</p>
            <h2 id="t-modelos" className="disp">
              Modelos para o seu negócio
            </h2>
          </div>
          <div className="modelos-ctrls">
            <span className="cota" aria-live="polite">
              {String(Math.min(MODELOS.length, ativoIdx + 1)).padStart(2, "0")} / {MODELOS.length}
            </span>
            <button type="button" className="modelos-btn cota" onClick={() => irParaCard(-1)} aria-label="Modelo anterior">
              ← Anterior
            </button>
            <button type="button" className="modelos-btn cota" onClick={() => irParaCard(1)} aria-label="Próximo modelo">
              Próximo →
            </button>
          </div>
        </header>

        <div ref={viewportRef} className="modelos-vp">
          <div ref={trackRef} className="modelos-trilha">
            {MODELOS.map((m, i) => (
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
                  aria-label={`Cartucho ${String(i + 1).padStart(2, "0")} ${m.nome}: ${m.conceito} Abrir demonstração`}
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
                    <span className="mod-card__acao cota">Carregar cartucho ao vivo ↗</span>
                  </div>
                </a>
              </article>
            ))}

            <article className="mod-card mod-card--cta mod-card--tilt" onMouseMove={onCardMove} onMouseLeave={onCardLeave}>
              <div className="mod-card__cta-inner">
                <span className="cota">SOB MEDIDA · JAÚ/SP PARA QUALQUER CIDADE</span>
                <h3 className="disp">Seu negócio pede um site com esse nível de acabamento?</h3>
                <p>Sem template genérico: direção visual, código próprio e performance real no navegador.</p>
                <a href="#contato" className="link-giz mod-card__cta-btn" data-cursor="hover">
                  Testar uma ideia comigo →
                </a>
              </div>
            </article>
          </div>
        </div>

        <div className="modelos-barra" aria-hidden="true">
          <span style={{ width: `${progPct}%` }} />
        </div>
      </div>
    </section>
  );
}
