"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import { useRouter } from "next/navigation";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import {
  AdditiveBlending,
  BufferGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  InstancedMesh,
  MathUtils,
  Matrix4,
  Quaternion,
  ShaderMaterial,
  Vector3,
} from "three";
import {
  canAfford,
  FLAG_COST,
  loadFlags,
  loadResources,
  RESOURCES,
  saveFlags,
  saveResources,
  spend,
  UNIVERSE,
  type Planet,
  type PlantedFlag,
  type ResourceBag,
} from "@/lib/galaxy";
import { makeCloudTexture } from "@/lib/three-textures";
import { getAsteroidGeometry, getPlanetGeometry } from "@/lib/planet-geometry";
import { getGalaxySkyboxTextures, SKYBOX_TILES } from "@/lib/galaxy-skybox";
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

/* ------------------------------------------------------------------ */
/* Phases                                                              */
/* ------------------------------------------------------------------ */

type Phase =
  | { kind: "deck" }
  | { kind: "fly"; from?: Planet }
  | { kind: "descent"; planet: Planet }
  | { kind: "surface"; planet: Planet };

const DECK_BOUNDS = 14;
const SHIP_SPOT: [number, number] = [-4, -5];
const SURFACE_BOUNDS = 58;
const DESCENT_SECONDS = 5;

/* ------------------------------------------------------------------ */
/* The ship — placeholder model, swap this component for a GLB later   */
/* ------------------------------------------------------------------ */

export function ShipModel({ landed = false }: { landed?: boolean }) {
  return (
    <group>
      {/* fuselage (nose points -z) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.85, 4.2, 16]} />
        <meshStandardMaterial color="#b8bec9" metalness={0.75} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, -2.7]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <coneGeometry args={[0.55, 1.4, 16]} />
        <meshStandardMaterial color="#d4d9e2" metalness={0.75} roughness={0.25} />
      </mesh>
      {/* cockpit canopy */}
      <mesh position={[0, 0.55, -0.9]}>
        <sphereGeometry args={[0.5, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#164e63"
          emissiveIntensity={0.6}
          metalness={0.2}
          roughness={0.1}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* delta wings */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 1.35, -0.15, 0.7]} rotation={[0, side * -0.35, side * 0.08]} castShadow>
          <boxGeometry args={[1.9, 0.1, 1.6]} />
          <meshStandardMaterial color="#8892a3" metalness={0.7} roughness={0.35} />
        </mesh>
      ))}
      {/* tail fin */}
      <mesh position={[0, 0.6, 1.7]} castShadow>
        <boxGeometry args={[0.08, 1, 0.9]} />
        <meshStandardMaterial color="#8892a3" metalness={0.7} roughness={0.35} />
      </mesh>
      {/* engines */}
      {[-0.45, 0.45].map((x) => (
        <group key={x} position={[x, -0.1, 2.15]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.28, 0.34, 0.7, 12]} />
            <meshStandardMaterial color="#4b5563" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.36]}>
            <circleGeometry args={[0.24, 12]} />
            <meshStandardMaterial color="#818cf8" emissive="#818cf8" emissiveIntensity={2.2} toneMapped={false} />
          </mesh>
        </group>
      ))}
      <pointLight position={[0, 0, 2.6]} intensity={4} distance={7} color="#818cf8" />
      {/* landing legs */}
      {landed &&
        [
          [-1.1, 0.9],
          [1.1, 0.9],
          [0, -1.6],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, -0.85, z]} castShadow>
            <cylinderGeometry args={[0.06, 0.09, 0.9, 8]} />
            <meshStandardMaterial color="#4b5563" metalness={0.7} roughness={0.4} />
          </mesh>
        ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Flight controller                                                   */
/* ------------------------------------------------------------------ */

interface FlightState {
  pos: Vector3;
  speed: number;
}

