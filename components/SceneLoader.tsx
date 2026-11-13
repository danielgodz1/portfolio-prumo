"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

/** Carrega a cena 3D só no cliente e só depois da primeira pintura (HTML semântico primeiro, LCP limpo). */
export default function SceneLoader() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const t = "requestIdleCallback" in window ? (window as any).requestIdleCallback(() => setOk(true), { timeout: 600 }) : setTimeout(() => setOk(true), 200);
    return () => ("cancelIdleCallback" in window ? (window as any).cancelIdleCallback(t) : clearTimeout(t));
  }, []);
  return <div className="canvas-fundo" aria-hidden="true">{ok && <Scene />}</div>;
}
