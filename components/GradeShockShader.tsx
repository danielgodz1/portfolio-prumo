"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { S } from "../lib/store";

const GRADE_VERT = /* glsl */ `
  uniform float uShock;
  uniform float uShockRadius;
  uniform vec2 uShockOrigin;
  varying vec2 vWorldXZ;
  varying float vRing;

  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    float d = distance(wp.xz, uShockOrigin);
    float ring = exp(-pow((d - uShockRadius) * 0.72, 2.0)) * uShock;
    wp.y += ring * 0.42 * sin((d - uShockRadius) * 2.8);
    vWorldXZ = wp.xz;
    vRing = ring;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const GRADE_FRAG = /* glsl */ `
  uniform float uOpacity;
  varying vec2 vWorldXZ;
  varying float vRing;

  void main() {
    vec2 coord = vWorldXZ * 0.65;
    vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
    float line = min(grid.x, grid.y);
    float mask = 1.0 - min(line, 1.0);

    vec2 major = abs(fract(coord * 0.25 - 0.5) - 0.5) / fwidth(coord * 0.25);
    float majorMask = 1.0 - min(min(major.x, major.y), 1.0);

    float distFade = clamp(1.0 - length(vWorldXZ) / 26.0, 0.0, 1.0);
    vec3 baseCol = mix(vec3(0.42, 0.56, 0.95), vec3(0.925, 0.933, 0.941), majorMask * 0.7);
    vec3 giz = vec3(1.0, 0.824, 0.247);
    vec3 col = mix(baseCol, giz, clamp(vRing * 1.45, 0.0, 1.0));
    float alpha = (mask * 0.16 + majorMask * 0.22 + vRing * 0.85) * distFade * uOpacity;

    if (alpha < 0.01) discard;
    gl_FragColor = vec4(col, alpha);
  }
`;

const LIQUIDO_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const LIQUIDO_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uMix;
  varying vec2 vUv;

  void main() {
    float wave = sin(vUv.x * 7.5 + uTime * 2.1) * 0.045
               + cos(vUv.x * 13.0 - uTime * 1.4) * 0.022;
    float borda = smoothstep(uMix - 0.14 + wave, uMix + 0.06 + wave, vUv.y);
    float brilho = exp(-pow((vUv.y - (uMix + wave)) * 18.0, 2.0));
    vec3 azul = vec3(0.059, 0.173, 0.478);
    vec3 escuro = vec3(0.012, 0.035, 0.106);
    vec3 giz = vec3(1.0, 0.824, 0.247);
    vec3 col = mix(escuro, azul, smoothstep(0.1, 0.9, vUv.y));
    col = mix(col, giz, brilho * 0.65);
    float alpha = (1.0 - borda) * smoothstep(0.01, 0.18, uMix) * 0.78;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(col, alpha);
  }
`;

/** Grade de base arquitetônica + onda de choque e véu líquido de transição para Contato. */
export default function GradeShockShader() {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const liqMatRef = useRef<THREE.ShaderMaterial>(null);
  const liqMeshRef = useRef<THREE.Mesh>(null);
  const radius = useRef(0);

  const uniforms = useMemo(
    () => ({
      uShock: { value: 0 },
      uShockRadius: { value: 0 },
      uShockOrigin: { value: new THREE.Vector2(3.5, 0) },
      uOpacity: { value: 1 },
    }),
    [],
  );

  const liqUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMix: { value: 0 },
    }),
    [],
  );

  useFrame((state, dt0) => {
    const dt = Math.min(dt0, 0.05);
    const lm = liqMeshRef.current;
    const lmat = liqMatRef.current;
    if (lm && lmat) {
      const lVis = S.liquidMix > 0.01 && S.audiencia === "empresa" && !S.reduced && !S.modo2D;
      lm.visible = lVis;
      if (lVis) {
        lmat.uniforms.uTime.value = state.clock.elapsedTime;
        lmat.uniforms.uMix.value = S.liquidMix;
      }
    }

    const m = meshRef.current;
    const mat = matRef.current;
    if (!m || !mat) return;
    const vis = S.progress < 0.38 && S.quartoActive < 0.35;
    m.visible = vis;
    if (!vis) return;

    if (S.shockwave > 0.01) {
      if (radius.current < 0.01) {
        mat.uniforms.uShockOrigin.value.set(S.shockOriginX, S.shockOriginZ);
      }
      radius.current += dt * 16.5;
      S.shockwave = Math.max(0, S.shockwave - dt * 1.25);
      mat.uniforms.uShock.value = S.shockwave;
      mat.uniforms.uShockRadius.value = radius.current;
    } else {
      radius.current = 0;
      mat.uniforms.uShock.value = 0;
    }

    mat.uniforms.uOpacity.value = 1 - THREE.MathUtils.smoothstep(S.progress, 0.16, 0.36);
  });

  return (
    <>
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -4.4, -4]}>
        <planeGeometry args={[48, 48, 48, 48]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={GRADE_VERT}
          fragmentShader={GRADE_FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
        />
      </mesh>
      <mesh ref={liqMeshRef} visible={false} renderOrder={999} frustumCulled={false}>
        <planeGeometry args={[2, 2]} />
        <shaderMaterial
          ref={liqMatRef}
          vertexShader={LIQUIDO_VERT}
          fragmentShader={LIQUIDO_FRAG}
          uniforms={liqUniforms}
          transparent
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}
