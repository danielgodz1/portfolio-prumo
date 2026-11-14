"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { S } from "../lib/store";

export const QUARTO_ORIGEM = new THREE.Vector3(0, 0.2, -68);

const U = 40;
const X = (px: number) => (px - 300) / U;
const Z = (py: number) => (py - 260) / U;

interface Peca {
  g: THREE.Group;
  ini: number;
  dur: number;
  tipo: "parede" | "movel";
}

interface Led {
  m: THREE.Mesh;
  along: "x" | "z";
  ini: number;
}

/**
 * Da planta ao quarto (Império Móveis Planejados), sincronizado ao scroll (0 -> 1):
 * - 0.0 a 0.3: planta baixa arquitetônica desenhada no chão
 * - 0.3 a 0.7: extrusão 3D em wireframe até ganhar material sólido
 * - 0.7 a 1.0: fitas de LED quentes (2700K) acendem na marcenaria
 */
export default function QuartoImperio() {
  const rootRef = useRef<THREE.Group>(null);
  const ledLight1 = useRef<THREE.PointLight>(null);
  const ledLight2 = useRef<THREE.PointLight>(null);

  const { room, grade, plantaLinhas, pecas, leds, matParede, matMovel, matLed, linhaTraco, linhaAzul } = useMemo(() => {
    const TRACO = 0xdce6ff;
    const PAPEL = 0xf3f5fb;
    const LED_2700K = 0xffd27a;
    const AZUL = 0x0f2c7a;
    const P = 0x1b43a8;

    const room = new THREE.Group();
    const pecas: Peca[] = [];
    const leds: Led[] = [];

    const linhaTraco = new THREE.LineBasicMaterial({ color: TRACO, transparent: true, opacity: 0.95 });
    const linhaAzul = new THREE.LineBasicMaterial({ color: AZUL, transparent: true, opacity: 0.95 });
    const matParede = new THREE.MeshStandardMaterial({
      color: P,
      roughness: 0.7,
      metalness: 0.08,
      transparent: true,
      opacity: 0,
    });
    const matMovel = new THREE.MeshStandardMaterial({
      color: PAPEL,
      roughness: 0.55,
      metalness: 0.05,
      emissive: new THREE.Color("#ffd27a"),
      emissiveIntensity: 0,
      transparent: true,
      opacity: 0,
    });
    const matLed = new THREE.MeshBasicMaterial({ color: LED_2700K, transparent: true, opacity: 0 });

    // Fase 1 (0.0..0.3): linhas arquitetônicas da planta baixa no chão
    const plantaPts: THREE.Vector3[] = [];
    const addRectPlanta = (a: number, b: number, c: number, d: number, y = 0.025) => {
      const x0 = X(a),
        z0 = Z(b),
        x1 = X(c),
        z1 = Z(d);
      plantaPts.push(
        new THREE.Vector3(x0, y, z0),
        new THREE.Vector3(x1, y, z0),
        new THREE.Vector3(x1, y, z0),
        new THREE.Vector3(x1, y, z1),
        new THREE.Vector3(x1, y, z1),
        new THREE.Vector3(x0, y, z1),
        new THREE.Vector3(x0, y, z1),
        new THREE.Vector3(x0, y, z0),
      );
    };
    // Perímetro da planta + projeções dos móveis
    addRectPlanta(34, 34, 566, 486, 0.02);
    addRectPlanta(46, 84, 118, 356, 0.03);
    addRectPlanta(284, 48, 472, 100, 0.03);
    addRectPlanta(338, 196, 548, 362, 0.03);
    addRectPlanta(506, 148, 548, 188, 0.03);
    addRectPlanta(506, 370, 548, 410, 0.03);
    const plantaGeo = new THREE.BufferGeometry().setFromPoints(plantaPts);
    const plantaLinhas = new THREE.LineSegments(
      plantaGeo,
      new THREE.LineBasicMaterial({ color: 0xffd23f, transparent: true, opacity: 0.9 }),
    );

    const caixa = (
      x0: number,
      z0: number,
      x1: number,
      z1: number,
      h: number,
      tipo: "parede" | "movel",
      linha: THREE.LineBasicMaterial,
      ini: number,
      dur = 0.16,
      y0 = 0,
    ) => {
      const w = Math.abs(x1 - x0);
      const d = Math.abs(z1 - z0);
      const geo = new THREE.BoxGeometry(w, h, d);
      geo.translate(0, h / 2, 0);
      const m = new THREE.Mesh(geo, tipo === "parede" ? matParede : matMovel);
      m.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), linha));
      const g = new THREE.Group();
      g.add(m);
      g.position.set((x0 + x1) / 2, y0, (z0 + z1) / 2);
      g.scale.y = 0.0001;
      g.visible = false;
      room.add(g);
      pecas.push({ g, ini, dur, tipo });
      return g;
    };

    const px = (a: number, b: number, c: number, d: number, h: number, tipo: "parede" | "movel", linha: THREE.LineBasicMaterial, ini: number, dur?: number, y0?: number) =>
      caixa(X(a), Z(b), X(c), Z(d), h, tipo, linha, ini, dur, y0);

    const grade = new THREE.GridHelper(16, 32, TRACO, TRACO);
    (grade.material as THREE.Material).opacity = 0.14;
    (grade.material as THREE.Material).transparent = true;
    grade.position.set(0, -0.01, 0);

    // Paredes (sobem em 0.30..0.48)
    const H = 2.6;
    const T = 6;
    px(40 - T, 40 - T, 300, 40 + T, H, "parede", linhaTraco, 0.3);
    px(460, 40 - T, 560 + T, 40 + T, H, "parede", linhaTraco, 0.31);
    px(300, 40 - T, 460, 40 + T, 0.9, "parede", linhaTraco, 0.32);
    px(300, 40 - T, 460, 40 + T, 0.35, "parede", linhaTraco, 0.32, 0.16, 2.25);
    px(560 - T, 40 - T, 560 + T, 480 + T, H, "parede", linhaTraco, 0.34);
    px(170, 480 - T, 560 + T, 480 + T, H, "parede", linhaTraco, 0.35);
    px(40 - T, 480 - T, 90, 480 + T, H, "parede", linhaTraco, 0.36);
    px(40 - T, 40 - T, 40 + T, 480 + T, H, "parede", linhaTraco, 0.37);

    // Módulos de marcenaria sob medida (sobem em 0.38..0.58)
    px(46, 84, 118, 356, 2.35, "movel", linhaAzul, 0.38, 0.18);
    px(284, 48, 472, 100, 0.78, "movel", linhaAzul, 0.42, 0.18);
    px(338, 196, 548, 362, 0.5, "movel", linhaAzul, 0.45, 0.18);
    px(538, 196, 552, 362, 1.15, "movel", linhaAzul, 0.48, 0.18);
    px(506, 148, 548, 188, 0.58, "movel", linhaAzul, 0.5, 0.14);
    px(506, 370, 548, 410, 0.58, "movel", linhaAzul, 0.52, 0.14);
    {
      const geo = new THREE.CylinderGeometry(0.42, 0.42, 0.5, 20);
      geo.translate(0, 0.25, 0);
      const m = new THREE.Mesh(geo, matMovel);
      m.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), linhaAzul));
      const g = new THREE.Group();
      g.add(m);
      g.position.set(X(393), 0, Z(132));
      g.scale.y = 0.0001;
      g.visible = false;
      room.add(g);
      pecas.push({ g, ini: 0.54, dur: 0.14, tipo: "movel" });
    }

    // Fitas de LED quentes 2700K (acendem entre 0.70 e 1.0)
    const addLed = (x0: number, z0: number, x1: number, z1: number, y: number, ini: number) => {
      const w = Math.max(Math.abs(x1 - x0), 0.07);
      const d = Math.max(Math.abs(z1 - z0), 0.07);
      const along: "x" | "z" = d > w ? "z" : "x";
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.07, d), matLed);
      m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2);
      m.scale[along] = 0.0001;
      room.add(m);
      leds.push({ m, along, ini });
    };
    addLed(X(118) + 0.04, Z(84), X(118) + 0.04, Z(356), 2.2, 0.72);
    addLed(X(284), Z(100) + 0.04, X(472), Z(100) + 0.04, 0.62, 0.78);
    addLed(X(338) - 0.04, Z(196), X(338) - 0.04, Z(362), 0.42, 0.84);

    return { room, grade, plantaLinhas, pecas, leds, matParede, matMovel, matLed, linhaTraco, linhaAzul };
  }, []);

  useFrame(() => {
    const root = rootRef.current;
    if (!root) return;
    const vis = S.quartoActive > 0.01;
    root.visible = vis;
    if (!vis) return;

    const p = S.reduced ? 1 : S.quartoProgress;
    const e = (a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)));

    // 0.0 - 0.3: desenho progressivo das linhas da planta baixa no chão
    const plantaDraw = e(0.0, 0.3);
    const totalVerts = plantaLinhas.geometry.attributes.position.count;
    plantaLinhas.geometry.setDrawRange(0, Math.floor(totalVerts * plantaDraw));

    // 0.3 - 0.7: extrusão em wireframe -> sólido
    const solidoF = e(0.5, 0.7);
    matParede.opacity = solidoF * 0.92;
    matMovel.opacity = solidoF * 0.98;
    linhaTraco.opacity = 0.95 - solidoF * 0.25;
    linhaAzul.opacity = 0.95 - solidoF * 0.15;

    for (const { g, ini, dur } of pecas) {
      const k = e(ini, ini + dur);
      g.visible = k > 0.005;
      if (g.visible) {
        g.scale.y = Math.max(0.0001, 1 - Math.pow(1 - k, 3));
      }
    }

    // 0.7 - 1.0: LEDs 2700K acendem com brilho quente
    const ledF = e(0.7, 0.95);
    matLed.opacity = ledF;
    matMovel.emissiveIntensity = ledF * 0.18;
    if (ledLight1.current) ledLight1.current.intensity = ledF * 6.5;
    if (ledLight2.current) ledLight2.current.intensity = ledF * 5.0;

    for (const l of leds) {
      const lk = e(l.ini, l.ini + 0.14);
      l.m.visible = lk > 0.01;
      l.m.scale[l.along] = Math.max(0.0001, lk);
    }
  });

  return (
    <group ref={rootRef} position={QUARTO_ORIGEM} visible={false}>
      <primitive object={grade} />
      <primitive object={plantaLinhas} />
      <primitive object={room} />
      <pointLight ref={ledLight1} position={[-3.8, 2.2, 0]} color="#ffd27a" intensity={0} distance={14} decay={1.6} />
      <pointLight ref={ledLight2} position={[2.2, 1.4, -2.5]} color="#ffcc66" intensity={0} distance={12} decay={1.6} />
    </group>
  );
}
