// Motor sonoro procedural (Web Audio API): zero MP3 externos, com drone espacial, propulsor por velocidade, saltos planetários e cliques mecânicos.

let ctx: AudioContext | null = null;
let ativo = false;
let droneGain: GainNode | null = null;
let propGain: GainNode | null = null;
let propFilter: BiquadFilterNode | null = null;
let droneIniciado = false;

export const SOM_STORAGE_KEY = "prumo-som";

export function lerSomPreferencia(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(SOM_STORAGE_KEY) === "on";
  } catch {
    return false;
  }
}

function garantirContexto(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

function iniciarCamadaEspacial() {
  const c = garantirContexto();
  if (!c || droneIniciado) return;
  droneIniciado = true;

  const agora = c.currentTime;

  // 1. Sub-drone cósmico quente (55Hz + 110Hz com filtro passa-baixa suave)
  const osc1 = c.createOscillator();
  const osc2 = c.createOscillator();
  const lp = c.createBiquadFilter();
  droneGain = c.createGain();

  osc1.type = "sine";
  osc1.frequency.setValueAtTime(55, agora);
  osc2.type = "triangle";
  osc2.frequency.setValueAtTime(110.2, agora);

  lp.type = "lowpass";
  lp.frequency.setValueAtTime(190, agora);
  droneGain.gain.setValueAtTime(0.0001, agora);
  droneGain.gain.exponentialRampToValueAtTime(ativo ? 0.045 : 0.0001, agora + 0.8);

  osc1.connect(lp);
  osc2.connect(lp);
  lp.connect(droneGain);
  droneGain.connect(c.destination);
  osc1.start();
  osc2.start();

  // 2. Ruído filtrado para propulsão do foguete proporcional à velocidade do scroll
  const len = c.sampleRate * 2;
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    data[i] = (last + 0.04 * white) / 1.04;
    last = data[i];
    data[i] *= 2.5;
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  src.loop = true;

  propFilter = c.createBiquadFilter();
  propFilter.type = "bandpass";
  propFilter.frequency.setValueAtTime(160, agora);
  propFilter.Q.setValueAtTime(1.4, agora);

  propGain = c.createGain();
  propGain.gain.setValueAtTime(0.0001, agora);

  src.connect(propFilter);
  propFilter.connect(propGain);
  propGain.connect(c.destination);
  src.start();
}

export function somAtivo() {
  return ativo;
}

export function definirSom(ligado: boolean, silencioso = false): boolean {
  ativo = ligado;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SOM_STORAGE_KEY, ligado ? "on" : "off");
    } catch {
      // ignora
    }
  }
  if (ligado) {
    const c = garantirContexto();
    if (c) {
      iniciarCamadaEspacial();
      if (droneGain) {
        droneGain.gain.cancelScheduledValues(c.currentTime);
        droneGain.gain.setTargetAtTime(0.045, c.currentTime, 0.25);
      }
    }
    if (!silencioso) tocarIgnicao();
  } else if (ctx) {
    const t = ctx.currentTime;
    droneGain?.gain.setTargetAtTime(0.0001, t, 0.12);
    propGain?.gain.setTargetAtTime(0.0001, t, 0.08);
  }
  return ativo;
}

/** Atualiza volume e filtro do motor de propulsão do foguete conforme velocidade da rolagem (0..1). */
export function atualizarMotorFoguete(velNorm: number) {
  if (!ativo || !ctx || !propGain || !propFilter) return;
  const t = ctx.currentTime;
  const v = Math.min(1, Math.max(0, velNorm));
  const alvoGanho = 0.004 + v * 0.095;
  const alvoFreq = 140 + v * 720;
  propGain.gain.setTargetAtTime(alvoGanho, t, 0.08);
  propFilter.frequency.setTargetAtTime(alvoFreq, t, 0.08);
}

/** Efeito sonoro espacial ao cruzar para um novo planeta (0..7). */
export function tocarSaltoPlaneta(indice: number) {
  if (!ativo) return;
  const c = garantirContexto();
  if (!c) return;
  const t = c.currentTime;
  const escala = [196, 220, 246.94, 293.66, 329.63, 392, 440, 523.25];
  const base = escala[Math.abs(indice) % escala.length];

  const o1 = c.createOscillator();
  const o2 = c.createOscillator();
  const g = c.createGain();
  o1.type = "sine";
  o2.type = "triangle";
  o1.frequency.setValueAtTime(base * 0.5, t);
  o1.frequency.exponentialRampToValueAtTime(base, t + 0.18);
  o2.frequency.setValueAtTime(base * 1.5, t);
  o2.frequency.exponentialRampToValueAtTime(base * 2, t + 0.22);

  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.06, t + 0.04);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);

  o1.connect(g);
  o2.connect(g);
  g.connect(c.destination);
  o1.start(t);
  o2.start(t);
  o1.stop(t + 0.45);
  o2.stop(t + 0.45);
}

