"use client";
import { useEffect, useRef } from "react";

/**
 * Tratamento ASCII da foto. Se existir public/daniel.jpg, ele vira caracteres.
 * Sem foto, desenha um PRUMO em ASCII como espaço reservado (e a legenda avisa).
 */
const RAMPA = " .:-=+*#%@";
export default function AsciiFoto() {
  const ref = useRef<HTMLCanvasElement>(null);
  const legenda = useRef<HTMLElement>(null);
  useEffect(() => {
    const c = ref.current!; const ctx = c.getContext("2d")!;
    const W = 80, H = 100; // grade de caracteres
    const pintar = (lum: (x: number, y: number) => number) => {
      const cw = 8, ch = 10; c.width = W * cw; c.height = H * ch;
      ctx.fillStyle = "#151817"; ctx.fillRect(0, 0, c.width, c.height);
      ctx.font = `${ch}px "IBM Plex Mono", monospace`; ctx.textBaseline = "top";
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const v = Math.max(0, Math.min(1, lum(x / W, y / H)));
        const i = Math.floor(v * (RAMPA.length - 1)); if (!i) continue;
        ctx.fillStyle = v > 0.82 ? "#FFD23F" : "#ECEEF0"; ctx.globalAlpha = 0.35 + v * 0.65;
        ctx.fillText(RAMPA[i], x * cw, y * ch);
      }
      ctx.globalAlpha = 1;
    };
    // espaço reservado: fio + peso de prumo
    const placeholder = () => {
      pintar((u, v) => {
        const fio = Math.abs(u - 0.5) < 0.006 && v < 0.5 ? 0.7 : 0;
        const t = (v - 0.5) / 0.42; // 0 no ombro, 1 na ponta
        const r = v > 0.5 && v < 0.92 ? (t < 0.3 ? 0.17 : 0.17 * (1 - (t - 0.3) / 0.7)) : 0;
        const corpo = Math.abs(u - 0.5) < r ? 0.35 + 0.65 * (1 - Math.abs(u - 0.4) * 3) : 0;
        return Math.max(fio, corpo);
      });
      if (legenda.current) legenda.current.textContent = "Espaço da foto: coloque public/daniel.jpg";
    };
    const img = new Image();
    img.onload = () => {
      const t = document.createElement("canvas"); t.width = W; t.height = H; const g = t.getContext("2d")!;
      const s = Math.max(W / img.width, H / img.height); g.drawImage(img, (W - img.width * s) / 2, (H - img.height * s) / 2, img.width * s, img.height * s);
      const d = g.getImageData(0, 0, W, H).data;
      pintar((u, v) => { const k = (Math.floor(v * H) * W + Math.floor(u * W)) * 4; return (0.3 * d[k] + 0.59 * d[k + 1] + 0.11 * d[k + 2]) / 255; });
      if (legenda.current) legenda.current.textContent = "";
    };
    img.onerror = placeholder;
    if (process.env.NEXT_PUBLIC_FOTO) img.src = "/daniel.jpg"; else placeholder();
  }, []);
  return (<><canvas ref={ref} role="img" aria-label="Retrato de Daniel dos Santos em ASCII (espaço reservado)" /><figcaption ref={legenda} className="cota" /></>);
}
