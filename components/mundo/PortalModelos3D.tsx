"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { S } from "../../lib/store";

/** Câmara 03: Corredor de 10 portais prismáticos rotacionando ao redor do eixo da viagem. */
export default function PortalModelos3D() {
  const wrapRef = useRef<THREE.Group>(null);
  const itemsRef = useRef<(THREE.Group | null)[]>([]);

  const portais = useMemo(() => {
    const geo = new THREE.BoxGeometry(2.6, 3.6, 0.14);
    const edges = new THREE.EdgesGeometry(geo);
    return Array.from({ length: 10 }, (_, i) => {
      const ang = (i / 10) * Math.PI * 2;
      const r = 6.2 + (i % 2) * 1.4;
      return {
        x: Math.cos(ang) * r,
        y: Math.sin(ang) * 2.8 + 1.5,
        z: -88 - i * 1.6,
        rotY: -ang * 0.35,
        geo,
        edges,
        cor: i % 3 === 0 ? "#FFD23F" : "#7DD3FC",
      };
    });
  }, []);

  useFrame(({ clock }) => {
    const w = wrapRef.current;
    if (!w) return;
    const vis = S.progress > 0.58 && S.progress < 0.92;
    w.visible = vis;
    if (!vis) return;

    const t = clock.getElapsedTime();
    if (!S.reduced) {
      itemsRef.current.forEach((g, idx) => {
        if (!g) return;
        g.rotation.y = portais[idx].rotY + Math.sin(t * 0.7 + idx) * 0.16 + S.px * 0.12;
        g.rotation.z = Math.cos(t * 0.5 + idx) * 0.05;
      });
    }
  });

  return (
    <group ref={wrapRef}>
      {portais.map((p, idx) => (
        <group
          key={idx}
          ref={(el) => {
            itemsRef.current[idx] = el;
          }}
          position={[p.x, p.y, p.z]}
          rotation={[0, p.rotY, 0]}
        >
          <mesh geometry={p.geo}>
            <meshPhysicalMaterial color="#0b1838" metalness={0.3} roughness={0.15} transparent opacity={0.42} />
          </mesh>
          <lineSegments geometry={p.edges}>
            <lineBasicMaterial color={p.cor} transparent opacity={0.8} toneMapped={false} />
          </lineSegments>
        </group>
      ))}
    </group>
  );
}
