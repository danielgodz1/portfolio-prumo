/** Estado compartilhado entre o DOM (Lenis/GSAP) e a cena 3D única. Mutável de propósito: lido a cada frame, sem re-render. */
export const S = {
  progress: 0, // 0..1 da página
  vel: 0, // velocidade de rolagem (Lenis)
  camara: 0, // 0..4 câmara atual
  cotaMeters: 0, // 0..15 m interpolada continuamente pelas seções
  cotaLabel: "GLOBO ORBITAL",
  desvioGraus: 0,
  wireTension: 0,
  px: 0,
  py: 0, // cursor em NDC (-1..1)
  pvx: 0,
  pvy: 0, // velocidade do cursor
  swing: 0,
  dropPending: false,
  dropActive: false,
  shockwave: 0,
  shockOriginX: 0,
  shockOriginZ: 0,
  ignition: 0,
  boost: 0,
  quartoActive: 0, // 0..1 peso da transição para a cena do quarto da Império
  quartoProgress: 0, // 0..1 montagem do quarto da Império
  naviSpin: 0, // impulso de giro 360º ao clicar na NAVI-KERNEL
  naviBurst: 0, // 0..1 explosão de faíscas da NAVI-KERNEL
  naviTransmit: 0, // 0..1 animação de transmissão/reverência ao enviar contato
  naviScreenX: 0.82, // posição normalizada X na tela (0..1)
  naviScreenY: 0.28, // posição normalizada Y na tela (0..1)
  modo2D: false, // Acesso Rápido 2D para leitura instantânea
  konami: false,
  sound: false,
  lowQuality: false,
  webgl: true,
  paused: false,
  reduced: false,
  motionOverride: null as "ativo" | "reduzido" | null,
  ready: false,
};
