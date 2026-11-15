"use client";
import { useState } from "react";
import { KERNEL_DUMP, PILARES_KERNEL, STACK } from "../lib/dados";
import AsciiFoto from "./AsciiFoto";

const COMANDOS_TERM: Record<string, string[]> = {
  help: [
    "Comandos disponíveis: help, stack, zelda, prumo, contato",
    "Dica: clique em um bloco de memória acima ou digite um comando abaixo.",
  ],
  stack: [
    "FRONT & 3D: React 19, Next.js 15, TypeScript, Three.js / R3F, GSAP, Lenis",
    "BACK & IA: Node.js, Express, Supabase (PostgreSQL + RLS), ERP TOTVS RM, n8n, Groq",
    "INFRA & SEC: Windows Server, AD, Hyper-V Replica, MikroTik, UniFi, Zabbix, Wazuh, Sysmon, Bitdefender",
  ],
  zelda: [
    "WORKSTATION: Intel Core i5-14600KF + NVIDIA RTX 5060 Ti",
    "INTERESSE TÉCNICO: engenharia reversa, análise de binários e estudo de decompilação estilo Zelda.",
  ],
  prumo: [
    "MOTOR GRÁFICO: Torre O Prumo (cotas 0,00 m a +15,00 m) + Sistema Solar NASA 2K + Cabos ópticos.",
    "CONVERSÃO: Dual mode (Empresa e Recrutador/Dev) sem bloqueio de acessibilidade no Windows.",
  ],
  contato: [
    "WHATSAPP DIRETO: (14) 99734-5164 · JAÚ/SP",
    "E-MAIL: daniel_santos172@hotmail.com · GITHUB: github.com/danielgodz1",
  ],
};

export default function KernelDumpSecao() {
  const [ativo, setAtivo] = useState(0);
  const [terminalAberto, setTerminalAberto] = useState(false);
  const [cmdInput, setCmdInput] = useState("");
  const [cmdSaida, setCmdSaida] = useState<string[]>(COMANDOS_TERM.help);

  const executarCmd = (bruto: string) => {
    const cmd = bruto.trim().toLowerCase();
    if (!cmd) return;
    setTerminalAberto(true);
    const resp = COMANDOS_TERM[cmd] ?? [
      `Comando '${cmd}' não reconhecido. Use: help, stack, zelda, prumo ou contato.`,
    ];
    setCmdSaida([`> ${cmd}`, ...resp]);
  };

  return (
    <section className="kernel-sec" id="camara-04" aria-labelledby="t-kernel">
      <div className="kernel-wrap">
        <header className="kernel-cabecalho">
          <p className="cota">Cota +15,00 m · O Núcleo · Pilares, Stack &amp; Kernel Inspector</p>
          <h2 id="t-kernel" className="disp">
            Três pilares do chão da operação ao 3D no navegador.
          </h2>
        </header>

        <ul className="pilares-grid" aria-label="Pilares técnicos em produção">
          {PILARES_KERNEL.map((pilar) => (
            <li key={pilar.codigo} className="pilar-card painel-chanfrado">
              <span className="cota pilar-card__cod">{pilar.codigo}</span>
              <h3>{pilar.titulo}</h3>
              <p className="pilar-card__resumo">{pilar.resumo}</p>
              <ul className="pilar-card__itens">
                {pilar.itens.map((item) => (
                  <li key={item} className="cota">
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        <div className="kernel-toggle-linha">
          <button
            type="button"
            className={`kernel-toggle cota${terminalAberto ? " ativo" : ""}`}
            aria-expanded={terminalAberto}
            onClick={() => setTerminalAberto((v) => !v)}
          >
            [ INSPECIONAR KERNEL // 0x00401000 ]
          </button>
          <span className="cota kernel-toggle__hint">
            Dump de memória, hardware e terminal interativo (help · stack · zelda · prumo · contato)
          </span>
        </div>

        <div className="kernel-grid">
          <div className="kernel-ascii painel-chanfrado">
            <div className="kernel-ascii__barra cota">
              <span>MEM_VISUALIZER · ASCII_SHADER</span>
              <span>JAÚ/SP · ATIVO</span>
            </div>
            <figure className="foto">
              <AsciiFoto />
            </figure>
          </div>

          <div className="kernel-dump painel-chanfrado">
            <div className="kernel-dump__barra cota">
              <span>HEX VIEWER // 0x00401000</span>
              <span>ENGENHARIA &amp; DECOMPILAÇÃO</span>
            </div>

            <div className="kernel-dump__lista" role="listbox" aria-label="Blocos de memória do perfil">
              {KERNEL_DUMP.map((row, idx) => {
                const isSel = ativo === idx;
                return (
                  <button
                    key={row.addr}
                    type="button"
                    role="option"
                    aria-selected={isSel}
                    className={`kernel-row${isSel ? " ativa" : ""}`}
                    onClick={() => setAtivo(idx)}
                  >
                    <span className="cota kernel-row__addr">{row.addr}</span>
                    <span className="cota kernel-row__hex">{row.hex}</span>
                    <span className="cota kernel-row__lbl">{row.label}</span>
                    <span className="kernel-row__desc">{row.desc}</span>
                  </button>
                );
              })}
            </div>

            {terminalAberto && (
              <div className="kernel-term" role="region" aria-label="Terminal interativo do Kernel">
                <div className="kernel-term__atalhos">
                  {Object.keys(COMANDOS_TERM).map((k) => (
                    <button key={k} type="button" className="kernel-term__chip cota" onClick={() => executarCmd(k)}>
                      {k}
                    </button>
                  ))}
                </div>
                <div className="kernel-term__log cota" aria-live="polite">
                  {cmdSaida.map((linha, i) => (
                    <p key={`${linha}-${i}`}>{linha}</p>
                  ))}
                </div>
                <form
                  className="kernel-term__form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    executarCmd(cmdInput);
                    setCmdInput("");
                  }}
                >
                  <label htmlFor="kernel-cmd-input" className="sr-only">
                    Comando do terminal
                  </label>
                  <span className="cota" aria-hidden="true">
                    kernel&gt;
                  </span>
                  <input
                    id="kernel-cmd-input"
                    type="text"
                    value={cmdInput}
                    onChange={(e) => setCmdInput(e.target.value)}
                    placeholder="Digite help, stack, zelda, prumo ou contato"
                  />
                  <button type="submit" className="cota">
                    Executar
                  </button>
                </form>
              </div>
            )}

            <div className="kernel-specs">
              <p className="cota">HARDWARE / STACK EM OPERAÇÃO</p>
              <ul className="kernel-tags">
                {STACK.map((s) => (
                  <li key={s} className="cota">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
