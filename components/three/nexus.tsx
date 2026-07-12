"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, MeshReflectorMaterial, Stars } from "@react-three/drei";
import {
  AdditiveBlending,
  BackSide,
  BufferGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  PointLight,
  Points,
  Vector3,
} from "three";
import type { World } from "@/lib/data/worlds";
import {
  makePlasterTexture,
  makeRugTexture,
  makeWoodTexture,
} from "@/lib/three-textures";
import {
  formatCounter,
  formatDuration,
  useSiteStats,
  type SiteStatsView,
} from "@/lib/use-site-stats";
import {
  BlinkOverlay,
  Crosshair,
  GyroButton,
  KeyLegend,
  PlayerRig,
  TouchControls,
  useGyroLook,
  useMouseLook,
  useWorldInput,
} from "@/components/three/player-rig";

const PEDESTAL_RADIUS = 6;
const WALL_RADIUS = 9.5;

function pedestalAngle(index: number, total: number): number {
  return (index / total) * Math.PI * 2 - Math.PI / 2;
}

/** rotation.y that makes a wall-mounted group face the room center */
function faceCenter(a: number): number {
  return Math.atan2(-Math.cos(a), -Math.sin(a));
}

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

/* ------------------------------------------------------------------ */
/* Emblems (unchanged idea — tiny objects, big consequences)           */
/* ------------------------------------------------------------------ */

function Emblem({ world }: { world: World }) {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.6;
    ref.current.position.y =
      1.32 + Math.sin(state.clock.elapsedTime * 1.4) * 0.05;
  });
  return (
    <group ref={ref} position={[0, 1.32, 0]}>
      {world.slug === "terminal" && (
        <group scale={0.9}>
          <mesh castShadow>
            <boxGeometry args={[0.55, 0.28, 0.24]} />
            <meshStandardMaterial color={world.color} emissive={world.color} emissiveIntensity={0.35} />
          </mesh>
          <mesh castShadow position={[0.32, 0.05, 0]}>
            <boxGeometry args={[0.16, 0.38, 0.24]} />
            <meshStandardMaterial color={world.color} emissive={world.color} emissiveIntensity={0.35} />
          </mesh>
          {[-0.18, 0.02, 0.22].map((x) => (
            <mesh key={x} position={[x, -0.18, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 0.04, 12]} />
              <meshStandardMaterial color="#3f3f46" metalness={0.6} roughness={0.4} />
            </mesh>
          ))}
        </group>
      )}
      {world.slug === "resort" && (
        <group scale={0.9}>
          <mesh castShadow position={[0, -0.05, 0]}>
            <sphereGeometry args={[0.26, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={world.color} emissive={world.color} emissiveIntensity={0.4} metalness={0.5} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.24, 0]}>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshStandardMaterial color="#fef3c7" emissive="#fef3c7" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0, -0.08, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.05, 24]} />
            <meshStandardMaterial color="#78716c" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      )}
      {world.slug === "galaxy" && (
        <group scale={0.9}>
          <mesh>
            <sphereGeometry args={[0.14, 16, 16]} />
            <meshStandardMaterial color={world.color} emissive={world.color} emissiveIntensity={1} />
          </mesh>
          <mesh rotation={[Math.PI / 2.6, 0, 0]}>
            <torusGeometry args={[0.3, 0.02, 8, 40]} />
            <meshStandardMaterial color="#c7d2fe" emissive="#c7d2fe" emissiveIntensity={0.5} />
          </mesh>
          <mesh rotation={[Math.PI / 1.8, 0.6, 0]}>
            <torusGeometry args={[0.4, 0.015, 8, 40]} />
            <meshStandardMaterial color="#a5b4fc" emissive="#a5b4fc" emissiveIntensity={0.4} />
          </mesh>
        </group>
      )}
      {world.slug === "metropolis" && (
        <group scale={0.9} position={[0, -0.12, 0]}>
          {[
            [-0.14, 0.18, 0, 0.5],
            [0.06, 0.3, 0.08, 0.74],
            [0.22, 0.12, -0.06, 0.38],
          ].map(([x, , z, h], i) => (
            <mesh key={i} castShadow position={[x as number, (h as number) / 2, z as number]}>
              <boxGeometry args={[0.14, h as number, 0.14]} />
              <meshStandardMaterial color="#0e7490" emissive={world.color} emissiveIntensity={0.8} />
            </mesh>
          ))}
        </group>
      )}
      {world.slug === "wonders" && (
        <mesh castShadow scale={0.9} position={[0, -0.02, 0]}>
          <coneGeometry args={[0.32, 0.45, 4]} />
          <meshStandardMaterial color={world.color} emissive={world.color} emissiveIntensity={0.35} roughness={0.6} />
        </mesh>
      )}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Pedestals + alcoves                                                 */
