"use client";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { S } from "../lib/store";
import { tocarImpactoBase } from "../lib/som";
import QuartoImperio, { QUARTO_ORIGEM } from "./QuartoImperio";
import SistemaSolar from "./mundo/SistemaSolar";
import FogueteEspacial from "./mundo/FogueteEspacial";
import CabosRedeEspacial from "./mundo/CabosRedeEspacial";
import MascoteIA from "./mundo/MascoteIA";

const GradeShockShader = dynamic(() => import("./GradeShockShader"), { ssr: false });

/** Fio e peso de prumo 3D com física de mola + queda livre (2x clique / HUD) acoplada à rolagem. */
function PrumoPendulo() {
  const grp = useRef<THREE.Group>(null);
  const pesoRef = useRef<THREE.Mesh>(null);
  const ang = useRef(0);
  const velAng = useRef(0);
  const dropY = useRef(0);
  const dropVel = useRef(0);

  useFrame((_, dt0) => {
    const g = grp.current;
    if (!g) return;
    const vis = S.progress < 0.24 || S.dropActive;
    g.visible = vis;
    if (!vis || S.reduced) {
      g.rotation.z = 0;
      return;
    }
    const dt = Math.min(dt0, 0.04);
    const force = -16 * ang.current - 3.6 * velAng.current + THREE.MathUtils.clamp(S.vel * 0.018 + S.px * 1.4 + S.swing * 3, -5, 5);
    S.swing *= 0.9;
    velAng.current += force * dt;
    ang.current += velAng.current * dt;
    g.rotation.z = THREE.MathUtils.clamp(ang.current, -0.35, 0.35);

    if (S.dropPending) {
      S.dropPending = false;
      S.dropActive = true;
      dropVel.current = -11;
    }
    if (S.dropActive && pesoRef.current) {
      dropVel.current += -18 * dt;
      dropY.current += dropVel.current * dt;
      if (dropY.current <= -3.2) {
        dropY.current = -3.2;
        dropVel.current = Math.abs(dropVel.current) * 0.42;
        S.shockwave = 1;
        tocarImpactoBase();
        if (Math.abs(dropVel.current) < 1.2) {
          S.dropActive = false;
          dropVel.current = 0;
        }
      }
      pesoRef.current.position.y = -4.35 + dropY.current * 0.35;
    } else if (pesoRef.current && dropY.current < -0.01) {
      dropY.current = THREE.MathUtils.lerp(dropY.current, 0, 0.08);
      pesoRef.current.position.y = -4.35 + dropY.current * 0.35;
    }
  });

  return (
    <group ref={grp} position={[-4.5, 4.4, -0.8]}>
      <mesh position={[0, -2.1, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 4.2, 6]} />
        <meshBasicMaterial color="#7DD3FC" transparent opacity={0.55} />
      </mesh>
      <mesh ref={pesoRef} position={[0, -4.35, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.24, 0.62, 6]} />
        <meshStandardMaterial color="#FFD23F" emissive="#FFB800" emissiveIntensity={0.45} metalness={0.85} roughness={0.25} />
      </mesh>
    </group>
  );
}

const CORES_ATMOS = [
  new THREE.Color("#020714"), // 00 Terra · Órbita Jaú/SP
  new THREE.Color("#040d1d"), // 01 Mercúrio & Vênus
  new THREE.Color("#071328"), // 02 Marte & Júpiter + Império 3D
  new THREE.Color("#08091b"), // 03 Saturno & Urano
  new THREE.Color("#050a18"), // 04 Netuno · Espaço Profundo
];

