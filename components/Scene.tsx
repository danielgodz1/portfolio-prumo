"use client";
import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Noise, Vignette, ChromaticAberration } from "@react-three/postprocessing";
import * as THREE from "three";
import { S } from "../lib/store";

const AZUL = new THREE.Color("#0F2C7A");
const PAPEL = new THREE.Color("#ECEEF0");
const GIZ = new THREE.Color("#FFD23F");
const ANDARES = 7, PASSO = 7, Z0 = -6;

/** O prumo: pêndulo amortecido. O cursor, a rolagem e o duplo clique dão impulso; ele tem peso e demora a parar. */
function Prumo() {
  const grupo = useRef<THREE.Group>(null);
  const fisica = useRef({ ax: 0.35, az: 0, vx: 0, vz: 0, giro: 0 });
  const { viewport } = useThree();
  const estreito = viewport.width <= 11;
  const L = estreito ? 2.3 : 3.6, ancora = useMemo(() => new THREE.Vector3(0, 3.7, 0), []);
  ancora.x = estreito ? viewport.width * 0.22 : 5.2; ancora.y = estreito ? 4.0 : 3.7;
  const perfil = useMemo(() => [[0, 0.64], [0.05, 0.62], [0.07, 0.52], [0.2, 0.46], [0.27, 0.32], [0.27, 0.12], [0.2, -0.12], [0.1, -0.36], [0, -0.58]].map(([r, y]) => new THREE.Vector2(r, y)), []);
  const geoFio = useMemo(() => new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, -1, 0)]), []);

  const linhaFio = useMemo(() => new THREE.Line(geoFio, new THREE.LineBasicMaterial({ color: "#ECEEF0" })), [geoFio]);

  useFrame((_, dt0) => {
    const f = fisica.current, dt = Math.min(dt0, 0.033);
    if (S.reduced) f.ax = estreito ? -0.12 : 0.1;
    if (!S.reduced) {
      f.vx += S.pvx * 2.4; f.vz -= S.pvy * 1.5; S.pvx = 0; S.pvy = 0;
      f.vz += S.vel * 0.0022;
      if (S.swing > 0) { f.vx += 5.5 * S.swing; f.vz += 2.5 * S.swing; S.swing = 0; }
      const alvoX = S.px * 0.22, alvoZ = 0;
      f.vx += (-7 * (f.ax - alvoX) - 0.85 * f.vx) * dt; f.vz += (-7 * (f.az - alvoZ) - 0.85 * f.vz) * dt;
      f.ax = THREE.MathUtils.clamp(f.ax + f.vx * dt, -1.2, 1.2); f.az = THREE.MathUtils.clamp(f.az + f.vz * dt, -1.2, 1.2);
      f.giro += (Math.abs(f.vx) + Math.abs(f.vz)) * dt * 1.6 + dt * 0.25;
    }
    const sx = Math.sin(f.ax), sz = Math.sin(f.az), cy = Math.sqrt(Math.max(0.05, 1 - sx * sx - sz * sz));
    const bob = new THREE.Vector3(ancora.x + L * sx, ancora.y - L * cy, ancora.z + L * sz);
    const g = grupo.current!; g.position.copy(bob); g.rotation.set(f.az, f.giro, -f.ax, "ZXY");
    // fio: da âncora até o topo do peso
    const topo = bob.clone().sub(ancora).normalize().multiplyScalar(-0.64).add(bob);
    const p = geoFio.attributes.position as THREE.BufferAttribute; p.setXYZ(0, ancora.x, ancora.y, ancora.z); p.setXYZ(1, topo.x, topo.y, topo.z); p.needsUpdate = true;
  });

  return (
    <>
      <group ref={grupo}>
        <mesh scale={1.35}>
          <latheGeometry args={[perfil, 6]} />
          <meshStandardMaterial color="#F0B400" metalness={0.9} roughness={0.32} envMapIntensity={1.15} flatShading />
        </mesh>
      </group>
      <primitive object={linhaFio} />
      <mesh position={ancora}><sphereGeometry args={[0.07, 12, 12]} /><meshBasicMaterial color="#ECEEF0" /></mesh>
    </>
  );
}

