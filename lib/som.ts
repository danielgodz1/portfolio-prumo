/** Sintetizador Web Audio opcional (0 KB extras, desligado por padrão; iniciado só por gesto do usuário). */
let ctx: AudioContext | null = null;
let ativo = false;
let ultimoPulso = 0;
let ultimoCliqueCota = 0;

function garantirCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    ctx = new Ctx();
  }
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

export function lerSomPreferencia(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem("prumo-som") === "1";
  } catch {
    return false;
  }
}

export function definirSom(ligado: boolean, silencioso = false): boolean {
  ativo = ligado;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("prumo-som", ligado ? "1" : "0");
    } catch {}
  }
  if (ligado && !silencioso) {
    garantirCtx();
    tocarCliqueCota(3);
  }
  return ativo;
}

/** Clique mecânico seco estilo instrumento de precisão ao cruzar cotas (+3,00 / +6,00 / +9,00 m). */
export function tocarCliqueCota(cotaMeters: number) {
  if (!ativo) return;
  const now = performance.now();
  if (now - ultimoCliqueCota < 180) return;
  ultimoCliqueCota = now;
  const c = garantirCtx();
  if (!c) return;
  const t = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "triangle";
  const base = 780 + Math.min(cotaMeters, 15) * 28;
  osc.frequency.setValueAtTime(base, t);
  osc.frequency.exponentialRampToValueAtTime(240, t + 0.022);
  g.gain.setValueAtTime(0.055, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.026);
  osc.connect(g).connect(c.destination);
  osc.start(t);
  osc.stop(t + 0.028);
}

export function tocarPulso(freq = 440) {
  if (!ativo) return;
  const nowMs = performance.now();
  if (nowMs - ultimoPulso < 90) return;
  ultimoPulso = nowMs;
  const c = garantirCtx();
  if (!c) return;
  const t = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.025, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.055);
  osc.connect(g).connect(c.destination);
  osc.start(t);
  osc.stop(t + 0.06);
}

export function tocarIgnicao() {
  if (!ativo) return;
  const c = garantirCtx();
  if (!c) return;
  const t = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(58, t);
  osc.frequency.exponentialRampToValueAtTime(140, t + 0.55);
  g.gain.setValueAtTime(0.045, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.65);
  osc.connect(g).connect(c.destination);
  osc.start(t);
  osc.stop(t + 0.7);
}

export function tocarKonami() {
  if (!ativo) return;
  const c = garantirCtx();
  if (!c) return;
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    const t = c.currentTime + i * 0.08;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.04, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    osc.connect(g).connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.24);
  });
}

export function tocarImpactoBase() {
  if (!ativo) return;
  const c = garantirCtx();
  if (!c) return;
  const t = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(115, t);
  osc.frequency.exponentialRampToValueAtTime(34, t + 0.42);
  g.gain.setValueAtTime(0.085, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.48);
  osc.connect(g).connect(c.destination);
  osc.start(t);
  osc.stop(t + 0.5);
}

/** Chime cristalino estilo fada/sistema ao clicar na NAVI-KERNEL. */
export function tocarNaviHey() {
  if (!ativo) return;
  const c = garantirCtx();
  if (!c) return;
  [880, 1174.66, 1567.98].forEach((freq, i) => {
    const t = c.currentTime + i * 0.065;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.032, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
    osc.connect(g).connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.25);
  });
}

/** Pulso de transmissão de pacote ao iniciar contato. */
export function tocarTransmissao() {
  if (!ativo) return;
  const c = garantirCtx();
  if (!c) return;
  [440, 660, 880, 1320].forEach((freq, i) => {
    const t = c.currentTime + i * 0.05;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.03, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    osc.connect(g).connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.18);
  });
}
