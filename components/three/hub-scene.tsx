"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Html, Stars } from "@react-three/drei";
import type { Group } from "three";

interface Portal {
  href: string;
  title: string;
  subtitle: string;
  color: string;
  position: [number, number, number];
  ready: boolean;
}

const portals: Portal[] = [
  {
    href: "/first-steps",
    title: "First Steps",
    subtitle: "Ages 6+ · start from zero",
    color: "#4ade80",
    position: [-4.6, 0, 0],
    ready: true,
  },
  {
    href: "/guides",
    title: "Builders",
    subtitle: "Ship real software with AI",
    color: "#818cf8",
    position: [0, 0.4, 0],
    ready: true,
  },
  {
    href: "/new-to-ai",
    title: "New to the AI Era",
    subtitle: "Experienced minds, new tools",
    color: "#fbbf24",
    position: [4.6, 0, 0],
    ready: true,
  },
];

function PortalRing({ portal }: { portal: Portal }) {
  const router = useRouter();
  const group = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (!group.current) return;
    const target = hovered ? 1.12 : 1;
    const s = group.current.scale.x + (target - group.current.scale.x) * Math.min(delta * 8, 1);
    group.current.scale.setScalar(s);
    group.current.rotation.y =
      Math.sin(state.clock.elapsedTime * 0.4 + portal.position[0]) * 0.18;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.6}>
      <group
        ref={group}
        position={portal.position}
        onClick={() => router.push(portal.href)}
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
        {/* outer ring */}
        <mesh>
          <torusGeometry args={[1.5, 0.07, 24, 96]} />
          <meshStandardMaterial
            color={portal.color}
            emissive={portal.color}
            emissiveIntensity={hovered ? 1.6 : 0.7}
            roughness={0.3}
          />
        </mesh>
        {/* inner glow disc */}
        <mesh>
          <circleGeometry args={[1.42, 64]} />
          <meshBasicMaterial color={portal.color} transparent opacity={hovered ? 0.28 : 0.12} />
        </mesh>
        {/* orbiting spark */}
        <OrbitingSpark color={portal.color} radius={1.5} />
        {/* label */}
        <Html center position={[0, -2.15, 0]} className="pointer-events-none select-none">
          <div className="w-44 text-center">
            <p className="text-base font-semibold tracking-tight text-white">
              {portal.title}
            </p>
            <p className="mt-0.5 text-xs text-white/60">{portal.subtitle}</p>
          </div>
        </Html>
      </group>
    </Float>
  );
}

function OrbitingSpark({ color, radius }: { color: string; radius: number }) {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * 1.2;
    ref.current.position.set(Math.cos(t) * radius, Math.sin(t) * radius, 0.05);
  });
  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

function Rig() {
  useFrame((state) => {
    const { pointer, camera } = state;
    camera.position.x += (pointer.x * 0.8 - camera.position.x) * 0.04;
    camera.position.y += (pointer.y * 0.5 + 0.2 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export function HubScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.2, 9], fov: 50 }}
      dpr={[1, 1.75]}
      className="touch-none"
    >
      <color attach="background" args={["#0a0a0b"]} />
      <fog attach="fog" args={["#0a0a0b", 12, 26]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[6, 6, 6]} intensity={120} />
      <pointLight position={[-6, -4, 4]} intensity={60} color="#818cf8" />
      <Stars radius={60} depth={40} count={2600} factor={3.4} saturation={0} fade speed={0.6} />
      {portals.map((portal) => (
        <PortalRing key={portal.href} portal={portal} />
      ))}
      <Rig />
    </Canvas>
  );
}
