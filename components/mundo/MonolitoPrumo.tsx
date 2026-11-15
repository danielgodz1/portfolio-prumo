"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { S } from "../../lib/store";

const TOTAL_BLOCOS = 160;

/**
 * Escultura 3D central de "O Prumo":
 * 160 blocos arquitetônicos instanciados que se montam em helicoide no Hero,
 * abrem em túnel espacial na travessia da história e alinham-se em colunas de dados no Ato 02.
 */
export default function MonolitoPrumo() {
  const instRef = useRef<THREE.InstancedMesh>(null);
  const nucleoRef = useRef<THREE.Group>(null);
  const anel1Ref = useRef<THREE.Mesh>(null);
  const anel2Ref = useRef<THREE.Mesh>(null);

  const sementes = useMemo(() => {
    const arr = [];
    for (let i = 0; i < TOTAL_BLOCOS; i++) {
      const t = i / TOTAL_BLOCOS;
      const ang = i * 2.39996; // ângulo áureo
      const raioHero = 0.85 + Math.sin(t * Math.PI) * 1.45;
      const yHero = (t - 0.5) * 4.4;
      const ladoRack = i % 2 === 0 ? -1 : 1;
      const colunaIdx = Math.floor(i / 2);
      const corTipo = i % 11 === 0 ? 1 : i % 4 === 0 ? 2 : 0; // ouro / azul claro / grafite azulado
      arr.push({
        t,
        ang,
        raioHero,
        yHero,
        ladoRack,
        colunaIdx,
        fase: i * 0.37,
        escalaX: 0.14 + (i % 5) * 0.045,
        escalaY: 0.42 + (i % 7) * 0.11,
        escalaZ: 0.14 + (i % 3) * 0.05,
        corTipo,
      });
    }
    return arr;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const coresReady = useRef(false);

  useFrame((state, dt0) => {
    const dt = Math.min(dt0, 0.05);
    const t = state.clock.elapsedTime;
    const p = S.progress;
    const inst = instRef.current;

    // 1. Atualiza o núcleo dourado + anéis giroscópicos no Hero & transição
    const nuc = nucleoRef.current;
    if (nuc) {
      const visNuc = p < 0.34;
      nuc.visible = visNuc;
      if (visNuc) {
        const emerge = 1 - THREE.MathUtils.smoothstep(p, 0.16, 0.34);
        const targetX = THREE.MathUtils.lerp(2.15, 0, THREE.MathUtils.smoothstep(p, 0.02, 0.18));
        const targetZ = THREE.MathUtils.lerp(0.5, -14.0, THREE.MathUtils.smoothstep(p, 0.04, 0.28));
        nuc.position.set(
          targetX + (S.reduced ? 0 : S.px * 0.45),
          Math.sin(t * 1.3) * 0.12 + (S.reduced ? 0 : S.py * 0.3),
          targetZ,
        );
        const s = 0.95 + Math.sin(t * 2.0) * 0.04 + S.ignition * 0.18;
        nuc.scale.setScalar(s * emerge);
        if (!S.reduced) {
          nuc.rotation.y += dt * 0.45 + S.vel * 0.002;
          nuc.rotation.x = S.py * 0.18;
        }
      }
    }
    if (anel1Ref.current && !S.reduced) {
      anel1Ref.current.rotation.z += dt * 0.55;
      anel1Ref.current.rotation.x += dt * 0.25;
    }
    if (anel2Ref.current && !S.reduced) {
      anel2Ref.current.rotation.y -= dt * 0.68;
      anel2Ref.current.rotation.z -= dt * 0.18;
    }

    if (!inst) return;
    if (!coresReady.current) {
      coresReady.current = true;
      const cAzul = new THREE.Color("#163b9a");
      const cCiano = new THREE.Color("#38bdf8");
      const cGiz = new THREE.Color("#ffd23f");
      for (let i = 0; i < TOTAL_BLOCOS; i++) {
        const tp = sementes[i].corTipo;
        inst.setColorAt(i, tp === 1 ? cGiz : tp === 2 ? cCiano : cAzul);
      }
      if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
    }

    const vis = p < 0.66;
    inst.visible = vis;
    if (!vis) return;

    // Pesos de metamorfose em 3 estados contínuos
    const wTunel = THREE.MathUtils.smoothstep(p, 0.08, 0.26) * (1 - THREE.MathUtils.smoothstep(p, 0.38, 0.54));
    const wRack = THREE.MathUtils.smoothstep(p, 0.28, 0.48);
    const wFadeFim = 1 - THREE.MathUtils.smoothstep(p, 0.55, 0.66);

    const mx = S.px * 4.5;
    const my = S.py * 3.0;

    for (let i = 0; i < TOTAL_BLOCOS; i++) {
      const b = sementes[i];
      const tempoSpin = S.reduced ? 0 : t * 0.36 + p * 6.0;

      // Posição 1: Hero — helicoide escultural montada ao redor do núcleo em Jaú (x=2.15, z=0.5)
      const angHero = b.ang + tempoSpin;
      const pulso = S.reduced ? 0 : Math.sin(t * 1.8 + b.fase) * 0.14;
      const hx = 2.15 + Math.cos(angHero) * (b.raioHero + pulso);
      const hy = b.yHero + Math.sin(angHero * 0.5) * 0.22;
      const hz = 0.5 + Math.sin(angHero) * (b.raioHero + pulso);

      // Posição 2: Túnel Z — fragmentos se abrem em anel largo ao redor do texto central
      const angTunel = b.ang + t * (S.reduced ? 0 : 0.45);
      const tx = Math.cos(angTunel) * (5.9 + (i % 4) * 1.15);
      const ty = Math.sin(angTunel) * (4.1 + (i % 3) * 0.9);
      const tz = -10 - b.t * 28;

      // Posição 3: Corredor de Sistemas — colunas retas e precisas ladeando a câmera (z=-20..-50)
      const rx = b.ladoRack * (4.6 + (b.colunaIdx % 3) * 1.15);
      const ry = ((b.colunaIdx % 7) - 3) * 1.05;
      const rz = -19 - Math.floor(b.colunaIdx / 3) * 1.35;

      // Interpolação suave Hero -> Túnel -> Racks
      let x = THREE.MathUtils.lerp(hx, tx, THREE.MathUtils.clamp(wTunel + wRack, 0, 1));
      let y = THREE.MathUtils.lerp(hy, ty, THREE.MathUtils.clamp(wTunel + wRack, 0, 1));
      let z = THREE.MathUtils.lerp(hz, tz, THREE.MathUtils.clamp(wTunel + wRack, 0, 1));

      x = THREE.MathUtils.lerp(x, rx, wRack);
      y = THREE.MathUtils.lerp(y, ry, wRack);
      z = THREE.MathUtils.lerp(z, rz, wRack);

      // Repulsão magnética do mouse no Hero
      if (!S.reduced && p < 0.28) {
        const dx = x - mx;
        const dy = y - my;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < 6.5) {
          const forca = (1 - dist2 / 6.5) * 1.15;
          x += dx * forca * 0.4;
          y += dy * forca * 0.4;
        }
      }

      dummy.position.set(x, y, z);
      dummy.rotation.set(
        THREE.MathUtils.lerp(b.fase * 0.4 + tempoSpin * 0.3, 0, wRack),
        THREE.MathUtils.lerp(angHero, 0, wRack),
        THREE.MathUtils.lerp(Math.sin(b.fase) * 0.3, 0, wRack),
      );
      const sBase = wFadeFim * (1 + S.boost * 0.25);
      dummy.scale.set(
        b.escalaX * sBase,
        b.escalaY * sBase * THREE.MathUtils.lerp(1, 1.45, wRack),
        b.escalaZ * sBase,
      );
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    }
    inst.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {/* Núcleo giroscópico dourado e cristalino do Hero */}
      <group ref={nucleoRef} position={[2.15, 0, 0.5]}>
        <mesh>
          <octahedronGeometry args={[0.72, 0]} />
          <meshStandardMaterial
            color="#ffd23f"
            emissive="#ffb703"
            emissiveIntensity={0.85}
            roughness={0.22}
            metalness={0.85}
          />
        </mesh>
        <mesh>
          <icosahedronGeometry args={[0.96, 1]} />
          <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.35} />
        </mesh>
        <mesh ref={anel1Ref} rotation={[Math.PI / 3, 0.2, 0]}>
          <torusGeometry args={[1.45, 0.024, 16, 72]} />
          <meshBasicMaterial color="#ffd23f" transparent opacity={0.82} />
        </mesh>
        <mesh ref={anel2Ref} rotation={[-Math.PI / 4, 0.8, 0]}>
          <torusGeometry args={[1.82, 0.018, 16, 72]} />
          <meshBasicMaterial color="#7dd3fc" transparent opacity={0.55} />
        </mesh>
        <pointLight intensity={4.5} distance={10} color="#ffd23f" />
      </group>

      {/* 160 blocos arquitetônicos instanciados que se montam ao longo da narrativa */}
      <instancedMesh ref={instRef} args={[undefined, undefined, TOTAL_BLOCOS]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.32} metalness={0.78} />
      </instancedMesh>
    </group>
  );
}
