"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { S } from "../../lib/store";

/** Câmara 04: Geometria Sagrada Triforce Gold + Anéis Hexagonais Roxo Hex (Games & Engenharia Reversa). */
export default function ReliquiaKernel() {
  const wrapRef = useRef<THREE.Group>(null);
  const triRef = useRef<THREE.Group>(null);
  const anelExtRef = useRef<THREE.Mesh>(null);
  const anelIntRef = useRef<THREE.Mesh>(null);

  const triGeo = useMemo(() => {
    const s = 0.95;
    const h = s * Math.sqrt(3) * 0.5;
    const shape = new THREE.Shape();
    shape.moveTo(0, h);
    shape.lineTo(-s * 0.5, 0);
    shape.lineTo(s * 0.5, 0);
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.22, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2 });
    g.center();
    return g;
  }, []);

  useFrame(({ clock }) => {
    const w = wrapRef.current;
    if (!w) return;
    const vis = S.progress > 0.74;
    w.visible = vis;
    if (!vis) return;

    const t = clock.getElapsedTime();
    if (!S.reduced) {
      if (triRef.current) {
        triRef.current.rotation.y = t * 0.48 + S.px * 0.3;
        triRef.current.position.y = Math.sin(t * 1.6) * 0.18;
      }
      if (anelExtRef.current) {
        anelExtRef.current.rotation.z = t * 0.35;
        anelExtRef.current.rotation.x = Math.sin(t * 0.6) * 0.25;
      }
      if (anelIntRef.current) {
        anelIntRef.current.rotation.y = -t * 0.52;
        anelIntRef.current.rotation.z = -t * 0.25;
      }
    }
  });

  const h = 0.95 * Math.sqrt(3) * 0.5;

  return (
    <group ref={wrapRef} position={[3.6, 2.2, -122]}>
      {/* Triforce Sagrada em ouro metálico emissivo */}
      <group ref={triRef}>
        {[
          [0, h * 0.55, 0],
          [-0.52, -h * 0.45, 0],
          [0.52, -h * 0.45, 0],
        ].map(([x, y, z], idx) => (
          <mesh key={idx} geometry={triGeo} position={[x, y, z]}>
            <meshStandardMaterial
              color="#FFD23F"
              emissive="#FFB800"
              emissiveIntensity={0.95}
              metalness={0.9}
              roughness={0.2}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>

      {/* Anéis hexagonais Roxo Hex de decompilação */}
      <mesh ref={anelExtRef}>
        <torusGeometry args={[2.65, 0.045, 6, 6]} />
        <meshBasicMaterial color="#A855F7" transparent opacity={0.85} toneMapped={false} />
      </mesh>
      <mesh ref={anelIntRef}>
        <torusGeometry args={[2.05, 0.03, 6, 8]} />
        <meshBasicMaterial color="#38BDF8" transparent opacity={0.65} toneMapped={false} />
      </mesh>
    </group>
  );
}