/** Câmera contínua acompanhando o foguete pelos 8 planetas + dolly-in na Império 3D. */
function CameraMundo() {
  const { scene } = useThree();
  const prog = useRef(0);
  const roll = useRef(0);
  const boost = useRef(0);

  const curvaPos = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.35, 0.28, 6.8), // 00 Terra + Foguete
        new THREE.Vector3(-0.25, 0.55, -11.5), // 01 Mercúrio
        new THREE.Vector3(0.25, 0.1, -28.0), // 02 Vênus
        new THREE.Vector3(-0.15, 0.2, -45.0), // 03 Marte
        new THREE.Vector3(-2.1, 4.7, -56.5), // 04 Júpiter & Império 3D
        new THREE.Vector3(0.45, 1.35, -83.5), // 05 Saturno com anéis
        new THREE.Vector3(-0.3, 0.15, -102.5), // 06 Urano
        new THREE.Vector3(0.35, 0.35, -122.0), // 07 Netuno
      ]),
    [],
  );

  const curvaAlvo = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(1.45, -0.15, -0.5),
        new THREE.Vector3(-1.55, 0.35, -18.5),
        new THREE.Vector3(1.65, -0.25, -35.5),
        new THREE.Vector3(-1.6, 0.15, -52.5),
        new THREE.Vector3(0.9, 0.9, -70.0),
        new THREE.Vector3(-2.1, 0.25, -94.5),
        new THREE.Vector3(1.8, -0.25, -113.5),
        new THREE.Vector3(-1.2, 0.2, -132.5),
      ]),
    [],
  );

  const curvaPosEmp = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.35, 0.28, 6.8),
        new THREE.Vector3(-0.25, 0.55, -11.5),
        new THREE.Vector3(0.25, 0.1, -28.0),
        new THREE.Vector3(-0.15, 0.2, -45.0),
        new THREE.Vector3(-2.1, 4.7, -56.5),
        new THREE.Vector3(0.45, 1.35, -83.5),
        new THREE.Vector3(-0.3, 0.15, -102.5),
        new THREE.Vector3(0.35, 0.35, -122.0),
      ]),
    [],
  );

  const curvaAlvoEmp = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(1.45, -0.15, -0.5),
        new THREE.Vector3(-1.55, 0.35, -18.5),
        new THREE.Vector3(1.65, -0.25, -35.5),
        new THREE.Vector3(-1.6, 0.15, -52.5),
        new THREE.Vector3(0.9, 0.9, -70.0),
        new THREE.Vector3(-2.1, 0.25, -94.5),
        new THREE.Vector3(1.8, -0.25, -113.5),
        new THREE.Vector3(-1.2, 0.2, -132.5),
      ]),
    [],
  );

  const pMundo = useMemo(() => new THREE.Vector3(), []);
  const aMundo = useMemo(() => new THREE.Vector3(), []);
  const pQuarto = useMemo(() => new THREE.Vector3(), []);
  const aQuarto = useMemo(() => new THREE.Vector3(), []);
  const pJau = useMemo(() => new THREE.Vector3(2.2, 0.05, 3.8), []);
  const aJau = useMemo(() => new THREE.Vector3(2.35, -0.05, -0.5), []);
  const bgCor = useMemo(() => new THREE.Color("#020714"), []);

  if (!scene.background) scene.background = new THREE.Color("#020714");
  if (!(scene.fog instanceof THREE.FogExp2)) {
    scene.fog = new THREE.FogExp2("#020714", 0.0055);
  }

  useFrame(({ camera }, dt0) => {
    const dt = Math.min(dt0, 0.05);
    const k = S.reduced || S.modo2D ? 1 : 1 - Math.pow(0.0008, dt);
    prog.current += (S.progress - prog.current) * k;
    const u = THREE.MathUtils.clamp(prog.current, 0, 1);

    // Atualiza cor do fundo + névoa leve espacial para não esconder planetas distantes
    const fIdx = u * 4;
    const i0 = Math.min(3, Math.floor(fIdx));
    const frac = fIdx - i0;
    bgCor.copy(CORES_ATMOS[i0]).lerp(CORES_ATMOS[i0 + 1], frac);
    (scene.background as THREE.Color).copy(bgCor);
    if (scene.fog instanceof THREE.FogExp2) {
      scene.fog.color.copy(bgCor);
      scene.fog.density = THREE.MathUtils.lerp(0.0052, 0.0072, S.camara === 1 ? 1 : 0.35);
    }

    const alvoBoost = S.reduced ? 0 : THREE.MathUtils.clamp(Math.abs(S.vel) / 42, 0, 1);
    boost.current += (alvoBoost - boost.current) * (S.reduced ? 1 : 0.14);
    S.boost = boost.current;
    S.ignition = THREE.MathUtils.lerp(S.ignition, 0, S.reduced ? 1 : 0.04);

    const cp = S.audiencia === "empresa" ? curvaPosEmp : curvaPos;
    const ca = S.audiencia === "empresa" ? curvaAlvoEmp : curvaAlvo;
    cp.getPointAt(u, pMundo);
    ca.getPointAt(u, aMundo);
    if (!S.reduced) {
      pMundo.x += S.px * 0.65;
      pMundo.y += S.py * 0.42;
      aMundo.x += S.px * 0.35;
    }

    if (S.globoFocus > 0.005) {
      const f = Math.sin(Math.min(1, S.globoFocus) * Math.PI);
      pMundo.lerp(pJau, f * 0.85);
      aMundo.lerp(aJau, f * 0.85);
      S.globoFocus = Math.max(0, S.globoFocus - dt * 0.72);
    }

    if (S.quartoActive > 0.005) {
      const qp = S.reduced || S.modo2D ? 1 : S.quartoProgress;
      const sub = Math.min(1, Math.max(0, qp / 0.72));
      const ease = 1 - Math.pow(1 - sub, 3);
      const dolly = Math.min(1, Math.max(0, (qp - 0.7) / 0.3));
      const dollyEase = 1 - Math.pow(1 - dolly, 2);

      const elev = ((76 - 46 * ease - 10 * dollyEase) * Math.PI) / 180;
      const az = ((-12 - 34 * ease - 12 * dollyEase) * Math.PI) / 180;
      const camPersp = camera as THREE.PerspectiveCamera;
      const narrow = camPersp.aspect < 1;
      const r = (narrow ? 36 : 22) - 2.5 * ease - (narrow ? 4 : 4.5) * dollyEase;
      pQuarto.set(
        QUARTO_ORIGEM.x + Math.sin(az) * Math.cos(elev) * r,
        QUARTO_ORIGEM.y + Math.sin(elev) * r,
        QUARTO_ORIGEM.z + Math.cos(az) * Math.cos(elev) * r,
      );
      aQuarto.set(
        QUARTO_ORIGEM.x + (narrow ? 0 : -2.6 + 0.8 * dollyEase),
        QUARTO_ORIGEM.y + 0.6 * ease + 0.45 * dollyEase,
        QUARTO_ORIGEM.z,
      );
      pMundo.lerp(pQuarto, S.quartoActive);
      aMundo.lerp(aQuarto, S.quartoActive);
    }

    camera.position.copy(pMundo);
    camera.lookAt(aMundo);

    if (camera instanceof THREE.PerspectiveCamera) {
      const fovAlvo = 48 + boost.current * 9 * (1 - S.quartoActive) + (S.quartoActive > 0.5 ? -10 * S.quartoActive : 0);
      if (Math.abs(camera.fov - fovAlvo) > 0.05) {
        camera.fov = THREE.MathUtils.lerp(camera.fov, fovAlvo, S.reduced ? 1 : 0.15);
        camera.updateProjectionMatrix();
      }
    }

    roll.current += ((S.reduced ? 0 : THREE.MathUtils.clamp(S.vel * -0.0008, -0.04, 0.04)) * (1 - S.quartoActive) - roll.current) * 0.08;
    camera.rotation.z = roll.current;
  });

  return null;
}

