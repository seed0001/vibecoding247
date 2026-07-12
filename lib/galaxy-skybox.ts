"use client";

import { CanvasTexture, ClampToEdgeWrapping, SRGBColorSpace } from "three";

/**
 * The galaxy backdrop: one huge painted panorama, split into N tiles
 * that wrap around a sky sphere enclosing the scene. All features are
 * generated from ONE global seeded feature list and painted in global
 * panorama coordinates, so tile seams line up exactly.
 *
 * Swappable later: to use real artwork instead, map image files onto
 * the same sphere segments in GalaxySkybox — nothing else changes.
 */

export const SKYBOX_TILES = 4;
const TILE_W = 1024;
const TILE_H = 1024;
const FULL_W = SKYBOX_TILES * TILE_W;

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

/* ------------------------ global feature plan ----------------------- */

interface GalaxyPlan {
  uCore: number;
  bandPhase1: number;
  bandPhase2: number;
  washes: { u: number; v: number; r: number; color: string; alpha: number }[];
  dust: { u: number; v: number; rx: number; ry: number; rot: number; alpha: number }[];
  bigStars: { u: number; v: number; r: number; flare: boolean; warm: boolean }[];
}

const WASH_COLORS = ["#7c3aed", "#4c6ef5", "#9333ea", "#2563eb", "#c026d3"];

let planCache: GalaxyPlan | null = null;

function bandCenter(plan: GalaxyPlan, u: number): number {
  return (
    0.5 +
    0.07 * Math.sin(u * Math.PI * 2 + plan.bandPhase1) +
    0.035 * Math.sin(u * Math.PI * 4 + plan.bandPhase2)
  );
}

function getPlan(): GalaxyPlan {
  if (planCache) return planCache;
  const rand = mulberry32(20260712);
  const plan: GalaxyPlan = {
    uCore: rand(),
    bandPhase1: rand() * Math.PI * 2,
    bandPhase2: rand() * Math.PI * 2,
    washes: [],
    dust: [],
    bigStars: [],
  };
  for (let i = 0; i < 30; i++) {
    plan.washes.push({
      u: rand(),
      v: 0.5 + (rand() - 0.5) * 0.45,
      r: 130 + rand() * 210,
      color: WASH_COLORS[Math.floor(rand() * WASH_COLORS.length)],
      alpha: 0.05 + rand() * 0.08,
    });
  }
  for (let i = 0; i < 46; i++) {
    const u = rand();
    plan.dust.push({
      u,
      v: bandCenter(plan, u) + (rand() - 0.5) * 0.1,
      rx: 60 + rand() * 150,
      ry: 14 + rand() * 34,
      rot: (rand() - 0.5) * 0.5,
      alpha: 0.2 + rand() * 0.3,
    });
  }
  for (let i = 0; i < 70; i++) {
    const nearBand = rand() > 0.35;
    const u = rand();
    plan.bigStars.push({
      u,
      v: nearBand
        ? bandCenter(plan, u) + (rand() - 0.5) * 0.3
        : rand(),
      r: 1.4 + rand() * 2.4,
      flare: rand() > 0.72,
      warm: rand() > 0.6,
    });
  }
  planCache = plan;
  return plan;
}

/** wrapped distance between two panorama u positions, in [0, 0.5] */
function uDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 1;
  return Math.min(d, 1 - d);
}

/** draw callback at every wrapped x position visible on this tile */
function wrapped(
  tileIndex: number,
  u: number,
  margin: number,
  draw: (x: number) => void,
) {
  const xGlobal = u * FULL_W;
  for (let k = -1; k <= 1; k++) {
    const x = xGlobal - tileIndex * TILE_W + k * FULL_W;
    if (x > -margin && x < TILE_W + margin) draw(x);
  }
}

/* ------------------------------ painter ----------------------------- */