/* ------------------------------------------------------------------ */

function Pedestal({
  world,
  index,
  total,
  playerPosRef,
}: {
  world: World;
  index: number;
  total: number;
  playerPosRef: React.MutableRefObject<Vector3>;
}) {
  const router = useRouter();
  const fired = useRef(false);
  const a = pedestalAngle(index, total);
  const x = Math.cos(a) * PEDESTAL_RADIUS;
  const z = Math.sin(a) * PEDESTAL_RADIUS;

  useFrame(() => {
    if (fired.current) return;
    const p = playerPosRef.current;
    if (Math.hypot(p.x - x, p.z - z) < 1.25) {
      fired.current = true;
      if (document.pointerLockElement) document.exitPointerLock();
      router.push(`/worlds/${world.slug}`);
    }
  });

  return (
    <group position={[x, 0, z]}>
      {/* plinth + column + brass collar */}
      <mesh castShadow receiveShadow position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.52, 0.58, 0.18, 24]} />
        <meshStandardMaterial color="#202027" roughness={0.35} metalness={0.2} />
      </mesh>
      <mesh castShadow position={[0, 0.62, 0]}>
        <cylinderGeometry args={[0.32, 0.4, 0.9, 24]} />
        <meshStandardMaterial color="#26262e" roughness={0.3} metalness={0.15} />
      </mesh>
      <mesh position={[0, 1.06, 0]}>
        <torusGeometry args={[0.33, 0.028, 12, 32]} />
        <meshStandardMaterial color="#8a6d3b" metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh castShadow position={[0, 1.13, 0]}>
        <cylinderGeometry args={[0.36, 0.33, 0.07, 24]} />
        <meshStandardMaterial color="#202027" roughness={0.3} metalness={0.3} />
      </mesh>
      <Emblem world={world} />
      {/* glow pad — step on it */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.85, 1.25, 48]} />
        <meshBasicMaterial color={world.color} transparent opacity={0.45} />
      </mesh>
      <pointLight position={[0, 1.7, 0]} intensity={5.5} distance={5.5} color={world.color} />
      <Html
        center
        position={[0, 2.45, 0]}
        zIndexRange={[5, 0]}
        className="pointer-events-none select-none"
      >
        <div className="w-40 text-center">
          <p className="text-sm font-semibold tracking-tight text-white">
            {world.name}
          </p>
          <p className="mt-0.5 text-[10px] text-white/50">{world.tagline}</p>
        </div>
      </Html>
    </group>
  );
}

