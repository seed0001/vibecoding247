"use client";

import { BufferAttribute, Color, IcosahedronGeometry, Vector3 } from "three";
import type { Planet, PlanetKind } from "@/lib/galaxy";

/**
 * Procedural planet terrain: an icosphere displaced by seeded layered
 * noise, with vertex colors tinted by elevation (valleys dark, peaks
 * light — ice worlds get snowy caps). Deterministic per planet and
 * cached, so revisits are free.
 */

const cache = new Map<string, IcosahedronGeometry>();
const asteroidCache: IcosahedronGeometry[] = [];

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const ROUGHNESS: Record<PlanetKind, number> = {
  rocky: 0.075,
  lush: 0.045,
  ice: 0.055,
  desert: 0.055,
  volcanic: 0.095,
};

interface NoiseLayer {
  dir: Vector3;
  freq: number;
  phase: number;
  amp: number;
}

export function getPlanetGeometry(planet: Planet): IcosahedronGeometry {
  const cached = cache.get(planet.id);
  if (cached) return cached;

  const rand = mulberry32(hashString(planet.id + planet.name));
  const geo = new IcosahedronGeometry(planet.radius, 3);

  // layered directional sine noise — cheap, seamless on the sphere
  const layers: NoiseLayer[] = [];
  let amp = 1;
  for (let octave = 0; octave < 6; octave++) {
    const dir = new Vector3(
      rand() * 2 - 1,
      rand() * 2 - 1,
      rand() * 2 - 1,
    ).normalize();
    layers.push({
      dir,
      freq: 1.6 * Math.pow(2, octave) + rand(),
      phase: rand() * Math.PI * 2,
      amp,
    });
    amp *= 0.55;
  }
  const totalAmp = layers.reduce((sum, l) => sum + l.amp, 0);

  const rough = ROUGHNESS[planet.kind];
  const base = new Color(planet.color);
  const light = base
    .clone()
    .lerp(new Color("#ffffff"), planet.kind === "ice" ? 0.55 : 0.32);
  const dark = base
    .clone()
    .lerp(new Color("#000000"), planet.kind === "volcanic" ? 0.5 : 0.35);

  const positions = geo.attributes.position;
  const colors = new Float32Array(positions.count * 3);
  const v = new Vector3();
  const c = new Color();

  for (let i = 0; i < positions.count; i++) {
    v.fromBufferAttribute(positions, i).normalize();
    let n = 0;
    for (const layer of layers) {
      n += layer.amp * Math.sin(layer.freq * v.dot(layer.dir) + layer.phase);
    }
    n /= totalAmp; // roughly -1..1
    const r = planet.radius * (1 + rough * n);
    positions.setXYZ(i, v.x * r, v.y * r, v.z * r);

    const t = Math.min(Math.max(0.5 + 0.62 * n, 0), 1);
    c.copy(dark).lerp(light, t);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  geo.setAttribute("color", new BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  cache.set(planet.id, geo);
  return geo;
}

/** Lumpy unit-radius asteroid; a few cached variants, scaled per instance. */
export function getAsteroidGeometry(variant: number): IcosahedronGeometry {
  const idx = Math.abs(variant) % 4;
  if (asteroidCache[idx]) return asteroidCache[idx];
  const rand = mulberry32(500 + idx * 97);
  const geo = new IcosahedronGeometry(1, 1);
  const positions = geo.attributes.position;
  const v = new Vector3();
  const dirs = Array.from({ length: 4 }, () =>
    new Vector3(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1).normalize(),
  );
  for (let i = 0; i < positions.count; i++) {
    v.fromBufferAttribute(positions, i).normalize();
    let n = 0;
    for (let d = 0; d < dirs.length; d++) {
      n += Math.sin((3 + d * 2.4) * v.dot(dirs[d]) + d) / (d + 1.5);
    }
    const r = 1 + 0.28 * n;
    positions.setXYZ(i, v.x * r, v.y * r, v.z * r);
  }
  geo.computeVertexNormals();
  asteroidCache[idx] = geo;
  return geo;
}
