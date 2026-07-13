"use client";

import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";

/**
 * Procedural canvas textures for the Nexus — no downloaded assets, fully
 * deterministic (seeded PRNG) so renders are stable frame to frame.
 */

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

function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

/** Softly grained plaster for the upper walls. */
export function makePlasterTexture(): CanvasTexture {
  const c = makeCanvas(256, 256);
  const ctx = c.getContext("2d")!;
  const rand = mulberry32(7);
  ctx.fillStyle = "#1a1a20";
  ctx.fillRect(0, 0, 256, 256);
  const img = ctx.getImageData(0, 0, 256, 256);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (rand() - 0.5) * 16;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n + 2;
  }
  ctx.putImageData(img, 0, 0);
  // faint mottling
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.01 + rand() * 0.015})`;
    ctx.beginPath();
    ctx.arc(rand() * 256, rand() * 256, 8 + rand() * 26, 0, Math.PI * 2);
    ctx.fill();
  }
  const t = new CanvasTexture(c);
  t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(6, 2);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/** Dark wood with grain, for wainscoting and furniture. */
export function makeWoodTexture(): CanvasTexture {
  const c = makeCanvas(512, 256);
  const ctx = c.getContext("2d")!;
  const rand = mulberry32(21);
  ctx.fillStyle = "#241812";
  ctx.fillRect(0, 0, 512, 256);
  for (let y = 0; y < 256; y += 32) {
    ctx.fillStyle = rand() > 0.5 ? "#2a1c14" : "#221610";
    ctx.fillRect(0, y, 512, 32);
    for (let i = 0; i < 10; i++) {
      ctx.strokeStyle = `rgba(0,0,0,${0.08 + rand() * 0.12})`;
      ctx.lineWidth = 0.8 + rand();
      const yy = y + rand() * 32;
      ctx.beginPath();
      ctx.moveTo(0, yy);
      ctx.bezierCurveTo(
        170,
        yy + rand() * 6 - 3,
        340,
        yy + rand() * 6 - 3,
        512,
        yy,
      );
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-1, y, 514, 32);
  }
  const t = new CanvasTexture(c);
  t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(4, 1);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/** Round woven rug with concentric rings and five accent notches. */
export function makeRugTexture(): CanvasTexture {
  const S = 512;
  const c = makeCanvas(S, S);
  const ctx = c.getContext("2d")!;
  const rand = mulberry32(99);
  const cx = S / 2;
  ctx.fillStyle = "#141420";
  ctx.fillRect(0, 0, S, S);
  const rings: [number, string][] = [
    [250, "#1b1b2b"],
    [232, "#23233a"],
    [214, "#1b1b2b"],
    [188, "#2b2b4a"],
    [150, "#1e1e30"],
    [96, "#262640"],
    [60, "#1b1b2b"],
  ];
  for (const [r, color] of rings) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cx, r, 0, Math.PI * 2);
    ctx.fill();
  }
  // five accent spokes pointing at the pedestals
  const accents = ["#4ade80", "#f472b6", "#818cf8", "#22d3ee", "#a3e635"];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    ctx.strokeStyle = accents[i];
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * 100, cx + Math.sin(a) * 100);
    ctx.lineTo(cx + Math.cos(a) * 180, cx + Math.sin(a) * 180);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  // weave noise
  const img = ctx.getImageData(0, 0, S, S);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (rand() - 0.5) * 18;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/** Soft cloud puff on transparent canvas — billboarded during descent. */
export function makeCloudTexture(tint = "#ffffff"): CanvasTexture {
  const S = 256;
  const c = makeCanvas(S, S);
  const ctx = c.getContext("2d")!;
  const rand = mulberry32(55);
  for (let i = 0; i < 26; i++) {
    const x = S / 2 + (rand() - 0.5) * S * 0.55;
    const y = S / 2 + (rand() - 0.5) * S * 0.3;
    const r = 22 + rand() * 46;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `${tint}66`);
    g.addColorStop(1, `${tint}00`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/** Banded planetary ring strip — map u runs inner→outer edge. */
export function makeRingTexture(tint: string, seed: number): CanvasTexture {
  const W = 256;
  const c = makeCanvas(W, 4);
  const ctx = c.getContext("2d")!;
  const rand = mulberry32(seed);
  const g = ctx.createLinearGradient(0, 0, W, 0);
  // soft edges, seeded alpha bands, and a Cassini-style gap
  const gap = 0.45 + rand() * 0.25;
  g.addColorStop(0, `${tint}00`);
  let u = 0.04;
  while (u < 0.97) {
    const near = Math.abs(u - gap) < 0.05;
    const alpha = near ? 8 : 40 + Math.floor(rand() * 150);
    g.addColorStop(u, `${tint}${alpha.toString(16).padStart(2, "0")}`);
    u += 0.03 + rand() * 0.07;
  }
  g.addColorStop(1, `${tint}00`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, 4);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/** Wispy nebula puff — additive-blended far-background galaxy clouds. */
export function makeNebulaTexture(tint: string): CanvasTexture {
  const S = 256;
  const c = makeCanvas(S, S);
  const ctx = c.getContext("2d")!;
  const rand = mulberry32(tint.length * 7919 + 13);
  for (let i = 0; i < 34; i++) {
    ctx.save();
    ctx.translate(
      S / 2 + (rand() - 0.5) * S * 0.5,
      S / 2 + (rand() - 0.5) * S * 0.5,
    );
    ctx.rotate(rand() * Math.PI);
    ctx.scale(1 + rand() * 1.6, 0.45 + rand() * 0.6);
    const r = 14 + rand() * 40;
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    const core = rand() > 0.75 ? "#ffffff" : tint;
    g.addColorStop(0, `${core}30`);
    g.addColorStop(0.5, `${tint}18`);
    g.addColorStop(1, `${tint}00`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}
