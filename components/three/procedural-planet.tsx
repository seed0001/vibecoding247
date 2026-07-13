"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  DoubleSide,
  MathUtils,
  type Points,
  type ShaderMaterial,
} from "three";
import type { Planet } from "@/lib/galaxy";
import {
  getAtmosphereGeometry,
  getAtmosphereMaterial,
  getPlanetMaterial,
  getPlanetSphereGeometry,
  getRimGlowMaterial,
  getRingGeometry,
} from "@/lib/planet-material";
import { makeCloudTexture, makeRingTexture } from "@/lib/three-textures";

/**
 * A GPU procedural planet: shader-displaced terrain with elevation color
 * layers, a drifting particle atmosphere tinted per planet, an additive
 * rim glow, and (sometimes) banded rings. Style ported from
 * dgreenheck/threejs-procedural-planets.
 */

let sharedCloudTexture: ReturnType<typeof makeCloudTexture> | null = null;

function seedFrom(planet: Planet): number {
  let h = 2166136261;
  for (let i = 0; i < planet.id.length; i++) {
    h ^= planet.id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function ProceduralPlanet({ planet }: { planet: Planet }) {
  const atmosphereRef = useRef<Points>(null);

  const parts = useMemo(() => {
    sharedCloudTexture ??= makeCloudTexture("#ffffff");
    const seed = seedFrom(planet);
    return {
      sphere: getPlanetSphereGeometry(),
      surface: getPlanetMaterial(planet),
      atmoGeometry: getAtmosphereGeometry(planet),
      atmoMaterial: getAtmosphereMaterial(planet, sharedCloudTexture),
      rim: getRimGlowMaterial(planet),
      ringGeometry: planet.hasRings ? getRingGeometry(planet) : null,
      ringTexture: planet.hasRings
        ? makeRingTexture(planet.ringColor, seed)
        : null,
      ringTilt: [
        Math.PI / 2 + MathUtils.seededRandom(seed) * 0.7 - 0.35,
        (MathUtils.seededRandom(seed + 1) - 0.5) * 0.5,
        0,
      ] as [number, number, number],
    };
  }, [planet]);

  useFrame((_, dt) => {
    const atmosphere = atmosphereRef.current;
    if (!atmosphere) return;
    (atmosphere.material as ShaderMaterial).uniforms.time.value += dt;
    atmosphere.rotation.y += dt * 0.008;
  });

  return (
    <group position={planet.position}>
      <mesh geometry={parts.sphere} material={parts.surface} />
      {/* rim glow just past the surface, atmosphere-colored */}
      <mesh material={parts.rim} scale={planet.radius * 1.12}>
        <sphereGeometry args={[1, 32, 24]} />
      </mesh>
      <points
        ref={atmosphereRef}
        geometry={parts.atmoGeometry}
        material={parts.atmoMaterial}
      />
      {parts.ringGeometry && parts.ringTexture && (
        <mesh geometry={parts.ringGeometry} rotation={parts.ringTilt}>
          <meshBasicMaterial
            map={parts.ringTexture}
            transparent
            depthWrite={false}
            side={DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}
