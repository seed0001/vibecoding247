"use client";

import { useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Sky, Stars } from "@react-three/drei";
import { Group, Vector3 } from "three";
import type { World, WorldZone } from "@/lib/data/worlds";
import {
  KeyLegend,
  PlayerRig,
  TouchControls,
  useDragYaw,
  useWorldInput,
} from "@/components/three/player-rig";

const ZONE_RADIUS = 10;
const BOUNDS = 14;

/* ------------------------------------------------------------------ */
/* Zone kiosk — the sign is real UI: app links or an open-slot CTA     */
/* ------------------------------------------------------------------ */

function ZoneKiosk({
  zone,
  color,
  index,
  total,
}: {
  zone: WorldZone;
  color: string;
  index: number;
  total: number;
}) {
  const a = (index / total) * Math.PI * 2 + Math.PI / total;
  const x = Math.cos(a) * ZONE_RADIUS;
  const z = Math.sin(a) * ZONE_RADIUS;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[0.18, 1.8, 0.18]} />
        <meshStandardMaterial color="#27272a" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[1, 1.35, 40]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>
      <pointLight position={[0, 2.4, 0]} intensity={5} distance={6} color={color} />
      <Html
        center
        position={[0, 2.7, 0]}
        className="select-none"
        distanceFactor={10}
      >
        <div className="w-56 rounded-xl bg-black/80 p-4 text-center shadow-xl backdrop-blur">
          <p className="text-sm font-bold tracking-tight text-white">
            {zone.name}
          </p>
          <p className="mt-1 text-[11px] leading-snug text-white/60">
            {zone.description}
          </p>
          <div className="mt-3 space-y-1.5">
            {zone.apps.slice(0, 4).map((app) => (
              <a
                key={app.url}
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg px-2 py-1.5 text-xs font-semibold text-white transition-colors hover:text-black"
                style={{ backgroundColor: `${color}44` }}
              >
                ▶ {app.name}
                <span className="block text-[9px] font-normal opacity-60">
                  by {app.author}
                </span>
              </a>
            ))}
            {zone.apps.length === 0 && (
              <Link
                href="/submit"
                className="block rounded-lg border border-dashed px-2 py-2 text-[11px] font-semibold text-white/70 transition-colors hover:text-white"
                style={{ borderColor: `${color}88` }}
              >
                Open slots — submit your app, be the first here
              </Link>
            )}
          </div>
        </div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Return portal back to the Nexus                                     */
/* ------------------------------------------------------------------ */

