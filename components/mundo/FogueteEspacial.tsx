"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { S } from "../../lib/store";
import { PLANETAS } from "./SistemaSolar";
import { atualizarMotorFoguete, tocarSaltoPlaneta } from "../../lib/som";
import { obterSpriteParticulaCircular } from "../../lib/particulaSprite";

const PLASMA_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uBoost;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    float pulse = sin(uTime * 34.0 + p.y * 12.0) * 0.06 * (1.0 - uv.y);
    p.x += pulse * (1.0 + uBoost);
    p.z += pulse * (1.0 + uBoost);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const PLASMA_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uBoost;
  varying vec2 vUv;
  void main() {
    float flicker = 0.78 + 0.22 * sin(uTime * 42.0 + vUv.y * 16.0);
    vec3 ciano = vec3(0.22, 0.74, 0.98);
    vec3 ouro = vec3(1.0, 0.82, 0.25);
    vec3 branco = vec3(1.0, 0.98, 0.9);
    vec3 col = mix(ciano, ouro, smoothstep(0.15, 0.8, vUv.y));
    col = mix(col, branco, smoothstep(0.65, 1.0, vUv.y) * (0.6 + uBoost * 0.4));
    float alpha = smoothstep(0.0, 0.85, vUv.y) * flicker * (0.72 + uBoost * 0.28);
    gl_FragColor = vec4(col, alpha);
  }
