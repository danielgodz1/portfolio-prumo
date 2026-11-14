"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { S } from "../../lib/store";

const latLonParaVec = (latDeg: number, lonDeg: number, r: number) => {
  const lat = (latDeg * Math.PI) / 180;
  const lon = (lonDeg * Math.PI) / 180;
  return new THREE.Vector3(
    r * Math.cos(lat) * Math.sin(lon),
    r * Math.sin(lat),
    r * Math.cos(lat) * Math.cos(lon),
  );
};

const GLOBO_VERT = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying vec3 vLocalPos;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vLocalPos = normalize(position);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const GLOBO_FRAG = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying vec3 vLocalPos;
  varying vec2 vUv;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
      f.z
    );
  }

  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.52;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = p * 2.08 + vec3(1.7, 9.2, 4.3);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 n = normalize(vLocalPos);
    // Máscara procedural multi-oitava evocando massas continentais e América do Sul
    float cont = fbm(n * 3.1 + vec3(0.4, -0.2, 0.8));
    float land = smoothstep(0.49, 0.56, cont);
    float coast = smoothstep(0.48, 0.52, cont) - smoothstep(0.52, 0.58, cont);

    // Malha geodésica Lat / Long de alta precisão
    float lat = asin(clamp(n.y, -1.0, 1.0));
    float lon = atan(n.x, n.z);
    float gridLat = smoothstep(0.96, 1.0, abs(cos(lat * 18.0)));
    float gridLon = smoothstep(0.97, 1.0, abs(cos(lon * 18.0)));
    float grid = max(gridLat, gridLon);

    // Pontos de cidade / textura digital nos continentes
    float dotGrid = step(0.62, sin(lat * 95.0) * sin(lon * 95.0));
    float dots = land * dotGrid;

    // Scanline orbital
    float scan = smoothstep(0.92, 1.0, sin(n.y * 8.0 - uTime * 1.6));

    // Iluminação + Fresnel orbital
    vec3 sunDir = normalize(vec3(0.7, 0.55, 0.65));
    float diff = max(dot(normalize(vNormalW), sunDir), 0.14);
    float fresnel = pow(1.0 - max(dot(normalize(vNormalW), normalize(vViewDir)), 0.0), 3.0);

    vec3 oceano = vec3(0.015, 0.038, 0.11);
    vec3 terra = vec3(0.05, 0.24, 0.58);
    vec3 ciano = vec3(0.22, 0.78, 1.0);
    vec3 giz = vec3(1.0, 0.84, 0.28);

    vec3 col = mix(oceano, terra, land) * (0.45 + diff * 0.85);
    col += ciano * dots * 0.65;
    col += ciano * coast * 0.85;
    col += vec3(0.18, 0.42, 0.88) * grid * 0.28;
    col += ciano * scan * 0.25;
    col += mix(ciano, giz, 0.2) * fresnel * 0.95;

    gl_FragColor = vec4(col, 1.0);
  }
`;

const ATMOS_VERT = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const ATMOS_FRAG = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  void main() {
    float rim = pow(0.66 - dot(normalize(vNormalW), normalize(vViewDir)), 3.2);
    vec3 col = vec3(0.16, 0.65, 1.0) * max(rim, 0.0) * 1.45;
    gl_FragColor = vec4(col, clamp(rim * 0.95, 0.0, 0.85));
  }
`;

const ARCO_VERT = /* glsl */ `
  attribute float aProg;
  varying float vProg;
  void main() {
    vProg = aProg;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ARCO_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uOffset;
  uniform vec3 uColor;
  varying float vProg;
  void main() {
    float pulse = fract(vProg - uTime * 0.42 + uOffset);
    float head = smoothstep(0.76, 1.0, pulse);
    float base = 0.22;
    vec3 col = mix(vec3(0.18, 0.62, 1.0), uColor, head);
    float alpha = base + head * 0.78;
    gl_FragColor = vec4(col * (1.0 + head * 1.6), alpha);
  }
`;

