import * as THREE from "three";

let cachedSprite: THREE.Texture | null = null;

/**
 * Gera textura radial circular suave em memória para `<pointsMaterial>`,
 * eliminando o visual de quadradinhos padrão dos pontos WebGL.
 */
export function obterSpriteParticulaCircular(): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  if (cachedSprite) return cachedSprite;

  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const c = size / 2;
  const grad = ctx.createRadialGradient(c, c, 0, c, c, c);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.28, "rgba(255,255,255,0.85)");
  grad.addColorStop(0.65, "rgba(255,255,255,0.22)");
  grad.addColorStop(1, "rgba(255,255,255,0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  cachedSprite = tex;
  return tex;
}
