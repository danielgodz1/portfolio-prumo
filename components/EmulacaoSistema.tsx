"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { S } from "../lib/store";
import { CHECK, REQ } from "../lib/telas.js";

gsap.registerPlugin(ScrollTrigger);

interface Props {
  id: "flowcheck" | "flowrequest";
}

const DADOS = {
  flowcheck: CHECK,
  flowrequest: REQ,
} as const;

const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

export default function EmulacaoSistema({ id }: Props) {
  const cfg = DADOS[id];
  const secRef = useRef<HTMLElement>(null);
  const janRef = useRef<HTMLDivElement>(null);

  const [passoAtivo, setPassoAtivo] = useState(0);
  const [sub, setSub] = useState(1); // 0..1 dentro do passo atual
  const [manualStep, setManualStep] = useState<number | null>(null);
  const [planoAprovadoManual, setPlanoAprovadoManual] = useState(false);
  const [reqEnviadaManual, setReqEnviadaManual] = useState(false);
  const [motionRev, setMotionRev] = useState(0);
  const manualRef = useRef<number | null>(null);
  manualRef.current = manualStep;

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
    if (!sec) return;

    if (S.reduced || S.modo2D) {
      setPassoAtivo(0);
      setSub(1);
      if (janRef.current) janRef.current.style.transform = "";
      return;
    }

    const st = ScrollTrigger.create({
      trigger: sec,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.5,
      onUpdate: (self) => {
        const p = self.progress;
        if (manualRef.current === null) {
          const total = cfg.passos.length;
          const scaled = p * total;
          const idx = Math.min(total - 1, Math.floor(scaled));
          const localSub = Math.min(1, Math.max(0, scaled - idx));
          setPassoAtivo(idx);
          setSub(idx === total - 1 && p > 0.96 ? 1 : localSub);
        }
        if (janRef.current && window.innerWidth >= 900) {
          const tiltY = (p - 0.5) * -7 + S.px * 3.5;
          const tiltX = Math.sin(p * Math.PI) * 3.2 - S.py * 2.5;
          janRef.current.style.transform = `perspective(1200px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`;
        } else if (janRef.current) {
          janRef.current.style.transform = "";
        }
      },
      onLeave: () => {
        if (manualRef.current !== null) setManualStep(null);
      },
      onLeaveBack: () => {
        if (manualRef.current !== null) setManualStep(null);
      },
    });

    ScrollTrigger.refresh();
    return () => {
      st.kill();
    };
  }, [cfg.passos.length, motionRev]);

  const selecionarPasso = (idx: number) => {
    setManualStep(idx);
    setPassoAtivo(idx);
    setSub(1);
  };

  const onTabKeyDown = (e: React.KeyboardEvent, idx: number) => {
    const total = cfg.passos.length;
    let next = idx;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      next = (idx + 1) % total;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      next = (idx - 1 + total) % total;
    } else if (e.key === "Home") {
      next = 0;
    } else if (e.key === "End") {
      next = total - 1;
    } else {
      return;
    }
    e.preventDefault();
    selecionarPasso(next);
    const parent = (e.currentTarget as HTMLElement).parentElement;
    const btns = parent?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    btns?.[next]?.focus();
  };

  const progressoGeral = Math.round(((passoAtivo + sub) / cfg.passos.length) * 100);
  const subEased = manualStep !== null || S.reduced ? 1 : easeOut(sub);

  // Valores dinâmicos FlowCheck
  const kpiChecklists = Math.round(14 * subEased);
  const kpiNc = Math.round(3 * subEased);
  const kpiPend = Math.round(5 * subEased);
  const ncMarcada = passoAtivo === 1 && (manualStep === 1 || S.reduced || sub > 0.34);
  const fotoVisivel = passoAtivo === 1 && (manualStep === 1 || S.reduced || sub > 0.56);
  const planoLinhas = passoAtivo === 2 ? (manualStep === 2 || S.reduced ? 5 : Math.min(5, Math.ceil(sub * 5.8))) : 0;
  const planoAprovado = planoAprovadoManual || (passoAtivo === 2 && (manualStep === 2 || S.reduced || sub > 0.8));
  const carimboSha = passoAtivo === 3 && (manualStep === 3 || S.reduced || sub > 0.42);

  // Valores dinâmicos FlowRequest
  const reqItensVisiveis = passoAtivo === 0 ? (manualStep === 0 || S.reduced ? 3 : Math.min(3, Math.ceil(sub * 3.6))) : 0;
  const reqEnviada = reqEnviadaManual || (passoAtivo === 0 && (manualStep === 0 || S.reduced || sub > 0.78));
  const stepperStage = passoAtivo === 1 ? (manualStep === 1 || S.reduced ? 3 : Math.min(3, Math.floor(sub * 3.6))) : 0;
  const horasRestantes = passoAtivo === 2 ? (manualStep === 2 || S.reduced ? 0 : Math.max(0, Math.round(48 * (1 - subEased)))) : 48;
  const barraFator = passoAtivo === 3 ? subEased : 0;

  const navLabels =
    id === "flowcheck"
      ? ["Painel / Dashboard", "Executar Checklist", "Aprovações Pendentes", "Relatórios & Exportação"]
      : ["Nova requisição", "Listagem & Fluxo", "Auto-conclusão 48h", "Consumo por setor"];

  return (
    <section
      ref={secRef}
      className={`emul emul--${cfg.tema} com-js`}
      id={`emul-${cfg.id}`}
      data-passos={cfg.passos.length}
      data-passo={passoAtivo}
      aria-labelledby={`em-${cfg.id}`}
    >
      <div className="emul__palco">
        <div className="emul__texto">
          <div className="emul__topo-meta">
            <p className="emul__kicker">Por dentro: {cfg.titulo}</p>
            <span className="emul__prog-pct cota" aria-hidden="true">
              {String(progressoGeral).padStart(2, "0")}%
            </span>
          </div>
          <h3 id={`em-${cfg.id}`} className="disp">
            O sistema real, passo a passo.
          </h3>

          <div className="emul__passos" role="tablist" aria-label={`Etapas de ${cfg.titulo}`}>
            {cfg.passos.map(([t, d]: string[], i: number) => {
              const ativo = passoAtivo === i;
              return (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  id={`tab-${cfg.id}-${i}`}
                  aria-selected={ativo}
                  aria-controls={`panel-${cfg.id}-${i}`}
                  className={`emul__passo-btn${ativo ? " on" : ""}`}
                  onClick={() => selecionarPasso(i)}
                  onKeyDown={(e) => onTabKeyDown(e, i)}
                >
                  <strong>
                    0{i + 1} · {t}
                  </strong>
                  <span>{d}</span>
                </button>
              );
            })}
          </div>

          <div className="emul__rodape-texto">
            <p className="emul__aviso">Emulação feita por mim, com dados fictícios. Role ou clique nas etapas.</p>
            {manualStep !== null && (
              <button type="button" className="emul__sync cota" onClick={() => setManualStep(null)}>
                Sincronizar com rolagem
              </button>
            )}
          </div>
        </div>

        <div ref={janRef} className="emul__janela">
          <div className="jan__barra">
            <i />
            <i />
            <i />
            <span>{cfg.titulo} · emulação interativa</span>
            <div className="jan__progresso" aria-hidden="true">
              <span style={{ width: `${progressoGeral}%` }} />
            </div>
          </div>

          <div className="jan__corpo">
            <nav className="s-nav" role="tablist" aria-label={`Menu do sistema ${cfg.titulo}`}>
              {navLabels.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  role="tab"
                  aria-selected={passoAtivo === i}
                  aria-controls={`panel-${cfg.id}-${i}`}
                  className={`s-nav__i${passoAtivo === i ? " ativo" : ""}`}
                  onClick={() => selecionarPasso(i)}
                  onKeyDown={(e) => onTabKeyDown(e, i)}
                >
                  {label}
                </button>
              ))}
            </nav>

            <div className="s-main">
              {id === "flowcheck" ? (
                <>
                  <div
                    id={`panel-flowcheck-0`}
                    role="tabpanel"
                    aria-labelledby="tab-flowcheck-0"
                    className={`tela${passoAtivo === 0 ? " on" : ""}`}
                    hidden={passoAtivo !== 0}
                  >
                    <h4>Painel / Dashboard</h4>
                    <div className="s-kpis">
                      <div>
                        <b>{kpiChecklists}</b>
                        <span>checklists hoje</span>
                      </div>
                      <div className="alerta">
                        <b>{kpiNc}</b>
                        <span>não conformidades</span>
                      </div>
                      <div>
                        <b>{kpiPend}</b>
                        <span>aguardando aprovação</span>
                      </div>
                    </div>
                    <div className="s-barras" aria-hidden="true">
                      {[40, 62, 48, 80, 56, 70, 34].map((h, idx) => (
                        <i
                          key={idx}
                          style={{
                            height: `${h}%`,
                            transform: `scaleY(${passoAtivo === 0 ? Math.min(1, Math.max(0.12, subEased * 1.15 - idx * 0.06)) : 0})`,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div
                    id={`panel-flowcheck-1`}
                    role="tabpanel"
                    aria-labelledby="tab-flowcheck-1"
                    className={`tela${passoAtivo === 1 ? " on" : ""}`}
                    hidden={passoAtivo !== 1}
                  >
                    <h4>Caminhão basculante · pré-operação</h4>
                    <div className={`s-cursor${ncMarcada ? " clicou" : ""}`} aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="18" height="18">
                        <path d="M4 2l14 11-6 1.5 3.5 6.5-2.5 1.2L9.5 16 5 19.5z" fill="#151817" stroke="#fff" strokeWidth="1.5" />
                      </svg>
                    </div>
                    <ul className="s-itens">
                      <li>
                        <span>Pneus e calibragem</span>
                        <em className="ok">Conforme (C)</em>
                      </li>
                      <li>
                        <span>Freios</span>
                        <em className="ok">Conforme (C)</em>
                      </li>
                      <li className={ncMarcada ? "nc" : ""}>
                        <span>Luzes e sinalização</span>
                        <em className={ncMarcada ? "bad" : "pend"}>{ncMarcada ? "Não conforme" : "Pendente"}</em>
                      </li>
                      <li>
                        <span>Extintor</span>
                        <em className="ok">Conforme (C)</em>
                      </li>
                    </ul>
                    <div className={`s-foto${fotoVisivel ? " visivel" : ""}`}>
                      <div className="s-foto__img" aria-hidden="true">
                        <span>CAM-04</span>
                      </div>
                      <span>Evidência anexada · farol dianteiro sem funcionar</span>
                    </div>
                  </div>

                  <div
                    id={`panel-flowcheck-2`}
                    role="tabpanel"
                    aria-labelledby="tab-flowcheck-2"
                    className={`tela${passoAtivo === 2 ? " on" : ""}`}
                    hidden={passoAtivo !== 2}
                  >
                    <h4>Aprovações Pendentes · IA 5W2H</h4>
                    <div className="s-card">
                      <div className="s-card__topo">
                        <b>Luzes e sinalização</b>
                        <span className="tag">Não conforme</span>
                      </div>
                      <p className="s-plano__t">Plano sugerido pela IA (5W2H):</p>
                      <ul className="s-plano">
                        {[
                          ["O quê", "Trocar o farol dianteiro esquerdo"],
                          ["Quem", "Equipe de manutenção elétrica"],
                          ["Quando", "Antes da próxima saída de pátio"],
                          ["Onde", "Box 02 da oficina central"],
                          ["Por quê", "Visibilidade noturna e conformidade NR"],
                        ].map(([k, v], i) => (
                          <li key={k} className={planoLinhas > i ? "visivel" : ""}>
                            <b>{k}</b> {v}
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        className={`s-btn${planoAprovado ? " aprovado" : ""}`}
                        onClick={() => setPlanoAprovadoManual((v) => !v)}
                      >
                        {planoAprovado ? "Plano aprovado [OK]" : "Aprovar plano"}
                      </button>
                    </div>
                  </div>

                  <div
                    id={`panel-flowcheck-3`}
                    role="tabpanel"
                    aria-labelledby="tab-flowcheck-3"
                    className={`tela${passoAtivo === 3 ? " on" : ""}`}
                    hidden={passoAtivo !== 3}
                  >
                    <h4>Relatórios &amp; Exportação</h4>
                    <div className={`s-folha${carimboSha ? " carimbada" : ""}`}>
                      <div className="s-folha__t" />
                      <div className="s-folha__l" />
                      <div className="s-folha__l c" />
                      <div className="s-folha__l" />
                      <div className={`s-assina${carimboSha ? " ativa" : ""}`}>
                        <svg viewBox="0 0 120 30" aria-hidden="true">
                          <path
                            d="M4 22 C20 4 26 30 40 14 S70 20 90 10 S108 16 116 12"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            pathLength={1}
                          />
                        </svg>
                        <span className="s-selo-sha">Assinado digitalmente · SHA-256</span>
                      </div>
                    </div>
                    <div className="s-acoes">
                      <span className="s-btn">Exportar PDF</span>
                      <span className="s-btn s-btn--ghost">Exportar Excel</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div
                    id={`panel-flowrequest-0`}
                    role="tabpanel"
                    aria-labelledby="tab-flowrequest-0"
                    className={`tela${passoAtivo === 0 ? " on" : ""}`}
                    hidden={passoAtivo !== 0}
                  >
                    <h4>Nova requisição · Almoxarifado</h4>
                    <ul className="s-itens s-itens--lista">
                      {[
                        ["Luva de raspa", "4 un"],
                        ['Disco de corte 7"', "10 un"],
                        ["Fita isolante 20 m", "2 un"],
                      ].map(([nome, qtd], idx) => (
                        <li key={nome} style={{ opacity: reqItensVisiveis > idx ? 1 : 0.18, transform: reqItensVisiveis > idx ? "none" : "translateY(6px)" }}>
                          <span>{nome}</span>
                          <em>{qtd}</em>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      className={`s-btn${reqEnviada ? " aprovado" : ""}`}
                      onClick={() => setReqEnviadaManual((v) => !v)}
                    >
                      {reqEnviada ? "Requisição enviada #REQ-408 [OK]" : "Enviar requisição"}
                    </button>
                  </div>

                  <div
                    id={`panel-flowrequest-1`}
                    role="tabpanel"
                    aria-labelledby="tab-flowrequest-1"
                    className={`tela${passoAtivo === 1 ? " on" : ""}`}
                    hidden={passoAtivo !== 1}
                  >
                    <h4>Acompanhamento de aprovação</h4>
                    <ol className="s-trilho">
                      {["Criada em campo", "Aguardando aprovação", "Aguardando retirada", "Concluída no almoxarifado"].map((st, idx) => (
                        <li key={st} className={stepperStage > idx ? "f" : stepperStage === idx ? "a" : ""}>
                          {st}
                        </li>
                      ))}
                    </ol>
                    <div className="s-card">
                      <b>Requisição de almoxarifado · #REQ-408</b>
                      <span>3 itens · setor Manutenção · obra Jaú/SP</span>
                    </div>
                  </div>

                  <div
                    id={`panel-flowrequest-2`}
                    role="tabpanel"
                    aria-labelledby="tab-flowrequest-2"
                    className={`tela${passoAtivo === 2 ? " on" : ""}`}
                    hidden={passoAtivo !== 2}
                  >
                    <h4>Auto-conclusão em 48 horas</h4>
                    <div className="s-reloj">
                      <svg viewBox="0 0 120 120" aria-hidden="true">
                        <circle cx="60" cy="60" r="50" className="trilha" />
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          className="prog"
                          pathLength="1"
                          style={{ strokeDashoffset: passoAtivo === 2 ? 1 - subEased : 1 }}
                        />
                      </svg>
                      <b>{String(horasRestantes).padStart(2, "0")}:00 h</b>
                    </div>
                    <span className={`s-status${horasRestantes === 0 ? " pronta" : ""}`}>
                      {horasRestantes === 0 ? "Concluída automaticamente" : "Janela de retirada ativa"}
                    </span>
                  </div>

                  <div
                    id={`panel-flowrequest-3`}
                    role="tabpanel"
                    aria-labelledby="tab-flowrequest-3"
                    className={`tela${passoAtivo === 3 ? " on" : ""}`}
                    hidden={passoAtivo !== 3}
                  >
                    <h4>Consumo por setor</h4>
                    <div className="s-hbar">
                      {[
                        ["Manutenção", 86],
                        ["Oficina", 62],
                        ["Obra", 44],
                        ["Escritório", 21],
                      ].map(([setor, pct]) => (
                        <div key={String(setor)}>
                          <span>{setor}</span>
                          <div className="s-hbar__trilha">
                            <i style={{ width: `${Number(pct) * barraFator}%` }} />
                          </div>
                          <em className="s-hbar__pct">{Math.round(Number(pct) * barraFator)}%</em>
                        </div>
                      ))}
                    </div>
                    <div className="s-acoes">
                      <span className="s-btn">Comprovante PDF</span>
                      <span className="s-btn s-btn--ghost">Planilha Excel</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
