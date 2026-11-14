"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { S } from "../../lib/store";

const RACK_Z = [-22, -26.5, -31, -35.5, -40, -44.5];
const LEDS_POR_RACK = 28;

/** Câmara 01: Túnel de Racks de Servidores 3D, LEDs instanciados e Anéis de Firewall. */
export default function SalaNucleo() {
  const wrapRef = useRef<THREE.Group>(null);
  const ledsRef = useRef<THREE.InstancedMesh>(null);
  const aneisRef = useRef<(THREE.Mesh | null)[]>([]);
  const feixesRef = useRef<(THREE.Mesh | null)[]>([]);

  const { rackGeo, edgeGeo, ledSeeds, ledMatrix, ledColor } = useMemo(() => {
    const rackGeo = new THREE.BoxGeometry(1.5, 4.8, 1.9);
    const edgeGeo = new THREE.EdgesGeometry(rackGeo);

    const total = RACK_Z.length * 2 * LEDS_POR_RACK;
    const ledSeeds: { x: number; y: number; z: number; phase: number; tipo: number }[] = [];

    RACK_Z.forEach((z) => {
      [-5.2, 5.2].forEach((sideX) => {
        for (let i = 0; i < LEDS_POR_RACK; i++) {
          const col = i % 4;
          const row = Math.floor(i / 4);
          const lx = sideX + (sideX < 0 ? 0.77 : -0.77);
          const ly = -1.8 + row * 0.56;
          const lz = z - 0.55 + col * 0.36;
          ledSeeds.push({
            x: lx,
            y: ly,
            z: lz,
            phase: Math.random() * 6.28,
            tipo: (i + Math.abs(z)) % 7 === 0 ? 2 : i % 3 === 0 ? 1 : 0,
          });
        }
      });
    });

    return {
      rackGeo,
      edgeGeo,
      ledSeeds,
      ledMatrix: new THREE.Matrix4(),
      ledColor: new THREE.Color(),
      total,
    };
  }, []);

  useFrame(({ clock }) => {
    const w = wrapRef.current;
    if (!w) return;
    const vis = S.progress > 0.14 && S.progress < 0.62;
    w.visible = vis;
    if (!vis) return;

    const t = clock.getElapsedTime();

    // Atualiza LEDs de atividade sem alocações
    const im = ledsRef.current;
    if (im) {
      for (let i = 0; i < ledSeeds.length; i++) {
        const s = ledSeeds[i];
        const blink = S.reduced ? 0.8 : 0.4 + 0.6 * Math.pow(Math.max(0, Math.sin(t * (3.5 + (i % 5)) + s.phase)), 2);
        ledMatrix.makeTranslation(s.x, s.y, s.z);
        im.setMatrixAt(i, ledMatrix);
        if (s.tipo === 2) {
          ledColor.setRGB(1.0 * blink, 0.72 * blink, 0.14 * blink); // âmbar alerta
        } else if (s.tipo === 1) {
          ledColor.setRGB(0.22 * blink, 0.78 * blink, 1.0 * blink); // ciano rede
        } else {
          ledColor.setRGB(0.0 * blink, 1.0 * blink, 0.61 * blink); // verde Matrix
        }
        im.setColorAt(i, ledColor);
      }
      im.instanceMatrix.needsUpdate = true;
      if (im.instanceColor) im.instanceColor.needsUpdate = true;
    }

    if (!S.reduced) {
      aneisRef.current.forEach((m, idx) => {
        if (!m) return;
        m.rotation.z = t * (idx % 2 === 0 ? 0.25 : -0.32) + S.progress * 3.0;
      });
      feixesRef.current.forEach((m, idx) => {
        if (!m) return;
        const off = ((t * 9.5 + idx * 4.5) % 28) - 14;
        m.position.z = -34 + off;
      });
    }
  });

  return (
    <group ref={wrapRef}>
      {/* Piso técnico refletivo da sala do núcleo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, -34]}>
        <planeGeometry args={[18, 38]} />
        <meshStandardMaterial color="#050b16" metalness={0.85} roughness={0.22} />
      </mesh>
      <gridHelper args={[36, 36, "#00FF9C", "#0f3a4a"]} position={[0, -2.48, -34]} />

      {/* Fileiras esquerda e direita de racks */}
      {RACK_Z.map((z) =>
        [-5.2, 5.2].map((x) => (
          <group key={`${z}-${x}`} position={[x, 0, z]}>
            <mesh geometry={rackGeo}>
              <meshStandardMaterial color="#0b1320" metalness={0.82} roughness={0.28} />
            </mesh>
            <lineSegments geometry={edgeGeo}>
              <lineBasicMaterial color="#00FF9C" transparent opacity={0.35} />
            </lineSegments>
          </group>
        )),
      )}

      {/* LEDs instanciados dos servidores */}
      <instancedMesh ref={ledsRef} args={[undefined, undefined, ledSeeds.length]}>
        <boxGeometry args={[0.04, 0.08, 0.14]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      {/* Anéis de Firewall octogonais ao redor do túnel */}
      {[-25, -34, -43].map((z, idx) => (
        <mesh
          key={z}
          ref={(el) => {
            aneisRef.current[idx] = el;
          }}
          position={[0, 0.2, z]}
        >
          <torusGeometry args={[6.4, 0.035, 6, 8]} />
          <meshBasicMaterial color={idx === 1 ? "#FFB020" : "#00FF9C"} transparent opacity={0.55} toneMapped={false} />
        </mesh>
      ))}

      {/* Feixes de dados correndo dos painéis para os racks */}
      {[-3.8, -2.6, 2.6, 3.8].map((x, idx) => (
        <mesh
          key={x}
          ref={(el) => {
            feixesRef.current[idx] = el;
          }}
          position={[x, idx % 2 === 0 ? -1.4 : 1.5, -34]}
        >
          <boxGeometry args={[0.045, 0.045, 2.8]} />
          <meshBasicMaterial color={idx % 2 === 0 ? "#00FF9C" : "#38BDF8"} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
