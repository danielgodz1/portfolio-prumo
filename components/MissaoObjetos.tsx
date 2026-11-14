"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { S } from "../lib/store";

const latLonParaVec = (latDeg: number, lonDeg: number, r: number) => {
  const lat = (latDeg * Math.PI) / 180;
  const lon = (lonDeg * Math.PI) / 180;
  return new THREE.Vector3(
    r * Math.cos(lat) * Math.sin(lon),
    r * Math.sin(lat),
    r * Math.cos(lat) * Math.cos(lon),
  );
};

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

/** Grade de base arquitetônica com shader GLSL de onda de choque ao impacto do prumo. */
export function GradeBaseShock() {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);
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

  useFrame((_, dt0) => {
    const m = meshRef.current;
    const mat = matRef.current;
    if (!m || !mat) return;
    const vis = S.progress < 0.38 && S.quartoActive < 0.35;
    m.visible = vis;
    if (!vis) return;

    const dt = Math.min(dt0, 0.05);
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
  );
}

/** Pontos técnicos em 3 profundidades para percepção de velocidade Z ao atravessar a obra. */
export function Estrelas3Camadas({ mobile }: { mobile: boolean }) {
  const refs = [useRef<THREE.Points>(null), useRef<THREE.Points>(null), useRef<THREE.Points>(null)];
  const mats = [useRef<THREE.PointsMaterial>(null), useRef<THREE.PointsMaterial>(null), useRef<THREE.PointsMaterial>(null)];

  const camadas = useMemo(() => {
    const fator = mobile ? 0.5 : 1;
    const specs = [
      { n: Math.round(280 * fator), minZ: -120, maxZ: 12, spread: 46, size: 0.075, cor: "#ECEEF0", baseOp: 0.38 },
      { n: Math.round(180 * fator), minZ: -125, maxZ: 5, spread: 60, size: 0.11, cor: "#9eb8ff", baseOp: 0.45 },
      { n: Math.round(75 * fator), minZ: -130, maxZ: -5, spread: 70, size: 0.16, cor: "#FFD23F", baseOp: 0.65 },
    ];
    return specs.map((sp) => {
      const pos = new Float32Array(sp.n * 3);
      for (let i = 0; i < sp.n; i++) {
        pos[i * 3] = (Math.random() - 0.5) * sp.spread;
        pos[i * 3 + 1] = (Math.random() - 0.5) * sp.spread + 14;
        pos[i * 3 + 2] = sp.minZ + Math.random() * (sp.maxZ - sp.minZ);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      return { geo, ...sp };
    });
  }, [mobile]);

  useFrame(({ clock }) => {
    const fade = S.reduced ? 0.75 : THREE.MathUtils.smoothstep(S.progress, 0.04, 0.22) * (1 - S.quartoActive * 0.9);
    const t = clock.getElapsedTime();
    camadas.forEach((c, idx) => {
      const pts = refs[idx].current;
      const mat = mats[idx].current;
      if (!pts || !mat) return;
      pts.visible = fade > 0.02;
      if (!pts.visible) return;
      mat.opacity = c.baseOp * fade;
      if (!S.reduced) {
        pts.rotation.z = t * (idx + 1) * 0.003 + S.px * (idx + 1) * 0.012;
      }
    });
  });

  return (
    <>
      {camadas.map((c, idx) => (
        <points key={idx} ref={refs[idx]} geometry={c.geo}>
          <pointsMaterial ref={mats[idx]} color={c.cor} size={c.size} sizeAttenuation transparent opacity={0} depthWrite={false} />
        </points>
      ))}
    </>
  );
}

/** Esfera geodésica técnica com coordenadas reais de Jaú/SP e sistemas em produção. */
export function TerraOrbita() {
  const grupo = useRef<THREE.Group>(null);
  const globo = useRef<THREE.Group>(null);
  const halos = useRef<(THREE.Mesh | null)[]>([]);

  const { pontosTerra, anelLinha, marcadores } = useMemo(() => {
    const R = 6.2;
    const n = 1800;
    const pts: number[] = [];
    for (let i = 0; i < n; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / n);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const x = Math.sin(phi) * Math.cos(theta);
      const y = Math.cos(phi);
      const z = Math.sin(phi) * Math.sin(theta);
      const onda = Math.sin(x * 3.1 + y * 2.4) * Math.cos(z * 2.8 - y * 1.7) + 0.35 * Math.sin(z * 6.0 + x * 4.5);
      if (onda > 0.08) {
        pts.push(x * (R + 0.04), y * (R + 0.04), z * (R + 0.04));
      }
    }
    const pontosTerra = new THREE.BufferGeometry();
    pontosTerra.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));

    const orbPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      orbPts.push(new THREE.Vector3(Math.cos(a) * 8.4, Math.sin(a) * 1.4, Math.sin(a) * 8.4));
    }
    const anelOrbita = new THREE.BufferGeometry().setFromPoints(orbPts);
    const anelLinha = new THREE.Line(anelOrbita, new THREE.LineBasicMaterial({ color: "#ECEEF0", transparent: true, opacity: 0.24 }));

    const marcadores = [
      { nome: "Jaú/SP", pos: latLonParaVec(-22.3, -48.55, R + 0.14) },
      { nome: "FlowCheck", pos: latLonParaVec(-19.5, -45.2, R + 0.14) },
      { nome: "Império", pos: latLonParaVec(-24.8, -51.4, R + 0.14) },
    ];
    return { pontosTerra, anelLinha, marcadores };
  }, []);

  useFrame(({ clock }) => {
    const g = grupo.current;
    if (!g) return;
    const vis = S.progress > 0.28 && S.progress < 0.85 && S.quartoActive < 0.75;
    g.visible = vis;
    if (!vis) return;

    const entrada = S.reduced ? 1 : THREE.MathUtils.smoothstep(S.progress, 0.3, 0.44);
    const saida = 1 - THREE.MathUtils.smoothstep(S.progress, 0.68, 0.82);
    const s = Math.max(0.001, entrada * saida * (1 - S.quartoActive * 0.5));
    g.scale.setScalar(s);

    if (globo.current && !S.reduced) {
      globo.current.rotation.y = 0.75 + clock.getElapsedTime() * 0.06 + S.px * 0.18;
    }
    const t = clock.getElapsedTime();
    halos.current.forEach((m, idx) => {
      if (!m) return;
      const p = S.reduced ? 1 : 1 + 0.3 * Math.sin(t * 2.8 + idx * 1.4);
      m.scale.setScalar(p);
    });
  });

  return (
    <group ref={grupo} position={[3.2, 23, -64]}>
      <group ref={globo} rotation={[0.32, 0.75, -0.15]}>
        <mesh>
          <sphereGeometry args={[6.12, 28, 22]} />
          <meshBasicMaterial color="#050B1E" />
        </mesh>
        <mesh>
          <sphereGeometry args={[6.18, 22, 16]} />
          <meshBasicMaterial color="#0F2C7A" wireframe transparent opacity={0.44} />
        </mesh>
        <points geometry={pontosTerra}>
          <pointsMaterial color="#9eb8ff" size={0.13} sizeAttenuation transparent opacity={0.85} />
        </points>
        {marcadores.map((mk, idx) => (
          <group key={mk.nome} position={mk.pos}>
            <mesh>
              <sphereGeometry args={[0.16, 10, 10]} />
              <meshBasicMaterial color="#FFD23F" />
            </mesh>
            <mesh
              ref={(el) => {
                halos.current[idx] = el;
              }}
            >
              <sphereGeometry args={[0.3, 10, 10]} />
              <meshBasicMaterial color="#FFD23F" transparent opacity={0.28} wireframe />
            </mesh>
          </group>
        ))}
      </group>
      <primitive object={anelLinha} />
    </group>
  );
}