function ReturnPortal({
  playerPosRef,
}: {
  playerPosRef: React.MutableRefObject<Vector3>;
}) {
  const router = useRouter();
  const fired = useRef(false);
  const ring = useRef<Group>(null);
  // Off the spawn walk-path so a first "W" press doesn't warp you home.
  const pos: [number, number, number] = [5.5, 0, 8];

  useFrame((state) => {
    if (ring.current) ring.current.rotation.z = state.clock.elapsedTime;
    if (fired.current) return;
    const p = playerPosRef.current;
    if (Math.hypot(p.x - pos[0], p.z - pos[2]) < 1.1) {
      fired.current = true;
      router.push("/");
    }
  });

  return (
    <group position={pos}>
      <group ref={ring} position={[0, 1.4, 0]}>
        <mesh>
          <torusGeometry args={[1, 0.05, 12, 40]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
        </mesh>
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[1.2, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
      </mesh>
      <Html center position={[0, 3, 0]} className="pointer-events-none select-none">
        <p className="whitespace-nowrap rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold text-slate-800 shadow">
          ← back to the Nexus
        </p>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Per-world flavor: environment + landmark                            */
/* ------------------------------------------------------------------ */

function Environment({ world }: { world: World }) {
  switch (world.slug) {
    case "terminal":
      return (
        <>
          <color attach="background" args={["#181310"]} />
          <fog attach="fog" args={["#181310", 18, 42]} />
          <ambientLight intensity={0.5} />
          <pointLight position={[0, 12, 0]} intensity={160} color="#ffd9a0" />
          {/* floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[BOUNDS + 1, 64]} />
            <meshStandardMaterial color="#3f3428" roughness={0.7} />
          </mesh>
          {/* colonnade */}
          {Array.from({ length: 10 }, (_, i) => {
            const a = (i / 10) * Math.PI * 2;
            return (
              <group key={i} position={[Math.cos(a) * 13, 0, Math.sin(a) * 13]}>
                <mesh position={[0, 4, 0]}>
                  <cylinderGeometry args={[0.5, 0.6, 8, 12]} />
                  <meshStandardMaterial color="#57493a" roughness={0.8} />
                </mesh>
              </group>
            );
          })}
          {/* departure board */}
          <group position={[0, 4.6, -9]}>
            <mesh>
              <boxGeometry args={[7, 2.6, 0.3]} />
              <meshStandardMaterial color="#0c0a09" />
            </mesh>
            <Html
              center
              position={[0, 0, 0.2]}
              transform
              distanceFactor={5}
              className="pointer-events-none select-none"
            >
              <div className="w-64 p-3 text-left font-mono">
                <p className="text-[11px] font-bold tracking-widest text-amber-400">
                  DEPARTURES
                </p>
                {world.zones.map((zone) => (
                  <p key={zone.slug} className="mt-1 text-[10px] text-amber-200/90">
                    {zone.name.toUpperCase()} ····{" "}
                    {zone.apps.length > 0 ? "NOW BOARDING" : "AWAITING FIRST TRAIN"}
                  </p>
                ))}
              </div>
            </Html>
          </group>
        </>
      );
    case "resort":
      return (
        <>
          <color attach="background" args={["#1a0f16"]} />
          <fog attach="fog" args={["#1a0f16", 16, 40]} />
          <ambientLight intensity={0.45} />
          <pointLight position={[0, 9, 0]} intensity={110} color="#fda4af" />
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[BOUNDS + 1, 64]} />
            <meshStandardMaterial color="#3b1c2e" roughness={0.6} />
          </mesh>
          {/* red carpet */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 2]}>
            <planeGeometry args={[2.4, 12]} />
            <meshStandardMaterial color="#9f1239" roughness={0.8} />
          </mesh>
          {/* elevator doors */}
          {[-4, 0, 4].map((x) => (
            <group key={x} position={[x, 0, -11]}>
              <mesh position={[0, 1.8, 0]}>
                <boxGeometry args={[2.2, 3.6, 0.4]} />
                <meshStandardMaterial
                  color="#facc15"
                  metalness={0.6}
                  roughness={0.3}
                  emissive="#78350f"
                  emissiveIntensity={0.2}
                />
              </mesh>
            </group>
          ))}
          {/* marquee bulbs */}
          {Array.from({ length: 14 }, (_, i) => {
            const a = (i / 14) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(a) * 12.5, 5.5, Math.sin(a) * 12.5]}>
                <sphereGeometry args={[0.12, 10, 10]} />
                <meshBasicMaterial color="#fbbf24" />
              </mesh>
            );
          })}
        </>
      );
    case "galaxy":
      return (
        <>
          <color attach="background" args={["#05050a"]} />
          <ambientLight intensity={0.5} />
          <pointLight position={[8, 10, 4]} intensity={90} color="#c7d2fe" />
          <Stars radius={70} depth={50} count={4000} factor={4} saturation={0} fade speed={0.5} />
          {/* floating deck */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[BOUNDS + 1, 64]} />
            <meshStandardMaterial color="#15152b" roughness={0.5} metalness={0.4} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <ringGeometry args={[BOUNDS - 0.4, BOUNDS + 0.2, 64]} />
            <meshBasicMaterial color="#818cf8" transparent opacity={0.5} />
          </mesh>
          {/* distant planet */}
          <mesh position={[-22, 10, -30]}>
            <sphereGeometry args={[6, 32, 32]} />
            <meshStandardMaterial color="#6366f1" roughness={0.8} />
          </mesh>
        </>
      );
    case "metropolis":
      return (
        <>
          <color attach="background" args={["#060a12"]} />
          <fog attach="fog" args={["#060a12", 16, 46]} />
          <ambientLight intensity={0.4} />
          <pointLight position={[0, 10, 0]} intensity={60} color="#22d3ee" />
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[BOUNDS + 1, 64]} />
            <meshStandardMaterial color="#0b1020" roughness={0.4} metalness={0.3} />
          </mesh>
          {/* skyline */}
          {Array.from({ length: 18 }, (_, i) => {
            const a = (i / 18) * Math.PI * 2;
            const r = 16 + (i % 3) * 3;
            const h = 6 + ((i * 7) % 9);
            return (
              <mesh key={i} position={[Math.cos(a) * r, h / 2, Math.sin(a) * r]}>
                <boxGeometry args={[2.2, h, 2.2]} />
                <meshStandardMaterial
                  color="#0f172a"
                  emissive={i % 2 ? "#22d3ee" : "#f472b6"}
                  emissiveIntensity={0.25}
                />
              </mesh>
            );
          })}
        </>
      );
    case "wonders":
    default:
      return (
        <>
          <Sky sunPosition={[6, 3, -8]} turbidity={5} rayleigh={1.2} />
          <ambientLight intensity={0.8} />
          <directionalLight position={[8, 12, 6]} intensity={2} />
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[BOUNDS + 1, 64]} />
            <meshStandardMaterial color="#65a30d" roughness={0.85} />
          </mesh>
          {/* great pyramid */}
          <mesh position={[0, 3.4, -16]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[7, 7, 4]} />
            <meshStandardMaterial color="#d6c193" roughness={0.9} />
          </mesh>
          {/* colonnade arc */}
          {Array.from({ length: 7 }, (_, i) => {
            const a = Math.PI * 0.7 + (i / 7) * Math.PI * 0.6;
            return (
              <mesh key={i} position={[Math.cos(a) * 13, 2.2, Math.sin(a) * 13]}>
                <cylinderGeometry args={[0.45, 0.5, 4.4, 12]} />
                <meshStandardMaterial color="#e7e5e4" roughness={0.8} />
              </mesh>
            );
          })}
        </>
      );
  }
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

