"use client";
import { useEffect, useState } from "react";
import { CAMARAS } from "../lib/dados";
import { S } from "../lib/store";

export default function ReguaCamaras() {
  const [camaraAtiva, setCamaraAtiva] = useState(0);
  const [progresso, setProgresso] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      const c = S.camara;
      const p = Math.round(S.progress * 100);
      setCamaraAtiva((prev) => (prev === c ? prev : c));
      setProgresso((prev) => (prev === p ? prev : p));
    }, 100);
    return () => window.clearInterval(id);
  }, []);

  return (
    <nav className="regua-camaras" aria-label="Progresso pelas 5 câmaras 3D">
      <div className="regua-camaras__trilha" aria-hidden="true">
        <span style={{ height: `${progresso}%` }} />
      </div>
      <ul>
        {CAMARAS.map((c) => {
          const ativa = camaraAtiva === c.id;
          return (
            <li key={c.id} className={ativa ? "ativa" : ""}>
              <a href={c.anchor} aria-current={ativa ? "step" : undefined}>
                <i style={{ background: ativa ? c.cor : undefined }} aria-hidden="true" />
                <span className="cota">{c.curto}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
