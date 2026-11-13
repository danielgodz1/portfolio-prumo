"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { S } from "../lib/store";

export const QUARTO_ORIGEM = new THREE.Vector3(0, 0, -108);

const U = 40;
const X = (px: number) => (px - 300) / U;
const Z = (py: number) => (py - 260) / U;

interface Peca {
  g: THREE.Group;
  ini: number;
  dur: number;
}

interface Led {
  m: THREE.Mesh;
  along: "x" | "z";
  ini: number;
}

/**
 * Da planta ao quarto (Império Móveis Planejados), migrado do Three puro para dentro do canvas único.
 * Só fica visível quando S.quartoActive > 0.01 para não competir com o restante da missão.
 */
export default function QuartoImperio() {
  const rootRef = useRef<THREE.Group>(null);

  const { room, grade, pecas, leds } = useMemo(() => {
    const TRACO = 0xdce6ff;
    const PAPEL = 0xf3f5fb;
    const MARCA = 0xffd23f;
    const AZUL = 0x0f2c7a;
    const P = 0x1b43a8;

    const room = new THREE.Group();
    const pecas: Peca[] = [];
    const leds: Led[] = [];

    const linhaTraco = new THREE.LineBasicMaterial({ color: TRACO });
    const linhaAzul = new THREE.LineBasicMaterial({ color: AZUL });
    const matMap = new Map<number, THREE.MeshBasicMaterial>();
    const mat = (c: number) => {
      if (!matMap.has(c)) matMap.set(c, new THREE.MeshBasicMaterial({ color: c }));
      return matMap.get(c)!;
    };

    const caixa = (x0: number, z0: number, x1: number, z1: number, h: number, face: number, linha: THREE.LineBasicMaterial, ini: number, dur = 0.18, y0 = 0) => {
      const w = Math.abs(x1 - x0);
      const d = Math.abs(z1 - z0);
      const geo = new THREE.BoxGeometry(w, h, d);
      geo.translate(0, h / 2, 0);
      const m = new THREE.Mesh(geo, mat(face));
      m.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), linha));
      const g = new THREE.Group();
      g.add(m);
      g.position.set((x0 + x1) / 2, y0, (z0 + z1) / 2);
      g.scale.y = 0.0001;
      room.add(g);
      pecas.push({ g, ini, dur });
      return g;
    };

    const px = (a: number, b: number, c: number, d: number, h: number, face: number, linha: THREE.LineBasicMaterial, ini: number, dur?: number, y0?: number) =>
      caixa(X(a), Z(b), X(c), Z(d), h, face, linha, ini, dur, y0);

    const grade = new THREE.GridHelper(16, 32, TRACO, TRACO);
    (grade.material as THREE.Material).opacity = 0.14;
    (grade.material as THREE.Material).transparent = true;
    grade.position.set(0, -0.01, 0);

    const H = 2.6;
    const T = 6;
    px(40 - T, 40 - T, 300, 40 + T, H, P, linhaTraco, 0.0);
    px(460, 40 - T, 560 + T, 40 + T, H, P, linhaTraco, 0.02);
    px(300, 40 - T, 460, 40 + T, 0.9, P, linhaTraco, 0.04);
    px(300, 40 - T, 460, 40 + T, 0.35, P, linhaTraco, 0.04, 0.18, 2.25);
    px(560 - T, 40 - T, 560 + T, 480 + T, H, P, linhaTraco, 0.06);
    px(170, 480 - T, 560 + T, 480 + T, H, P, linhaTraco, 0.08);
    px(40 - T, 480 - T, 90, 480 + T, H, P, linhaTraco, 0.1);
    px(40 - T, 40 - T, 40 + T, 480 + T, H, P, linhaTraco, 0.12);

    // móveis
    px(46, 84, 118, 356, 2.35, PAPEL, linhaAzul, 0.3, 0.2);
    px(284, 48, 472, 100, 0.78, PAPEL, linhaAzul, 0.4, 0.2);
    px(338, 196, 548, 362, 0.5, PAPEL, linhaAzul, 0.46, 0.2);
    px(538, 196, 548 + 4, 362, 1.15, PAPEL, linhaAzul, 0.5, 0.2);
    px(506, 148, 548, 188, 0.58, PAPEL, linhaAzul, 0.54, 0.16);
    px(506, 370, 548, 410, 0.58, PAPEL, linhaAzul, 0.56, 0.16);
    {
      const geo = new THREE.CylinderGeometry(0.42, 0.42, 0.5, 20);
      geo.translate(0, 0.25, 0);
      const m = new THREE.Mesh(geo, mat(PAPEL));
      m.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), linhaAzul));
      const g = new THREE.Group();
      g.add(m);
      g.position.set(X(393), 0, Z(132));
      g.scale.y = 0.0001;
      room.add(g);
      pecas.push({ g, ini: 0.6, dur: 0.14 });
    }

    const addLed = (x0: number, z0: number, x1: number, z1: number, y: number, ini: number) => {
      const w = Math.max(Math.abs(x1 - x0), 0.06);
      const d = Math.max(Math.abs(z1 - z0), 0.06);
      const along: "x" | "z" = d > w ? "z" : "x";
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.06, d), mat(MARCA));
      m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2);
      m.scale[along] = 0.0001;
      room.add(m);
      leds.push({ m, along, ini });
    };
    addLed(X(118) + 0.04, Z(84), X(118) + 0.04, Z(356), 2.2, 0.82);
    addLed(X(284), Z(100) + 0.04, X(472), Z(100) + 0.04, 0.62, 0.86);
    addLed(X(338) - 0.04, Z(196), X(338) - 0.04, Z(362), 0.42, 0.9);

    return { room, grade, pecas, leds };
  }, []);

  useFrame(() => {
    const root = rootRef.current;
    if (!root) return;
    const vis = S.quartoActive > 0.01;
    root.visible = vis;
    if (!vis) return;
    const p = S.reduced ? 1 : S.quartoProgress;
    const e = (a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)));
    for (const { g, ini, dur } of pecas) {
      const k = e(ini, ini + dur);
      g.scale.y = Math.max(0.0001, 1 - Math.pow(1 - k, 3));
    }
    for (const l of leds) {
      l.m.scale[l.along] = Math.max(0.0001, e(l.ini, l.ini + 0.1));
    }
  });

  return (
    <group ref={rootRef} position={QUARTO_ORIGEM} visible={false}>
      <primitive object={grade} />
      <primitive object={room} />
    </group>
  );
}

