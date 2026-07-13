"use client";

import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  NormalBlending,
  RingGeometry,
  ShaderMaterial,
  SphereGeometry,
  Texture,
  Vector3,
} from "three";
import type { Planet, PlanetKind } from "@/lib/galaxy";
import {
  ATMOSPHERE_FRAGMENT,
  ATMOSPHERE_VERTEX,
  NOISE_FUNCTIONS,
  PLANET_FRAGMENT,
  PLANET_VERTEX,
} from "@/lib/planet-shaders";

/**
 * Per-planet GPU materials for the Galaxy realm, built on the shaders
 * ported from dgreenheck/threejs-procedural-planets. Every planet gets a
 * seeded noise offset (unique terrain), a kind-specific five-layer color
 * ramp, and a tinted particle atmosphere. Deterministic and cached, so
 * revisits are free.
 */

/** Matches the directionalLight position in the fly-phase scene. */
export const SUN_DIRECTION = new Vector3(100, 60, 40).normalize();

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

interface KindProfile {
  /** Noise shape: 2 = billowy continents, 3 = ridged. */
  type: 2 | 3;
  octaves: number;
  /** Terrain height as a fraction of planet radius. */
  relAmplitude: number;
  /** Raises/lowers sea level, as a fraction of amplitude (negative → flat seas). */
  relOffset: number;
  sharpness: number;
  period: number;
  persistence: number;
  lacunarity: number;
  /** Elevation ramp, low → high. */
  colors: [string, string, string, string, string];
  /** Layer transition points as fractions of amplitude. */
  transitions: [number, number, number, number];
  /** Blend widths as fractions of amplitude. */
  blends: [number, number, number, number];
  specularIntensity: number;
  shininess: number;
  /** Unlit glow of the lowest layer (lava). */
  glowIntensity: number;
  /** How strongly the mid layers lean toward planet.color for variety. */
  tint: number;
}

const KIND_PROFILES: Record<PlanetKind, KindProfile> = {
  lush: {
    type: 2,
    octaves: 7,
    relAmplitude: 0.06,
    relOffset: -0.014,
    sharpness: 2.6,
    period: 0.55,
    persistence: 0.48,
    lacunarity: 1.9,
    colors: ["#04264f", "#15864f", "#9e845f", "#26411f", "#d8dee4"],
    transitions: [0.06, 0.18, 0.4, 0.85],
    blends: [0.1, 0.13, 0.1, 0.14],
    specularIntensity: 1.6,
    shininess: 12,
    glowIntensity: 0,
    tint: 0.3,
  },
  ice: {
    type: 2,
    octaves: 6,
    relAmplitude: 0.05,
    relOffset: -0.02,
    sharpness: 2.0,
    period: 0.6,
    persistence: 0.5,
    lacunarity: 1.9,
    colors: ["#274b6d", "#9dc4d8", "#cde4ef", "#e8f2f8", "#ffffff"],
    transitions: [0.05, 0.22, 0.48, 0.8],
    blends: [0.08, 0.12, 0.15, 0.15],
    specularIntensity: 2.0,
    shininess: 16,
    glowIntensity: 0,
    tint: 0.2,
  },
  desert: {
    type: 3,
    octaves: 5,
    relAmplitude: 0.045,
    relOffset: 0.015,
    sharpness: 1.6,
    period: 0.45,
    persistence: 0.45,
    lacunarity: 2.0,
    colors: ["#8a5a2e", "#b57f3e", "#cf9a4e", "#e0b26e", "#f0dcae"],
    transitions: [0.12, 0.32, 0.58, 0.85],
    blends: [0.12, 0.12, 0.12, 0.12],
    specularIntensity: 0.2,
    shininess: 6,
    glowIntensity: 0,
    tint: 0.35,
  },
  volcanic: {
    type: 2,
    octaves: 7,
    relAmplitude: 0.07,
    relOffset: -0.02,
    sharpness: 3.0,
    period: 0.5,
    persistence: 0.5,
    lacunarity: 1.9,
    colors: ["#ff7b24", "#7a2410", "#45302a", "#57453f", "#201814"],
    transitions: [0.035, 0.13, 0.38, 0.75],
    blends: [0.03, 0.08, 0.12, 0.15],
    specularIntensity: 0.4,
    shininess: 8,
    glowIntensity: 0.9,
    tint: 0.15,
  },
  rocky: {
    type: 3,
    octaves: 6,
    relAmplitude: 0.06,
    relOffset: 0.005,
    sharpness: 1.9,
    period: 0.5,
    persistence: 0.5,
    lacunarity: 2.0,
    colors: ["#4c423a", "#6b5d50", "#8d7b6c", "#a5917f", "#cabfae"],
    transitions: [0.1, 0.32, 0.6, 0.88],
    blends: [0.1, 0.12, 0.14, 0.15],
    specularIntensity: 0.15,
    shininess: 6,
    glowIntensity: 0,
    tint: 0.35,
  },
};

