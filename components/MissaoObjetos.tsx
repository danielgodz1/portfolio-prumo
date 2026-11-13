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

/** 3 camadas de estrelas com profundidade e brilho progressivo na saída da atmosfera. */
export function Estrelas3Camadas({ mobile }: { mobile: boolean }) {
  const refs = [useRef<THREE.Points>(null), useRef<THREE.Points>(null), useRef<THREE.Points>(null)];
  const mats = [useRef<THREE.PointsMaterial>(null), useRef<THREE.PointsMaterial>(null), useRef<THREE.PointsMaterial>(null)];

  const camadas = useMemo(() => {
    const fator = mobile ? 0.5 : 1;
    const specs = [
      { n: Math.round(320 * fator), minZ: -120, maxZ: 12, spread: 48, size: 0.08, cor: "#ECEEF0", baseOp: 0.45 },
      { n: Math.round(220 * fator), minZ: -125, maxZ: 5, spread: 64, size: 0.13, cor: "#9eb8ff", baseOp: 0.55 },
      { n: Math.round(90 * fator), minZ: -130, maxZ: -5, spread: 75, size: 0.2, cor: "#FFD23F", baseOp: 0.72 },
    ];
    return specs.map((sp) => {
      const pos = new Float32Array(sp.n * 3);
      for (let i = 0; i < sp.n; i++) {
        pos[i * 3] = (Math.random() - 0.5) * sp.spread;
        pos[i * 3 + 1] = (Math.random() - 0.5) * sp.spread + 18;
        pos[i * 3 + 2] = sp.minZ + Math.random() * (sp.maxZ - sp.minZ);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      return { geo, ...sp };
    });
  }, [mobile]);

  useFrame(({ clock }) => {
    const fade = S.reduced ? 0.85 : THREE.MathUtils.smoothstep(S.progress, 0.06, 0.24) * (1 - S.quartoActive * 0.9);
    const t = clock.getElapsedTime();
    camadas.forEach((c, idx) => {
      const pts = refs[idx].current;
      const mat = mats[idx].current;
      if (!pts || !mat) return;
      pts.visible = fade > 0.02;
      mat.opacity = c.baseOp * fade;
      if (!S.reduced) {
        pts.rotation.z = t * (idx + 1) * 0.004 + S.px * (idx + 1) * 0.015;
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

/** Foguete low-poly feito em código + exaustão em Points dirigida por scroll e boost. */
export function Foguete({ mobile }: { mobile: boolean }) {
  const grupo = useRef<THREE.Group>(null);
  const chamaRef = useRef<THREE.Mesh>(null);
  const ptsRef = useRef<THREE.Points>(null);

  const rota = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-5.4, -0.7, -1.8),
        new THREE.Vector3(-3.4, 2.6, -8.5),
        new THREE.Vector3(-1.4, 9.5, -24),
        new THREE.Vector3(0.4, 18.0, -44),
        new THREE.Vector3(1.8, 25.5, -62),
      ]),
    [],
  );

  const nPts = mobile ? 90 : 180;
  const exaustao = useMemo(() => {
    const pos = new Float32Array(nPts * 3);
    const vidas = new Float32Array(nPts);
    for (let i = 0; i < nPts; i++) {
      vidas[i] = Math.random();
      pos[i * 3] = (Math.random() - 0.5) * 0.28;
      pos[i * 3 + 1] = -1.2 - vidas[i] * 3.8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.28;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return { geo, vidas };
  }, [nPts]);

  const posTmp = useMemo(() => new THREE.Vector3(), []);
  const tanTmp = useMemo(() => new THREE.Vector3(), []);
  const eixoY = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const qTmp = useMemo(() => new THREE.Quaternion(), []);

  useFrame((_, dt0) => {
    const g = grupo.current;
    if (!g) return;
    const vis = S.progress < 0.56 && S.quartoActive < 0.4;
    g.visible = vis;
    if (!vis) return;

    const u = THREE.MathUtils.clamp((S.progress - 0.02) / 0.44, 0, 1);
    rota.getPointAt(u, posTmp);
    rota.getTangentAt(u, tanTmp);
    g.position.copy(posTmp);
    qTmp.setFromUnitVectors(eixoY, tanTmp.normalize());
    g.quaternion.slerp(qTmp, S.reduced ? 1 : 0.25);

    const empuxo = THREE.MathUtils.clamp(S.ignition + S.boost * 1.15 + (u > 0.02 && u < 0.95 ? 0.35 : 0.08), 0.1, 1.5);
    if (chamaRef.current) {
      const trem = S.reduced ? 1 : 0.85 + Math.random() * 0.3;
      chamaRef.current.scale.set(0.75 + empuxo * 0.3, (0.4 + empuxo * 1.1) * trem, 0.75 + empuxo * 0.3);
    }

    if (ptsRef.current && !S.reduced) {
      const dt = Math.min(dt0, 0.05);
      const attr = exaustao.geo.attributes.position as THREE.BufferAttribute;
      const arr = attr.array as Float32Array;
      for (let i = 0; i < nPts; i++) {
        exaustao.vidas[i] += dt * (1.8 + empuxo * 2.6);
        if (exaustao.vidas[i] >= 1) {
          exaustao.vidas[i] = 0;
          arr[i * 3] = (Math.random() - 0.5) * 0.22;
          arr[i * 3 + 1] = -1.15;
          arr[i * 3 + 2] = (Math.random() - 0.5) * 0.22;
        } else {
          arr[i * 3] += (Math.random() - 0.5) * dt * (0.6 + empuxo);
          arr[i * 3 + 1] -= dt * (4.5 + empuxo * 5.2);
          arr[i * 3 + 2] += (Math.random() - 0.5) * dt * (0.6 + empuxo);
        }
      }
      attr.needsUpdate = true;
    }
  });

  return (
    <group ref={grupo} scale={0.78}>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.32, 0.38, 1.8, 10]} />
        <meshStandardMaterial color="#ECEEF0" roughness={0.38} metalness={0.25} flatShading />
      </mesh>
      <mesh position={[0, 1.55, 0]}>
        <coneGeometry args={[0.32, 0.85, 10]} />
        <meshStandardMaterial color="#0F2C7A" roughness={0.35} metalness={0.4} flatShading />
      </mesh>
      <mesh position={[0, 0.5, 0.26]}>
        <cylinderGeometry args={[0.11, 0.11, 0.08, 8]} />
        <meshBasicMaterial color="#FFD23F" />
      </mesh>
      {[0, 1, 2, 3].map((i) => {
        const ang = (i * Math.PI) / 2;
        return (
          <mesh key={i} position={[Math.sin(ang) * 0.42, -0.45, Math.cos(ang) * 0.42]} rotation={[0, ang, 0]}>
            <boxGeometry args={[0.06, 0.62, 0.36]} />
            <meshStandardMaterial color="#FFD23F" roughness={0.4} metalness={0.3} flatShading />
          </mesh>
        );
      })}
      <mesh position={[0, -0.78, 0]}>
        <cylinderGeometry args={[0.24, 0.32, 0.34, 10]} />
        <meshStandardMaterial color="#151817" roughness={0.5} metalness={0.7} flatShading />
      </mesh>
      <mesh ref={chamaRef} position={[0, -1.2, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.22, 0.95, 8]} />
        <meshBasicMaterial color="#FFD23F" transparent opacity={0.92} />
      </mesh>
      <points ref={ptsRef} geometry={exaustao.geo}>
        <pointsMaterial color="#FFD23F" size={0.14} sizeAttenuation transparent opacity={0.8} depthWrite={false} />
      </points>
    </group>
  );
}

/** Ato 2: Globo gerado por código (0 texturas externas) com marcadores Jaú, FlowCheck e Império. */
export function TerraOrbita() {
  const grupo = useRef<THREE.Group>(null);
  const globo = useRef<THREE.Group>(null);
  const halos = useRef<(THREE.Mesh | null)[]>([]);

  const { pontosTerra, anelLinha, marcadores } = useMemo(() => {
    const R = 6.2;
    const n = 2200;
    const pts: number[] = [];
    for (let i = 0; i < n; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / n);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const x = Math.sin(phi) * Math.cos(theta);
      const y = Math.cos(phi);
      const z = Math.sin(phi) * Math.sin(theta);
      // máscara procedural determinística evocando continentes
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
      orbPts.push(new THREE.Vector3(Math.cos(a) * 8.4, Math.sin(a) * 1.6, Math.sin(a) * 8.4));
    }
    const anelOrbita = new THREE.BufferGeometry().setFromPoints(orbPts);
    const anelLinha = new THREE.Line(anelOrbita, new THREE.LineBasicMaterial({ color: "#ECEEF0", transparent: true, opacity: 0.28 }));

    // Marcadores reais: Jaú/SP, FlowCheck (SP/interior), Império (Jaú/SP)
    const marcadores = [
      { nome: "Jaú", pos: latLonParaVec(-22.3, -48.55, R + 0.14) },
      { nome: "FlowCheck", pos: latLonParaVec(-19.5, -45.2, R + 0.14) },
      { nome: "Império", pos: latLonParaVec(-24.8, -51.4, R + 0.14) },
    ];
    return { pontosTerra, anelLinha, marcadores };
  }, []);

  useFrame(({ clock }) => {
    const g = grupo.current;
    if (!g) return;
    const vis = S.progress > 0.3 && S.progress < 0.85 && S.quartoActive < 0.75;
    g.visible = vis;
    if (!vis) return;

    const entrada = S.reduced ? 1 : THREE.MathUtils.smoothstep(S.progress, 0.32, 0.45);
    const saida = 1 - THREE.MathUtils.smoothstep(S.progress, 0.68, 0.82);
    const s = Math.max(0.001, entrada * saida * (1 - S.quartoActive * 0.5));
    g.scale.setScalar(s);

    if (globo.current && !S.reduced) {
      globo.current.rotation.y = 0.75 + clock.getElapsedTime() * 0.08 + S.px * 0.18;
    }
    const t = clock.getElapsedTime();
    halos.current.forEach((m, idx) => {
      if (!m) return;
      const p = S.reduced ? 1 : 1 + 0.35 * Math.sin(t * 3 + idx * 1.4);
      m.scale.setScalar(p);
    });
  });

  return (
    <group ref={grupo} position={[3.2, 23, -64]}>
      <group ref={globo} rotation={[0.32, 0.75, -0.15]}>
        <mesh>
          <sphereGeometry args={[6.12, 32, 24]} />
          <meshBasicMaterial color="#050B1E" />
        </mesh>
        <mesh>
          <sphereGeometry args={[6.18, 24, 16]} />
          <meshBasicMaterial color="#0F2C7A" wireframe transparent opacity={0.42} />
        </mesh>
        <mesh>
          <sphereGeometry args={[6.75, 24, 24]} />
          <meshBasicMaterial color="#1d4ed8" transparent opacity={0.14} side={THREE.BackSide} depthWrite={false} />
        </mesh>
        <points geometry={pontosTerra}>
          <pointsMaterial color="#9eb8ff" size={0.13} sizeAttenuation transparent opacity={0.88} />
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

/** Ato 3: Constelação de 12 nós (stack real) em reentrada. */
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
