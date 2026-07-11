"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Html, Sky } from "@react-three/drei";
import type { Group } from "three";
import { getVisitedLessons } from "@/lib/first-steps-progress";

export interface WorldLesson {
  slug: string;
  order: number;
  title: string;
  emoji: string;
  color: string;
}

/** Islands rise gently from left to right — a path you can see. */
function islandPosition(index: number, total: number): [number, number, number] {
  const spread = 14;
  const x = -spread / 2 + (spread / (total - 1)) * index;
  const y = -1.4 + index * 0.55 + (index % 2) * 0.35;
  const z = (index % 2) * -1.8;
  return [x, y, z];
}

function Island({
  lesson,
  position,
  visited,
}: {
  lesson: WorldLesson;
  position: [number, number, number];
  visited: boolean;
}) {
  const router = useRouter();
  const group = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (!group.current) return;
    const target = hovered ? 1.15 : 1;
    const s = group.current.scale.x + (target - group.current.scale.x) * Math.min(delta * 8, 1);
    group.current.scale.setScalar(s);
  });

  return (
    <Float speed={1.6} rotationIntensity={0.08} floatIntensity={0.5}>
      <group
        ref={group}
        position={position}
        onClick={() => router.push(`/first-steps/${lesson.slug}`)}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        {/* grassy top */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[1, 1.08, 0.42, 8]} />
          <meshStandardMaterial color={lesson.color} roughness={0.7} />
        </mesh>
        {/* rocky underside */}
        <mesh position={[0, -0.75, 0]}>
          <coneGeometry args={[1.02, 1.3, 8]} />
          <meshStandardMaterial color="#8b6f47" roughness={0.9} />
        </mesh>
        {/* little tree */}
        <mesh position={[0.55, 0.5, 0.2]}>
          <coneGeometry args={[0.22, 0.55, 8]} />
          <meshStandardMaterial color="#166534" roughness={0.8} />
        </mesh>
        <mesh position={[0.55, 0.18, 0.2]}>
          <cylinderGeometry args={[0.05, 0.05, 0.2, 8]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        {/* flag when visited */}
        {visited && (
          <group position={[-0.5, 0.65, 0.1]}>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.9, 8]} />
              <meshStandardMaterial color="#e5e7eb" />
            </mesh>
            <mesh position={[0.18, 0.28, 0]}>
              <boxGeometry args={[0.34, 0.22, 0.02]} />
              <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.4} />
            </mesh>
          </group>
        )}
        {/* number + title */}
        <Html center position={[0, 1.5, 0]} className="pointer-events-none select-none">
          <div className="w-40 text-center">
            <p className="text-2xl">{lesson.emoji}</p>
            <p className="mt-0.5 rounded-full bg-white/85 px-2 py-0.5 text-[11px] font-bold text-slate-800 shadow-sm backdrop-blur">
              {lesson.order}. {lesson.title}
            </p>
            {visited && (
              <p className="mt-1 text-[10px] font-bold text-amber-500 drop-shadow">
                ★ explored
              </p>
            )}
          </div>
        </Html>
      </group>
    </Float>
  );
}

/** Friendly robot buddy hovering near the start of the path. */
function RobotBuddy({ position }: { position: [number, number, number] }) {
  const group = useRef<Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.6) * 0.18;
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.4;
  });
  return (
    <group ref={group} position={position}>
      {/* body */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[0.55, 0.5, 0.4]} />
        <meshStandardMaterial color="#818cf8" roughness={0.4} />
      </mesh>
      {/* head */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.7, 0.55, 0.55]} />
        <meshStandardMaterial color="#a5b4fc" roughness={0.4} />
      </mesh>
      {/* eyes */}
      <mesh position={[-0.16, 0.08, 0.29]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshBasicMaterial color="#0ea5e9" />
      </mesh>
      <mesh position={[0.16, 0.08, 0.29]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshBasicMaterial color="#0ea5e9" />
      </mesh>
      {/* antenna */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.3, 8]} />
        <meshStandardMaterial color="#6366f1" />
      </mesh>
      <mesh position={[0, 0.65, 0]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial color="#f59e0b" />
      </mesh>
    </group>
  );
}

function PathDots({ lessons }: { lessons: WorldLesson[] }) {
  const dots: [number, number, number][] = [];
  for (let i = 0; i < lessons.length - 1; i++) {
    const a = islandPosition(i, lessons.length);
    const b = islandPosition(i + 1, lessons.length);
    for (let step = 1; step <= 3; step++) {
      const t = step / 4;
      dots.push([
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t + 0.35,
        a[2] + (b[2] - a[2]) * t,
      ]);
    }
  }
  return (
    <>
      {dots.map((d, i) => (
        <mesh key={i} position={d}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.75} />
        </mesh>
      ))}
    </>
  );
}

function Rig() {
  useFrame((state) => {
    const { pointer, camera } = state;
    camera.position.x += (pointer.x * 1.2 - camera.position.x) * 0.04;
    camera.position.y += (pointer.y * 0.6 + 0.6 - camera.position.y) * 0.04;
    camera.lookAt(0, 0.2, 0);
  });
  return null;
}

export function FirstStepsWorld({ lessons }: { lessons: WorldLesson[] }) {
  // Client-only component (loaded with ssr:false), so localStorage is safe here.
  const [visited] = useState<string[]>(() => getVisitedLessons());

  return (
    <div className="relative h-full w-full">
      <Canvas camera={{ position: [0, 0.6, 12], fov: 55 }} dpr={[1, 1.75]} className="touch-none">
        <Sky sunPosition={[8, 4, -6]} turbidity={6} rayleigh={0.8} />
        <ambientLight intensity={0.9} />
        <directionalLight position={[6, 8, 4]} intensity={2.2} />
        <PathDots lessons={lessons} />
        {lessons.map((lesson, i) => (
          <Island
            key={lesson.slug}
            lesson={lesson}
            position={islandPosition(i, lessons.length)}
            visited={visited.includes(lesson.slug)}
          />
        ))}
        <RobotBuddy position={[-6.6, 0.4, 1]} />
        <Rig />
      </Canvas>
      {/* progress HUD */}
      <div className="pointer-events-none absolute right-4 top-4 rounded-full bg-white/85 px-4 py-1.5 text-xs font-bold text-slate-800 shadow backdrop-blur">
        {visited.length} of {lessons.length} islands explored
      </div>
    </div>
  );
}