/** Quality scaler automático para manter 60fps. */
function QualityScaler({ aoDegradar }: { aoDegradar: () => void }) {
  const { gl } = useThree();
  const lentos = useRef(0);
  const done = useRef(false);

  useFrame((_, dt) => {
    if (done.current || S.reduced || S.paused) return;
    if (dt > 0.045) {
      lentos.current += 1;
      if (lentos.current >= 4) {
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
  if (!ativo) return null;
  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur luminanceThreshold={0.82} intensity={0.68} radius={0.55} />
      <Vignette offset={0.28} darkness={0.62} />
    </EffectComposer>
  );
}

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
  const [softGpu, setSoftGpu] = useState(false);
  const [pausado, setPausado] = useState(false);
  const [reduzido, setReduzido] = useState(() => S.reduced);
  const [evSource, setEvSource] = useState<HTMLElement | undefined>(undefined);

  useEffect(() => {
    setEvSource(document.body);
    const onVis = () => {
      S.paused = document.hidden;
      setPausado(document.hidden);
    };
    const onMotion = (e: Event) => {
      const custom = e as CustomEvent<{ reduced: boolean }>;
      setReduzido(Boolean(custom.detail?.reduced));
    };
    const onCanvasVis = (e: Event) => {
      const custom = e as CustomEvent<{ visible: boolean }>;
      const vis = Boolean(custom.detail?.visible);
      S.paused = !vis || document.hidden;
      setPausado(S.paused);
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("prumo:motion", onMotion);
    window.addEventListener("prumo:canvas-visible", onCanvasVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("prumo:motion", onMotion);
      window.removeEventListener("prumo:canvas-visible", onCanvasVis);
    };
  }, []);

  return (
    <Canvas
      aria-label="Mundo 3D contínuo com Globo NASA 2K, Cabos de Fibra, Prumo, Mascote PRUMO-NAVI, 8 Planetas e Império 3D"
      eventSource={evSource}
      eventPrefix="client"
      dpr={softGpu ? [1, 1.2] : [1, 1.5]}
      frameloop={pausado ? "never" : reduzido ? "demand" : "always"}
      camera={{ fov: 48, position: [0.35, 0.28, 6.8], near: 0.1, far: 340 }}
      gl={{ antialias: !mobile && !softGpu, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        S.webgl = true;
        try {
          const raw = gl.getContext();
          const dbg = raw.getExtension("WEBGL_debug_renderer_info");
          const rend = dbg ? String(raw.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || "") : "";
          if (/swiftshader|llvmpipe|software|basic render/i.test(rend)) {
            setSoftGpu(true);
            S.lowQuality = true;
          }
        } catch {}
        gl.domElement.addEventListener("webglcontextlost", () => {
          S.webgl = false;
        });
      }}
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%" }}
    >
      <Environment resolution={256} frames={1}>
        <mesh scale={160}>
          <sphereGeometry args={[1, 18, 18]} />
          <meshBasicMaterial color="#071535" side={THREE.BackSide} />
        </mesh>
        <Lightformer form="rect" intensity={5.2} position={[-6, 8, 8]} scale={[16, 4, 1]} color="#fff1d6" />
        <Lightformer form="rect" intensity={3.2} position={[8, 2, -35]} scale={[6, 12, 1]} color="#7dd3fc" />
        <Lightformer form="rect" intensity={3.6} position={[6, 3, -72]} scale={[6, 8, 1]} color="#ffd27a" />
      </Environment>

      <ambientLight intensity={0.34} />
      <directionalLight position={[-14, 7, 14]} intensity={3.1} color="#fff7e6" />
      <directionalLight position={[10, -5, -40]} intensity={0.85} color="#38bdf8" />

      <CameraMundo />
      <PrumoPendulo />
      <MascoteIA />
      <Suspense fallback={null}>
        <SistemaSolar />
        <CabosRedeEspacial />
        <FogueteEspacial />
      </Suspense>
      <QuartoImperio />
      <Suspense fallback={null}>
        <GradeShockShader />
      </Suspense>
      <QualityScaler aoDegradar={() => setDegradado(true)} />
      <ReduceUpdater reduced={reduzido} />
      <Pos ativo={!mobile && !degradado && !reduzido && !softGpu} />
    </Canvas>
  );
}
