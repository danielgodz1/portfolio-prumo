/** Sintetizador Web Audio opcional (0 KB extras, desligado por padrão; iniciado só por gesto do usuário). */
let ctx: AudioContext | null = null;
let ativo = false;
let ultimoPulso = 0;

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

export function definirSom(ligado: boolean): boolean {
  ativo = ligado;
  if (ligado) {
    garantirCtx();
    tocarPulso(520);
  }
  return ativo;
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

