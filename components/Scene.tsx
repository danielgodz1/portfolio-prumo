"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Noise, Vignette, ChromaticAberration } from "@react-three/postprocessing";
import * as THREE from "three";
import { S } from "../lib/store";
import { tocarImpactoBase } from "../lib/som";
import QuartoImperio, { QUARTO_ORIGEM } from "./QuartoImperio";
import { ConstelacaoSkills, Estrelas3Camadas, GradeBaseShock, TerraOrbita } from "./MissaoObjetos";

const AZUL = new THREE.Color("#0F2C7A");
const ESPACO = new THREE.Color("#050B1E");
const PAPEL = new THREE.Color("#ECEEF0");
const GIZ = new THREE.Color("#FFD23F");
const ANDARES = 7,
  PASSO = 7,
  Z0 = -6;
const CABO_SEGS = 32;

/** O prumo: cabo tensionado com vibração harmônica, inércia de andar e queda livre com onda de choque. */
function Prumo() {
  const wrap = useRef<THREE.Group>(null);
  const grupo = useRef<THREE.Group>(null);
  const fisica = useRef({
    ax: 0.25,
    az: 0,
    vx: 0,
    vz: 0,
    giro: 0,
    dropOffset: 0,
    dropVel: 0,
    dropPhase: "idle" as "idle" | "falling" | "rebound",
    lastAndar: 0,
  });
  const bobPos = useMemo(() => new THREE.Vector3(), []);
  const topoPos = useMemo(() => new THREE.Vector3(), []);
  const dirTmp = useMemo(() => new THREE.Vector3(), []);

  const { viewport } = useThree();
  const estreito = viewport.width <= 11;
  const L = estreito ? 2.3 : 3.6;
  const ancora = useMemo(() => new THREE.Vector3(0, 3.7, 0), []);
  ancora.x = estreito ? viewport.width * 0.22 : 5.2;
  ancora.y = estreito ? 4.0 : 3.7;

  const perfil = useMemo(
    () =>
      [
        [0, 0.64],
        [0.05, 0.62],
        [0.07, 0.52],
        [0.2, 0.46],
        [0.27, 0.32],
        [0.27, 0.12],
        [0.2, -0.12],
        [0.1, -0.36],
        [0, -0.58],
      ].map(([r, y]) => new THREE.Vector2(r, y)),
    [],
  );

  const { linhaFio, geoFio, matFio } = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= CABO_SEGS; i++) {
      pts.push(new THREE.Vector3(0, -i / CABO_SEGS, 0));
    }
    const geoFio = new THREE.BufferGeometry().setFromPoints(pts);
    const matFio = new THREE.LineBasicMaterial({ color: "#ECEEF0" });
    const linhaFio = new THREE.Line(geoFio, matFio);
    return { linhaFio, geoFio, matFio };
  }, []);

  useFrame(({ clock }, dt0) => {
    const w = wrap.current;
    const visible = S.progress < 0.42 && S.quartoActive < 0.25;
    if (w) w.visible = visible;
    if (!visible) {
      S.desvioGraus *= 0.9;
      return;
    }

    const f = fisica.current;
    const dt = Math.min(dt0, 0.033);
    const tension = THREE.MathUtils.clamp(Math.abs(S.vel) / 28, 0, 1);
    S.wireTension = THREE.MathUtils.lerp(S.wireTension, tension, 0.18);

    // Pulso de assentamento quando cruza cada andar (+3, +6, +9, +12)
    const andarIdx = Math.floor((S.cotaMeters + 0.3) / 3);
    if (andarIdx !== f.lastAndar && !S.reduced) {
      const dir = andarIdx > f.lastAndar ? 1 : -1;
      f.vz += dir * 0.48;
      f.vx += dir * 0.22;
      f.lastAndar = andarIdx;
    }

    // Gatilho de queda livre (duplo clique no topo)
    if (S.dropPending && f.dropPhase === "idle") {
      S.dropPending = false;
      S.dropActive = true;
      f.dropPhase = "falling";
      f.dropVel = 1.5;
    } else if (S.dropPending) {
      S.dropPending = false;
    }

    if (S.reduced) {
      f.ax = estreito ? -0.06 : 0.04;
      f.az = 0;
      f.dropOffset = 0;
      f.dropPhase = "idle";
      S.dropActive = false;
      S.desvioGraus = 0;
    } else {
      f.vx += S.pvx * 2.4;
      f.vz -= S.pvy * 1.5;
      S.pvx = 0;
      S.pvy = 0;
      f.vz += S.vel * 0.0032;
      f.vx += S.vel * 0.0012;

      if (S.swing > 0) {
        f.vx += 4.8 * S.swing;
        f.vz += 2.2 * S.swing;
        S.swing = 0;
      }

      const alvoX = S.px * 0.22;
      f.vx += (-8.8 * (f.ax - alvoX) - 1.25 * f.vx) * dt;
      f.vz += (-8.8 * f.az - 1.25 * f.vz) * dt;
      f.ax = THREE.MathUtils.clamp(f.ax + f.vx * dt, -1.15, 1.15);
      f.az = THREE.MathUtils.clamp(f.az + f.vz * dt, -1.15, 1.15);
      f.giro += (Math.abs(f.vx) + Math.abs(f.vz)) * dt * 1.6 + dt * 0.25;

      // Máquina de estados da queda livre até a grade de base
      const maxDrop = Math.max(2.6, ancora.y + 3.4 - L);
      if (f.dropPhase === "falling") {
        f.dropVel += 38 * dt;
        f.dropOffset += f.dropVel * dt;
        if (f.dropOffset >= maxDrop) {
          f.dropOffset = maxDrop;
          f.dropPhase = "rebound";
          f.dropVel = -8.5;
          S.shockwave = 1.0;
          S.shockOriginX = ancora.x + L * Math.sin(f.ax);
          S.shockOriginZ = ancora.z + L * Math.sin(f.az);
          tocarImpactoBase();
        }
      } else if (f.dropPhase === "rebound") {
        // Recolhimento com mola amortecida
        const force = -22 * f.dropOffset - 5.2 * f.dropVel;
        f.dropVel += force * dt;
        f.dropOffset += f.dropVel * dt;
        if (Math.abs(f.dropOffset) < 0.015 && Math.abs(f.dropVel) < 0.08) {
          f.dropOffset = 0;
          f.dropVel = 0;
          f.dropPhase = "idle";
          S.dropActive = false;
        }
      }

      const rad = Math.sqrt(f.ax * f.ax + f.az * f.az);
      S.desvioGraus = rad * (180 / Math.PI) * 0.45;
    }

    const sx = Math.sin(f.ax);
    const sz = Math.sin(f.az);
    const cy = Math.sqrt(Math.max(0.05, 1 - sx * sx - sz * sz));
    const effL = L + f.dropOffset;
    bobPos.set(ancora.x + effL * sx, ancora.y - effL * cy, ancora.z + effL * sz);

    const g = grupo.current!;
    g.position.copy(bobPos);
    g.rotation.set(f.az, f.giro, -f.ax, "ZXY");

    dirTmp.copy(bobPos).sub(ancora).normalize();
    topoPos.copy(bobPos).addScaledVector(dirTmp, -0.64);

    // Atualiza vértices do cabo com vibração harmônica proporcional à tensão do scroll
    const p = geoFio.attributes.position as THREE.BufferAttribute;
    const tClock = clock.getElapsedTime();
    const vibAmp = S.reduced ? 0 : (S.wireTension * 0.085 + (f.dropPhase === "rebound" ? 0.04 : 0));
    for (let i = 0; i <= CABO_SEGS; i++) {
      const t = i / CABO_SEGS;
      const env = Math.sin(t * Math.PI);
      const wave = Math.sin(t * Math.PI * 3.0) * Math.sin(tClock * 36.0 + t * 6.0) * vibAmp * env;
      const lx = THREE.MathUtils.lerp(ancora.x, topoPos.x, t) + wave;
      const ly = THREE.MathUtils.lerp(ancora.y, topoPos.y, t);
      const lz = THREE.MathUtils.lerp(ancora.z, topoPos.z, t) + wave * 0.5;
      p.setXYZ(i, lx, ly, lz);
    }
    p.needsUpdate = true;
    matFio.color.copy(PAPEL).lerp(GIZ, Math.min(1, S.wireTension * 0.85 + (S.dropActive ? 0.9 : 0)));
  });

  return (
    <group ref={wrap}>
      <group ref={grupo}>
        <mesh scale={1.35}>
          <latheGeometry args={[perfil, 6]} />
          <meshStandardMaterial color="#F0B400" metalness={0.9} roughness={0.32} envMapIntensity={1.15} flatShading />
        </mesh>
      </group>
      <primitive object={linhaFio} />
      <mesh position={ancora}>
        <sphereGeometry args={[0.075, 12, 12]} />
        <meshBasicMaterial color="#FFD23F" />
      </mesh>
    </group>
  );
}