/** Clique mecânico seco disparado ao cruzar uma cota (+3,00 / +6,00 / +9,00 m). */
export function tocarCliqueCota(cotaMeters: number) {
  if (!ativo) return;
  const c = garantirContexto();
  if (!c) return;
  const t = c.currentTime;

  const osc = c.createOscillator();
  const bp = c.createBiquadFilter();
  const g = c.createGain();

  const freq = cotaMeters >= 9 ? 540 : cotaMeters >= 6 ? 440 : 340;
  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq, t);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.42, t + 0.045);

  bp.type = "bandpass";
  bp.frequency.setValueAtTime(freq * 1.4, t);
  bp.Q.setValueAtTime(2.4, t);

  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.075, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.055);

  osc.connect(bp);
  bp.connect(g);
  g.connect(c.destination);
  osc.start(t);
  osc.stop(t + 0.06);
}

export function tocarPulso(freq = 520, dur = 0.08, ganho = 0.03) {
  if (!ativo) return;
  const c = garantirContexto();
  if (!c) return;
  const t = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, t);
  osc.frequency.exponentialRampToValueAtTime(freq * 1.25, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(ganho, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g);
  g.connect(c.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export function tocarIgnicao() {
  if (!ativo) return;
  const c = garantirContexto();
  if (!c) return;
  const t = c.currentTime;
  [146.83, 220, 329.63].forEach((f, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(f, t + i * 0.05);
    o.frequency.exponentialRampToValueAtTime(f * 1.35, t + i * 0.05 + 0.25);
    g.gain.setValueAtTime(0.0001, t + i * 0.05);
    g.gain.exponentialRampToValueAtTime(0.05, t + i * 0.05 + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.05 + 0.36);
    o.connect(g);
    g.connect(c.destination);
    o.start(t + i * 0.05);
    o.stop(t + i * 0.05 + 0.4);
  });
}

export function tocarKonami() {
  if (!ativo) return;
  const c = garantirContexto();
  if (!c) return;
  const t = c.currentTime;
  [392, 493.88, 587.33, 783.99].forEach((f, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "square";
    o.frequency.setValueAtTime(f, t + i * 0.08);
    g.gain.setValueAtTime(0.0001, t + i * 0.08);
    g.gain.exponentialRampToValueAtTime(0.032, t + i * 0.08 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.08 + 0.22);
    o.connect(g);
    g.connect(c.destination);
    o.start(t + i * 0.08);
    o.stop(t + i * 0.08 + 0.25);
  });
}

export function tocarImpactoBase() {
  if (!ativo) return;
  const c = garantirContexto();
  if (!c) return;
  const t = c.currentTime;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(118, t);
  o.frequency.exponentialRampToValueAtTime(38, t + 0.22);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.11, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
  o.connect(g);
  g.connect(c.destination);
  o.start(t);
  o.stop(t + 0.3);
}

export function tocarNaviHey() {
  if (!ativo) return;
  const c = garantirContexto();
  if (!c) return;
  const t = c.currentTime;
  [
    [880, 0, 0.09],
    [1318.5, 0.095, 0.14],
  ].forEach(([f, off, dur]) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(f, t + off);
    g.gain.setValueAtTime(0.0001, t + off);
    g.gain.exponentialRampToValueAtTime(0.045, t + off + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + off + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(t + off);
    o.stop(t + off + dur + 0.02);
  });
}

export function tocarTransmissao() {
  if (!ativo) return;
  const c = garantirContexto();
  if (!c) return;
  const t = c.currentTime;
  [330, 440, 659.25, 880].forEach((f, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(f, t + i * 0.055);
    g.gain.setValueAtTime(0.0001, t + i * 0.055);
    g.gain.exponentialRampToValueAtTime(0.04, t + i * 0.055 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.055 + 0.24);
    o.connect(g);
    g.connect(c.destination);
    o.start(t + i * 0.055);
    o.stop(t + i * 0.055 + 0.28);
  });
}