export function WorldExperience({ world }: { world: World }) {
  const inputRef = useWorldInput();
  const yawRef = useRef(Math.PI);
  const playerPosRef = useRef(new Vector3(0, 0, 2));
  const drag = useDragYaw(yawRef, Math.PI);

  return (
    <div className="relative h-full w-full touch-none" {...drag}>
      <Canvas camera={{ position: [0, 3.2, 9], fov: 55 }} dpr={[1, 1.75]}>
        <Environment world={world} />
        {world.zones.map((zone, i) => (
          <ZoneKiosk
            key={zone.slug}
            zone={zone}
            color={world.color}
            index={i}
            total={world.zones.length}
          />
        ))}
        <ReturnPortal playerPosRef={playerPosRef} />
        <PlayerRig
          inputRef={inputRef}
          yawRef={yawRef}
          playerPosRef={playerPosRef}
          config={{
            spawn: [0, 0, 2],
            bounds: BOUNDS,
            tint: world.color,
          }}
        />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center px-4">
        <p className="rounded-2xl bg-black/60 px-5 py-2 text-center text-sm font-semibold text-white backdrop-blur">
          {world.emblem} {world.name} — {world.tagline}
        </p>
      </div>
      <KeyLegend hint="walk · SPACE = jump · drag = look · signs are clickable" />
      <TouchControls inputRef={inputRef} />
    </div>
  );
}