function FlightRig({
  inputRef,
  yawRef,
  pitchRef,
  flightRef,
  playerPosRef,
  onNearest,
}: {
  inputRef: ReturnType<typeof useWorldInput>;
  yawRef: MutableRefObject<number>;
  pitchRef: MutableRefObject<number>;
  flightRef: MutableRefObject<FlightState>;
  playerPosRef: MutableRefObject<Vector3>;
  onNearest: (planet: Planet, dist: number) => void;
}) {
  const shipRef = useRef<Group>(null);
  const fwd = useRef(new Vector3());
  const camTarget = useRef(new Vector3());

  useFrame(({ camera }, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const inp = inputRef.current;
    const flight = flightRef.current;

    // mobile joystick steers
    yawRef.current -= inp.analogX * dt * 1.6;
    pitchRef.current = MathUtils.clamp(
      pitchRef.current - inp.analogZ * dt * 1.2,
      -1.2,
      1.2,
    );

    const yaw = yawRef.current;
    const pitch = pitchRef.current;
    fwd.current.set(
      -Math.sin(yaw) * Math.cos(pitch),
      Math.sin(pitch),
      -Math.cos(yaw) * Math.cos(pitch),
    );

    // thrust: W (desktop) or JUMP button (mobile); SPACE boosts
    const thrusting = inp.forward || inp.jump;
    const braking = inp.back;
    const targetSpeed = thrusting ? (inp.jump && inp.forward ? 110 : 46) : 0;
    const accel = thrusting ? 40 : braking ? 80 : 18;
    flight.speed = MathUtils.damp(flight.speed, targetSpeed, accel / 40, dt * 10);
    flight.pos.addScaledVector(fwd.current, flight.speed * dt);

    // keep out of planet cores + find nearest
    let nearest: Planet | null = null;
    let nearestDist = Infinity;
    for (const planet of UNIVERSE) {
      const dx = flight.pos.x - planet.position[0];
      const dy = flight.pos.y - planet.position[1];
      const dz = flight.pos.z - planet.position[2];
      const d = Math.hypot(dx, dy, dz);
      const minD = planet.radius * 1.35;
      if (d < minD) {
        const push = (minD - d) / Math.max(d, 0.001);
        flight.pos.x += dx * push;
        flight.pos.y += dy * push;
        flight.pos.z += dz * push;
      }
      if (d < nearestDist) {
        nearestDist = d;
        nearest = planet;
      }
    }
    if (nearest) onNearest(nearest, nearestDist);

    if (shipRef.current) {
      shipRef.current.position.copy(flight.pos);
      shipRef.current.rotation.set(pitch, yaw, 0, "YXZ");
    }
    playerPosRef.current.copy(flight.pos);

    // chase camera
    camTarget.current
      .copy(flight.pos)
      .addScaledVector(fwd.current, -9)
      .add({ x: 0, y: 2.8, z: 0 } as Vector3);
    camera.position.lerp(camTarget.current, Math.min(dt * 4, 1));
    camera.lookAt(
      flight.pos.x + fwd.current.x * 12,
      flight.pos.y + fwd.current.y * 12,
      flight.pos.z + fwd.current.z * 12,
    );
  });

  return (
    <group ref={shipRef}>
      <ShipModel />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Planets                                                             */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Galaxy backdrop: painted panorama skybox + twinkling stars + rocks   */
/* ------------------------------------------------------------------ */

const SKY_RADIUS = 1300;

function GalaxySkybox() {
  const textures = useMemo(() => getGalaxySkyboxTextures(), []);
  return (
    <group>
      {textures.map((texture, i) => (
        <mesh key={i} renderOrder={-10}>
          <sphereGeometry
            args={[
              SKY_RADIUS,
              24,
              20,
              (i / SKYBOX_TILES) * Math.PI * 2,
              (Math.PI * 2) / SKYBOX_TILES,
            ]}
          />
          <meshBasicMaterial
            map={texture}
            side={1}
            depthWrite={false}
            fog={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* per-star twinkle + size variation via a tiny point shader */
const STAR_VERTEX = `
attribute float aSize;
attribute float aPhase;
attribute vec3 aColor;
varying float vPhase;
varying vec3 vColor;
void main() {
  vPhase = aPhase;
  vColor = aColor;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * (420.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}
`;
const STAR_FRAGMENT = `
uniform float uTime;
varying float vPhase;
varying vec3 vColor;
void main() {
  vec2 pc = gl_PointCoord - 0.5;
  float d = length(pc);
  if (d > 0.5) discard;
  float speed = 0.7 + fract(vPhase * 13.7) * 2.4;
  float tw = 0.55 + 0.45 * sin(uTime * speed + vPhase * 6.28318);
  float alpha = smoothstep(0.5, 0.05, d) * tw;
  gl_FragColor = vec4(vColor, alpha);
}
`;

function tickStarMaterial(material: ShaderMaterial, time: number) {
  material.uniforms.uTime.value = time;
}

function TwinkleStars() {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: STAR_VERTEX,
        fragmentShader: STAR_FRAGMENT,
        uniforms: { uTime: { value: 0 } },
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    [],
  );
  const geometry = useMemo(() => {
    const rand = mulberry32(31415);
    const count = 2600;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // shell just inside the skybox
      const r = 650 + rand() * 500;
      const theta = rand() * Math.PI * 2;
      const y = (rand() * 2 - 1) * 0.9;
      const s = Math.sqrt(1 - y * y);
      positions[i * 3] = Math.cos(theta) * s * r;
      positions[i * 3 + 1] = y * r;
      positions[i * 3 + 2] = Math.sin(theta) * s * r;
      sizes[i] = 0.8 + rand() * rand() * 3.4;
      phases[i] = rand();
      const roll = rand();
      const tint =
        roll > 0.25
          ? [1, 1, 1]
          : roll > 0.1
            ? [0.76, 0.85, 1]
            : [1, 0.88, 0.74];
      colors[i * 3] = tint[0];
      colors[i * 3 + 1] = tint[1];
      colors[i * 3 + 2] = tint[2];
    }
    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geo.setAttribute("aSize", new Float32BufferAttribute(sizes, 1));
    geo.setAttribute("aPhase", new Float32BufferAttribute(phases, 1));
    geo.setAttribute("aColor", new Float32BufferAttribute(colors, 3));
    return geo;
  }, []);

  useFrame(({ clock }) => tickStarMaterial(material, clock.elapsedTime));

  return <points geometry={geometry} material={material} />;
}

/* procedurally generated rocks drifting in two belts + strays */
interface AsteroidInstance {
  pos: [number, number, number];
  scale: number;
  rot: [number, number, number];
  variant: number;
}

function buildAsteroidField(): AsteroidInstance[] {
  const rand = mulberry32(60660);
  const items: AsteroidInstance[] = [];
  // two tilted belts
  for (let belt = 0; belt < 2; belt++) {
    const beltRadius = 260 + belt * 190;
    const tilt = (rand() - 0.5) * 0.9;
    for (let i = 0; i < 70; i++) {
      const a = rand() * Math.PI * 2;
      const r = beltRadius + (rand() - 0.5) * 90;
      const y = Math.sin(a * 2 + belt) * 40 * tilt + (rand() - 0.5) * 50;
      items.push({
        pos: [Math.cos(a) * r, y, Math.sin(a) * r],
        scale: 0.7 + rand() * rand() * 4.5,
        rot: [rand() * Math.PI, rand() * Math.PI, rand() * Math.PI],
        variant: Math.floor(rand() * 4),
      });
    }
  }
  // strays
  for (let i = 0; i < 45; i++) {
    const a = rand() * Math.PI * 2;
    const r = 150 + rand() * 650;
    items.push({
      pos: [Math.cos(a) * r, (rand() - 0.5) * 400, Math.sin(a) * r],
      scale: 0.5 + rand() * rand() * 3.5,
      rot: [rand() * Math.PI, rand() * Math.PI, rand() * Math.PI],
      variant: Math.floor(rand() * 4),
    });
  }
  return items;
}

function fillInstances(mesh: InstancedMesh, items: AsteroidInstance[]) {
  const matrix = new Matrix4();
  const quat = new Quaternion();
  const scaleV = new Vector3();
  const posV = new Vector3();
  const eulerHelper = new Vector3();
  items.forEach((item, i) => {
    posV.set(...item.pos);
    eulerHelper.set(...item.rot);
    quat.setFromAxisAngle(
      new Vector3(
        Math.sin(eulerHelper.x),
        Math.cos(eulerHelper.y),
        Math.sin(eulerHelper.z),
      ).normalize(),
      eulerHelper.x + eulerHelper.y,
    );
    scaleV.setScalar(item.scale);
    matrix.compose(posV, quat, scaleV);
    mesh.setMatrixAt(i, matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
}

function AsteroidField() {
  const groupRef = useRef<Group>(null);
  const items = useMemo(() => buildAsteroidField(), []);
  const byVariant = useMemo(() => {
    const buckets: AsteroidInstance[][] = [[], [], [], []];
    for (const item of items) buckets[item.variant].push(item);
    return buckets;
  }, [items]);
  const meshRefs = useRef<(InstancedMesh | null)[]>([null, null, null, null]);

  useEffect(() => {
    byVariant.forEach((bucket, i) => {
      const mesh = meshRefs.current[i];
      if (mesh) fillInstances(mesh, bucket);
    });
  }, [byVariant]);

  useFrame((_, dt) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += dt * 0.004; // slow orbital drift
    }
  });

  return (
    <group ref={groupRef}>
      {byVariant.map((bucket, i) => (
        <instancedMesh
          key={i}
          ref={(mesh) => {
            meshRefs.current[i] = mesh;
          }}
          args={[getAsteroidGeometry(i), undefined, bucket.length]}
        >
          <meshStandardMaterial color="#6f675c" roughness={0.95} flatShading />
        </instancedMesh>
      ))}
    </group>
  );
}

function PlanetMesh({ planet }: { planet: Planet }) {
  const terrain = useMemo(() => getPlanetGeometry(planet), [planet]);
  return (
    <group position={planet.position}>
      <mesh geometry={terrain}>
        <meshStandardMaterial vertexColors flatShading roughness={0.9} />
      </mesh>
      {/* atmosphere */}
      <mesh>
        <sphereGeometry args={[planet.radius * 1.06, 24, 16]} />
        <meshBasicMaterial color={planet.atmosphereColor} transparent opacity={0.14} />
      </mesh>
      {planet.hasRings && (
        <mesh rotation={[Math.PI / 2.4, 0.2, 0]}>
          <torusGeometry args={[planet.radius * 1.7, planet.radius * 0.16, 2, 48]} />
          <meshStandardMaterial color={planet.ringColor} roughness={0.7} transparent opacity={0.8} side={DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Surface scatter                                                     */
/* ------------------------------------------------------------------ */

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

function SurfaceScatter({ planet }: { planet: Planet }) {
  const items = useMemo(() => {
    const rand = mulberry32(planet.id.length * 1000 + planet.radius * 97);
    const out: { x: number; z: number; s: number; kind: "rock" | "accent" }[] = [];
    for (let i = 0; i < 46; i++) {
      const r = 8 + rand() * (SURFACE_BOUNDS - 12);
      const a = rand() * Math.PI * 2;
      out.push({
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        s: 0.4 + rand() * 1.6,
        kind: rand() > 0.6 ? "accent" : "rock",
      });
    }
    return out;
  }, [planet]);

  return (
    <>
      {items.map((item, i) =>
        item.kind === "rock" ? (
          <mesh key={i} position={[item.x, item.s * 0.4, item.z]} castShadow>
            <dodecahedronGeometry args={[item.s * 0.7, 0]} />
            <meshStandardMaterial color={planet.rockColor} roughness={0.95} />
          </mesh>
        ) : planet.kind === "lush" ? (
          <group key={i} position={[item.x, 0, item.z]}>
            <mesh position={[0, item.s * 0.5, 0]} castShadow>
              <cylinderGeometry args={[0.08 * item.s, 0.12 * item.s, item.s, 8]} />
              <meshStandardMaterial color="#5d4425" roughness={0.9} />
            </mesh>
            <mesh position={[0, item.s * 1.25, 0]} castShadow>
              <coneGeometry args={[item.s * 0.55, item.s * 1.4, 8]} />
              <meshStandardMaterial color="#2f7a3d" roughness={0.85} />
            </mesh>
          </group>
        ) : planet.kind === "ice" || planet.kind === "volcanic" ? (
          <mesh key={i} position={[item.x, item.s * 0.8, item.z]} rotation={[0.15, i, 0.1]} castShadow>
            <octahedronGeometry args={[item.s * 0.7, 0]} />
            <meshStandardMaterial
              color={planet.kind === "ice" ? "#d9f0fa" : "#3b2a26"}
              emissive={planet.kind === "ice" ? "#8fd6f2" : "#f97316"}
              emissiveIntensity={planet.kind === "ice" ? 0.25 : 0.5}
              roughness={0.3}
            />
          </mesh>
        ) : (
          <mesh key={i} position={[item.x, item.s * 0.7, item.z]} castShadow>
            <cylinderGeometry args={[item.s * 0.18, item.s * 0.26, item.s * 1.5, 8]} />
            <meshStandardMaterial color={planet.rockColor} roughness={0.9} />
          </mesh>
        ),
      )}
    </>
  );
}

function HorizonRidge({ planet }: { planet: Planet }) {
  const peaks = useMemo(() => {
    const rand = mulberry32(hashPlanet(planet));
    return Array.from({ length: 26 }, (_, i) => {
      const a = (i / 26) * Math.PI * 2 + rand() * 0.2;
      const r = SURFACE_BOUNDS + 10 + rand() * 22;
      return {
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        h: 6 + rand() * 16,
        w: 6 + rand() * 10,
        rot: rand() * Math.PI,
      };
    });
  }, [planet]);
  return (
    <>
      {peaks.map((peak, i) => (
        <mesh
          key={i}
          position={[peak.x, peak.h * 0.38, peak.z]}
          rotation={[0, peak.rot, 0]}
        >
          <coneGeometry args={[peak.w, peak.h, 5]} />
          <meshStandardMaterial color={planet.rockColor} roughness={0.95} flatShading />
        </mesh>
      ))}
    </>
  );
}

function hashPlanet(planet: Planet): number {
  return planet.id.length * 1000 + Math.round(planet.radius * 97);
}

function FlagMesh({ flag, color }: { flag: PlantedFlag; color: string }) {
  return (
    <group position={[flag.x, 0, flag.z]}>
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 2.2, 8]} />
        <meshStandardMaterial color="#e5e7eb" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0.42, 1.85, 0]} castShadow>
        <boxGeometry args={[0.8, 0.5, 0.03]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 2.3, 0]}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 2.3, 0]} intensity={3} distance={6} color={color} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Descent cinematic                                                   */
/* ------------------------------------------------------------------ */

function DescentScene({
  planet,
  onArrive,
}: {
  planet: Planet;
  onArrive: () => void;
}) {
  const cloudTexture = useMemo(() => makeCloudTexture(planet.cloudColor), [planet]);
  const t0 = useRef<number | null>(null);
  const done = useRef(false);
  const clouds = useMemo(() => {
    const rand = mulberry32(9);
    return Array.from({ length: 10 }, () => ({
      x: (rand() - 0.5) * 30,
      z: (rand() - 0.5) * 30 - 10,
      y0: -20 - rand() * 60,
      s: 14 + rand() * 22,
      rot: rand() * Math.PI,
    }));
  }, []);
  const cloudGroup = useRef<Group>(null);

  useFrame(({ camera, clock }) => {
    if (t0.current === null) t0.current = clock.elapsedTime;
    const t = clock.elapsedTime - t0.current;
    const k = Math.min(t / DESCENT_SECONDS, 1);
    const ease = 1 - Math.pow(1 - k, 2);
    // falling: clouds rush upward past the camera
    if (cloudGroup.current) {
      cloudGroup.current.position.y = ease * 110;
    }
    const shake = (1 - k) * 0.12;
    camera.position.set(
      Math.sin(t * 31) * shake,
      2 + Math.sin(t * 27) * shake,
      6,
    );
    camera.lookAt(0, -4, -6);
    if (k >= 1 && !done.current) {
      done.current = true;
      onArrive();
    }
  });

  return (
    <>
      <color attach="background" args={[planet.skyColor]} />
      <fog attach="fog" args={[planet.fogColor, 6, 55]} />
      <ambientLight intensity={1.1} />
      <group ref={cloudGroup}>
        {clouds.map((cloud, i) => (
          <mesh
            key={i}
            position={[cloud.x, cloud.y0, cloud.z]}
            rotation={[-Math.PI / 2, 0, cloud.rot]}
          >
            <planeGeometry args={[cloud.s, cloud.s]} />
            <meshBasicMaterial
              map={cloudTexture}
              transparent
              depthWrite={false}
              side={DoubleSide}
            />
          </mesh>
        ))}
      </group>
      {/* the ship, nose down through the weather */}
      <group position={[0, 0, -4]} rotation={[0.5, Math.PI, 0]}>
        <ShipModel />
      </group>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Main experience                                                     */
/* ------------------------------------------------------------------ */

export function GalaxyExperience() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useWorldInput();
  const yawRef = useRef(Math.PI);
  const pitchRef = useRef(0);
  const playerPosRef = useRef(new Vector3(0, 0, 2));
  const flightRef = useRef<FlightState>({ pos: new Vector3(0, 4, 30), speed: 0 });
  const { locked, finePointer } = useMouseLook(containerRef, yawRef, pitchRef, Math.PI);
  const gyro = useGyroLook();
  const session = useSession();
  const presence = usePresence("worlds/galaxy", !!session.user, playerPosRef, yawRef);

  const [phase, setPhase] = useState<Phase>({ kind: "deck" });
  const [nearShip, setNearShip] = useState(false);
  const [nearestInfo, setNearestInfo] = useState<{ planet: Planet; dist: number } | null>(null);
  const nearestRef = useRef<{ planet: Planet; dist: number } | null>(null);
  // client-only component (ssr:false) — localStorage is safe to read here
  const [resources, setResources] = useState<ResourceBag | null>(() =>
    loadResources(),
  );
  const [flags, setFlags] = useState<PlantedFlag[]>(() => loadFlags());
  const [claimOpen, setClaimOpen] = useState(false);

  // deck / surface ship proximity (checked from a light interval — the
  // rig already publishes positions at frame rate into playerPosRef)
  useEffect(() => {
    const timer = setInterval(() => {
      if (phase.kind !== "deck" && phase.kind !== "surface") return;
      const p = playerPosRef.current;
      setNearShip(Math.hypot(p.x - SHIP_SPOT[0], p.z - SHIP_SPOT[1]) < 3.4);
    }, 150);
    return () => clearInterval(timer);
  }, [phase.kind]);

  const onNearest = useCallback((planet: Planet, dist: number) => {
    nearestRef.current = { planet, dist };
    setNearestInfo((prev) => {
      if (
        prev &&
        prev.planet.id === planet.id &&
        Math.abs(prev.dist - dist) < 3
      ) {
        return prev;
      }
      return { planet, dist };
    });
  }, []);

  const planetFlag = useMemo(
    () =>
      phase.kind === "surface"
        ? flags.find((f) => f.planetId === phase.planet.id) ?? null
        : null,
    [flags, phase],
  );

  const boardShip = useCallback(() => {
    flightRef.current = { pos: new Vector3(0, 6, 26), speed: 0 };
    pitchRef.current = 0;
    setPhase({ kind: "fly" });
  }, []);

  const takeOff = useCallback((planet: Planet) => {
    const p = planet.position;
    flightRef.current = {
      pos: new Vector3(p[0], p[1] + planet.radius * 2.5, p[2] + planet.radius * 3),
      speed: 20,
    };
    pitchRef.current = 0.2;
    setPhase({ kind: "fly", from: planet });
  }, []);

  const interact = useCallback(() => {
    if (phase.kind === "deck" && nearShip) {
      boardShip();
    } else if (phase.kind === "fly") {
      const nearest = nearestRef.current;
      if (nearest && nearest.dist < nearest.planet.radius * 4.5) {
        setPhase({ kind: "descent", planet: nearest.planet });
      }
    } else if (phase.kind === "surface") {
      if (nearShip) {
        takeOff(phase.planet);
      } else if (!planetFlag) {
        setClaimOpen(true);
      }
    }
  }, [phase, nearShip, boardShip, takeOff, planetFlag]);

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

  const plantFlag = useCallback(() => {
    if (phase.kind !== "surface" || !resources) return;
    if (!canAfford(resources, FLAG_COST)) return;
    const p = playerPosRef.current;
    const nextResources = spend(resources, FLAG_COST);
    const nextFlags = [
      ...flags,
      { planetId: phase.planet.id, x: p.x, z: p.z, plantedAt: 1 },
    ];
    setResources(nextResources);
    saveResources(nextResources);
    setFlags(nextFlags);
    saveFlags(nextFlags);
    setClaimOpen(false);
  }, [phase, resources, flags]);

  /* ------------- prompts ------------- */
  let prompt: string | null = null;
  if (phase.kind === "deck" && nearShip) prompt = "board your ship";
  else if (
    phase.kind === "fly" &&
    nearestInfo &&
    nearestInfo.dist < nearestInfo.planet.radius * 4.5
  )
    prompt = `descend to ${nearestInfo.planet.name}`;
  else if (phase.kind === "surface" && nearShip) prompt = "take off";
  else if (phase.kind === "surface" && !nearShip && !planetFlag)
    prompt = "plant your flag here";

  const affordable = resources ? canAfford(resources, FLAG_COST) : false;

  return (
    <div ref={containerRef} className="relative h-full w-full touch-none">
      <Canvas shadows camera={{ position: [0, 2, 10], fov: 60 }} dpr={[1, 1.6]}>
        {phase.kind === "descent" ? (
          <DescentScene
            planet={phase.planet}
            onArrive={() => setPhase({ kind: "surface", planet: phase.planet })}
          />
        ) : phase.kind === "surface" ? (
          <>
            <color attach="background" args={[phase.planet.skyColor]} />
            <fog attach="fog" args={[phase.planet.fogColor, 25, 110]} />
            <ambientLight intensity={0.75} />
            <directionalLight position={[30, 40, 10]} intensity={2} castShadow shadow-mapSize={[1024, 1024]} />
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <circleGeometry args={[SURFACE_BOUNDS + 4, 64]} />
              <meshStandardMaterial color={phase.planet.groundColor} roughness={0.95} />
            </mesh>
            <SurfaceScatter planet={phase.planet} />
            <HorizonRidge planet={phase.planet} />
            <group position={[SHIP_SPOT[0], 1.05, SHIP_SPOT[1]]}>
              <ShipModel landed />
            </group>
            {planetFlag && (
              <FlagMesh flag={planetFlag} color={session.user?.color ?? "#818cf8"} />
            )}
            <PlayerRig
              inputRef={inputRef}
              yawRef={yawRef}
              pitchRef={pitchRef}
              gyroRef={gyro.gyroRef}
              playerPosRef={playerPosRef}
              config={{ spawn: [0, 0, 2], bounds: SURFACE_BOUNDS }}
            />
            <PeerOrbs peers={presence.peerList} peersRef={presence.peersRef} />
          </>
        ) : phase.kind === "fly" ? (
          <>
            <color attach="background" args={["#04040a"]} />
            <ambientLight intensity={0.55} />
            <directionalLight position={[100, 60, 40]} intensity={2.4} />
            <GalaxySkybox />
            <TwinkleStars />
            <AsteroidField />
            {UNIVERSE.map((planet) => (
              <PlanetMesh key={planet.id} planet={planet} />
            ))}
            <FlightRig
              inputRef={inputRef}
              yawRef={yawRef}
              pitchRef={pitchRef}
              flightRef={flightRef}
              playerPosRef={playerPosRef}
              onNearest={onNearest}
            />
          </>
        ) : (
          /* deck */
          <>
            <color attach="background" args={["#05050a"]} />
            <ambientLight intensity={0.5} />
            <pointLight position={[8, 10, 4]} intensity={90} color="#c7d2fe" />
            <GalaxySkybox />
            <TwinkleStars />
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <circleGeometry args={[DECK_BOUNDS + 1, 64]} />
              <meshStandardMaterial color="#15152b" roughness={0.5} metalness={0.4} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
              <ringGeometry args={[DECK_BOUNDS - 0.4, DECK_BOUNDS + 0.2, 64]} />
              <meshBasicMaterial color="#818cf8" transparent opacity={0.5} />
            </mesh>
            {/* landing pad + the ship */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[SHIP_SPOT[0], 0.02, SHIP_SPOT[1]]}>
              <ringGeometry args={[3, 3.5, 48]} />
              <meshBasicMaterial color="#22d3ee" transparent opacity={0.5} />
            </mesh>
            <group position={[SHIP_SPOT[0], 1.05, SHIP_SPOT[1]]}>
              <ShipModel landed />
            </group>
            <Html
              center
              position={[SHIP_SPOT[0], 4, SHIP_SPOT[1]]}
              zIndexRange={[5, 0]}
              className="pointer-events-none select-none"
            >
              <p className="whitespace-nowrap rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold text-slate-800 shadow">
                your ship
              </p>
            </Html>
            {/* return portal */}
            <ReturnPad playerPosRef={playerPosRef} onEnter={() => router.push("/")} />
            <PlayerRig
              inputRef={inputRef}
              yawRef={yawRef}
              pitchRef={pitchRef}
              gyroRef={gyro.gyroRef}
              playerPosRef={playerPosRef}
              config={{ spawn: [0, 0, 6], bounds: DECK_BOUNDS }}
            />
            <PeerOrbs peers={presence.peerList} peersRef={presence.peersRef} />
          </>
        )}
      </Canvas>

      <BlinkOverlay />
      <Crosshair visible={locked && phase.kind !== "fly"} />

      {/* top banner */}
      <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center px-4">
        <p className="rounded-2xl bg-black/60 px-5 py-2 text-center text-sm font-semibold text-white backdrop-blur">
          {finePointer && !locked && phase.kind !== "descent"
            ? "Click anywhere to take control"
            : phase.kind === "deck"
              ? "🌌 The Galaxy — your ship is waiting"
              : phase.kind === "fly"
                ? "W / hold JUMP = thrust · +SPACE = overdrive · steer with your view"
                : phase.kind === "descent"
                  ? `Entering ${phase.planet.name}…`
                  : `${phase.planet.name} — ${phase.planet.kind} world`}
        </p>
      </div>

      {/* nearest planet HUD while flying */}
      {phase.kind === "fly" && nearestInfo && (
        <div className="pointer-events-none absolute left-4 top-16 rounded-xl bg-black/60 px-4 py-3 font-mono text-xs text-indigo-200 backdrop-blur">
          <p className="font-bold text-white">{nearestInfo.planet.name}</p>
          <p className="mt-0.5 capitalize">{nearestInfo.planet.kind} world</p>
          <p className="mt-0.5">{Math.round(nearestInfo.dist)}u away</p>
          {flags.some((f) => f.planetId === nearestInfo.planet.id) && (
            <p className="mt-0.5 text-amber-300">★ your flag flies here</p>
          )}
        </div>
      )}

      {/* resources chip */}
      {resources && phase.kind !== "descent" && (
        <div className="pointer-events-none absolute right-4 top-16 rounded-full bg-black/60 px-4 py-2 font-mono text-xs text-white/85 backdrop-blur">
          {RESOURCES.map((r) => (
            <span key={r.id} className="ml-2 first:ml-0">
              {r.icon} {resources[r.id] ?? 0}
            </span>
          ))}
        </div>
      )}

      {/* interact prompt */}
      {prompt && (
        <div className="absolute inset-x-0 bottom-24 flex justify-center px-4 sm:bottom-16">
          <button
            onClick={interact}
            className="rounded-2xl bg-white px-6 py-3 text-sm font-bold text-black shadow-xl transition-transform active:scale-95"
          >
            <span className="hidden sm:inline">
              Press <kbd className="rounded bg-black/10 px-1.5">E</kbd> —{" "}
            </span>
            <span className="sm:hidden">Tap — </span>
            {prompt}
          </button>
        </div>
      )}

      {/* back to nexus while flying */}
      {phase.kind === "fly" && (
        <button
          onClick={() => {
            flightRef.current.speed = 0;
            setPhase({ kind: "deck" });
          }}
          className="absolute left-4 bottom-24 rounded-full bg-black/60 px-4 py-2 text-xs font-bold text-white/70 backdrop-blur hover:text-white sm:bottom-6"
        >
          ← Return to hangar deck
        </button>
      )}

      {/* claim panel */}
      {claimOpen && phase.kind === "surface" && resources && (
        <div className="absolute inset-0 z-[8] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-zinc-900 p-6 ring-1 ring-white/15">
            <h2 className="text-lg font-bold text-white">
              Claim {phase.planet.name}
            </h2>
            <p className="mt-1 text-sm text-white/60">
              Plant your flag to stake this spot for your colony, business, or
              storefront. One claim costs:
            </p>
            <div className="mt-4 space-y-2">
              {RESOURCES.map((r) => {
                const have = resources[r.id] ?? 0;
                const need = FLAG_COST[r.id] ?? 0;
                return (
                  <div key={r.id} className="flex items-center justify-between text-sm">
                    <span className="text-white/85">
                      {r.icon} {r.name}
                    </span>
                    <span
                      className={`font-mono font-bold ${have >= need ? "text-emerald-400" : "text-rose-400"}`}
                    >
                      {have} / {need}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 rounded-lg bg-white/5 p-3 text-xs leading-relaxed text-white/50">
              Need more resources? The <b className="text-white/80">Supply
              Depot</b> is opening soon — explore, trade, and stock up for
              bigger builds. Your first claim is on the house.
            </p>
            <div className="mt-5 flex items-center justify-between">
              <button
                onClick={() => setClaimOpen(false)}
                className="text-xs font-bold text-white/50 hover:text-white"
              >
                Not yet
              </button>
              <button
                onClick={plantFlag}
                disabled={!affordable}
                className="rounded-lg bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white disabled:opacity-40"
              >
                🚩 Plant the flag
              </button>
            </div>
          </div>
        </div>
      )}

      {phase.kind !== "descent" && phase.kind !== "fly" && (
        <KeyLegend hint="move · mouse = look · SPACE = jump · E = interact · T = chat" />
      )}
      {phase.kind !== "descent" && <TouchControls inputRef={inputRef} />}
      <GyroButton supported={gyro.supported} active={gyro.active} onEnable={() => void gyro.request()} />
      <AccountPanel session={session} />
      <ChatOverlay
        chat={presence.chat}
        sendChat={presence.sendChat}
        connected={presence.connected}
        signedIn={!!session.user}
        voiceStatus={presence.voiceStatus}
        micMuted={presence.micMuted}
        joinVoice={presence.joinVoice}
        leaveVoice={presence.leaveVoice}
        toggleMute={presence.toggleMute}
      />
    </div>
  );
}

function ReturnPad({
  playerPosRef,
  onEnter,
}: {
  playerPosRef: MutableRefObject<Vector3>;
  onEnter: () => void;
}) {
  const fired = useRef(false);
  const ring = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (ring.current) ring.current.rotation.z = clock.elapsedTime;
    if (fired.current) return;
    const p = playerPosRef.current;
    if (Math.hypot(p.x - 5.5, p.z - 8) < 1.1) {
      fired.current = true;
      if (document.pointerLockElement) document.exitPointerLock();
      onEnter();
    }
  });
  return (
    <group position={[5.5, 0, 8]}>
      <group ref={ring} position={[0, 1.4, 0]}>
        <mesh>
          <torusGeometry args={[1, 0.05, 12, 40]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
        </mesh>
      </group>
      <Html center position={[0, 3, 0]} zIndexRange={[5, 0]} className="pointer-events-none select-none">
        <p className="whitespace-nowrap rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold text-slate-800 shadow">
          ← back to the Nexus
        </p>
      </Html>
    </group>
  );
}
