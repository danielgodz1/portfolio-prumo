/** Estado compartilhado entre o DOM (Lenis/GSAP) e a cena 3D única. Mutável de propósito: lido a cada frame, sem re-render. */
export const S = {
  progress: 0, // 0..1 da página
  vel: 0, // velocidade de rolagem (Lenis)
  px: 0,
  py: 0, // cursor em NDC (-1..1)
  pvx: 0,
  pvy: 0, // velocidade do cursor
  swing: 0, // impulso extra no prumo (duplo clique / P)
  ignition: 0, // 0..1 pulso de ignição do Ato 0 -> Ato 1
  boost: 0, // 0..1 intensidade de boost pela velocidade de scroll
  quartoActive: 0, // 0..1 peso da transição para a cena do quarto da Império
  quartoProgress: 0, // 0..1 montagem do quarto da Império
  konami: false, // easter egg Konami ativado
  sound: false, // áudio opcional (desligado por padrão)
  lowQuality: false, // ativado pelo quality scaler automático
  webgl: true,
  paused: false,
  reduced: false,
  ready: false,
};
