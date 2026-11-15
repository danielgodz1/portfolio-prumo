"use client";
import { useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { S } from "../../lib/store";
import { tocarCliqueCota } from "../../lib/som";
import { obterSpriteParticulaCircular } from "../../lib/particulaSprite";

export interface PlanetaSpec {
  id: string;
  ordem: string;
  nome: string;
  papel: string;
  techEmpresa: string;
  techDev: string;
  pos: [number, number, number];
  raio: number;
  tex: string;
  corAtmos: string;
  velocidade: number;
  bumpScale?: number;
  aneis?: { inner: number; outer: number; inclinaX: number; inclinaZ: number; cor: string; usarTexSaturno?: boolean };
  luas?: { raio: number; dist: number; vel: number; cor: string }[];
}

export const PLANETAS: PlanetaSpec[] = [
  {
    id: "terra",
    ordem: "01",
    nome: "Terra · Jaú/SP",
    papel: "Ponto de partida",
    techEmpresa: "Origem em Jaú/SP · Atendimento direto",
    techDev: "Núcleo Central · Next.js 15 & WebGL",
    pos: [2.65, -0.05, -0.5],
    raio: 2.35,
    tex: "/texturas/planetas/2k_earth_daymap.jpg",
    corAtmos: "#38bdf8",
    velocidade: 0.055,
  },
  {
    id: "mercurio",
    ordem: "02",
    nome: "Mercúrio",
    papel: "A Fundação",
    techEmpresa: "Servidores, rede segura e operação no ar",
    techDev: "Windows Server · Hyper-V · MikroTik",
    pos: [-2.8, 0.6, -19],
    raio: 1.35,
    tex: "/texturas/planetas/2k_mercury.jpg",
    corAtmos: "#ffd23f",
    velocidade: 0.09,
    bumpScale: 0.085,
  },
  {
    id: "venus",
    ordem: "03",
    nome: "Vênus",
    papel: "FlowCheck",
    techEmpresa: "Checklists de campo com foto no celular",
    techDev: "FlowCheck · React 19 · Supabase · IA",
    pos: [3.1, -0.4, -36],
    raio: 1.85,
    tex: "/texturas/planetas/2k_venus_surface.jpg",
    corAtmos: "#fbbf24",
    velocidade: 0.06,
    bumpScale: 0.065,
  },
  {
    id: "marte",
    ordem: "04",
    nome: "Marte",
    papel: "FlowRequest",
    techEmpresa: "Pedidos da equipe até a entrega sem extravio",
    techDev: "FlowRequest · TanStack · Telemetria IoT",
    pos: [-3.0, 0.25, -53],
    raio: 1.6,
    tex: "/texturas/planetas/2k_mars.jpg",
    corAtmos: "#fb7185",
    velocidade: 0.08,
    bumpScale: 0.09,
  },
  {
    id: "jupiter",
    ordem: "05",
    nome: "Júpiter",
    papel: "Império 3D",
    techEmpresa: "Maquete 3D no navegador · Império Móveis",
    techDev: "Three.js · Shaders GLSL · GSAP",
    pos: [4.2, 0.8, -74],
    raio: 3.35,
    tex: "/texturas/planetas/2k_jupiter.jpg",
    corAtmos: "#fcd34d",
    velocidade: 0.045,
    luas: [
      { raio: 0.14, dist: 4.3, vel: 0.9, cor: "#fde68a" },
      { raio: 0.11, dist: 5.0, vel: -0.65, cor: "#cbd5e1" },
      { raio: 0.16, dist: 5.7, vel: 0.45, cor: "#fed7aa" },
    ],
  },
  {
    id: "saturno",
    ordem: "06",
    nome: "Saturno",
    papel: "10 Modelos",
    techEmpresa: "10 sites prontos para escolher o seu ramo",
    techDev: "Sites Interativos · 10 Modelos · Conversão",
    pos: [-3.9, 0.3, -95],
    raio: 2.65,
    tex: "/texturas/planetas/2k_saturn.jpg",
    corAtmos: "#fde047",
    velocidade: 0.05,
    aneis: {
      inner: 3.35,
      outer: 6.1,
      inclinaX: 1.25,
      inclinaZ: 0.28,
      cor: "#fde68a",
      usarTexSaturno: true,
    },
  },
  {
    id: "urano",
    ordem: "07",
    nome: "Urano",
    papel: "Monitoramento",
    techEmpresa: "Segurança e alertas 24h nos seus sistemas",
    techDev: "Wazuh SIEM · Zabbix · Sensores & VPN",
    pos: [3.4, -0.4, -114],
    raio: 2.0,
    tex: "/texturas/planetas/2k_uranus.jpg",
    corAtmos: "#67e8f9",
    velocidade: 0.065,
    aneis: {
      inner: 2.55,
      outer: 3.45,
      inclinaX: 0.25,
      inclinaZ: 1.48,
      cor: "#a5f3fc",
    },
  },
  {
    id: "netuno",
    ordem: "08",
    nome: "Netuno",
    papel: "Contato Final",
    techEmpresa: "Projeto sob medida conectado ao WhatsApp",
    techDev: "TOTVS RM · APIs · Automação & Entrega",
    pos: [-2.4, 0.2, -133],
    raio: 2.15,
    tex: "/texturas/planetas/2k_neptune.jpg",
    corAtmos: "#3b82f6",
    velocidade: 0.07,
  },
];

const ATMOS_VERT = /* glsl */ `
  varying vec3 vNorm;
  varying vec3 vView;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNorm = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const ATMOS_FRAG = /* glsl */ `
  uniform vec3 uCor;
  uniform float uForca;
  varying vec3 vNorm;
  varying vec3 vView;
  void main() {
    // Em BackSide, dot(vNorm, vView) é negativo (-1 no centro, 0 na borda externa)
    float radial = clamp(-dot(vNorm, vView) / 0.58, 0.0, 1.0);
    float f = pow(radial, 2.8) * 0.65;
    gl_FragColor = vec4(uCor, f * uForca);
  }
`;

function latLonParaVec(lat: number, lon: number, raio: number): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return [
    -raio * Math.sin(phi) * Math.cos(theta),
    raio * Math.cos(phi),
    raio * Math.sin(phi) * Math.sin(theta),
  ];
}

function PlanetaComVFX({
  spec,
  texMap,
  texNuvensTerra,
  texNoiteTerra,
  texVenusAtmos,
  texLua,
  texAnelSaturno,
}: {
  spec: PlanetaSpec;
  texMap: THREE.Texture;
  texNuvensTerra?: THREE.Texture;
  texNoiteTerra?: THREE.Texture;
  texVenusAtmos?: THREE.Texture;
  texLua?: THREE.Texture;
  texAnelSaturno?: THREE.Texture;
}) {
  const grpRef = useRef<THREE.Group>(null);
  const esferaRef = useRef<THREE.Mesh>(null);
  const nuvensRef = useRef<THREE.Mesh>(null);
  const venusAtmosRef = useRef<THREE.Mesh>(null);
  const luaRef = useRef<THREE.Mesh>(null);
  const luasGrpRef = useRef<THREE.Group>(null);
  const vfxParticlesRef = useRef<THREE.Points>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const techSpanRef = useRef<HTMLSpanElement>(null);

  const atmosUniforms = useMemo(
    () => ({
      uCor: { value: new THREE.Color(spec.corAtmos) },
      uForca: { value: spec.id === "terra" ? 0.92 : 0.72 },
    }),
    [spec.corAtmos, spec.id],
  );

  // Anel de partículas VFX orbitando cada planeta
  const particlesGeo = useMemo(() => {
    const count = spec.id === "terra" ? 260 : 140;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const ang = (i / count) * Math.PI * 2;
      const dist = spec.raio * (1.28 + ((i * 37) % 100) / 140);
      const y = ((((i * 53) % 100) / 100) - 0.5) * spec.raio * 0.45;
      pos[i * 3] = Math.cos(ang) * dist;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(ang) * dist;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [spec.id, spec.raio]);

  // Geometria radial de anel com mapeamento UV concêntrico (exige faixa 1D para textura real de Saturno)
  const anelGeo = useMemo(() => {
    if (!spec.aneis) return null;
    const g = new THREE.RingGeometry(spec.aneis.inner, spec.aneis.outer, 96, 1);
    const pos = g.attributes.position;
    const uv = g.attributes.uv;
    const v3 = new THREE.Vector3();
    const span = Math.max(0.001, spec.aneis.outer - spec.aneis.inner);
    for (let i = 0; i < pos.count; i++) {
      v3.fromBufferAttribute(pos, i);
      const r = v3.length();
      const tUv = THREE.MathUtils.clamp((r - spec.aneis.inner) / span, 0, 1);
      uv.setXY(i, tUv, 0.5);
    }
    uv.needsUpdate = true;
    return g;
  }, [spec.aneis]);

  const sprite = useMemo(() => obterSpriteParticulaCircular(), []);

  const jauPos = useMemo(() => latLonParaVec(-22.296, -48.558, spec.raio * 1.02), [spec.raio]);

  useFrame((state, dt0) => {
    const dt = Math.min(dt0, 0.05);
    const t = state.clock.elapsedTime;
    if (grpRef.current) {
      // Economiza draw calls longe da câmera e controla visibilidade do rótulo do planeta em foco
      const dz = Math.abs(grpRef.current.position.z - state.camera.position.z);
      const frente = state.camera.position.z - grpRef.current.position.z;
      grpRef.current.visible = dz < 75;
      if (tagRef.current) {
        const mostrarTag = frente > -1.5 && frente < 18 && !S.modo2D && S.quartoActive < 0.35;
        tagRef.current.style.opacity = mostrarTag ? String(THREE.MathUtils.clamp((18 - frente) / 6, 0, 1)) : "0";
        tagRef.current.style.display = mostrarTag ? "grid" : "none";
        if (mostrarTag && techSpanRef.current) {
          const txt = S.audiencia === "dev" ? spec.techDev : spec.techEmpresa;
          if (techSpanRef.current.textContent !== txt) techSpanRef.current.textContent = txt;
        }
      }
      if (!grpRef.current.visible) return;
    }

    if (esferaRef.current && !S.reduced) {
      esferaRef.current.rotation.y += dt * spec.velocidade;
    }
    if (nuvensRef.current && !S.reduced) {
      nuvensRef.current.rotation.y += dt * 0.085;
    }
    if (venusAtmosRef.current && !S.reduced) {
      venusAtmosRef.current.rotation.y += dt * 0.11;
    }
    if (luaRef.current && !S.reduced) {
      const a = t * 0.35;
      luaRef.current.position.set(Math.cos(a) * 3.85, Math.sin(a * 0.7) * 0.55, Math.sin(a) * 3.85);
      luaRef.current.rotation.y += dt * 0.15;
    }
    if (luasGrpRef.current && !S.reduced) {
      luasGrpRef.current.rotation.y += dt * 0.35;
    }
    if (vfxParticlesRef.current && !S.reduced) {
      vfxParticlesRef.current.rotation.y -= dt * 0.18;
    }
  });

  const clicarJau = () => {
    if (spec.id !== "terra") return;
    S.globoFocus = 1;
    S.shockwave = 1;
    S.shockOriginX = 2.65;
    S.shockOriginZ = -0.5;
    tocarCliqueCota(0);
    window.dispatchEvent(new CustomEvent("prumo:jau-easter-egg"));
  };

  return (
    <group ref={grpRef} position={spec.pos}>
      <mesh ref={esferaRef}>
        <sphereGeometry args={[spec.raio, 56, 56]} />
        <meshStandardMaterial
          map={texMap}
          bumpMap={spec.bumpScale ? texMap : undefined}
          bumpScale={spec.bumpScale ?? 0}
          emissiveMap={spec.id === "terra" ? texNoiteTerra : undefined}
          emissive={spec.id === "terra" ? new THREE.Color("#ffd27a") : new THREE.Color("#000000")}
          emissiveIntensity={spec.id === "terra" ? 0.52 : 0}
          roughness={spec.id === "terra" ? 0.56 : spec.id === "urano" || spec.id === "netuno" ? 0.62 : 0.78}
          metalness={spec.id === "terra" ? 0.14 : 0.05}
        />

        {/* Marcador Jaú/SP girando junto à Terra */}
        {spec.id === "terra" && (
          <group position={jauPos} onClick={clicarJau}>
            <mesh>
              <sphereGeometry args={[0.075, 16, 16]} />
              <meshBasicMaterial color="#ffd23f" />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.24, 14, 14]} />
              <meshBasicMaterial color="#ffd23f" wireframe transparent opacity={0.45} />
            </mesh>
          </group>
        )}
      </mesh>

      {/* Camada de nuvens NASA na Terra + grade tech sutil */}
      {spec.id === "terra" && texNuvensTerra && (
        <mesh ref={nuvensRef}>
          <sphereGeometry args={[spec.raio * 1.016, 48, 48]} />
          <meshStandardMaterial
            map={texNuvensTerra}
            transparent
            opacity={0.34}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
      {spec.id === "terra" && (
        <mesh>
          <sphereGeometry args={[spec.raio * 1.032, 24, 16]} />
          <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.06} />
        </mesh>
      )}

      {/* Atmosfera espessa giratória de Vênus sobre a superfície Magellan */}
      {spec.id === "venus" && texVenusAtmos && (
        <mesh ref={venusAtmosRef}>
          <sphereGeometry args={[spec.raio * 1.028, 48, 48]} />
          <meshStandardMaterial
            map={texVenusAtmos}
            transparent
            opacity={0.62}
            roughness={0.7}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Halo Atmosférico Fresnel GLSL suave */}
      <mesh>
        <sphereGeometry args={[spec.raio * 1.18, 42, 42]} />
        <shaderMaterial
          vertexShader={ATMOS_VERT}
          fragmentShader={ATMOS_FRAG}
          uniforms={atmosUniforms}
          transparent
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Lua orbitando a Terra com relevo de crateras */}
      {spec.id === "terra" && texLua && (
        <mesh ref={luaRef} position={[3.85, 0.3, 0]}>
          <sphereGeometry args={[0.42, 32, 32]} />
          <meshStandardMaterial map={texLua} bumpMap={texLua} bumpScale={0.095} roughness={0.92} />
        </mesh>
      )}

      {/* Anéis Planetários (Saturno com textura radial real / Urano gelado) */}
      {spec.aneis && anelGeo && (
        <mesh geometry={anelGeo} rotation={[spec.aneis.inclinaX, 0, spec.aneis.inclinaZ]}>
          <meshStandardMaterial
            map={spec.aneis.usarTexSaturno ? texAnelSaturno : undefined}
            color={spec.aneis.cor}
            emissive={spec.aneis.cor}
            emissiveIntensity={spec.aneis.usarTexSaturno ? 0.28 : 0.16}
            transparent
            opacity={spec.aneis.usarTexSaturno ? 0.92 : 0.48}
            side={THREE.DoubleSide}
            roughness={0.55}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Luas de Júpiter */}
      {spec.luas && (
        <group ref={luasGrpRef}>
          {spec.luas.map((l, idx) => (
            <mesh key={idx} position={[Math.cos(idx * 2.1) * l.dist, (idx - 1) * 0.45, Math.sin(idx * 2.1) * l.dist]}>
              <sphereGeometry args={[l.raio, 18, 18]} />
              <meshStandardMaterial color={l.cor} roughness={0.7} />
            </mesh>
          ))}
        </group>
      )}

      {/* Poeira estelar / vento solar VFX (esferas suaves sem quadrados) */}
      <points ref={vfxParticlesRef} geometry={particlesGeo}>
        <pointsMaterial
          size={spec.id === "terra" ? 0.11 : 0.13}
          map={sprite ?? undefined}
          alphaTest={0.01}
          color={spec.corAtmos}
          transparent
          opacity={0.72}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Placa espacial flutuante com nome do planeta e stack conectada */}
      <Html
        position={[spec.id === "terra" ? 0.3 : 0, spec.id === "terra" ? spec.raio * 0.72 : spec.raio + 0.35, 0.9]}
        center
        zIndexRange={[2, 8]}
        style={{ pointerEvents: "none" }}
      >
        <div ref={tagRef} className="planeta-tag" style={{ display: "none", opacity: 0 }}>
          <span className="planeta-tag__topo cota">
            <i aria-hidden="true" style={{ background: spec.corAtmos }} />
            PLANETA {spec.ordem} · {spec.nome}
          </span>
          <strong className="planeta-tag__papel">{spec.papel}</strong>
          <span ref={techSpanRef} className="planeta-tag__tech cota">
            {spec.techEmpresa}
          </span>
        </div>
      </Html>
    </group>
  );
}

/**
 * Sistema Solar contínuo com texturas reais 2K da NASA / Solar System Scope,
 * Via Láctea ao fundo e campo estelar reativo ao deslocamento espacial.
 */
export default function SistemaSolar() {
  const starRef = useRef<THREE.Points>(null);

  const texturas = useLoader(THREE.TextureLoader, [
    "/texturas/planetas/2k_earth_daymap.jpg", // 0
    "/texturas/planetas/2k_earth_nightmap.jpg", // 1
    "/texturas/planetas/2k_earth_clouds.jpg", // 2
    "/texturas/planetas/2k_moon.jpg", // 3
    "/texturas/planetas/2k_mercury.jpg", // 4
    "/texturas/planetas/2k_venus_atmosphere.jpg", // 5
    "/texturas/planetas/2k_mars.jpg", // 6
    "/texturas/planetas/2k_jupiter.jpg", // 7
    "/texturas/planetas/2k_saturn.jpg", // 8
    "/texturas/planetas/2k_saturn_ring_alpha.png", // 9
    "/texturas/planetas/2k_uranus.jpg", // 10
    "/texturas/planetas/2k_neptune.jpg", // 11
    "/texturas/planetas/2k_stars_milky_way.jpg", // 12
    "/texturas/planetas/2k_venus_surface.jpg", // 13
  ]);

  texturas.forEach((tx, idx) => {
    if (idx !== 9) tx.colorSpace = THREE.SRGBColorSpace;
  });

  const mapById: Record<string, THREE.Texture> = {
    terra: texturas[0],
    mercurio: texturas[4],
    venus: texturas[13],
    marte: texturas[6],
    jupiter: texturas[7],
    saturno: texturas[8],
    urano: texturas[10],
    netuno: texturas[11],
  };

  // 2.200 estrelas ao longo de todo o corredor espacial Z (z = +15 até -155)
  const starsGeo = useMemo(() => {
    const n = 2200;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (((i * 73) % 1000) / 1000 - 0.5) * 68;
      pos[i * 3 + 1] = (((i * 137) % 1000) / 1000 - 0.5) * 44;
      pos[i * 3 + 2] = 16 - ((i * 211) % 1750) / 10;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  const starSprite = useMemo(() => obterSpriteParticulaCircular(), []);

  useFrame((_, dt0) => {
    if (starRef.current && !S.reduced) {
      starRef.current.rotation.z += Math.min(dt0, 0.05) * 0.008;
    }
  });

  return (
    <group>
      {/* Via Láctea real como fundo espacial profundo (fog={false} evita escurecimento pela névoa) */}
      <mesh position={[0, 0, -60]} scale={165}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          map={texturas[12]}
          color="#1e3a8a"
          transparent
          opacity={0.38}
          side={THREE.BackSide}
          depthWrite={false}
          fog={false}
        />
      </mesh>

      <points ref={starRef} geometry={starsGeo}>
        <pointsMaterial
          size={0.18}
          map={starSprite ?? undefined}
          alphaTest={0.01}
          color="#dbeafe"
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          fog={false}
        />
      </points>

      {PLANETAS.map((spec) => (
        <PlanetaComVFX
          key={spec.id}
          spec={spec}
          texMap={mapById[spec.id]}
          texNuvensTerra={spec.id === "terra" ? texturas[2] : undefined}
          texNoiteTerra={spec.id === "terra" ? texturas[1] : undefined}
          texVenusAtmos={spec.id === "venus" ? texturas[5] : undefined}
          texLua={spec.id === "terra" ? texturas[3] : undefined}
          texAnelSaturno={spec.id === "saturno" ? texturas[9] : undefined}
        />
      ))}
    </group>
  );
}
