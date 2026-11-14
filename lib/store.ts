/** Estado compartilhado entre o DOM (Lenis/GSAP) e a cena 3D única. Mutável de propósito: lido a cada frame, sem re-render. */
export const S = {
  progress: 0, // 0..1 da página
  vel: 0, // velocidade de rolagem (Lenis)
  cotaMeters: 0, // 0..15 m interpolada continuamente pelas seções
  cotaLabel: "FUNDAÇÃO",
  desvioGraus: 0, // desvio angular do eixo do prumo em graus
  wireTension: 0, // 0..1 tensão/vibração harmônica no cabo do prumo
  px: 0,
  py: 0, // cursor em NDC (-1..1)
  pvx: 0,
  pvy: 0, // velocidade do cursor
  swing: 0, // impulso extra no prumo (tecla P / impulso lateral)
  dropPending: false, // gatilho de queda livre do prumo (duplo clique no topo)
  dropActive: false, // prumo em queda livre até a base
  shockwave: 0, // 0..1 intensidade da onda de choque na grade de base
  shockOriginX: 0,
  shockOriginZ: 0,
  ignition: 0, // 0..1 pulso inicial de calibração do eixo
  boost: 0, // 0..1 intensidade de tração pela velocidade de scroll
  quartoActive: 0, // 0..1 peso da transição para a cena do quarto da Império
  quartoProgress: 0, // 0..1 montagem do quarto da Império
  konami: false, // easter egg Konami ativado
  sound: false, // áudio opcional (desligado por padrão)
  lowQuality: false, // ativado pelo quality scaler automático
  webgl: true,
  paused: false,
  reduced: false,
  motionOverride: null as "ativo" | "reduzido" | null,
  ready: false,
};