const PART_VERT = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouseNDC;
  uniform float uHoverActive;
  attribute float aPhase;
  varying float vEnergy;

  void main() {
    vec3 p = position;
    // Movimento orbital suave
    float ang = uTime * 0.07 + aPhase;
    float cs = cos(ang * 0.25);
    float sn = sin(ang * 0.25);
    p.xz = mat2(cs, -sn, sn, cs) * p.xz;
    p.y += sin(uTime * 0.8 + aPhase * 3.0) * 0.14;

    vec4 clip = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    vec2 ndc = clip.xy / max(clip.w, 0.001);
    vec2 diff = ndc - uMouseNDC;
    float d = length(diff);
    float rep = smoothstep(0.42, 0.0, d) * uHoverActive;
    vec2 pushDir = d > 0.001 ? normalize(diff) : vec2(0.0, 1.0);
    p.xy += pushDir * rep * 1.65;
    p.z += rep * 0.8;

    vEnergy = rep;
    vec4 mvPos = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = clamp((16.0 + rep * 20.0) / max(-mvPos.z, 1.0), 1.4, 5.5);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const PART_FRAG = /* glsl */ `
  varying float vEnergy;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float glow = 1.0 - d * 2.0;
    vec3 col = mix(vec3(0.45, 0.82, 1.0), vec3(1.0, 0.84, 0.28), vEnergy);
    gl_FragColor = vec4(col * (1.0 + vEnergy * 1.4), glow * (0.65 + vEnergy * 0.35));
  }
`;

const DESTINOS_REDE: [string, number, number][] = [
  ["São Paulo", -23.55, -46.63],
  ["Virgínia (US-East)", 39.04, -77.48],
  ["Londres", 51.5, -0.12],
  ["Frankfurt", 50.11, 8.68],
  ["Dublin", 53.34, -6.26],
  ["Tóquio", 35.67, 139.65],
];

/** Globo terrestre de alta densidade com shader procedural, arcos saindo de Jaú/SP e 2.000 partículas com repulsão em GPU. */
export default function GloboLusion() {
  const wrapRef = useRef<THREE.Group>(null);
  const globoRef = useRef<THREE.Group>(null);
  const pinoHaloRef = useRef<THREE.Mesh>(null);

  const globoUniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  const partUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouseNDC: { value: new THREE.Vector2(0, 0) },
      uHoverActive: { value: 1 },
    }),
    [],
  );

  const { pinoPos, arcos, partGeo } = useMemo(() => {
    const R = 3.55;
    // Coordenada exata de Jaú, SP: 22°17'47"S 48°33'28"W
    const jauLat = -22.2964;
    const jauLon = -48.5578;
    const pinoPos = latLonParaVec(jauLat, jauLon, R + 0.08);

    const arcos = DESTINOS_REDE.map(([nome, lat, lon], idx) => {
      const fim = latLonParaVec(lat, lon, R + 0.03);
      const mid = pinoPos.clone().add(fim).multiplyScalar(0.5);
      const dist = pinoPos.distanceTo(fim);
      mid.normalize().multiplyScalar(R + 0.55 + dist * 0.24);
      const curve = new THREE.QuadraticBezierCurve3(pinoPos, mid, fim);
      const pts = curve.getPoints(48);
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const prog = new Float32Array(pts.length);
      for (let i = 0; i < pts.length; i++) prog[i] = i / (pts.length - 1);
      geo.setAttribute("aProg", new THREE.BufferAttribute(prog, 1));
      const mat = new THREE.ShaderMaterial({
        vertexShader: ARCO_VERT,
        fragmentShader: ARCO_FRAG,
        uniforms: {
          uTime: { value: 0 },
          uOffset: { value: idx * 0.23 },
          uColor: { value: new THREE.Color("#FFD23F") },
        },
        transparent: true,
        depthWrite: false,
      });
      const line = new THREE.Line(geo, mat);
      return { nome, line, mat };
    });

    // 2.000 partículas flutuantes ao redor do globo
    const N = 2000;
    const pos = new Float32Array(N * 3);
    const phase = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const r = 4.0 + Math.random() * 4.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      phase[i] = Math.random() * Math.PI * 2;
    }
    const partGeo = new THREE.BufferGeometry();
    partGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    partGeo.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));

    return { pinoPos, arcos, partGeo };
  }, []);

  useFrame(({ clock }) => {
    const w = wrapRef.current;
    if (!w) return;
    const vis = S.progress < 0.34 && !S.modo2D;
    w.visible = vis || (S.modo2D && S.progress < 0.25);
    if (!w.visible) return;

    const t = clock.getElapsedTime();
    globoUniforms.uTime.value = t;
    partUniforms.uTime.value = t;
    partUniforms.uMouseNDC.value.set(S.px, S.py);
    partUniforms.uHoverActive.value = S.reduced ? 0 : 1;

    arcos.forEach((a) => {
      a.mat.uniforms.uTime.value = t;
    });

    if (globoRef.current && !S.reduced) {
      // Orienta América do Sul / Jaú inicialmente visível para a câmera + rotação orbital suave
      globoRef.current.rotation.y = 0.85 + t * 0.055 + S.px * 0.22;
      globoRef.current.rotation.x = 0.18 - S.py * 0.12;
    }

    if (pinoHaloRef.current && !S.reduced) {
      const s = 1 + 0.45 * Math.sin(t * 4.0);
      pinoHaloRef.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={wrapRef} position={[3.6, 0.1, -1.5]}>
      <group ref={globoRef}>
        <mesh>
          <sphereGeometry args={[3.55, 64, 48]} />
          <shaderMaterial vertexShader={GLOBO_VERT} fragmentShader={GLOBO_FRAG} uniforms={globoUniforms} />
        </mesh>

        {/* Atmosfera Fresnel azul orbital */}
        <mesh scale={1.12}>
          <sphereGeometry args={[3.55, 48, 36]} />
          <shaderMaterial
            vertexShader={ATMOS_VERT}
            fragmentShader={ATMOS_FRAG}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            transparent
            depthWrite={false}
          />
        </mesh>

        {/* Pino marcador em Jaú/SP */}
        <group position={pinoPos}>
          <mesh>
            <sphereGeometry args={[0.11, 14, 14]} />
            <meshBasicMaterial color="#FFD23F" toneMapped={false} />
          </mesh>
          <mesh ref={pinoHaloRef}>
            <sphereGeometry args={[0.24, 14, 14]} />
            <meshBasicMaterial color="#FFD23F" transparent opacity={0.35} wireframe toneMapped={false} />
          </mesh>
        </group>

        {/* Arcos Parabólicos de Dados saindo de Jaú */}
        {arcos.map((a) => (
          <primitive key={a.nome} object={a.line} />
        ))}
      </group>

      {/* Campo de 2.000 partículas com repulsão magnética na GPU */}
      <points geometry={partGeo}>
        <shaderMaterial
          vertexShader={PART_VERT}
          fragmentShader={PART_FRAG}
          uniforms={partUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
