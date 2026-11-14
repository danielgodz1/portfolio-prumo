"use client";
import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { S } from "../../lib/store";
import { tocarNaviHey } from "../../lib/som";

const CORES_CAMARA = [
  new THREE.Color("#38BDF8"), // 00 Globo: Ciano/Azul NASA
  new THREE.Color("#00FF9C"), // 01 Núcleo: Verde Matrix
  new THREE.Color("#FFD27A"), // 02 Império: Dourado 2700K
  new THREE.Color("#7DD3FC"), // 03 Modelos: Ciano Prisma
  new THREE.Color("#A855F7"), // 04 Kernel: Roxo Hex / Triforce
];

const COR_GIZ = new THREE.Color("#FFD23F");
const SPARK_COUNT = 48;

/**
 * NAVI-KERNEL: IA Mascote 3D viva (núcleo octaédrico + anéis giroscópicos + asas de energia + faíscas).
 * Acompanha a câmera e o cursor com mola amortecida, ilumina o cenário e reage a cliques com giro 360º.
 */
export default function NaviKernel3D() {
  const rootRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const asaERef = useRef<THREE.Mesh>(null);
  const asaDRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const coreMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const ring1MatRef = useRef<THREE.MeshBasicMaterial>(null);
  const ring2MatRef = useRef<THREE.MeshBasicMaterial>(null);
  const sparkRef = useRef<THREE.Points>(null);

  const { camera } = useThree();
  const posAtual = useRef(new THREE.Vector3(2.5, 1.5, 4));
  const spinAtual = useRef(0);
  const corAtual = useRef(new THREE.Color("#38BDF8"));

  const targetWorld = useMemo(() => new THREE.Vector3(), []);
  const camRight = useMemo(() => new THREE.Vector3(), []);
  const camUp = useMemo(() => new THREE.Vector3(), []);
  const camForward = useMemo(() => new THREE.Vector3(), []);
  const projTmp = useMemo(() => new THREE.Vector3(), []);

  const sparks = useMemo(() => {
    const pos = new Float32Array(SPARK_COUNT * 3);
    const dirs: THREE.Vector3[] = [];
    for (let i = 0; i < SPARK_COUNT; i++) {
      const a = (i / SPARK_COUNT) * Math.PI * 2;
      const b = ((i * 7) % 11) / 11 - 0.5;
      const d = new THREE.Vector3(Math.cos(a), b * 1.2, Math.sin(a)).normalize();
      dirs.push(d);
      pos[i * 3] = d.x * 0.45;
      pos[i * 3 + 1] = d.y * 0.45;
      pos[i * 3 + 2] = d.z * 0.45;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return { geo, dirs };
  }, []);

  const onNaviClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    S.naviSpin += Math.PI * 2;
    S.naviBurst = 1;
    tocarNaviHey();
    window.dispatchEvent(new CustomEvent("navi:click"));
  };

  useFrame(({ clock }, dt0) => {
    const root = rootRef.current;
    if (!root) return;
    const dt = Math.min(dt0, 0.05);
    const t = clock.getElapsedTime();

    // Base ancorada na frente da câmera, seguindo o cursor com leve atraso orgânico
    camera.updateMatrixWorld();
    camForward.set(0, 0, -1).applyQuaternion(camera.quaternion);
    camRight.set(1, 0, 0).applyQuaternion(camera.quaternion);
    camUp.set(0, 1, 0).applyQuaternion(camera.quaternion);

    const offX = (S.reduced ? 1.8 : 1.9 + S.px * 1.45) * (camera instanceof THREE.PerspectiveCamera && camera.aspect < 1 ? 0.55 : 1);
    const offY = (S.reduced ? 0.9 : 0.85 + S.py * 0.95 + Math.sin(t * 2.3) * 0.14);
    const dist = 5.4;

    targetWorld
      .copy(camera.position)
      .addScaledVector(camForward, dist)
      .addScaledVector(camRight, offX)
      .addScaledVector(camUp, offY);

    const k = S.reduced ? 1 : 1 - Math.pow(0.002, dt);
    posAtual.current.lerp(targetWorld, k);
    root.position.copy(posAtual.current);

    // Projeta posição 2D para o balão RPG/Terminal acompanhar
    projTmp.copy(posAtual.current).project(camera);
    S.naviScreenX = THREE.MathUtils.clamp((projTmp.x + 1) * 0.5, 0.15, 0.88);
    S.naviScreenY = THREE.MathUtils.clamp((1 - projTmp.y) * 0.5, 0.15, 0.78);

    // Cor dinâmica por Câmara (+ pulso dourado na transmissão)
    const alvoCor = CORES_CAMARA[S.camara] ?? CORES_CAMARA[0];
    corAtual.current.lerp(S.naviTransmit > 0.1 ? COR_GIZ : alvoCor, 0.08);

    if (coreMatRef.current) {
      coreMatRef.current.color.copy(corAtual.current);
      coreMatRef.current.emissive.copy(corAtual.current);
      coreMatRef.current.emissiveIntensity = 1.35 + S.naviBurst * 1.4;
    }
    if (ring1MatRef.current) ring1MatRef.current.color.copy(corAtual.current);
    if (ring2MatRef.current) ring2MatRef.current.color.copy(COR_GIZ).lerp(corAtual.current, 0.35);
    if (lightRef.current) {
      lightRef.current.color.copy(corAtual.current);
      lightRef.current.intensity = 3.2 + S.naviBurst * 3.5;
    }

    // Giro acrobático 360° e inclinação na direção do mouse
    if (S.naviSpin > 0.01) {
      const step = S.naviSpin * Math.min(1, dt * 8.5);
      spinAtual.current += step;
      S.naviSpin -= step;
    }
    if (S.naviTransmit > 0) {
      S.naviTransmit = Math.max(0, S.naviTransmit - dt * 0.8);
    }

    if (bodyRef.current) {
      bodyRef.current.rotation.y = spinAtual.current + t * 0.65 + S.px * 0.4;
      bodyRef.current.rotation.z = -S.px * 0.28;
      bodyRef.current.rotation.x = S.py * 0.25 + S.naviTransmit * 0.45;
    }
    if (ring1Ref.current && !S.reduced) {
      ring1Ref.current.rotation.x = t * 1.4;
      ring1Ref.current.rotation.y = t * 0.9;
    }
    if (ring2Ref.current && !S.reduced) {
      ring2Ref.current.rotation.y = -t * 1.7;
      ring2Ref.current.rotation.z = t * 1.1;
    }
    if (!S.reduced) {
      const flap = Math.sin(t * 9.0) * 0.36;
      if (asaERef.current) asaERef.current.rotation.y = -0.35 + flap;
      if (asaDRef.current) asaDRef.current.rotation.y = 0.35 - flap;
    }

    // Faíscas orbitais + burst no clique
    if (S.naviBurst > 0) {
      S.naviBurst = Math.max(0, S.naviBurst - dt * 1.45);
    }
    if (sparkRef.current) {
      const attr = sparks.geo.attributes.position as THREE.BufferAttribute;
      const arr = attr.array as Float32Array;
      const spread = 0.44 + S.naviBurst * 1.35;
      for (let i = 0; i < SPARK_COUNT; i++) {
        const d = sparks.dirs[i];
        const orb = S.reduced ? 0 : Math.sin(t * 3.0 + i) * 0.08;
        arr[i * 3] = d.x * (spread + orb);
        arr[i * 3 + 1] = d.y * (spread + orb);
        arr[i * 3 + 2] = d.z * (spread + orb);
      }
      attr.needsUpdate = true;
      sparkRef.current.rotation.y = t * 0.9;
    }
  });

  return (
    <group ref={rootRef}>
      <pointLight ref={lightRef} distance={16} decay={1.6} intensity={3.2} />
      <group ref={bodyRef} onClick={onNaviClick}>
        {/* Núcleo octaédrico sagrado */}
        <mesh>
          <octahedronGeometry args={[0.24, 0]} />
          <meshStandardMaterial ref={coreMatRef} color="#38BDF8" emissive="#38BDF8" emissiveIntensity={1.4} roughness={0.15} metalness={0.3} toneMapped={false} />
        </mesh>

        {/* Anéis giroscópicos */}
        <mesh ref={ring1Ref}>
          <torusGeometry args={[0.38, 0.018, 8, 32]} />
          <meshBasicMaterial ref={ring1MatRef} color="#38BDF8" transparent opacity={0.85} toneMapped={false} />
        </mesh>
        <mesh ref={ring2Ref}>
          <torusGeometry args={[0.48, 0.014, 8, 32]} />
          <meshBasicMaterial ref={ring2MatRef} color="#FFD23F" transparent opacity={0.7} toneMapped={false} />
        </mesh>

        {/* Asas prismáticas de energia (estilo fada Navi) */}
        <mesh ref={asaERef} position={[-0.36, 0.08, -0.05]} rotation={[0.2, -0.35, 0.45]}>
          <coneGeometry args={[0.14, 0.48, 3]} />
          <meshBasicMaterial color="#ECEEF0" transparent opacity={0.42} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
        <mesh ref={asaDRef} position={[0.36, 0.08, -0.05]} rotation={[0.2, 0.35, -0.45]}>
          <coneGeometry args={[0.14, 0.48, 3]} />
          <meshBasicMaterial color="#ECEEF0" transparent opacity={0.42} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>

        {/* Hitbox invisível confortável para clique */}
        <mesh visible={false}>
          <sphereGeometry args={[0.68, 8, 8]} />
          <meshBasicMaterial />
        </mesh>
      </group>

      {/* Partículas/faíscas ao redor da mascote */}
      <points ref={sparkRef} geometry={sparks.geo}>
        <pointsMaterial color="#FFD23F" size={0.055} sizeAttenuation transparent opacity={0.88} depthWrite={false} toneMapped={false} />
      </points>
    </group>
  );
}