function Alcove({ world, index, total }: { world: World; index: number; total: number }) {
  const a = pedestalAngle(index, total);
  const r = WALL_RADIUS - 0.35;
  return (
    <group
      position={[Math.cos(a) * r, 0, Math.sin(a) * r]}
      rotation={[0, faceCenter(a), 0]}
    >
      {/* recessed back */}
      <mesh position={[0, 2.3, -0.12]}>
        <boxGeometry args={[2.5, 4.6, 0.14]} />
        <meshStandardMaterial color="#0e0e13" roughness={0.9} />
      </mesh>
      {/* jambs */}
      {[-1.32, 1.32].map((x) => (
        <mesh key={x} castShadow position={[x, 2.3, 0.1]}>
          <boxGeometry args={[0.24, 4.6, 0.5]} />
          <meshStandardMaterial color="#1c1c22" roughness={0.5} />
        </mesh>
      ))}
      {/* lintel */}
      <mesh castShadow position={[0, 4.72, 0.1]}>
        <boxGeometry args={[2.9, 0.4, 0.55]} />
        <meshStandardMaterial color="#1c1c22" roughness={0.5} />
      </mesh>
      {/* inner rim glow strips */}
      {[-1.16, 1.16].map((x) => (
        <mesh key={x} position={[x, 2.3, -0.02]}>
          <boxGeometry args={[0.035, 4.4, 0.035]} />
          <meshStandardMaterial
            color={world.color}
            emissive={world.color}
            emissiveIntensity={1.6}
            toneMapped={false}
          />
        </mesh>
      ))}
      {/* small downlight wash inside the niche */}
      <pointLight position={[0, 4.1, 0.25]} intensity={3.5} distance={5} color={world.color} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Architecture: walls, dome, oculus, floor                            */
/* ------------------------------------------------------------------ */

function Architecture() {
  const plaster = useMemo(() => makePlasterTexture(), []);
  const wood = useMemo(() => makeWoodTexture(), []);
  const rug = useMemo(() => makeRugTexture(), []);

  return (
    <>
      {/* polished reflective floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[WALL_RADIUS, 64]} />
        <MeshReflectorMaterial
          blur={[280, 60]}
          resolution={512}
          mixBlur={0.85}
          mixStrength={5}
          roughness={0.6}
          depthScale={1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.2}
          color="#0b0b0f"
          metalness={0.45}
          mirror={0.45}
        />
      </mesh>
      {/* woven rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} receiveShadow>
        <circleGeometry args={[2.95, 64]} />
        <meshStandardMaterial map={rug} roughness={0.95} />
      </mesh>
      {/* faint center ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.016, 0]}>
        <ringGeometry args={[2.6, 2.66, 64]} />
        <meshBasicMaterial color="#3a3a46" />
      </mesh>

      {/* upper plaster wall */}
      <mesh position={[0, 4.25, 0]}>
        <cylinderGeometry args={[WALL_RADIUS, WALL_RADIUS, 5.3, 48, 1, true]} />
        <meshStandardMaterial map={plaster} side={BackSide} roughness={0.85} />
      </mesh>
      {/* wainscot */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[WALL_RADIUS - 0.04, WALL_RADIUS - 0.04, 1.6, 48, 1, true]} />
        <meshStandardMaterial map={wood} side={BackSide} roughness={0.55} />
      </mesh>
      {/* chair rail, base + crown moldings */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 1.64, 0]}>
        <torusGeometry args={[WALL_RADIUS - 0.06, 0.05, 10, 64]} />
        <meshStandardMaterial color="#3a2a1e" roughness={0.4} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.09, 0]}>
        <torusGeometry args={[WALL_RADIUS - 0.06, 0.07, 10, 64]} />
        <meshStandardMaterial color="#141418" roughness={0.5} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 6.82, 0]}>
        <torusGeometry args={[WALL_RADIUS - 0.08, 0.09, 10, 64]} />
        <meshStandardMaterial color="#101014" roughness={0.6} />
      </mesh>

      {/* dome with star oculus */}
      <mesh position={[0, 6.8, 0]} scale={[1, 0.5, 1]}>
        <sphereGeometry args={[WALL_RADIUS, 48, 24, 0, Math.PI * 2, 0.24, Math.PI / 2 - 0.24]} />
        <meshStandardMaterial color="#121218" side={BackSide} roughness={0.9} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 11.35, 0]}>
        <torusGeometry args={[2.28, 0.14, 12, 48]} />
        <meshStandardMaterial color="#26262e" metalness={0.4} roughness={0.35} />
      </mesh>

      {/* volumetric-ish light shaft from the oculus */}
      <mesh position={[0, 5.7, 0]}>
        <cylinderGeometry args={[2.1, 3.3, 11.3, 32, 1, true]} />
        <meshBasicMaterial
          color="#8b9cf8"
          transparent
          opacity={0.05}
          blending={AdditiveBlending}
          side={DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Details: motes, sconces, neon sign, desk                            */
/* ------------------------------------------------------------------ */

function DustMotes() {
  const ref = useRef<Points>(null);
  const geometry = useMemo(() => {
    const rand = mulberry32(1234);
    const positions: number[] = [];
    for (let i = 0; i < 150; i++) {
      const r = Math.sqrt(rand()) * 3;
      const a = rand() * Math.PI * 2;
      positions.push(Math.cos(a) * r, rand() * 10.5, Math.sin(a) * r);
    }
    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.025;
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.18;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        color="#cdd6ff"
        size={0.035}
        transparent
        opacity={0.5}
        blending={AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

const SCONCE_ANGLES = [-54, 18, 162, 234].map((d) => (d * Math.PI) / 180);

function Sconce({ angle, flicker }: { angle: number; flicker: boolean }) {
  const lightRef = useRef<PointLight>(null);
  const r = WALL_RADIUS - 0.45;
  useFrame((state) => {
    if (!lightRef.current || !flicker) return;
    const t = state.clock.elapsedTime;
    lightRef.current.intensity =
      7 + Math.sin(t * 9.3) * 0.5 + Math.sin(t * 23.7) * 0.35;
  });
  return (
    <group
      position={[Math.cos(angle) * r, 3.3, Math.sin(angle) * r]}
      rotation={[0, faceCenter(angle), 0]}
    >
      {/* pilaster behind the sconce */}
      <mesh position={[0, 0.05, -0.22]}>
        <boxGeometry args={[0.55, 6.5, 0.3]} />
        <meshStandardMaterial color="#17171d" roughness={0.7} />
      </mesh>
      {/* backplate + arm + shade + bulb */}
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[0.16, 0.5, 0.06]} />
        <meshStandardMaterial color="#3b2f20" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.12, 0.16]} rotation={[Math.PI / 3, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
        <meshStandardMaterial color="#3b2f20" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.3, 0.26]}>
        <coneGeometry args={[0.14, 0.16, 16, 1, true]} />
        <meshStandardMaterial color="#4a3a26" metalness={0.6} roughness={0.4} side={DoubleSide} />
      </mesh>
      <mesh position={[0, 0.26, 0.26]}>
        <sphereGeometry args={[0.055, 12, 12]} />
        <meshStandardMaterial color="#ffe4b8" emissive="#ffd9a0" emissiveIntensity={2.2} toneMapped={false} />
      </mesh>
      <pointLight
        ref={lightRef}
        position={[0, 0.22, 0.4]}
        intensity={7}
        distance={7}
        decay={2}
        color="#ffb066"
      />
    </group>
  );
}

/** Seven-segment neon "24/7" — no fonts needed, pure glow. */
const SEGS: Record<string, [number, number, boolean][]> = {
  // [x, y, horizontal?] in digit-local units
  "2": [[0, 0.5, true], [0.3, 0.25, false], [0, 0, true], [-0.3, -0.25, false], [0, -0.5, true]],
  "4": [[-0.3, 0.25, false], [0.3, 0.25, false], [0, 0, true], [0.3, -0.25, false]],
  "7": [[0, 0.5, true], [0.3, 0.25, false], [0.3, -0.25, false]],
};

function NeonDigit({ digit, x }: { digit: keyof typeof SEGS; x: number }) {
  return (
    <group position={[x, 0, 0]}>
      {SEGS[digit].map(([sx, sy, horizontal], i) => (
        <mesh key={i} position={[sx, sy, 0]}>
          <boxGeometry args={horizontal ? [0.44, 0.075, 0.05] : [0.075, 0.42, 0.05]} />
          <meshStandardMaterial
            color="#fb7185"
            emissive="#fb7185"
            emissiveIntensity={2.4}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function NeonSign() {
  const lightRef = useRef<PointLight>(null);
  useFrame((state) => {
    if (!lightRef.current) return;
    const t = state.clock.elapsedTime;
    // neon hum with an occasional stutter
    const stutter = Math.sin(t * 1.7) > 0.985 ? 0.4 : 1;
    lightRef.current.intensity =
      (5.5 + Math.sin(t * 13.1) * 0.35) * stutter;
  });
  const a = Math.PI / 2; // wall section the player wakes up facing
  const r = WALL_RADIUS - 0.42;
  return (
    <group
      position={[Math.cos(a) * r, 4.3, Math.sin(a) * r]}
      rotation={[0, faceCenter(a), 0]}
    >
      <mesh>
        <boxGeometry args={[3.5, 1.5, 0.08]} />
        <meshStandardMaterial color="#0c0c10" roughness={0.7} />
      </mesh>
      <group position={[0, 0, 0.08]} scale={0.85}>
        <NeonDigit digit="2" x={-1.35} />
        <NeonDigit digit="4" x={-0.45} />
        {/* slash */}
        <mesh position={[0.3, 0, 0]} rotation={[0, 0, -0.45]}>
          <boxGeometry args={[0.075, 1.05, 0.05]} />
          <meshStandardMaterial color="#fb7185" emissive="#fb7185" emissiveIntensity={2.4} toneMapped={false} />
        </mesh>
        <NeonDigit digit="7" x={1.1} />
      </group>
      <pointLight ref={lightRef} position={[0, 0, 1]} intensity={5.5} distance={7} decay={2} color="#fb7185" />
    </group>
  );
}

function Desk() {
  const screenLight = useRef<PointLight>(null);
  useFrame((state) => {
    if (!screenLight.current) return;
    const t = state.clock.elapsedTime;
    screenLight.current.intensity =
      1.3 + Math.sin(t * 3.1) * 0.15 + Math.sin(t * 17.3) * 0.08;
  });
  const a = Math.PI / 2;
  const r = WALL_RADIUS - 1.15;
  return (
    <group
      position={[Math.cos(a) * r, 0, Math.sin(a) * r]}
      rotation={[0, faceCenter(a), 0]}
    >
      {/* table */}
      <mesh castShadow receiveShadow position={[0, 0.92, 0]}>
        <boxGeometry args={[2.5, 0.07, 0.85]} />
        <meshStandardMaterial color="#2a1c14" roughness={0.45} />
      </mesh>
      {[[-1.12, -0.32], [1.12, -0.32], [-1.12, 0.32], [1.12, 0.32]].map(([lx, lz], i) => (
        <mesh key={i} castShadow position={[lx, 0.45, lz]}>
          <boxGeometry args={[0.08, 0.9, 0.08]} />
          <meshStandardMaterial color="#1c120c" roughness={0.5} />
        </mesh>
      ))}
      {/* laptop */}
      <group position={[-0.25, 0.96, 0.05]} rotation={[0, 0.25, 0]}>
        <mesh castShadow position={[0, 0.02, 0.1]}>
          <boxGeometry args={[0.72, 0.035, 0.46]} />
          <meshStandardMaterial color="#26262c" metalness={0.6} roughness={0.35} />
        </mesh>
        <group position={[0, 0.045, -0.13]} rotation={[-0.42, 0, 0]}>
          <mesh castShadow position={[0, 0.22, 0]}>
            <boxGeometry args={[0.72, 0.46, 0.025]} />
            <meshStandardMaterial color="#26262c" metalness={0.6} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.22, 0.015]}>
            <planeGeometry args={[0.64, 0.38]} />
            <meshStandardMaterial color="#0a0a12" emissive="#8b9cf8" emissiveIntensity={0.9} toneMapped={false} />
          </mesh>
        </group>
      </group>
      <pointLight ref={screenLight} position={[-0.25, 1.35, 0.35]} intensity={1.3} distance={2.6} decay={2} color="#9db0ff" />
      {/* mug */}
      <group position={[0.55, 1.03, 0.12]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.07, 0.06, 0.15, 16]} />
          <meshStandardMaterial color="#a13d2d" roughness={0.4} />
        </mesh>
        <mesh position={[0.09, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.045, 0.012, 8, 20]} />
          <meshStandardMaterial color="#a13d2d" roughness={0.4} />
        </mesh>
      </group>
      {/* stacked books */}
      <group position={[0.95, 0.96, -0.12]}>
        {[
          ["#31425f", 0, 0.03, 0.12],
          ["#5f3131", 0.035, 0.03, -0.08],
          ["#3d5f31", 0.065, 0.022, 0.05],
        ].map(([color, y, h, rot], i) => (
          <mesh key={i} castShadow position={[0, (y as number) + (h as number) / 2, 0]} rotation={[0, rot as number, 0]}>
            <boxGeometry args={[0.42, h as number, 0.3]} />
            <meshStandardMaterial color={color as string} roughness={0.7} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** LED telemetry board mounted beneath the neon sign. */
function StatsBoard({ stats }: { stats: SiteStatsView | null }) {
  const a = Math.PI / 2;
  const r = WALL_RADIUS - 0.42;
  const rows: [string, string][] = [
    ["VISITORS", stats ? formatCounter(stats.totalVisits) : "······"],
    ["EXPLORERS ONLINE", stats ? formatCounter(stats.activeNow, 3) : "···"],
    ["REALMS", stats ? `${stats.realmsCurrent} / ∞` : "· / ∞"],
    ["TIME EXPLORED", stats ? formatDuration(stats.totalSeconds) : "······"],
  ];
  return (
    <group
      position={[Math.cos(a) * r, 2.62, Math.sin(a) * r]}
      rotation={[0, faceCenter(a), 0]}
    >
      <mesh castShadow>
        <boxGeometry args={[3.5, 1.42, 0.09]} />
        <meshStandardMaterial color="#0c0c10" roughness={0.65} />
      </mesh>
      {/* thin brass frame */}
      <mesh position={[0, 0, -0.005]}>
        <boxGeometry args={[3.62, 1.54, 0.06]} />
        <meshStandardMaterial color="#3b2f20" metalness={0.7} roughness={0.35} />
      </mesh>
      {/* power LED */}
      <mesh position={[1.62, -0.58, 0.06]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#4ade80" emissive="#4ade80" emissiveIntensity={2} toneMapped={false} />
      </mesh>
      <Html
        center
        position={[0, 0, 0.06]}
        transform
        distanceFactor={5}
        zIndexRange={[5, 0]}
        className="pointer-events-none select-none"
      >
        <div className="w-[300px] p-3 font-mono">
          <p className="text-[10px] font-bold tracking-[0.3em] text-amber-400">
            LIVE HUB TELEMETRY
          </p>
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="mt-1.5 flex items-baseline justify-between text-[11px]"
            >
              <span className="text-amber-200/70">{label}</span>
              <span className="mx-2 flex-1 overflow-hidden text-amber-200/25">
                ····································
              </span>
              <span className="font-bold tracking-wider text-amber-300">
                {value}
              </span>
            </div>
          ))}
        </div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Experience                                                          */
/* ------------------------------------------------------------------ */

export function NexusExperience({ worlds }: { worlds: World[] }) {
  const [greeting, setGreeting] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useWorldInput();
  const yawRef = useRef(Math.PI);
  const pitchRef = useRef(0);
  const playerPosRef = useRef(new Vector3(0, 0, 0));
  const { locked, finePointer } = useMouseLook(
    containerRef,
    yawRef,
    pitchRef,
    Math.PI,
  );
  const gyro = useGyroLook();
  const stats = useSiteStats();

  const enter = useCallback(() => {
    setGreeting(false);
    // both need a user gesture — this click/keypress is it
    void gyro.request();
    if (
      window.matchMedia("(pointer: fine)").matches &&
      containerRef.current &&
      !document.pointerLockElement
    ) {
      containerRef.current.requestPointerLock();
    }
  }, [gyro]);

  useEffect(() => {
    if (!greeting) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Enter" || e.code === "Space") {
        e.preventDefault();
        enter();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [greeting, enter]);

  return (
    <div ref={containerRef} className="relative h-full w-full touch-none">
      <Canvas shadows camera={{ position: [0, 1.55, 0], fov: 60 }} dpr={[1, 1.75]}>
        <color attach="background" args={["#08080a"]} />
        <fog attach="fog" args={["#08080a", 14, 34]} />
        <ambientLight intensity={0.35} />
        <hemisphereLight args={["#33334a", "#0b0b0f", 0.5]} />
        {/* moonlight beam through the oculus */}
        <spotLight
          position={[0, 14.5, 0]}
          angle={0.38}
          penumbra={0.7}
          intensity={420}
          distance={30}
          decay={2}
          color="#dfe6ff"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0002}
        />
        <Stars radius={55} depth={30} count={1800} factor={3} saturation={0} fade speed={0.4} />
        <Architecture />
        <DustMotes />
        <NeonSign />
        <StatsBoard stats={stats} />
        <Desk />
        {SCONCE_ANGLES.map((angle, i) => (
          <Sconce key={i} angle={angle} flicker={i === 1} />
        ))}
        {worlds.map((world, i) => (
          <group key={world.slug}>
            <Alcove world={world} index={i} total={worlds.length} />
            <Pedestal
              world={world}
              index={i}
              total={worlds.length}
              playerPosRef={playerPosRef}
            />
          </group>
        ))}
        <PlayerRig
          inputRef={inputRef}
          yawRef={yawRef}
          pitchRef={pitchRef}
          gyroRef={gyro.gyroRef}
          playerPosRef={playerPosRef}
          config={{ spawn: [0, 0, 0], bounds: 8.7 }}
        />
      </Canvas>

      {!greeting && (
        <>
          <BlinkOverlay />
          <Crosshair visible={locked} />
          <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center px-4">
            <p className="rounded-2xl bg-white/10 px-5 py-2 text-center text-sm font-medium text-white/80 backdrop-blur">
              {finePointer && !locked
                ? "Click anywhere to take control"
                : "Five little things on five little pedestals. Walk up to one."}
            </p>
          </div>
          <KeyLegend />
          <TouchControls inputRef={inputRef} />
          <GyroButton
            supported={gyro.supported}
            active={gyro.active}
            onEnable={() => void gyro.request()}
          />
        </>
      )}

      {/* Greeting */}
      {greeting && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/70 px-6 text-center backdrop-blur-sm">
          <p className="font-mono text-sm text-white/50">vibecoding247.net</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Hey. Welcome in.
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/70">
            This is the hub — a small room with five doors to five infinite
            worlds, all built by people like you.
          </p>
          <button
            onClick={enter}
            className="mt-8 rounded-xl bg-white px-8 py-3 text-sm font-bold text-black transition-transform hover:scale-105"
          >
            Enter ⏎
          </button>
          <p className="mt-3 text-xs text-white/40">
            W A S D to walk · move the mouse (or your phone) to look
          </p>
        </div>
      )}
    </div>
  );
}