/** Malha estrutural de 12 nós da stack técnica no topo da obra. */
export function ConstelacaoSkills() {
  const grupo = useRef<THREE.Group>(null);
  const { nos, linhas } = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 12; i++) {
      const ang = (i / 12) * Math.PI * 2;
      const r = 4.5 + (i % 3) * 2.2;
      pts.push(new THREE.Vector3(Math.cos(ang) * r, Math.sin(ang) * (r * 0.55) + ((i % 2) - 0.5) * 1.4, -((i % 4) * 1.6)));
    }
    const segs: THREE.Vector3[] = [];
    for (let i = 0; i < pts.length; i++) {
      segs.push(pts[i], pts[(i + 1) % pts.length]);
      if (i % 2 === 0) segs.push(pts[i], pts[(i + 5) % pts.length]);
    }
    return { nos: pts, linhas: new THREE.BufferGeometry().setFromPoints(segs) };
  }, []);

  useFrame(({ clock }) => {
    const g = grupo.current;
    if (!g) return;
    const vis = S.progress > 0.62 && S.quartoActive < 0.5;
    g.visible = vis;
    if (!vis) return;
    const f = S.reduced ? 1 : THREE.MathUtils.smoothstep(S.progress, 0.64, 0.8);
    g.scale.setScalar(Math.max(0.001, f));
    if (!S.reduced) {
      g.rotation.y = clock.getElapsedTime() * 0.04 + S.px * 0.14;
      g.rotation.x = S.py * 0.08;
    }
  });

  return (
    <group ref={grupo} position={[0, 12, -88]}>
      <lineSegments geometry={linhas}>
        <lineBasicMaterial color="#ECEEF0" transparent opacity={0.32} />
      </lineSegments>
      {nos.map((p, idx) => (
        <mesh key={idx} position={p}>
          <sphereGeometry args={[idx % 3 === 0 ? 0.18 : 0.11, 8, 8]} />
          <meshBasicMaterial color={idx % 3 === 0 ? "#FFD23F" : "#ECEEF0"} />
        </mesh>
      ))}
    </group>
  );
}