/** A obra: andares em linhas que acompanham a saída da base; atmosfera transita de cobalto (#0F2C7A) ao azul técnico profundo (#050B1E). */
function Obra({ mobile }: { mobile: boolean }) {
  const wrap = useRef<THREE.Group>(null);
  const { scene } = useThree();
  const andares = useRef<THREE.LineLoop[]>([]);
  const W = 9,
    H = 5.2;

  const { aneis, colLinha, divLinhas } = useMemo(() => {
    const aneis: THREE.BufferGeometry[] = [];
    const divLinhas: THREE.LineSegments[] = [];
    const quad = (z: number) => [
      new THREE.Vector3(-W, -H, z),
      new THREE.Vector3(W, -H, z),
      new THREE.Vector3(W, H, z),
      new THREE.Vector3(-W, H, z),
    ];
    for (let i = 0; i < ANDARES; i++) {
      const z = Z0 - i * PASSO;
      aneis.push(new THREE.BufferGeometry().setFromPoints(quad(z)));
      const d: THREE.Vector3[] = [];
      const a = ((i * 37) % 7) - 3;
      d.push(
        new THREE.Vector3(a, -H, z),
        new THREE.Vector3(a, H * 0.2, z),
        new THREE.Vector3(a, H * 0.2, z),
        new THREE.Vector3(a + 5, H * 0.2, z),
        new THREE.Vector3(-W, -H * 0.3, z),
        new THREE.Vector3(a - 3, -H * 0.3, z),
      );
      divLinhas.push(
        new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(d), new THREE.LineBasicMaterial({ color: "#ECEEF0", transparent: true, opacity: 0.3 })),
      );
    }
    const c: THREE.Vector3[] = [];
    const zf = Z0 - (ANDARES - 1) * PASSO;
    for (const [x, y] of [
      [-W, -H],
      [W, -H],
      [W, H],
      [-W, H],
      [0, -H],
      [0, H],
    ])
      c.push(new THREE.Vector3(x, y, Z0 + PASSO), new THREE.Vector3(x, y, zf));
    const colLinha = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(c), new THREE.LineBasicMaterial({ color: "#ECEEF0", transparent: true, opacity: 0.28 }));
    return { aneis, colLinha, divLinhas };
  }, []);

  const poeira = useMemo(() => {
    const n = mobile ? 140 : 380;
    const p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      p[i * 3] = (Math.random() - 0.5) * 26;
      p[i * 3 + 1] = (Math.random() - 0.5) * 14;
      p[i * 3 + 2] = 10 - Math.random() * 62;
    }
    return new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(p, 3));
  }, [mobile]);

  const lacos = useMemo(
    () =>
      aneis.map((g, i) => {
        const l = new THREE.LineLoop(g, new THREE.LineBasicMaterial({ color: "#ECEEF0", transparent: true, opacity: 0.85 }));
        andares.current[i] = l;
        return l;
      }),
    [aneis],
  );

  const bgCor = useMemo(() => new THREE.Color("#0F2C7A"), []);
  if (!scene.background) scene.background = new THREE.Color("#0F2C7A");
  if (!scene.fog) scene.fog = new THREE.Fog(AZUL, 9, 52);

  useFrame(({ camera }) => {
    const vis = S.progress < 0.52 && S.quartoActive < 0.4;
    if (wrap.current) wrap.current.visible = vis;
    const espacoF = S.reduced ? (S.progress > 0.2 ? 1 : 0) : THREE.MathUtils.smoothstep(S.progress, 0.08, 0.34);
    bgCor.copy(AZUL).lerp(ESPACO, espacoF * (1 - S.quartoActive));
    (scene.background as THREE.Color).copy(bgCor);
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.color.copy(bgCor);
      scene.fog.near = 9 + espacoF * 18;
      scene.fog.far = 52 + espacoF * 48;
    }

    if (!vis) return;
    andares.current.forEach((l, i) => {
      const dist = Math.abs(camera.position.z - (Z0 - i * PASSO));
      const quente = THREE.MathUtils.smoothstep(4.5 - dist, 0, 3.5);
      (l.material as THREE.LineBasicMaterial).color.copy(PAPEL).lerp(GIZ, quente);
    });
  });

  return (
    <group ref={wrap}>
      {lacos.map((l, i) => (
        <group key={i}>
          <primitive object={l} />
          <primitive object={divLinhas[i]} />
        </group>
      ))}
      <primitive object={colLinha} />
      <points geometry={poeira}>
        <pointsMaterial color="#ECEEF0" size={0.05} sizeAttenuation transparent opacity={0.45} depthWrite={false} />
      </points>
    </group>
  );
}

