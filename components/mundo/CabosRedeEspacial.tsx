"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { PLANETAS } from "./SistemaSolar";
import { S } from "../../lib/store";

const CABO_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const CABO_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uPulseSpeed;
  uniform vec3 uCorBase;
  uniform vec3 uCorPulso;
  varying vec2 vUv;

  void main() {
    float fluxo1 = pow(max(0.0, sin((vUv.x * 26.0 - uTime * uPulseSpeed) * 3.14159)), 8.0);
    float fluxo2 = pow(max(0.0, sin((vUv.x * 11.0 - uTime * (uPulseSpeed * 0.65) + 1.4) * 3.14159)), 12.0);
    vec3 col = mix(uCorBase, uCorPulso, clamp(fluxo1 * 0.85 + fluxo2, 0.0, 1.0));
    float alpha = 0.24 + fluxo1 * 0.55 + fluxo2 * 0.45;
    gl_FragColor = vec4(col, alpha);
  }
`;

interface PacoteSpec {
  id: string;
  trilha: 0 | 1 | 2;
  offset: number;
  vel: number;
  cor: string;
  tagEmpresa: string;
  tagDev: string;
}

const PACOTES: PacoteSpec[] = [
  { id: "p-win", trilha: 0, offset: 0.04, vel: 0.022, cor: "#38bdf8", tagEmpresa: "Servidores em Rede", tagDev: "INFRA · Windows Server + AD" },
  { id: "p-mk", trilha: 1, offset: 0.14, vel: 0.025, cor: "#00ff9c", tagEmpresa: "Conexão Segura", tagDev: "REDE · MikroTik VPN & Firewall" },
  { id: "p-iot", trilha: 0, offset: 0.22, vel: 0.02, cor: "#ffd23f", tagEmpresa: "Sensores em Campo", tagDev: "IOT · Sensores & Telemetria" },
  { id: "p-fc", trilha: 0, offset: 0.34, vel: 0.019, cor: "#38bdf8", tagEmpresa: "Site & Checklist", tagDev: "SISTEMA · FlowCheck IA" },
  { id: "p-fr", trilha: 2, offset: 0.39, vel: 0.021, cor: "#fb7185", tagEmpresa: "Pedidos Online", tagDev: "FLUXO · FlowRequest 48h" },
  { id: "p-imp", trilha: 1, offset: 0.54, vel: 0.023, cor: "#ffd23f", tagEmpresa: "Imersão 3D ao Vivo", tagDev: "WEBGL · Império 3D Shader" },
  { id: "p-mod", trilha: 0, offset: 0.64, vel: 0.02, cor: "#a5f3fc", tagEmpresa: "Sites por Ramo", tagDev: "SITES · 10 Modelos Interativos" },
  { id: "p-sec", trilha: 2, offset: 0.75, vel: 0.022, cor: "#00ff9c", tagEmpresa: "Monitoramento 24h", tagDev: "SEC · Wazuh & Zabbix" },
  { id: "p-hyp", trilha: 1, offset: 0.86, vel: 0.024, cor: "#7dd3fc", tagEmpresa: "Alta Disponibilidade", tagDev: "REPLICA · Hyper-V & Supabase" },
  { id: "p-zap", trilha: 0, offset: 0.93, vel: 0.018, cor: "#ffd23f", tagEmpresa: "Contato WhatsApp", tagDev: "API · TOTVS RM & Automação" },
];

/**
 * Cabos de servidores / fibra ótica saindo da Terra e interligando todos os 8 planetas,
 * transportando pulsos luminosos e cápsulas com sites, sistemas, servidores e IoT.
 */
export default function CabosRedeEspacial() {
  const matRefs = useRef<(THREE.ShaderMaterial | null)[]>([]);
  const pacMeshRefs = useRef<(THREE.Group | null)[]>([]);
  const pacTagRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pacSpanRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const tmpPt = useMemo(() => new THREE.Vector3(), []);

  // 3 rotas de cabos partindo da Terra (Jaú/SP) conectando planetas e Império 3D
  const trilhas = useMemo(() => {
    const p = PLANETAS.map((item) => new THREE.Vector3(...item.pos));

    // Cabo 0: Backbone sequencial passando pela órbita de cada planeta
    const backbone = new THREE.CatmullRomCurve3([
      p[0].clone().add(new THREE.Vector3(-0.35, -0.45, 0.6)), // Terra (Jaú/SP)
      new THREE.Vector3(-0.3, -0.7, -9.5),
      p[1].clone().add(new THREE.Vector3(0.4, -0.6, 0.5)), // Mercúrio
      new THREE.Vector3(0.5, -1.1, -27.5),
      p[2].clone().add(new THREE.Vector3(-0.6, -0.8, 0.4)), // Vênus
      new THREE.Vector3(0.1, -0.9, -44.5),
      p[3].clone().add(new THREE.Vector3(0.6, -0.5, 0.4)), // Marte
      new THREE.Vector3(0.4, -0.2, -64.0), // Ramal ao lado da Império 3D
      p[4].clone().add(new THREE.Vector3(-1.4, -1.1, 0.9)), // Júpiter
      new THREE.Vector3(0.2, -1.3, -84.5),
      p[5].clone().add(new THREE.Vector3(1.1, -0.9, 0.7)), // Saturno
      new THREE.Vector3(-0.1, -1.2, -104.5),
      p[6].clone().add(new THREE.Vector3(-0.7, -0.8, 0.6)), // Urano
      new THREE.Vector3(0.3, -0.9, -123.5),
      p[7].clone().add(new THREE.Vector3(0.7, -0.5, 0.8)), // Netuno
    ]);

    // Cabo 1: Tronco superior direto Terra -> Vênus -> Império 3D / Júpiter -> Urano
    const troncoSuperior = new THREE.CatmullRomCurve3([
      p[0].clone().add(new THREE.Vector3(-0.8, 1.15, 0.2)),
      new THREE.Vector3(2.8, 2.3, -18.0),
      p[2].clone().add(new THREE.Vector3(-0.2, 1.65, 0.2)),
      new THREE.Vector3(2.4, 2.6, -54.0),
      new THREE.Vector3(0.3, 1.4, -68.0), // Ancora na maquete Império 3D
      p[4].clone().add(new THREE.Vector3(-0.6, 2.4, 0.5)),
      new THREE.Vector3(3.6, 2.4, -96.0),
      p[6].clone().add(new THREE.Vector3(-0.4, 1.6, 0.4)),
      p[7].clone().add(new THREE.Vector3(0.3, 1.4, 0.5)),
    ]);

    // Cabo 2: Tronco inferior de redundância Terra -> Mercúrio -> Marte -> Saturno -> Netuno
    const troncoInferior = new THREE.CatmullRomCurve3([
      p[0].clone().add(new THREE.Vector3(-1.2, -1.35, 0.4)),
      new THREE.Vector3(-3.4, -2.1, -10.0),
      p[1].clone().add(new THREE.Vector3(-0.2, -1.2, 0.2)),
      new THREE.Vector3(-3.8, -2.4, -38.0),
      p[3].clone().add(new THREE.Vector3(-0.4, -1.35, 0.3)),
      new THREE.Vector3(-3.6, -2.6, -74.0),
      p[5].clone().add(new THREE.Vector3(-0.5, -2.0, 0.6)),
      new THREE.Vector3(-3.3, -2.2, -114.0),
      p[7].clone().add(new THREE.Vector3(-0.4, -1.5, 0.6)),
    ]);

    return [
      { curva: backbone, raio: 0.056, corBase: "#0ea5e9", corPulso: "#7dd3fc", speed: 1.55 },
      { curva: troncoSuperior, raio: 0.04, corBase: "#10b981", corPulso: "#00ff9c", speed: 1.9 },
      { curva: troncoInferior, raio: 0.04, corBase: "#eab308", corPulso: "#ffd23f", speed: 1.35 },
    ];
  }, []);

  const geometrias = useMemo(
    () => trilhas.map((tr) => new THREE.TubeGeometry(tr.curva, 220, tr.raio, 8, false)),
    [trilhas],
  );

  const uniformsList = useMemo(
    () =>
      trilhas.map((tr) => ({
        uTime: { value: 0 },
        uPulseSpeed: { value: tr.speed },
        uCorBase: { value: new THREE.Color(tr.corBase) },
        uCorPulso: { value: new THREE.Color(tr.corPulso) },
      })),
    [trilhas],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const camZ = state.camera.position.z;
    const boostVel = S.reduced ? 0 : Math.min(2.8, Math.abs(S.vel) * 0.08);

    for (let i = 0; i < matRefs.current.length; i++) {
      const m = matRefs.current[i];
      if (m) {
        m.uniforms.uTime.value = S.reduced ? 0 : t * (1 + boostVel * 0.45);
      }
    }

    for (let i = 0; i < PACOTES.length; i++) {
      const p = PACOTES[i];
      const grp = pacMeshRefs.current[i];
      if (!grp) continue;

      const u = S.reduced ? p.offset : (p.offset + t * p.vel) % 1;
      trilhas[p.trilha].curva.getPointAt(u, tmpPt);
      grp.position.copy(tmpPt);

      const frente = camZ - tmpPt.z;
      const foraHeroEsquerda = !(camZ > 1 && tmpPt.x < 0.2);
      const tag = pacTagRefs.current[i];
      if (tag) {
        const mostrar = frente > 1 && frente < 19 && foraHeroEsquerda && !S.modo2D && S.quartoActive < 0.35;
        tag.style.display = mostrar ? "inline-flex" : "none";
        tag.style.opacity = mostrar ? String(THREE.MathUtils.clamp((19 - frente) / 5, 0, 1)) : "0";
        if (mostrar) {
          const sp = pacSpanRefs.current[i];
          const txt = S.audiencia === "dev" ? p.tagDev : p.tagEmpresa;
          if (sp && sp.textContent !== txt) sp.textContent = txt;
        }
      }
    }
  });

  return (
    <group>
      {/* Cabos de fibra ótica / servidores entre Terra e todos os planetas */}
      {geometrias.map((geo, idx) => (
        <mesh key={idx} geometry={geo}>
          <shaderMaterial
            ref={(el) => {
              matRefs.current[idx] = el;
            }}
            vertexShader={CABO_VERT}
            fragmentShader={CABO_FRAG}
            uniforms={uniformsList[idx]}
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* Terminais / conectores brilhantes ancorados na órbita de cada planeta */}
      {PLANETAS.map((pl) => (
        <mesh key={pl.id} position={[pl.pos[0], pl.pos[1] - pl.raio * 0.52, pl.pos[2] + 0.5]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.26, 0.025, 8, 24]} />
          <meshBasicMaterial color={pl.corAtmos} transparent opacity={0.7} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}

      {/* Cápsulas de dados (sites, servidores, IoT, WebGL) trafegando pelos cabos */}
      {PACOTES.map((p, idx) => (
        <group
          key={p.id}
          ref={(el) => {
            pacMeshRefs.current[idx] = el;
          }}
        >
          <mesh>
            <sphereGeometry args={[0.11, 14, 14]} />
            <meshBasicMaterial color={p.cor} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.24, 12, 12]} />
            <meshBasicMaterial color={p.cor} transparent opacity={0.28} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
          <Html position={[0, 0.34, 0]} center zIndexRange={[2, 8]} style={{ pointerEvents: "none" }}>
            <div
              ref={(el) => {
                pacTagRefs.current[idx] = el;
              }}
              className="cabo-pacote-tag cota"
              style={{ display: "none", opacity: 0, borderColor: p.cor }}
            >
              <i aria-hidden="true" style={{ background: p.cor }} />
              <span
                ref={(el) => {
                  pacSpanRefs.current[idx] = el;
                }}
              >
                {p.tagEmpresa}
              </span>
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}