function paintTile(tileIndex: number): HTMLCanvasElement {
  const plan = getPlan();
  const canvas = document.createElement("canvas");
  canvas.width = TILE_W;
  canvas.height = TILE_H;
  const ctx = canvas.getContext("2d")!;

  // deep space base with a faint vertical blue cast
  const bg = ctx.createLinearGradient(0, 0, 0, TILE_H);
  bg.addColorStop(0, "#04040c");
  bg.addColorStop(0.5, "#080a16");
  bg.addColorStop(1, "#04040c");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, TILE_W, TILE_H);

  // color washes (nebulosity lives IN the band structure, not as blobs)
  ctx.globalCompositeOperation = "lighter";
  for (const wash of plan.washes) {
    wrapped(tileIndex, wash.u, wash.r, (x) => {
      const g = ctx.createRadialGradient(x, wash.v * TILE_H, 0, x, wash.v * TILE_H, wash.r);
      g.addColorStop(0, `${wash.color}${Math.round(wash.alpha * 255).toString(16).padStart(2, "0")}`);
      g.addColorStop(1, `${wash.color}00`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, wash.v * TILE_H, wash.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // the galactic band: dense glow along a wavy centerline, brightest
  // toward the core direction, bluish-violet toward the rim
  for (let gx = -80; gx <= TILE_W + 80; gx += 6) {
    const u = ((tileIndex * TILE_W + gx) / FULL_W + 1) % 1;
    const vc = bandCenter(plan, u) * TILE_H;
    const core = Math.max(0, 1 - uDistance(u, plan.uCore) * 3.2);
    // wide diffuse glow
    let radius = 150 + core * 90;
    let g = ctx.createRadialGradient(gx, vc, 0, gx, vc, radius);
    const outerColor = core > 0.4 ? "#e8d9b8" : "#9aa8e8";
    g.addColorStop(0, `${outerColor}14`);
    g.addColorStop(1, `${outerColor}00`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(gx, vc, radius, 0, Math.PI * 2);
    ctx.fill();
    // bright spine
    radius = 55 + core * 55;
    g = ctx.createRadialGradient(gx, vc, 0, gx, vc, radius);
    const spineColor = core > 0.4 ? "#fff0d0" : "#c9d2ff";
    g.addColorStop(0, `${spineColor}${core > 0.4 ? "2e" : "1c"}`);
    g.addColorStop(1, `${spineColor}00`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(gx, vc, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // dust lanes cutting the band (dark, drawn over the glow)
  ctx.globalCompositeOperation = "source-over";
  for (const dust of plan.dust) {
    wrapped(tileIndex, dust.u, dust.rx, (x) => {
      ctx.save();
      ctx.translate(x, dust.v * TILE_H);
      ctx.rotate(dust.rot);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, dust.rx);
      g.addColorStop(0, `rgba(4, 3, 10, ${dust.alpha})`);
      g.addColorStop(1, "rgba(4, 3, 10, 0)");
      ctx.fillStyle = g;
      ctx.scale(1, dust.ry / dust.rx);
      ctx.beginPath();
      ctx.arc(0, 0, dust.rx, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  // field stars — dense in the band, sparse off it, varied size/tint
  const rand = mulberry32(9000 + tileIndex * 131);
  for (let i = 0; i < 2100; i++) {
    const x = rand() * TILE_W;
    const v = rand();
    const u = ((tileIndex * TILE_W + x) / FULL_W + 1) % 1;
    const vc = bandCenter(plan, u);
    const bandWeight = Math.exp(-Math.pow((v - vc) / 0.15, 2));
    if (rand() > 0.3 + 0.7 * bandWeight) continue;
    const size = 0.3 + rand() * rand() * 1.5;
    const tintRoll = rand();
    ctx.fillStyle =
      tintRoll > 0.2
        ? `rgba(255,255,255,${0.35 + rand() * 0.6})`
        : tintRoll > 0.08
          ? `rgba(190,214,255,${0.4 + rand() * 0.55})`
          : `rgba(255,224,190,${0.4 + rand() * 0.55})`;
    ctx.beginPath();
    ctx.arc(x, v * TILE_H, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // hero stars with glow and cross flares
  for (const star of plan.bigStars) {
    wrapped(tileIndex, star.u, 30, (x) => {
      const y = star.v * TILE_H;
      const color = star.warm ? "255,232,200" : "205,220,255";
      const g = ctx.createRadialGradient(x, y, 0, x, y, star.r * 5);
      g.addColorStop(0, `rgba(${color},0.9)`);
      g.addColorStop(0.25, `rgba(${color},0.25)`);
      g.addColorStop(1, `rgba(${color},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, star.r * 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255,255,255,0.95)`;
      ctx.beginPath();
      ctx.arc(x, y, star.r * 0.7, 0, Math.PI * 2);
      ctx.fill();
      if (star.flare) {
        ctx.fillStyle = `rgba(${color},0.35)`;
        ctx.fillRect(x - star.r * 7, y - 0.5, star.r * 14, 1);
        ctx.fillRect(x - 0.5, y - star.r * 7, 1, star.r * 14);
      }
    });
  }

  return canvas;
}

let textureCache: CanvasTexture[] | null = null;

export function getGalaxySkyboxTextures(): CanvasTexture[] {
  if (textureCache) return textureCache;
  textureCache = Array.from({ length: SKYBOX_TILES }, (_, i) => {
    const t = new CanvasTexture(paintTile(i));
    t.colorSpace = SRGBColorSpace;
    t.wrapS = ClampToEdgeWrapping;
    t.wrapT = ClampToEdgeWrapping;
    t.anisotropy = 4;
    return t;
  });
  return textureCache;
}