/** Câmera: CatmullRomCurve3 pelo scroll + FOV kick na tração + dolly-in cinematográfico no Quarto da Império. */
function Camera() {
  const prog = useRef(0);
  const roll = useRef(0);
  const boost = useRef(0);

  const curvaPos = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.5, 9),
        new THREE.Vector3(-0.9, 5.2, -11),
        new THREE.Vector3(1.1, 16.5, -39),
        new THREE.Vector3(5.6, 24.0, -52),
        new THREE.Vector3(1.4, 14.0, -72),
        new THREE.Vector3(0, 12.0, -77),
      ]),
    [],
  );
  const curvaAlvo = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.2, -5),
        new THREE.Vector3(-1.4, 5.4, -22),
        new THREE.Vector3(2.2, 20.5, -58),
        new THREE.Vector3(3.2, 23.0, -64),
        new THREE.Vector3(0, 12.0, -88),
        new THREE.Vector3(0, 12.0, -92),
      ]),
    [],
  );

  const pMissao = useMemo(() => new THREE.Vector3(), []);
  const aMissao = useMemo(() => new THREE.Vector3(), []);
  const pQuarto = useMemo(() => new THREE.Vector3(), []);
  const aQuarto = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera }, dt0) => {
    const dt = Math.min(dt0, 0.05);
    const k = S.reduced ? 1 : 1 - Math.pow(0.0008, dt);
    prog.current += (S.progress - prog.current) * k;
    const u = THREE.MathUtils.clamp(prog.current, 0, 1);

    const alvoBoost = S.reduced ? 0 : THREE.MathUtils.clamp(Math.abs(S.vel) / 40, 0, 1);
    boost.current += (alvoBoost - boost.current) * (S.reduced ? 1 : 0.14);
    S.boost = boost.current;
    S.ignition = THREE.MathUtils.lerp(S.ignition, 0, S.reduced ? 1 : 0.04);

    curvaPos.getPointAt(u, pMissao);
    curvaAlvo.getPointAt(u, aMissao);
    if (!S.reduced) {
      pMissao.x += S.px * 0.65;
      pMissao.y += S.py * 0.4;
      aMissao.x += S.px * 0.35;
      // Micro-shake sutil quando o prumo impacta a base
      if (S.shockwave > 0.25) {
        const shk = (S.shockwave - 0.25) * 0.12;
        pMissao.y += Math.sin(performance.now() * 0.08) * shk;
      }
    }

    if (S.quartoActive > 0.005) {
      const qp = S.reduced ? 1 : S.quartoProgress;
      const sub = Math.min(1, Math.max(0, qp / 0.72));
      const ease = 1 - Math.pow(1 - sub, 3);
      // 0.7..1.0: dolly-in cinematográfico quando os LEDs 2700K acendem
      const dolly = Math.min(1, Math.max(0, (qp - 0.7) / 0.3));
      const dollyEase = 1 - Math.pow(1 - dolly, 2);

      const elev = ((82 - 50 * ease - 10 * dollyEase) * Math.PI) / 180;
      const az = ((-10 - 36 * ease - 12 * dollyEase) * Math.PI) / 180;
      const camPersp = camera as THREE.PerspectiveCamera;
      const narrow = camPersp.aspect < 1;
      const r = (narrow ? 62 : 30) - 3 * ease - (narrow ? 8 : 5.5) * dollyEase;
      pQuarto.set(
        QUARTO_ORIGEM.x + Math.sin(az) * Math.cos(elev) * r,
        QUARTO_ORIGEM.y + Math.sin(elev) * r,
        QUARTO_ORIGEM.z + Math.cos(az) * Math.cos(elev) * r,
      );
      aQuarto.set(
        QUARTO_ORIGEM.x + (narrow ? 0 : -3.4 + 0.9 * dollyEase),
        QUARTO_ORIGEM.y + 0.65 * ease + 0.45 * dollyEase,
        QUARTO_ORIGEM.z,
      );
      pMissao.lerp(pQuarto, S.quartoActive);
      aMissao.lerp(aQuarto, S.quartoActive);
    }

    camera.position.copy(pMissao);
    camera.lookAt(aMissao);

    if (camera instanceof THREE.PerspectiveCamera) {
      const fovAlvo = 48 + boost.current * 8 * (1 - S.quartoActive) + (S.quartoActive > 0.5 ? -14 * S.quartoActive : 0);
      if (Math.abs(camera.fov - fovAlvo) > 0.05) {
        camera.fov = THREE.MathUtils.lerp(camera.fov, fovAlvo, S.reduced ? 1 : 0.15);
        camera.updateProjectionMatrix();
      }
    }

    roll.current += ((S.reduced ? 0 : THREE.MathUtils.clamp(S.vel * -0.0009, -0.045, 0.045)) * (1 - S.quartoActive) - roll.current) * 0.08;
    camera.rotation.z = roll.current;
  });

  return null;
}

