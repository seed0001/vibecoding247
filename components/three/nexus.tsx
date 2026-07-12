"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { Group, Vector3 } from "three";
import type { World } from "@/lib/data/worlds";
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

/** Tiny emblem objects — deliberately small and quiet. The joke is what happens when you touch one. */
function Emblem({ world }: { world: World }) {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.6;
    ref.current.position.y = 1.28 + Math.sin(state.clock.elapsedTime * 1.4) * 0.05;
  });
  return (
    <group ref={ref} position={[0, 1.28, 0]}>
      {world.slug === "terminal" && (
        <group scale={0.9}>
          <mesh>
            <boxGeometry args={[0.55, 0.28, 0.24]} />
            <meshStandardMaterial color={world.color} emissive={world.color} emissiveIntensity={0.35} />
          </mesh>
          <mesh position={[0.32, 0.05, 0]}>
            <boxGeometry args={[0.16, 0.38, 0.24]} />
            <meshStandardMaterial color={world.color} emissive={world.color} emissiveIntensity={0.35} />
          </mesh>
          {[-0.18, 0.02, 0.22].map((x) => (
            <mesh key={x} position={[x, -0.18, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 0.04, 12]} />
              <meshStandardMaterial color="#3f3f46" />
            </mesh>
          ))}
        </group>
      )}
      {world.slug === "resort" && (
        <group scale={0.9}>
          <mesh position={[0, -0.05, 0]}>
            <sphereGeometry args={[0.26, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={world.color} emissive={world.color} emissiveIntensity={0.4} />
          </mesh>
          <mesh position={[0, 0.24, 0]}>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshStandardMaterial color="#fef3c7" emissive="#fef3c7" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0, -0.08, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.05, 24]} />
            <meshStandardMaterial color="#78716c" />
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
            <mesh key={i} position={[x as number, (h as number) / 2, z as number]}>
              <boxGeometry args={[0.14, h as number, 0.14]} />
              <meshStandardMaterial
                color="#0e7490"
                emissive={world.color}
                emissiveIntensity={0.8}
              />
            </mesh>
          ))}
        </group>
      )}
      {world.slug === "wonders" && (
        <mesh scale={0.9} position={[0, -0.02, 0]}>
          <coneGeometry args={[0.32, 0.45, 4]} />
          <meshStandardMaterial color={world.color} emissive={world.color} emissiveIntensity={0.35} />
        </mesh>
      )}
    </group>
  );
}

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
  const a = (index / total) * Math.PI * 2 - Math.PI / 2;
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
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.34, 0.42, 1, 20]} />
        <meshStandardMaterial color="#1c1c21" roughness={0.5} />
      </mesh>
      <Emblem world={world} />
      {/* glow pad — step on it */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <ringGeometry args={[0.85, 1.25, 40]} />
        <meshBasicMaterial color={world.color} transparent opacity={0.5} />
      </mesh>
      <pointLight position={[0, 1.6, 0]} intensity={4} distance={5} color={world.color} />
      <Html
        center
        position={[0, 2.35, 0]}
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

function Room() {
  return (
    <>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[9.5, 64]} />
        <meshStandardMaterial color="#131316" roughness={0.85} />
      </mesh>
      {/* faint center ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[2.6, 2.68, 64]} />
        <meshBasicMaterial color="#34343a" />
      </mesh>
      {/* wall */}
      <mesh position={[0, 3.5, 0]}>
        <cylinderGeometry args={[9.5, 9.5, 7, 64, 1, true]} />
        <meshStandardMaterial color="#0d0d10" side={1} roughness={0.9} />
      </mesh>
    </>
  );
}

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
      <Canvas camera={{ position: [0, 1.55, 0], fov: 60 }} dpr={[1, 1.75]}>
        <color attach="background" args={["#09090b"]} />
        <fog attach="fog" args={["#09090b", 10, 22]} />
        <ambientLight intensity={0.35} />
        <pointLight position={[0, 6, 0]} intensity={30} color="#e0e7ff" />
        <Room />
        {worlds.map((world, i) => (
          <Pedestal
            key={world.slug}
            world={world}
            index={i}
            total={worlds.length}
            playerPosRef={playerPosRef}
          />
        ))}
        <PlayerRig
          inputRef={inputRef}
          yawRef={yawRef}
          pitchRef={pitchRef}
          gyroRef={gyro.gyroRef}
          playerPosRef={playerPosRef}
          config={{ spawn: [0, 0, 0], bounds: 8.9 }}
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