/* ------------------------------------------------------------------ */
/* Shared geometry — one unit sphere, radius applied in the shader     */
/* ------------------------------------------------------------------ */

let unitSphere: SphereGeometry | null = null;

export function getPlanetSphereGeometry(): SphereGeometry {
  if (!unitSphere) {
    unitSphere = new SphereGeometry(1, 80, 80);
    unitSphere.computeTangents(); // bump mapping needs tangents
  }
  return unitSphere;
}

/* ------------------------------------------------------------------ */
/* Planet surface material                                             */
/* ------------------------------------------------------------------ */

const materialCache = new Map<string, ShaderMaterial>();

export function getPlanetMaterial(planet: Planet): ShaderMaterial {
  const cached = materialCache.get(planet.id);
  if (cached) return cached;

  const rand = mulberry32(hashString(planet.id + planet.name));
  const profile = KIND_PROFILES[planet.kind];
  const amplitude = planet.radius * profile.relAmplitude;
  const tintColor = new Color(planet.color);

  const layerColors = profile.colors.map((hex, i) => {
    const c = new Color(hex);
    // vary the mid layers toward this planet's palette color
    if (i >= 1 && i <= 3) c.lerp(tintColor, profile.tint);
    return c;
  });

  const [t2, t3, t4, t5] = profile.transitions;
  const [b12, b23, b34, b45] = profile.blends;

  const material = new ShaderMaterial({
    uniforms: {
      type: { value: profile.type },
      radius: { value: planet.radius },
      amplitude: { value: amplitude },
      sharpness: { value: profile.sharpness },
      offset: { value: amplitude * profile.relOffset },
      period: { value: profile.period * (0.85 + rand() * 0.3) },
      persistence: { value: profile.persistence + (rand() - 0.5) * 0.06 },
      lacunarity: { value: profile.lacunarity },
      octaves: { value: profile.octaves },
      seedOffset: {
        value: new Vector3(rand() * 20 - 10, rand() * 20 - 10, rand() * 20 - 10),
      },
      color1: { value: layerColors[0] },
      color2: { value: layerColors[1] },
      color3: { value: layerColors[2] },
      color4: { value: layerColors[3] },
      color5: { value: layerColors[4] },
      transition2: { value: amplitude * t2 },
      transition3: { value: amplitude * t3 },
      transition4: { value: amplitude * t4 },
      transition5: { value: amplitude * t5 },
      blend12: { value: amplitude * b12 },
      blend23: { value: amplitude * b23 },
      blend34: { value: amplitude * b34 },
      blend45: { value: amplitude * b45 },
      bumpStrength: { value: 0.7 },
      bumpOffset: { value: 0.004 },
      ambientIntensity: { value: 0.18 },
      diffuseIntensity: { value: 1.2 },
      specularIntensity: { value: profile.specularIntensity },
      shininess: { value: profile.shininess },
      lightDirection: { value: SUN_DIRECTION },
      lightColor: { value: new Color("#ffffff") },
      glowIntensity: { value: profile.glowIntensity },
    },
    vertexShader: PLANET_VERTEX.replace(
      "void main() {",
      `${NOISE_FUNCTIONS}
       void main() {`,
    ),
    fragmentShader: PLANET_FRAGMENT.replace(
      "void main() {",
      `${NOISE_FUNCTIONS}
       void main() {`,
    ),
  });

  materialCache.set(planet.id, material);
  return material;
}

/* ------------------------------------------------------------------ */
/* Atmosphere — a shell of drifting cloud particles                    */
/* ------------------------------------------------------------------ */

const atmosphereGeoCache = new Map<string, BufferGeometry>();
const atmosphereMatCache = new Map<string, ShaderMaterial>();