/** Quality scaler automático: reduz DPR e pós-processamento se detectar quadros lentos sustentados. */
function QualityScaler({ aoDegradar }: { aoDegradar: () => void }) {
  const { gl } = useThree();
  const lentos = useRef(0);
  const done = useRef(false);

  useFrame((_, dt) => {
    if (done.current || S.reduced || S.paused) return;
    if (dt > 0.04) {
      lentos.current += 1;
      if (lentos.current >= 10) {
        done.current = true;
        S.lowQuality = true;
        gl.setPixelRatio(1);
        aoDegradar();
      }
    } else {
      lentos.current = Math.max(0, lentos.current - 1);
    }
  });
  return null;
}

function Pos({ ativo }: { ativo: boolean }) {
  const off = useMemo(() => new THREE.Vector2(0, 0), []);
  useFrame(() => {
    const a = Math.min(Math.abs(S.vel) * 0.00018, 0.006);
    off.set(a, a * 0.6);
  });
  if (!ativo) return null;
  return (
    <EffectComposer multisampling={0}>
      <ChromaticAberration offset={off} radialModulation={false} modulationOffset={0} />
      <Noise opacity={0.09} />
      <Vignette offset={0.3} darkness={0.62} />
    </EffectComposer>
  );
}

/** Mantém o modo reduce-motion atualizado sob demanda quando o scroll ou toggle muda. */
function ReduceUpdater({ reduced }: { reduced: boolean }) {
  const { invalidate } = useThree();
  useEffect(() => {
    invalidate();
    if (!reduced) return;
    const onScroll = () => invalidate();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, [invalidate, reduced]);
  return null;
}

export default function Scene() {
  const mobile = useMemo(() => window.matchMedia("(max-width:800px)").matches || (navigator.hardwareConcurrency || 8) <= 4, []);
  const [degradado, setDegradado] = useState(false);
  const [pausado, setPausado] = useState(false);
  const [reduzido, setReduzido] = useState(() => S.reduced);

  useEffect(() => {
    const onVis = () => {
      S.paused = document.hidden;
      setPausado(document.hidden);
    };
    const onMotion = (e: Event) => {
      const custom = e as CustomEvent<{ reduced: boolean }>;
      setReduzido(Boolean(custom.detail?.reduced));
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("prumo:motion", onMotion);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("prumo:motion", onMotion);
    };
  }, []);

  return (
    <Canvas
      dpr={mobile ? [1, 1.25] : [1, 1.75]}
      frameloop={pausado ? "never" : reduzido ? "demand" : "always"}
      camera={{ fov: 48, position: [0, 0.5, 9], near: 0.1, far: 160 }}
      gl={{ antialias: !mobile, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        S.webgl = true;
        gl.domElement.addEventListener("webglcontextlost", () => {
          S.webgl = false;
        });
      }}
      style={{ position: "absolute", inset: 0 }}
    >
      <Environment resolution={256} frames={1}>
        <mesh scale={80}>
          <sphereGeometry args={[1, 20, 20]} />
          <meshBasicMaterial color="#7f98ff" side={THREE.BackSide} />
        </mesh>
        <Lightformer form="rect" intensity={6} position={[0, 6, 3]} scale={[12, 3, 1]} />
        <Lightformer form="rect" intensity={3} position={[-6, 1, 4]} scale={[3, 8, 1]} color="#9db4ff" />
        <Lightformer form="rect" intensity={2.2} position={[6, 0, 2]} scale={[3, 8, 1]} />
      </Environment>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 6, 8]} intensity={2.4} color="#ffe9a8" />
      <Camera />
      <Obra mobile={mobile} />
      <GradeBaseShock />
      <Prumo />
      <Estrelas3Camadas mobile={mobile} />
      <TerraOrbita />
      <ConstelacaoSkills />
      <QuartoImperio />
      <QualityScaler aoDegradar={() => setDegradado(true)} />
      <ReduceUpdater reduced={reduzido} />
      <Pos ativo={!mobile && !degradado && !reduzido} />
    </Canvas>
  );
}
