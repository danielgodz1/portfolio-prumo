"use client";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { Bloom, ChromaticAberration, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { S } from "../lib/store";
import QuartoImperio, { QUARTO_ORIGEM } from "./QuartoImperio";
import GloboLusion from "./mundo/GloboLusion";
import SalaNucleo from "./mundo/SalaNucleo";
import PortalModelos3D from "./mundo/PortalModelos3D";
import ReliquiaKernel from "./mundo/ReliquiaKernel";
import NaviKernel3D from "./mundo/NaviKernel3D";

const GradeShockShader = dynamic(() => import("./GradeShockShader"), { ssr: false });

const CORES_ATMOS = [
  new THREE.Color("#03091B"), // 00 Globo Orbital
  new THREE.Color("#041118"), // 01 Sala do Núcleo
  new THREE.Color("#08142C"), // 02 Império 3D
  new THREE.Color("#09071A"), // 03 Portal Modelos
  new THREE.Color("#07060F"), // 04 Memory Dump / Kernel
];

/** Câmera contínua em CatmullRomCurve3 atravessando as 5 Câmaras + dolly-in na Império 3D. */
function CameraMundo() {
  const { scene } = useThree();
  const prog = useRef(0);
  const roll = useRef(0);
  const boost = useRef(0);

  const curvaPos = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.35, 10.8), // 00 Globo
        new THREE.Vector3(0, 0.45, -18.5), // 01 Entrada Túnel
        new THREE.Vector3(0, 0.55, -42.0), // 01 Núcleo Sistemas
        new THREE.Vector3(-2.0, 5.6, -55.0), // 02 Império 3D
        new THREE.Vector3(0, 1.8, -82.0), // 03 Portal Modelos
        new THREE.Vector3(0.8, 2.2, -110.5), // 04 Relíquia & Kernel
      ]),
    [],
  );

  const curvaAlvo = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(1.9, 0.1, -1.5), // 00 Olha levemente p/ globo à direita
        new THREE.Vector3(0, 0.25, -34.0), // 01 Olha pelo túnel de racks
        new THREE.Vector3(0, 0.3, -58.0), // 01 Fundo do núcleo
        new THREE.Vector3(0, 1.0, -68.0), // 02 Palco Império
        new THREE.Vector3(0, 1.6, -102.0), // 03 Corredor portais
        new THREE.Vector3(2.4, 2.2, -122.0), // 04 Relíquia Triforce
      ]),
    [],
  );

  const pMundo = useMemo(() => new THREE.Vector3(), []);
  const aMundo = useMemo(() => new THREE.Vector3(), []);
  const pQuarto = useMemo(() => new THREE.Vector3(), []);
  const aQuarto = useMemo(() => new THREE.Vector3(), []);
  const bgCor = useMemo(() => new THREE.Color("#03091B"), []);

  if (!scene.background) scene.background = new THREE.Color("#03091B");
  if (!(scene.fog instanceof THREE.FogExp2)) {
    scene.fog = new THREE.FogExp2("#03091B", 0.022);
  }

  useFrame(({ camera }, dt0) => {
    const dt = Math.min(dt0, 0.05);
    const k = S.reduced || S.modo2D ? 1 : 1 - Math.pow(0.0008, dt);
    prog.current += (S.progress - prog.current) * k;
    const u = THREE.MathUtils.clamp(prog.current, 0, 1);

    // Atualiza cor do fundo + FogExp2 conforme a câmara atual
    const fIdx = u * 4;
    const i0 = Math.min(3, Math.floor(fIdx));
    const frac = fIdx - i0;
    bgCor.copy(CORES_ATMOS[i0]).lerp(CORES_ATMOS[i0 + 1], frac);
    (scene.background as THREE.Color).copy(bgCor);
    if (scene.fog instanceof THREE.FogExp2) {
      scene.fog.color.copy(bgCor);
      scene.fog.density = THREE.MathUtils.lerp(0.02, 0.032, S.camara === 1 ? 1 : 0.25);
    }

    const alvoBoost = S.reduced ? 0 : THREE.MathUtils.clamp(Math.abs(S.vel) / 42, 0, 1);
    boost.current += (alvoBoost - boost.current) * (S.reduced ? 1 : 0.14);
    S.boost = boost.current;
    S.ignition = THREE.MathUtils.lerp(S.ignition, 0, S.reduced ? 1 : 0.04);

    curvaPos.getPointAt(u, pMundo);
    curvaAlvo.getPointAt(u, aMundo);
    if (!S.reduced) {
      pMundo.x += S.px * 0.65;
      pMundo.y += S.py * 0.42;
      aMundo.x += S.px * 0.35;
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
      if (lentos.current >= 12) {
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
    const a = Math.min(Math.abs(S.vel) * 0.00016, 0.005);
    off.set(a, a * 0.6);
  });
  if (!ativo) return null;
  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur luminanceThreshold={0.78} intensity={0.82} radius={0.62} />
      <ChromaticAberration offset={off} radialModulation={false} modulationOffset={0} />
      <Noise opacity={0.055} />
      <Vignette offset={0.28} darkness={0.68} />
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
      aria-label="Mundo 3D contínuo com globo orbital, sala de servidores, maquete da Império, portais e relíquia kernel"
      eventSource={evSource}
      eventPrefix="client"
      dpr={mobile ? [1, 1.25] : [1, 1.75]}
      frameloop={pausado ? "never" : reduzido ? "demand" : "always"}
      camera={{ fov: 48, position: [0, 0.35, 10.8], near: 0.1, far: 180 }}
      gl={{ antialias: !mobile, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        S.webgl = true;
        gl.domElement.addEventListener("webglcontextlost", () => {
          S.webgl = false;
        });
      }}
      style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh" }}
    >
      <Environment resolution={256} frames={1}>
        <mesh scale={140}>
          <sphereGeometry args={[1, 18, 18]} />
          <meshBasicMaterial color="#0b1f54" side={THREE.BackSide} />
        </mesh>
        <Lightformer form="rect" intensity={5.5} position={[0, 8, 5]} scale={[14, 3, 1]} color="#7ec8ff" />
        <Lightformer form="rect" intensity={3.2} position={[-8, 2, -25]} scale={[4, 10, 1]} color="#00ff9c" />
        <Lightformer form="rect" intensity={3.5} position={[6, 3, -68]} scale={[5, 8, 1]} color="#ffd27a" />
      </Environment>

      <ambientLight intensity={0.48} />
      <directionalLight position={[6, 8, 10]} intensity={2.2} color="#b9dcff" />

      <CameraMundo />
      <GloboLusion />
      <SalaNucleo />
      <QuartoImperio />
      <PortalModelos3D />
      <ReliquiaKernel />
      <NaviKernel3D />
      <Suspense fallback={null}>
        <GradeShockShader />
      </Suspense>
      <QualityScaler aoDegradar={() => setDegradado(true)} />
      <ReduceUpdater reduced={reduzido} />
      <Pos ativo={!mobile && !degradado && !reduzido} />
    </Canvas>
  );
}