export function getAtmosphereGeometry(planet: Planet): BufferGeometry {
  const cached = atmosphereGeoCache.get(planet.id);
  if (cached) return cached;

  const rand = mulberry32(hashString(planet.id) ^ 0x9e3779b9);
  const count = Math.round(
    Math.min(520, Math.max(180, planet.radius * 24)),
  );
  const innerRadius = planet.radius * 1.08;
  const thickness = planet.radius * 0.12;

  const verts = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const p = new Vector3();

  for (let i = 0; i < count; i++) {
    // random point in a cube projected onto the sphere — avoids pole bunching
    p.set(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1)
      .normalize()
      .multiplyScalar(innerRadius + rand() * thickness);
    verts[i * 3] = p.x;
    verts[i * 3 + 1] = p.y;
    verts[i * 3 + 2] = p.z;
    sizes[i] = planet.radius * (0.35 + rand() * 0.4);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(verts, 3));
  geometry.setAttribute("size", new BufferAttribute(sizes, 1));
  atmosphereGeoCache.set(planet.id, geometry);
  return geometry;
}

export function getAtmosphereMaterial(
  planet: Planet,
  cloudTexture: Texture,
): ShaderMaterial {
  const cached = atmosphereMatCache.get(planet.id);
  if (cached) return cached;

  const material = new ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      speed: { value: 0.04 },
      opacity: { value: 0.55 },
      density: { value: 0.15 },
      scale: { value: planet.radius * 0.45 },
      lightDirection: { value: SUN_DIRECTION },
      planetCenter: { value: new Vector3(...planet.position) },
      color: { value: new Color(planet.atmosphereColor) },
      pointTexture: { value: cloudTexture },
    },
    vertexShader: ATMOSPHERE_VERTEX,
    fragmentShader: ATMOSPHERE_FRAGMENT.replace(
      "void main() {",
      `${NOISE_FUNCTIONS}
       void main() {`,
    ),
    blending: NormalBlending,
    depthWrite: false,
    transparent: true,
  });

  atmosphereMatCache.set(planet.id, material);
  return material;
}

/* ------------------------------------------------------------------ */
/* Rim glow — a soft additive halo tinted per planet                   */
/* ------------------------------------------------------------------ */

const RIM_VERTEX = /* glsl */ `
varying vec3 vNormal;
varying vec3 vView;

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vNormal = normalize(mat3(modelMatrix) * normal);
  vView = normalize(cameraPosition - worldPos.xyz);
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

const RIM_FRAGMENT = /* glsl */ `
uniform vec3 color;
uniform vec3 lightDirection;

varying vec3 vNormal;
varying vec3 vView;

void main() {
  float rim = pow(1.0 - max(0.0, dot(vNormal, vView)), 3.0);
  float sun = 0.35 + 0.65 * max(0.0, dot(vNormal, normalize(lightDirection)));
  gl_FragColor = vec4(color, rim * sun * 0.85);
}
`;

const rimMatCache = new Map<string, ShaderMaterial>();

export function getRimGlowMaterial(planet: Planet): ShaderMaterial {
  const cached = rimMatCache.get(planet.id);
  if (cached) return cached;

  const material = new ShaderMaterial({
    uniforms: {
      color: { value: new Color(planet.atmosphereColor) },
      lightDirection: { value: SUN_DIRECTION },
    },
    vertexShader: RIM_VERTEX,
    fragmentShader: RIM_FRAGMENT,
    blending: AdditiveBlending,
    depthWrite: false,
    transparent: true,
  });

  rimMatCache.set(planet.id, material);
  return material;
}

/* ------------------------------------------------------------------ */
/* Rings — flat disc with radial UVs for banded textures               */
/* ------------------------------------------------------------------ */

const ringGeoCache = new Map<string, RingGeometry>();

export function getRingGeometry(planet: Planet): RingGeometry {
  const cached = ringGeoCache.get(planet.id);
  if (cached) return cached;

  const inner = planet.radius * 1.5;
  const outer = planet.radius * 2.4;
  const geometry = new RingGeometry(inner, outer, 96, 1);

  // remap UVs so u runs inner→outer edge; lets a 1D band texture wrap radially
  const pos = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const r = Math.hypot(pos.getX(i), pos.getY(i));
    uv.setXY(i, (r - inner) / (outer - inner), 0.5);
  }

  ringGeoCache.set(planet.id, geometry);
  return geometry;
}
