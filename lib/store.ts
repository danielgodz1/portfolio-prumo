/** Estado compartilhado entre o DOM (Lenis/GSAP) e a cena 3D. Mutável de propósito: lido a cada frame, sem re-render. */
export const S = {
  progress: 0, // 0..1 da página
  vel: 0, // velocidade de rolagem (Lenis)
  px: 0, py: 0, // cursor em NDC (-1..1)
  pvx: 0, pvy: 0, // velocidade do cursor
  swing: 0, // impulso extra no prumo (easter egg)
  reduced: false,
  ready: false,
};
