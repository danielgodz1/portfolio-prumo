"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { S } from "../../lib/store";
import { tocarNaviHey } from "../../lib/som";
import { obterSpriteParticulaCircular } from "../../lib/particulaSprite";

const CORES_COTAS = [
  new THREE.Color("#38bdf8"), // 00 +0,00 m Globo / Fundação
  new THREE.Color("#10b981"), // 01 +3,00 m FlowCheck
  new THREE.Color("#6366f1"), // 02 +6,00 m FlowRequest
  new THREE.Color("#d4af37"), // 03 +9,00 m Império 3D (LED 2700K)
  new THREE.Color("#f8fafc"), // 04 +12,00 m 13 Modelos
  new THREE.Color("#eab308"), // 05 +15,00 m Kernel Room / Triforce Gold
];

/**
 * IA Mascote 3D ("PRUMO-NAVI"): núcleo cristalino octaédrico + 2 anéis giroscópicos +
 * partículas orbitais + pointLight real reativa às 6 cotas e ao cursor/scroll.
 */
export default function MascoteIA() {
  const grpRef = useRef<THREE.Group>(null);
  const nucleoRef = useRef<THREE.Mesh>(null);
  const anel1Ref = useRef<THREE.Mesh>(null);
  const anel2Ref = useRef<THREE.Mesh>(null);
  const sparksRef = useRef<THREE.Points>(null);
  const matCoreRef = useRef<THREE.MeshStandardMaterial>(null);
  const matAnel1Ref = useRef<THREE.MeshBasicMaterial>(null);
  const matAnel2Ref = useRef<THREE.MeshBasicMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  const corAtual = useRef(new THREE.Color("#38bdf8"));
  const posAlvo = useMemo(() => new THREE.Vector3(), []);
  const projTmp = useMemo(() => new THREE.Vector3(), []);
  const dirCam = useMemo(() => new THREE.Vector3(), []);
  const rightCam = useMemo(() => new THREE.Vector3(), []);
  const upCam = useMemo(() => new THREE.Vector3(), []);
  const sprite = useMemo(() => obterSpriteParticulaCircular(), []);

  const sparksGeo = useMemo(() => {
    const n = 36;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = 0.36 + ((i * 29) % 10) * 0.024;
      const y = ((((i * 41) % 10) / 10) - 0.5) * 0.42;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(a) * r;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  const aoClicar = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    S.naviSpin += Math.PI * 2;
    S.naviBurst = 1;
    tocarNaviHey();
    window.dispatchEvent(new CustomEvent("navi:click"));
  };

  useFrame((state, dt0) => {
    const g = grpRef.current;
    if (!g) return;
    const dt = Math.min(dt0, 0.05);
    const t = state.clock.elapsedTime;
    const cam = state.camera;

    // Ancora na visão da câmera deslocada suavemente pelo mouse/toque e pela cota
    cam.getWorldDirection(dirCam);
    rightCam.crossVectors(dirCam, cam.up).normalize();
    upCam.crossVectors(rightCam, dirCam).normalize();

    const offsetX = S.px * 1.45 - (S.camara === 0 ? 1.55 : -1.45) + Math.sin(t * 1.35) * 0.1;
    const offsetY = S.py * 0.85 + 0.55 + Math.cos(t * 1.75) * 0.09;
    const dist = 4.6;

    posAlvo
      .copy(cam.position)
      .addScaledVector(dirCam, dist)
      .addScaledVector(rightCam, offsetX)
      .addScaledVector(upCam, offsetY);

    g.position.lerp(posAlvo, S.reduced ? 1 : 0.11);

    // Aerodinâmica na rolagem
    const tiltVel = S.reduced ? 0 : THREE.MathUtils.clamp(S.vel * -0.025, -0.5, 0.5);
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, tiltVel + S.px * -0.25, 0.14);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, S.py * 0.25 + S.naviTransmit * 0.4, 0.14);

    if (S.naviSpin > 0.01) {
      const step = S.naviSpin * Math.min(1, dt * 8.5);
      g.rotation.y += step;
      S.naviSpin -= step;
    } else if (!S.reduced) {
      g.rotation.y += dt * 0.45;
    }

    if (S.naviBurst > 0) S.naviBurst = Math.max(0, S.naviBurst - dt * 1.4);
    if (S.naviTransmit > 0) S.naviTransmit = Math.max(0, S.naviTransmit - dt * 0.75);

    const corAlvo = S.naviTransmit > 0.1 ? CORES_COTAS[5] : CORES_COTAS[Math.min(CORES_COTAS.length - 1, S.camara)];
    corAtual.current.lerp(corAlvo, 0.08);

    if (matCoreRef.current) {
      matCoreRef.current.color.copy(corAtual.current);
      matCoreRef.current.emissive.copy(corAtual.current);
      matCoreRef.current.emissiveIntensity = 1.4 + S.naviBurst * 1.5;
    }
    if (matAnel1Ref.current) matAnel1Ref.current.color.copy(corAtual.current);
    if (matAnel2Ref.current) matAnel2Ref.current.color.copy(corAtual.current);
    if (lightRef.current) {
      lightRef.current.color.copy(corAtual.current);
      lightRef.current.intensity = 2.8 + S.naviBurst * 3.4;
    }

    if (anel1Ref.current && !S.reduced) {
      anel1Ref.current.rotation.x += dt * (1.4 + S.naviBurst * 3);
      anel1Ref.current.rotation.y += dt * 0.85;
    }
    if (anel2Ref.current && !S.reduced) {
      anel2Ref.current.rotation.y -= dt * (1.2 + S.naviBurst * 2.6);
      anel2Ref.current.rotation.z += dt * 0.9;
    }
    if (sparksRef.current && !S.reduced) {
      const s = 1 + S.naviBurst * 1.15;
      sparksRef.current.scale.setScalar(s);
      sparksRef.current.rotation.y += dt * 0.65;
    }

    // Exporta coordenadas de tela normalizadas para HUD sincronizado
    projTmp.copy(g.position).project(cam);
    S.naviScreenX = THREE.MathUtils.clamp((projTmp.x + 1) * 0.5, 0.1, 0.9);
    S.naviScreenY = THREE.MathUtils.clamp((1 - projTmp.y) * 0.5, 0.1, 0.85);
  });

  return (
    <group ref={grpRef} onClick={aoClicar} scale={0.78}>
      <pointLight ref={lightRef} intensity={2.8} distance={11} color="#38bdf8" />

      {/* Núcleo cristalino octaédrico */}
      <mesh ref={nucleoRef}>
        <octahedronGeometry args={[0.17, 0]} />
        <meshStandardMaterial
          ref={matCoreRef}
          color="#38bdf8"
          emissive="#38bdf8"
          emissiveIntensity={1.4}
          roughness={0.18}
          metalness={0.35}
        />
      </mesh>

      {/* Casca prismática sutil */}
      <mesh>
        <icosahedronGeometry args={[0.25, 0]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.18} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* 2 Anéis giroscópicos de precisão */}
      <mesh ref={anel1Ref}>
        <torusGeometry args={[0.32, 0.014, 10, 40]} />
        <meshBasicMaterial ref={matAnel1Ref} color="#38bdf8" transparent opacity={0.85} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={anel2Ref} rotation={[Math.PI / 3, 0, Math.PI / 4]}>
        <torusGeometry args={[0.42, 0.011, 10, 44]} />
        <meshBasicMaterial ref={matAnel2Ref} color="#ffd23f" transparent opacity={0.68} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Partículas luminosas orbitais */}
      <points ref={sparksRef} geometry={sparksGeo}>
        <pointsMaterial
          size={0.075}
          map={sprite ?? undefined}
          alphaTest={0.01}
          color="#ffffff"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
