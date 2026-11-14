"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

/** Carrega a cena 3D só no cliente após a primeira pintura e pausa se o container sair da viewport. */
export default function SceneLoader() {
  const [ok, setOk] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = "requestIdleCallback" in window ? (window as any).requestIdleCallback(() => setOk(true), { timeout: 500 }) : setTimeout(() => setOk(true), 120);
    return () => ("cancelIdleCallback" in window ? (window as any).cancelIdleCallback(t) : clearTimeout(t));
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        window.dispatchEvent(new CustomEvent("prumo:canvas-visible", { detail: { visible: entry.isIntersecting } }));
      },
      { threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="canvas-fundo" aria-hidden="true">
      {ok && <Scene />}
    </div>
  );
}
