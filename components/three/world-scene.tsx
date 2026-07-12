"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Sky, Stars } from "@react-three/drei";
import { Group, Vector3 } from "three";
import type { World, WorldZone } from "@/lib/data/worlds";
import { AccountPanel } from "@/components/multiplayer/account-panel";
import { ChatOverlay } from "@/components/multiplayer/chat-overlay";
import { PeerOrbs } from "@/components/multiplayer/peer-orbs";
import { usePresence } from "@/lib/use-presence";
import { useSession } from "@/lib/use-session";
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

const ZONE_RADIUS = 10;
const BOUNDS = 14;
const NEAR_DISTANCE = 2.6;

function zonePosition(index: number, total: number): [number, number] {
  const a = (index / total) * Math.PI * 2 + Math.PI / total;
  return [Math.cos(a) * ZONE_RADIUS, Math.sin(a) * ZONE_RADIUS];
}

/* ------------------------------------------------------------------ */
/* Zone kiosk — sign is informational; interaction is proximity + E    */
/* ------------------------------------------------------------------ */

function ZoneKiosk({
  zone,
  color,
  index,
  total,
  playerPosRef,
  onNearChange,
}: {
  zone: WorldZone;
  color: string;
  index: number;
  total: number;
  playerPosRef: React.MutableRefObject<Vector3>;
  onNearChange: (slug: string, near: boolean) => void;
}) {
  const [x, z] = zonePosition(index, total);
  const wasNear = useRef(false);

  useFrame(() => {
    const p = playerPosRef.current;
    const near = Math.hypot(p.x - x, p.z - z) < NEAR_DISTANCE;
    if (near !== wasNear.current) {
      wasNear.current = near;
      onNearChange(zone.slug, near);
    }
  });

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
        zIndexRange={[5, 0]}
        className="pointer-events-none select-none"
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
              <p
                key={app.url}
                className="rounded-lg px-2 py-1.5 text-xs font-semibold text-white"
                style={{ backgroundColor: `${color}44` }}
              >
                ▶ {app.name}
                <span className="block text-[9px] font-normal opacity-60">
                  by {app.author}
                </span>
              </p>
            ))}
            {zone.apps.length === 0 && (
              <p
                className="rounded-lg border border-dashed px-2 py-2 text-[11px] font-semibold text-white/70"
                style={{ borderColor: `${color}88` }}
              >
                Open slots — be the first here
              </p>
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
      if (document.pointerLockElement) document.exitPointerLock();
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
      <Html
        center
        position={[0, 3, 0]}
        zIndexRange={[5, 0]}
        className="pointer-events-none select-none"
      >
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
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[BOUNDS + 1, 64]} />
            <meshStandardMaterial color="#3f3428" roughness={0.7} />
          </mesh>
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
              zIndexRange={[5, 0]}
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
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 2]}>
            <planeGeometry args={[2.4, 12]} />
            <meshStandardMaterial color="#9f1239" roughness={0.8} />
          </mesh>
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
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[BOUNDS + 1, 64]} />
            <meshStandardMaterial color="#15152b" roughness={0.5} metalness={0.4} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <ringGeometry args={[BOUNDS - 0.4, BOUNDS + 0.2, 64]} />
            <meshBasicMaterial color="#818cf8" transparent opacity={0.5} />
          </mesh>
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
          <mesh position={[0, 3.4, -16]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[7, 7, 4]} />
            <meshStandardMaterial color="#d6c193" roughness={0.9} />
          </mesh>
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
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useWorldInput();
  const yawRef = useRef(Math.PI);
  const pitchRef = useRef(0);
  const playerPosRef = useRef(new Vector3(0, 0, 2));
  const { locked, finePointer } = useMouseLook(
    containerRef,
    yawRef,
    pitchRef,
    Math.PI,
  );
  const gyro = useGyroLook();
  const session = useSession();
  const presence = usePresence(
    `worlds/${world.slug}`,
    !!session.user,
    playerPosRef,
    yawRef,
  );

  const [nearZoneSlug, setNearZoneSlug] = useState<string | null>(null);
  const nearZone = world.zones.find((z) => z.slug === nearZoneSlug) ?? null;
  const nearZoneRef = useRef<WorldZone | null>(null);
  useEffect(() => {
    nearZoneRef.current = nearZone;
  }, [nearZone]);

  const onNearChange = useCallback((slug: string, near: boolean) => {
    setNearZoneSlug((current) => {
      if (near) return slug;
      return current === slug ? null : current;
    });
  }, []);

  // Interact: fires from a real key/tap gesture so window.open isn't blocked
  const interact = useCallback(() => {
    const zone = nearZoneRef.current;
    if (!zone) return;
    const app = zone.apps[0];
    if (app) {
      window.open(app.url, "_blank", "noopener,noreferrer");
    } else {
      if (document.pointerLockElement) document.exitPointerLock();
      router.push("/submit");
    }
  }, [router]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (e.code === "KeyE") {
        e.preventDefault();
        interact();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [interact]);

  const promptLabel = nearZone
    ? nearZone.apps[0]
      ? `open ${nearZone.apps[0].name}`
      : `claim the first spot in ${nearZone.name}`
    : null;

  return (
    <div ref={containerRef} className="relative h-full w-full touch-none">
      <Canvas camera={{ position: [0, 1.55, 2], fov: 60 }} dpr={[1, 1.75]}>
        <Environment world={world} />
        {world.zones.map((zone, i) => (
          <ZoneKiosk
            key={zone.slug}
            zone={zone}
            color={world.color}
            index={i}
            total={world.zones.length}
            playerPosRef={playerPosRef}
            onNearChange={onNearChange}
          />
        ))}
        <ReturnPortal playerPosRef={playerPosRef} />
        <PlayerRig
          inputRef={inputRef}
          yawRef={yawRef}
          pitchRef={pitchRef}
          gyroRef={gyro.gyroRef}
          playerPosRef={playerPosRef}
          config={{ spawn: [0, 0, 2], bounds: BOUNDS }}
        />
        <PeerOrbs peers={presence.peerList} peersRef={presence.peersRef} />
      </Canvas>

      <BlinkOverlay />
      <Crosshair visible={locked} />

      <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center px-4">
        <p className="rounded-2xl bg-black/60 px-5 py-2 text-center text-sm font-semibold text-white backdrop-blur">
          {finePointer && !locked
            ? "Click anywhere to take control"
            : `${world.emblem} ${world.name} — ${world.tagline}`}
        </p>
      </div>

      {/* interact prompt */}
      {promptLabel && (
        <div className="absolute inset-x-0 bottom-24 flex justify-center px-4 sm:bottom-16">
          <button
            onClick={interact}
            className="rounded-2xl bg-white px-6 py-3 text-sm font-bold text-black shadow-xl transition-transform active:scale-95"
          >
            <span className="hidden sm:inline">
              Press <kbd className="rounded bg-black/10 px-1.5">E</kbd> —{" "}
            </span>
            <span className="sm:hidden">Tap — </span>
            {promptLabel}
          </button>
        </div>
      )}

      <KeyLegend hint="move · mouse = look · SPACE = jump · E = enter · T = chat" />
      <AccountPanel session={session} />
      <ChatOverlay
        chat={presence.chat}
        sendChat={presence.sendChat}
        connected={presence.connected}
        signedIn={!!session.user}
      />
      <TouchControls inputRef={inputRef} />
      <GyroButton
        supported={gyro.supported}
        active={gyro.active}
        onEnable={() => void gyro.request()}
      />
    </div>
  );
}
