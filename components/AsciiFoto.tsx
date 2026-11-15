"use client";
import { useEffect, useRef } from "react";
import { S } from "../lib/store";

/**
 * Tratamento ASCII da foto. Se existir public/daniel.jpg, ele vira caracteres.
 * Sem foto, desenha um PRUMO em ASCII reativo ao ponteiro (e a legenda avisa).
 */
const RAMPA = " .:-=+*#%@";
export default function AsciiFoto() {
  const ref = useRef<HTMLCanvasElement>(null);
  const legenda = useRef<HTMLElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const W = 80;
    const H = 100;
    const cw = 8;
    const ch = 10;
    c.width = W * cw;
    c.height = H * ch;

    let mx = 0.5;
    let my = 0.6;

    const pintar = (lum: (x: number, y: number) => number) => {
      ctx.fillStyle = "#151817";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.font = `${ch}px "IBM Plex Mono", monospace`;
      ctx.textBaseline = "top";
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const u = x / W;
          const v = y / H;
          const distCursor = Math.hypot(u - mx, v - my);
          const brilhoCursor = distCursor < 0.24 ? (1 - distCursor / 0.24) * 0.28 : 0;
          const val = Math.max(0, Math.min(1, lum(u, v) + brilhoCursor));
          const i = Math.floor(val * (RAMPA.length - 1));
          if (!i) continue;
          ctx.fillStyle = val > 0.78 ? "#FFD23F" : "#ECEEF0";
          ctx.globalAlpha = 0.35 + val * 0.65;
          ctx.fillText(RAMPA[i], x * cw, y * ch);
        }
      }
      ctx.globalAlpha = 1;
    };

    const lumPlaceholder = (u: number, v: number) => {
      const fio = Math.abs(u - 0.5) < 0.008 && v < 0.5 ? 0.75 : 0;
      const t = (v - 0.5) / 0.42;
      const r = v > 0.5 && v < 0.92 ? (t < 0.3 ? 0.17 : 0.17 * (1 - (t - 0.3) / 0.7)) : 0;
      const corpo = Math.abs(u - 0.5) < r ? 0.38 + 0.62 * (1 - Math.abs(u - 0.42) * 3) : 0;
      return Math.max(fio, corpo);
    };

    let lumAtual: (u: number, v: number) => number = lumPlaceholder;

    const desenharPlaceholder = () => {
      lumAtual = lumPlaceholder;
      pintar(lumAtual);
      if (legenda.current) legenda.current.textContent = "PRUMO_ASCII_NODE · interativo ao mover o ponteiro";
    };

    const img = new Image();
    img.onload = () => {
      const t = document.createElement("canvas");
      t.width = W;
      t.height = H;
      const g = t.getContext("2d")!;
      const s = Math.max(W / img.width, H / img.height);
      g.drawImage(img, (W - img.width * s) / 2, (H - img.height * s) / 2, img.width * s, img.height * s);
      const d = g.getImageData(0, 0, W, H).data;
      lumAtual = (u, v) => {
        const k = (Math.floor(v * H) * W + Math.floor(u * W)) * 4;
        return (0.3 * d[k] + 0.59 * d[k + 1] + 0.11 * d[k + 2]) / 255;
      };
      pintar(lumAtual);
      if (legenda.current) legenda.current.textContent = "";
    };
    img.onerror = desenharPlaceholder;
    if (process.env.NEXT_PUBLIC_FOTO) img.src = "/daniel.jpg";
    else desenharPlaceholder();

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (S.reduced) return;
      const r = c.getBoundingClientRect();
      mx = Math.max(0, Math.min(1, (e.clientX - r.left) / Math.max(1, r.width)));
      my = Math.max(0, Math.min(1, (e.clientY - r.top) / Math.max(1, r.height)));
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          pintar(lumAtual);
        });
      }
    };
    c.addEventListener("pointermove", onMove);
    return () => {
      c.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <canvas ref={ref} role="img" aria-label="Visualização ASCII interativa do fio de prumo" />
      <figcaption ref={legenda} className="cota" />
    </>
  );
}