/** A obra: andares em linhas, um atrás do outro em profundidade. A câmera os atravessa conforme a rolagem. */
function Obra() {
  const { scene } = useThree();
  const andares = useRef<THREE.LineLoop[]>([]);
  const W = 9, H = 5.2;
  const { aneis, colunas, divisorias } = useMemo(() => {
    const aneis: THREE.BufferGeometry[] = [], divisorias: THREE.BufferGeometry[] = [];
    const quad = (z: number) => [new THREE.Vector3(-W, -H, z), new THREE.Vector3(W, -H, z), new THREE.Vector3(W, H, z), new THREE.Vector3(-W, H, z)];
    for (let i = 0; i < ANDARES; i++) {
      const z = Z0 - i * PASSO; aneis.push(new THREE.BufferGeometry().setFromPoints(quad(z)));
      const d: THREE.Vector3[] = []; const a = ((i * 37) % 7) - 3;
      d.push(new THREE.Vector3(a, -H, z), new THREE.Vector3(a, H * 0.2, z), new THREE.Vector3(a, H * 0.2, z), new THREE.Vector3(a + 5, H * 0.2, z), new THREE.Vector3(-W, -H * 0.3, z), new THREE.Vector3(a - 3, -H * 0.3, z));
      divisorias.push(new THREE.BufferGeometry().setFromPoints(d));
    }
    const c: THREE.Vector3[] = []; const zf = Z0 - (ANDARES - 1) * PASSO;
    for (const [x, y] of [[-W, -H], [W, -H], [W, H], [-W, H], [0, -H], [0, H]]) c.push(new THREE.Vector3(x, y, Z0 + PASSO), new THREE.Vector3(x, y, zf));
    return { aneis, colunas: new THREE.BufferGeometry().setFromPoints(c), divisorias };
  }, []);
  const poeira = useMemo(() => {
    const n = window.matchMedia("(max-width:800px)").matches ? 220 : 700; const p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { p[i * 3] = (Math.random() - 0.5) * 26; p[i * 3 + 1] = (Math.random() - 0.5) * 14; p[i * 3 + 2] = 10 - Math.random() * 62; }
    return new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(p, 3));
  }, []);
  const laco = (i: number, g: THREE.BufferGeometry) => { const l = new THREE.LineLoop(g, new THREE.LineBasicMaterial({ color: "#ECEEF0", transparent: true, opacity: 0.85 })); andares.current[i] = l; return l; };
  scene.background = AZUL; scene.fog = new THREE.Fog(AZUL, 7, 36);

  useFrame(({ camera }) => {
    andares.current.forEach((l, i) => {
      const dist = Math.abs(camera.position.z - (Z0 - i * PASSO));
      const quente = THREE.MathUtils.smoothstep(4.5 - dist, 0, 3.5); // perto da câmera fica giz
      (l.material as THREE.LineBasicMaterial).color.copy(PAPEL).lerp(GIZ, quente);
    });
  });
  return (
    <>
      {aneis.map((g, i) => (
        <group key={i}>
          <primitive object={laco(i, g)} />
          <primitive object={new THREE.LineSegments(divisorias[i], new THREE.LineBasicMaterial({ color: "#ECEEF0", transparent: true, opacity: 0.3 }))} />
        </group>
      ))}
      <primitive object={new THREE.LineSegments(colunas, new THREE.LineBasicMaterial({ color: "#ECEEF0", transparent: true, opacity: 0.28 }))} />
      <points geometry={poeira}><pointsMaterial color="#ECEEF0" size={0.05} sizeAttenuation transparent opacity={0.55} depthWrite={false} /></points>
    </>
  );
}

/** Câmera: profundidade pela rolagem, deriva pelo cursor e um leve rolamento pela velocidade. */
function Camera() {
  const prog = useRef(0), roll = useRef(0);
  useFrame(({ camera }, dt) => {
    const k = S.reduced ? 1 : 1 - Math.pow(0.0008, dt);
    prog.current += (S.progress - prog.current) * k;
    const e = prog.current;
    camera.position.z = 9 - e * 55;
    camera.position.x += ((S.reduced ? 0 : S.px * 0.7) - camera.position.x) * 0.05;
    camera.position.y += ((S.reduced ? 0.5 : 0.5 + S.py * 0.4) - camera.position.y) * 0.05;
    roll.current += ((S.reduced ? 0 : THREE.MathUtils.clamp(S.vel * -0.0009, -0.05, 0.05)) - roll.current) * 0.08;
    camera.rotation.z = roll.current; camera.lookAt(camera.position.x * 0.4, 0.2, camera.position.z - 10);
    camera.rotation.z = roll.current;
  });
  return null;
}

function Pos({ mobile }: { mobile: boolean }) {
  const off = useMemo(() => new THREE.Vector2(0, 0), []);
  useFrame(() => { const a = Math.min(Math.abs(S.vel) * 0.00018, 0.006); off.set(a, a * 0.6); });
  if (mobile) return null;
  return (
    <EffectComposer multisampling={0}>
      <ChromaticAberration offset={off} radialModulation={false} modulationOffset={0} />
      <Noise opacity={0.12} />
      <Vignette offset={0.3} darkness={0.65} />
    </EffectComposer>
  );
}

export default function Scene() {
  const mobile = useMemo(() => window.matchMedia("(max-width:800px)").matches || (navigator.hardwareConcurrency || 8) <= 4, []);
  return (
    <Canvas
      dpr={mobile ? [1, 1.25] : [1, 1.75]}
      frameloop={S.reduced ? "demand" : "always"}
      camera={{ fov: 48, position: [0, 0.5, 9], near: 0.1, far: 80 }}
      gl={{ antialias: !mobile, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <Environment resolution={256} frames={1}>
        <mesh scale={60}><sphereGeometry args={[1, 24, 24]} /><meshBasicMaterial color="#7f98ff" side={THREE.BackSide} /></mesh>
        <Lightformer form="rect" intensity={6} position={[0, 6, 3]} scale={[12, 3, 1]} />
        <Lightformer form="rect" intensity={3} position={[-6, 1, 4]} scale={[3, 8, 1]} color="#9db4ff" />
        <Lightformer form="rect" intensity={2.2} position={[6, 0, 2]} scale={[3, 8, 1]} />
      </Environment>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 6, 8]} intensity={2.5} color="#ffe9a8" />
      <Camera />
      <Obra />
      <Prumo />
      <Pos mobile={mobile} />
    </Canvas>
  );
}
