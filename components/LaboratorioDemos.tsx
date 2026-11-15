"use client";
import { useEffect, useRef, useState } from "react";
import { definirSom, tocarCliqueCota } from "../lib/som";

export function DemoPendulo() {
  const [rigidez, setRigidez] = useState(26);
  const [amort, setAmort] = useState(3.2);
  const [angulo, setAngulo] = useState(0);
  const velRef = useRef(0);
  const angRef = useRef(0);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const acc = -rigidez * angRef.current - velRef.current * amort;
      velRef.current += acc * dt;
      angRef.current += velRef.current * dt;
      setAngulo(Math.round(angRef.current * 1000) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [rigidez, amort]);

  const impulsionar = () => {
    velRef.current += 4.2;
  };

  const deg = ((angulo * 180) / Math.PI).toFixed(1);

  return (
    <div className="lab-demo">
      <div className="lab-demo__controles">
        <button type="button" className="lab-demo__btn cota" onClick={impulsionar}>
          Dar impulso no prumo
        </button>
        <label className="cota">
          Mola ({rigidez})
          <input type="range" min={10} max={50} value={rigidez} onChange={(e) => setRigidez(Number(e.target.value))} />
        </label>
        <label className="cota">
          Amortecimento ({amort.toFixed(1)})
          <input
            type="range"
            min={1}
            max={7}
            step={0.2}
            value={amort}
            onChange={(e) => setAmort(Number(e.target.value))}
          />
        </label>
        <span className="cota" aria-live="polite">
          desvio: {deg}°
        </span>
      </div>
      <svg viewBox="0 0 240 130" width="240" height="130" aria-label="Simulação ao vivo do fio de prumo">
        <line x1="40" y1="10" x2="200" y2="10" stroke="rgba(236,238,240,0.4)" strokeWidth="2" />
        <g transform={`translate(120, 10) rotate(${deg})`}>
          <line x1="0" y1="0" x2="0" y2="86" stroke="#ECEEF0" strokeWidth="2" />
          <polygon points="-10,86 10,86 0,110" fill="#FFD23F" />
        </g>
      </svg>
    </div>
  );
}

export function DemoCelularRapido() {
  const [perfil, setPerfil] = useState<"celular-simples" | "desktop-gpu">("celular-simples");

  const config =
    perfil === "celular-simples"
      ? {
          dpr: "[1, 1.2]",
          posProc: "Desligado (sem pós-processamento pesado)",
          modoInicial: "Atalho Leitura 2D automático em saveData ou RAM <= 4 GB",
          midia: "Zero arquivos .mp3/.glb externos; shaders e som gerados em código",
        }
      : {
          dpr: "[1, 1.65]",
          posProc: "Bloom + Vignette em GPU dedicada",
          modoInicial: "Viagem 3D contínua nas 5 câmaras + QualityScaler automático",
          midia: "Mesmo bundle HTML/CSS primeiro; Three.js entra por dynamic import",
        };

  return (
    <div className="lab-demo">
      <div className="lab-demo__controles">
        <button
          type="button"
          className="lab-demo__btn cota"
          onClick={() => setPerfil("celular-simples")}
          aria-pressed={perfil === "celular-simples"}
        >
          Simular celular simples
        </button>
        <button
          type="button"
          className="lab-demo__btn cota"
          onClick={() => setPerfil("desktop-gpu")}
          aria-pressed={perfil === "desktop-gpu"}
        >
          Simular desktop com GPU
        </button>
      </div>
      <dl className="arco-empresa__grade" style={{ marginTop: "0.25rem" }}>
        <div>
          <dt className="cota">DPR</dt>
          <dd>{config.dpr}</dd>
        </div>
        <div>
          <dt className="cota">Passes de tela</dt>
          <dd>{config.posProc}</dd>
        </div>
        <div>
          <dt className="cota">Modo de leitura</dt>
          <dd>{config.modoInicial}</dd>
        </div>
        <div>
          <dt className="cota">Peso de mídia</dt>
          <dd>{config.midia}</dd>
        </div>
      </dl>
    </div>
  );
}

export function DemoSomCota() {
  const [ultimo, setUltimo] = useState<string>("Clique em uma cota para ouvir o clique mecânico (Web Audio).");

  const tocar = (m: number) => {
    definirSom(true, true);
    tocarCliqueCota(m);
    setUltimo(`Cota +${m},00 m disparada (pulso triangular + filtro passa-banda sem arquivos MP3).`);
  };

  return (
    <div className="lab-demo">
      <div className="lab-demo__controles">
        {[3, 6, 9].map((m) => (
          <button key={m} type="button" className="lab-demo__btn cota" onClick={() => tocar(m)}>
            Disparar cota +{m},00 m
          </button>
        ))}
      </div>
      <p className="cota" aria-live="polite" style={{ margin: 0 }}>
        {ultimo}
      </p>
    </div>
  );
}
