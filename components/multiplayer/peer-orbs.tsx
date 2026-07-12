"use client";

import { useRef } from "react";
import type { MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { Group } from "three";
import type { Peer } from "@/lib/use-presence";

/**
 * Other explorers, rendered as glowing orbs with name tags. Positions
 * arrive over the network at ~10Hz and are smoothed here every frame.
 */

const ORB_HEIGHT = 1.35;

function Orb({
  peer,
  peersRef,
}: {
  peer: Peer;
  peersRef: MutableRefObject<Map<string, Peer>>;
}) {
  const group = useRef<Group>(null);

  useFrame((state, rawDelta) => {
    const g = group.current;
    const live = peersRef.current.get(peer.id);
    if (!g || !live) return;
    const dt = Math.min(rawDelta, 0.05);
    const [x, y, z] = live.target;
    const bob = Math.sin(state.clock.elapsedTime * 1.8 + x) * 0.06;
    const k = Math.min(dt * 8, 1);
    g.position.x += (x - g.position.x) * k;
    g.position.y += (y + ORB_HEIGHT + bob - g.position.y) * k;
    g.position.z += (z - g.position.z) * k;
  });

  return (
    <group
      ref={group}
      position={[peer.target[0], peer.target[1] + ORB_HEIGHT, peer.target[2]]}
    >
      {/* core */}
      <mesh>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial
          color={peer.color}
          emissive={peer.color}
          emissiveIntensity={1.8}
          toneMapped={false}
        />
      </mesh>
      {/* halo */}
      <mesh>
        <sphereGeometry args={[0.34, 16, 16]} />
        <meshBasicMaterial color={peer.color} transparent opacity={0.18} />
      </mesh>
      <pointLight intensity={2.2} distance={3.5} decay={2} color={peer.color} />
      <Html
        center
        position={[0, 0.55, 0]}
        zIndexRange={[5, 0]}
        className="pointer-events-none select-none"
      >
        <p
          className="whitespace-nowrap rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold backdrop-blur"
          style={{ color: peer.color }}
        >
          {peer.handle}
        </p>
      </Html>
    </group>
  );
}

export function PeerOrbs({
  peers,
  peersRef,
}: {
  peers: Peer[];
  peersRef: MutableRefObject<Map<string, Peer>>;
}) {
  return (
    <>
      {peers.map((peer) => (
        <Orb key={peer.id} peer={peer} peersRef={peersRef} />
      ))}
    </>
  );
}