`;

/**
 * Foguete espacial real carregado via GLTF (.glb) viajando entre os 8 planetas do Sistema Solar,
 * com chama de propulsão GLSL, trilha de partículas e onda de choque warp a cada salto planetário.
 */
export default function FogueteEspacial() {
  const { scene: fogueteGlb } = useGLTF("/modelos-3d/foguete.glb");
  const grpRef = useRef<THREE.Group>(null);
  const chamaRef = useRef<THREE.Mesh>(null);
  const chamaMatRef = useRef<THREE.ShaderMaterial>(null);
  const warpRingRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Points>(null);

  const warpPulse = useRef(0);
  const ultimoPlaneta = useRef(0);

  // Trajetória contínua ziguezagueando suavemente perto de cada planeta
  const rota = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.68, -0.58, 2.25), // 00 Terra (órbita de Jaú à direita)
        new THREE.Vector3(-1.1, 0.45, -16.5), // 01 Mercúrio
        new THREE.Vector3(1.25, -0.2, -33.5), // 02 Vênus
        new THREE.Vector3(-1.25, 0.15, -50.5), // 03 Marte
        new THREE.Vector3(1.1, 0.35, -70.0), // 04 Júpiter + Império
        new THREE.Vector3(-1.3, 0.2, -91.5), // 05 Saturno
        new THREE.Vector3(1.2, -0.25, -110.5), // 06 Urano
        new THREE.Vector3(-0.7, 0.15, -129.0), // 07 Netuno
      ]),
    [],
  );

  const pAtual = useMemo(() => new THREE.Vector3(), []);
  const pFrente = useMemo(() => new THREE.Vector3(), []);

  // 240 partículas locais formando rastro atrás do bocal (-Z local)
  const { trailGeo, seeds } = useMemo(() => {
    const n = 240;
    const pos = new Float32Array(n * 3);
    const s = [];
    for (let i = 0; i < n; i++) {
      const d = (i / n) * 4.5;
      pos[i * 3] = (Math.random() - 0.5) * 0.22;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.22;
      pos[i * 3 + 2] = -1.35 - d;
      s.push({ ox: pos[i * 3], oy: pos[i * 3 + 1], t: i / n });
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return { trailGeo: g, seeds: s };
  }, []);

  const plasmaUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBoost: { value: 0 },
    }),
    [],
  );

  const sprite = useMemo(() => obterSpriteParticulaCircular(), []);

  useFrame((state, dt0) => {
    const dt = Math.min(dt0, 0.05);
    const t = state.clock.elapsedTime;
    const g = grpRef.current;
    if (!g) return;

    const u = THREE.MathUtils.clamp(S.progress, 0.001, 0.995);
    const uNext = Math.min(0.999, u + 0.015);
    rota.getPointAt(u, pAtual);
    rota.getPointAt(uNext, pFrente);

    // Suave flutuação orbital e resposta ao mouse
    if (!S.reduced) {
      pAtual.x += S.px * 0.48 + Math.sin(t * 1.4) * 0.08;
      pAtual.y += S.py * 0.35 + Math.cos(t * 1.8) * 0.06;
    }

    g.position.lerp(pAtual, S.reduced ? 1 : 0.16);
    g.lookAt(pFrente);
    g.rotateZ(THREE.MathUtils.clamp(S.vel * -0.018, -0.55, 0.55) + S.px * 0.22);

    // Detecta salto de planeta e dispara VFX + áudio
    const planetaIdx = Math.min(PLANETAS.length - 1, Math.floor(u * PLANETAS.length));
    if (planetaIdx !== ultimoPlaneta.current) {
      ultimoPlaneta.current = planetaIdx;
      warpPulse.current = 1;
      tocarSaltoPlaneta(planetaIdx);
      window.dispatchEvent(
        new CustomEvent("prumo:planeta", {
          detail: { idx: planetaIdx, nome: PLANETAS[planetaIdx].nome, papel: PLANETAS[planetaIdx].papel },
        }),
      );
    }

    const boostNorm = THREE.MathUtils.clamp(Math.abs(S.vel) / 28, 0, 1);
    atualizarMotorFoguete(boostNorm);

    if (chamaMatRef.current) {
      chamaMatRef.current.uniforms.uTime.value = t;
      chamaMatRef.current.uniforms.uBoost.value = boostNorm;
    }
    if (chamaRef.current) {
      const estica = 1 + boostNorm * 2.1 + S.ignition * 1.2;
      chamaRef.current.scale.set(1 + boostNorm * 0.35, estica, 1 + boostNorm * 0.35);
    }

    // Anel warp de troca de planeta
    if (warpRingRef.current) {
      if (warpPulse.current > 0.01) {
        warpPulse.current = Math.max(0, warpPulse.current - dt * 1.8);
        const s = 1 + (1 - warpPulse.current) * 6.5;
        warpRingRef.current.visible = true;
        warpRingRef.current.scale.setScalar(s);
        const mat = warpRingRef.current.material as THREE.MeshBasicMaterial;
        mat.opacity = warpPulse.current * 0.72;
      } else {
        warpRingRef.current.visible = false;
      }
    }

    // Atualiza partículas do rastro de exaustão
    if (trailRef.current && !S.reduced) {
      const attr = trailGeo.getAttribute("position") as THREE.BufferAttribute;
      const arr = attr.array as Float32Array;
      for (let i = 0; i < seeds.length; i++) {
        const s = seeds[i];
        const fase = (s.t + t * (0.9 + boostNorm * 2.4)) % 1;
        const spread = 0.08 + fase * (0.55 + boostNorm * 0.45);
        arr[i * 3] = s.ox * spread * 4;
        arr[i * 3 + 1] = s.oy * spread * 4;
        arr[i * 3 + 2] = -1.35 - fase * (3.2 + boostNorm * 5.2);
      }
      attr.needsUpdate = true;
    }
  });

  return (
    <group ref={grpRef} position={[0.68, -0.58, 2.25]} scale={0.62}>
      <primitive object={fogueteGlb} />

      {/* Luz do motor iluminando os planetas próximos */}
      <pointLight position={[0, 0, -1.8]} intensity={3.2} distance={10} color="#38bdf8" />

      {/* Chama de plasma GLSL saindo do bocal (-Z local) */}
      <mesh ref={chamaRef} position={[0, 0, -2.05]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.25, 1.45, 20, 1, true]} />
        <shaderMaterial
          ref={chamaMatRef}
          vertexShader={PLASMA_VERT}
          fragmentShader={PLASMA_FRAG}
          uniforms={plasmaUniforms}
          transparent
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Onda de choque de dobra ao cruzar um planeta */}
      <mesh ref={warpRingRef} visible={false}>
        <torusGeometry args={[0.55, 0.025, 12, 48]} />
        <meshBasicMaterial color="#ffd23f" transparent opacity={0} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Partículas circulares de rastro espacial sem quadradinhos */}
      <points ref={trailRef} geometry={trailGeo}>
        <pointsMaterial
          size={0.18}
          map={sprite ?? undefined}
          alphaTest={0.01}
          color="#7dd3fc"
          transparent
          opacity={0.78}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

useGLTF.preload("/modelos-3d/foguete.glb");
