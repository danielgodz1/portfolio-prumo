"use client";
import { useState } from "react";
import { KERNEL_DUMP, STACK } from "../lib/dados";
import AsciiFoto from "./AsciiFoto";

export default function KernelDumpSecao() {
  const [ativo, setAtivo] = useState(0);

  return (
    <section className="kernel-sec" id="camara-04" aria-labelledby="t-kernel">
      <div className="kernel-wrap">
        <header className="kernel-cabecalho">
          <p className="cota">Câmara 04 · Memory Dump &amp; Engenharia Reversa</p>
          <h2 id="t-kernel" className="disp">
            The dev behind the kernel.
          </h2>
        </header>

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
