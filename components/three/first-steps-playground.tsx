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
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Sky } from "@react-three/drei";
import { Group, MathUtils, Vector3 } from "three";
import { getVisitedLessons } from "@/lib/first-steps-progress";
import { sfx } from "@/lib/sfx";

export interface WorldLesson {
  slug: string;
  order: number;
  title: string;
  emoji: string;
  color: string;
}

/* ------------------------------------------------------------------ */
/* World layout                                                        */
/* ------------------------------------------------------------------ */

const ISLAND_RADIUS = 16;
const SPAWN: [number, number, number] = [0, 0, 6];
const EYE_HEIGHT = 1.55;

/** Stepping-stone platforms rising to a sky deck. */
const PLATFORMS: { x: number; z: number; top: number; size: number }[] = [
  { x: 6.5, z: -3, top: 0.7, size: 1.6 },
  { x: 8.2, z: -5.2, top: 1.4, size: 1.5 },
  { x: 9.8, z: -7.6, top: 2.1, size: 1.4 },
  { x: 11.2, z: -10.2, top: 2.8, size: 1.4 },
  { x: 8.6, z: -11.8, top: 3.4, size: 2.6 }, // sky deck
];

const STARS: { id: string; x: number; y: number; z: number }[] = [
  { id: "s1", x: 3, y: 0.9, z: 2 },
  { id: "s2", x: -4, y: 0.9, z: 5 },
  { id: "s3", x: -7, y: 0.9, z: -2 },
  { id: "s4", x: 1.5, y: 0.9, z: -6 },
  { id: "s5", x: -2.5, y: 0.9, z: 9 },
  { id: "s6", x: 10, y: 0.9, z: 3 },
  { id: "s7", x: -11, y: 0.9, z: 6 },
  { id: "s8", x: -9, y: 0.9, z: -8 },
  // platform path bonus stars
  { id: "p1", x: 8.2, y: 2.4, z: -5.2 },
  { id: "p2", x: 11.2, y: 3.8, z: -10.2 },
  { id: "p3", x: 8.6, y: 4.4, z: -11.8 },
  { id: "p4", x: 8.6, y: 4.4, z: -13 },
];

/** Friendly critters that wander the island and chat when you say hi. */
const CRITTERS: {
  id: string;
  name: string;
  kind: "bunny" | "blob" | "bird";
  color: string;
  home: [number, number];
  /** voice pitch multiplier for its chirp */
  pitch: number;
  msgs: string[];
}[] = [
  {
    id: "pip",
    name: "Pip",
    kind: "bunny",
    color: "#f472b6",
    home: [4, 3],
    pitch: 1.25,
    msgs: [
      "Hi! I'm Pip! Press SPACE to jump — it's the best!",
      "Did you find the stars up on the pink platforms?",
      "Boing boing boing!",
    ],
  },
  {
    id: "momo",
    name: "Momo",
    kind: "blob",
    color: "#34d399",
    home: [-5, -3],
    pitch: 0.8,
    msgs: [
      "I'm Momo! I love naps in the grass.",
      "Walk into a glowing ring to open a lesson!",
      "Wow, you run fast!",
    ],
  },
  {
    id: "zuzu",
    name: "Zuzu",
    kind: "bird",
    color: "#60a5fa",
    home: [-8, 7],
    pitch: 1.6,
    msgs: [
      "Cheep cheep! I'm Zuzu!",
      "Collect ALL the stars — you can do it!",
      "The sky deck has the best view on the island!",
    ],
  },
  {
    id: "bo",
    name: "Bo",
    kind: "blob",
    color: "#fbbf24",
    home: [9, 6],
    pitch: 1.0,
    msgs: [
      "Heya, I'm Bo! You found me!",
      "If you fall off the edge, don't worry — you pop right back.",
      "Say hi to my friends Pip, Momo, and Zuzu too!",
    ],
  },
];

const STARS_KEY = "vc247-fs-stars";

function loadCollectedStars(): string[] {
  try {
    const raw = window.localStorage.getItem(STARS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCollectedStars(ids: string[]) {
  try {
    window.localStorage.setItem(STARS_KEY, JSON.stringify(ids));
  } catch {
    /* storage unavailable — session-only progress */
  }
}

/** Height of whatever surface is under (x, z), or -Infinity off the edge. */
function supportHeight(x: number, z: number): number {
  let h = -Infinity;
  if (Math.hypot(x, z) <= ISLAND_RADIUS - 0.3) h = 0;
  for (const p of PLATFORMS) {
    if (Math.abs(x - p.x) <= p.size && Math.abs(z - p.z) <= p.size) {
      h = Math.max(h, p.top);
    }
  }
  return h;
}

/* ------------------------------------------------------------------ */
/* Input                                                               */
/* ------------------------------------------------------------------ */

interface InputState {
  forward: boolean;
  back: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  /** Set on keydown, consumed by the physics frame — so a quick tap
   *  still jumps even if it lands between two slow frames. */
  jumpQueued: boolean;
  /** Set on E keydown / wave button, consumed by the nearest critter. */
  interactQueued: boolean;
}

function useInput(): MutableRefObject<InputState> {
  const input = useRef<InputState>({
    forward: false,
    back: false,
    left: false,
    right: false,
    jump: false,
    jumpQueued: false,
    interactQueued: false,
  });

  useEffect(() => {
    const set = (code: string, down: boolean): boolean => {
      switch (code) {
        case "KeyW":
        case "ArrowUp":
          input.current.forward = down;
          return true;
        case "KeyS":
        case "ArrowDown":
          input.current.back = down;
          return true;
        case "KeyA":
        case "ArrowLeft":
          input.current.left = down;
          return true;
        case "KeyD":
        case "ArrowRight":
          input.current.right = down;
          return true;
        case "Space":
          input.current.jump = down;
          if (down) input.current.jumpQueued = true;
          return true;
        case "KeyE":
          if (down) input.current.interactQueued = true;
          return true;
        default:
          return false;
      }
    };
    const onDown = (e: KeyboardEvent) => {
      if (set(e.code, true)) e.preventDefault();
    };
    const onUp = (e: KeyboardEvent) => {
      if (set(e.code, false)) e.preventDefault();
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  return input;
}

/* ------------------------------------------------------------------ */
/* First-person look (pointer lock on desktop, drag on touch)          */
/* ------------------------------------------------------------------ */

const PITCH_LIMIT = 1.25;

function useLook(
  containerRef: MutableRefObject<HTMLDivElement | null>,
  yawRef: MutableRefObject<number>,
  pitchRef: MutableRefObject<number>,
  onLook: () => void,
) {
  const [locked, setLocked] = useState(false);
  const touchId = useRef<number | null>(null);
  const lastTouch = useRef<[number, number]>([0, 0]);

  // pointer lock (desktop)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onChange = () => setLocked(document.pointerLockElement === el);
    const onMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== el) return;
      yawRef.current -= e.movementX * 0.0025;
      pitchRef.current = MathUtils.clamp(
        pitchRef.current - e.movementY * 0.0025,
        -PITCH_LIMIT,
        PITCH_LIMIT,
      );
      if (e.movementX !== 0 || e.movementY !== 0) onLook();
    };
    document.addEventListener("pointerlockchange", onChange);
    document.addEventListener("mousemove", onMove);
    return () => {
      document.removeEventListener("pointerlockchange", onChange);
      document.removeEventListener("mousemove", onMove);
    };
  }, [containerRef, yawRef, pitchRef, onLook]);

  const requestLock = useCallback(
    (e: React.MouseEvent) => {
      const el = containerRef.current;
      if (!el || document.pointerLockElement === el) return;
      // only lock from clicks on the 3D canvas itself, not HUD buttons
      if ((e.target as HTMLElement).tagName !== "CANVAS") return;
      if (window.matchMedia("(pointer: coarse)").matches) return;
      el.requestPointerLock();
    },
    [containerRef],
  );

  // drag look (touch)
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType !== "touch") return;
    if ((e.target as HTMLElement).tagName !== "CANVAS") return;
    if (touchId.current !== null) return;
    touchId.current = e.pointerId;
    lastTouch.current = [e.clientX, e.clientY];
  }, []);
  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerId !== touchId.current) return;
      const dx = e.clientX - lastTouch.current[0];
      const dy = e.clientY - lastTouch.current[1];
      lastTouch.current = [e.clientX, e.clientY];
      yawRef.current -= dx * 0.005;
      pitchRef.current = MathUtils.clamp(
        pitchRef.current - dy * 0.004,
        -PITCH_LIMIT,
        PITCH_LIMIT,
      );
      if (dx !== 0 || dy !== 0) onLook();
    },
    [yawRef, pitchRef, onLook],
  );
  const endTouch = useCallback((e: React.PointerEvent) => {
    if (e.pointerId === touchId.current) touchId.current = null;
  }, []);

  return {
    locked,
    handlers: {
      onClick: requestLock,
      onPointerDown,
      onPointerMove,
      onPointerUp: endTouch,
      onPointerCancel: endTouch,
      onPointerLeave: endTouch,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Player rig (you ARE the camera)                                     */
/* ------------------------------------------------------------------ */

function PlayerRig({
  input: inputRef,
  yaw: yawRef,
  pitch: pitchRef,
  playerPos: playerPosRef,
  onMoved,
  onJumped,
}: {
  input: MutableRefObject<InputState>;
  yaw: MutableRefObject<number>;
  pitch: MutableRefObject<number>;
  playerPos: MutableRefObject<Vector3>;
  onMoved: () => void;
  onJumped: () => void;
}) {
  const vel = useRef(new Vector3());
  const grounded = useRef(true);
  const bobPhase = useRef(0);
  const { camera } = useThree();

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const pos = playerPosRef.current;
    const inp = inputRef.current;

    // movement relative to look yaw
    let mx = 0;
    let mz = 0;
    if (inp.forward) mz -= 1;
    if (inp.back) mz += 1;
    if (inp.left) mx -= 1;
    if (inp.right) mx += 1;
    const moving = mx !== 0 || mz !== 0;
    if (moving) {
      onMoved();
      const len = Math.hypot(mx, mz);
      const speed = 5.2;
      const sin = Math.sin(yawRef.current);
      const cos = Math.cos(yawRef.current);
      const wx = (mx * cos + mz * sin) / len;
      const wz = (-mx * sin + mz * cos) / len;
      pos.x += wx * speed * dt;
      pos.z += wz * speed * dt;
    }

    // jumping + gravity
    if ((inp.jump || inp.jumpQueued) && grounded.current) {
      vel.current.y = 7.6;
      grounded.current = false;
      sfx.jump();
      onJumped();
    }
    inp.jumpQueued = false;
    vel.current.y -= 19 * dt;
    const prevY = pos.y;
    pos.y += vel.current.y * dt;
    const support = supportHeight(pos.x, pos.z);
    if (vel.current.y <= 0 && prevY >= support - 0.01 && pos.y <= support) {
      pos.y = support;
      vel.current.y = 0;
      grounded.current = true;
    } else if (pos.y > support) {
      grounded.current = false;
    }

    // fell off the world → respawn
    if (pos.y < -14) {
      pos.set(...SPAWN);
      vel.current.set(0, 0, 0);
      sfx.respawn();
    }

    // gentle head-bob while running on the ground
    if (moving && grounded.current) {
      bobPhase.current += dt * 11;
    }
    const bob =
      moving && grounded.current ? Math.sin(bobPhase.current) * 0.045 : 0;

    camera.position.set(pos.x, pos.y + EYE_HEIGHT + bob, pos.z);
    camera.rotation.set(pitchRef.current, yawRef.current, 0, "YXZ");
  });

  return null;
}

/** Runs after the critters each frame and clears one-shot input flags. */
function InputJanitor({
  input: inputRef,
}: {
  input: MutableRefObject<InputState>;
}) {
  useFrame(() => {
    inputRef.current.interactQueued = false;
  });
  return null;
}

/* ------------------------------------------------------------------ */
/* Collectibles + lesson gates                                         */
/* ------------------------------------------------------------------ */

function Star({
  star,
  collected,
  playerPos,
  onCollect,
}: {
  star: (typeof STARS)[number];
  collected: boolean;
  playerPos: MutableRefObject<Vector3>;
  onCollect: (id: string) => void;
}) {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (!ref.current || collected) return;
    ref.current.rotation.y = state.clock.elapsedTime * 2;
    ref.current.position.y =
      star.y + Math.sin(state.clock.elapsedTime * 2.4 + star.x) * 0.15;
    const p = playerPos.current;
    if (
      Math.hypot(p.x - star.x, p.z - star.z) < 0.9 &&
      Math.abs(p.y + 1 - star.y) < 1.6
    ) {
      onCollect(star.id);
    }
  });
  if (collected) return null;
  return (
    <group ref={ref} position={[star.x, star.y, star.z]}>
      <mesh>
        <octahedronGeometry args={[0.32]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#f59e0b"
          emissiveIntensity={0.9}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

function LessonGate({
  lesson,
  angleDeg,
  visited,
  playerPos,
  enabled,
}: {
  lesson: WorldLesson;
  angleDeg: number;
  visited: boolean;
  playerPos: MutableRefObject<Vector3>;
  enabled: boolean;
}) {
  const router = useRouter();
  const fired = useRef(false);
  const ring = useRef<Group>(null);
  const a = (angleDeg * Math.PI) / 180;
  const x = Math.sin(a) * (ISLAND_RADIUS - 3.2);
  const z = Math.cos(a) * (ISLAND_RADIUS - 3.2);

  useFrame((state) => {
    if (ring.current) {
      ring.current.rotation.z = state.clock.elapsedTime * 0.8;
    }
    if (!enabled || fired.current) return;
    const p = playerPos.current;
    if (Math.hypot(p.x - x, p.z - z) < 1.3 && p.y < 1.5) {
      fired.current = true;
      sfx.gate();
      router.push(`/first-steps/${lesson.slug}`);
    }
  });

  return (
    <group position={[x, 0, z]}>
      {/* glowing ring you walk into */}
      <group ref={ring} position={[0, 1.4, 0]}>
        <mesh>
          <torusGeometry args={[1.05, 0.06, 16, 48]} />
          <meshStandardMaterial
            color={lesson.color}
            emissive={lesson.color}
            emissiveIntensity={1.2}
          />
        </mesh>
      </group>
      {/* pad */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <circleGeometry args={[1.35, 32]} />
        <meshBasicMaterial color={lesson.color} transparent opacity={0.35} />
      </mesh>
      <Html center position={[0, 3, 0]} className="pointer-events-none select-none">
        <div className="w-40 text-center">
          <p className="text-xl">{lesson.emoji}</p>
          <p className="mt-0.5 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-bold text-slate-800 shadow-sm">
            {lesson.order}. {lesson.title}
          </p>
          {visited && (
            <p className="mt-1 text-[10px] font-extrabold text-amber-500 drop-shadow">
              ★ done
            </p>
          )}
        </div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Critters                                                            */
/* ------------------------------------------------------------------ */

const INTERACT_RANGE = 2.6;

function Critter({
  critter,
  input: inputRef,
  playerPos: playerPosRef,
  onInteract,
}: {
  critter: (typeof CRITTERS)[number];
  input: MutableRefObject<InputState>;
  playerPos: MutableRefObject<Vector3>;
  onInteract: () => void;
}) {
  const group = useRef<Group>(null);
  const body = useRef<Group>(null);
  const target = useRef(new Vector3(critter.home[0], 0, critter.home[1]));
  const retargetAt = useRef(0);
  const msgIndex = useRef(0);
  const msgUntil = useRef(0);
  const spin = useRef(0);
  const nextPeepAt = useRef(
    3 + Math.abs(critter.home[0] * 7 + critter.home[1] * 3) % 5,
  );
  const [near, setNear] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const p = playerPosRef.current;
    const dx = p.x - g.position.x;
    const dz = p.z - g.position.z;
    const playerDist = Math.hypot(dx, dz);
    const isNear = playerDist < INTERACT_RANGE && Math.abs(p.y) < 2;

    if (isNear !== near) setNear(isNear);

    // say hi!
    if (isNear && inputRef.current.interactQueued) {
      inputRef.current.interactQueued = false;
      setMsg(critter.msgs[msgIndex.current % critter.msgs.length]);
      msgIndex.current += 1;
      msgUntil.current = t + 3.2;
      spin.current = Math.PI * 2;
      sfx.critter(critter.pitch);
      onInteract();
    }

    // occasional soft peep when you're wandering close by
    if (playerDist < 6 && t > nextPeepAt.current) {
      nextPeepAt.current = t + 5 + Math.random() * 6;
      sfx.peep(critter.pitch);
    }
    if (msg && t > msgUntil.current) setMsg(null);

    if (isNear) {
      // stop and face the player
      g.rotation.y = MathUtils.lerp(
        g.rotation.y,
        Math.atan2(dx, dz),
        Math.min(dt * 8, 1),
      );
    } else {
      // wander near home
      if (t > retargetAt.current) {
        retargetAt.current = t + 2.5 + Math.random() * 3;
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * 2.5;
        target.current.set(
          critter.home[0] + Math.sin(a) * r,
          0,
          critter.home[1] + Math.cos(a) * r,
        );
      }
      const tx = target.current.x - g.position.x;
      const tz = target.current.z - g.position.z;
      const dist = Math.hypot(tx, tz);
      if (dist > 0.15) {
        const speed = 1.1;
        g.position.x += (tx / dist) * speed * dt;
        g.position.z += (tz / dist) * speed * dt;
        g.rotation.y = MathUtils.lerp(
          g.rotation.y,
          Math.atan2(tx, tz),
          Math.min(dt * 6, 1),
        );
      }
    }

    // hop bob + happy spin after a greeting
    const movingHop = !isNear ? Math.abs(Math.sin(t * 6)) * 0.12 : 0;
    const idleBreath = Math.sin(t * 3 + critter.home[0]) * 0.02;
    if (body.current) {
      body.current.position.y = 0.32 + movingHop + idleBreath;
      if (spin.current > 0) {
        const step = Math.min(spin.current, dt * 9);
        body.current.rotation.y += step;
        spin.current -= step;
      } else {
        body.current.rotation.y = 0;
      }
    }
  });

  return (
    <group ref={group} position={[critter.home[0], 0, critter.home[1]]}>
      <group ref={body} position={[0, 0.32, 0]}>
        {/* body */}
        <mesh scale={[1, 0.85, 1]}>
          <sphereGeometry args={[0.34, 24, 24]} />
          <meshStandardMaterial color={critter.color} roughness={0.55} />
        </mesh>
        {/* eyes */}
        <mesh position={[-0.12, 0.08, 0.28]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshBasicMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0.12, 0.08, 0.28]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshBasicMaterial color="#1e293b" />
        </mesh>
        {/* kind-specific bits */}
        {critter.kind === "bunny" && (
          <>
            <mesh position={[-0.12, 0.42, 0]} rotation={[0, 0, 0.15]}>
              <capsuleGeometry args={[0.05, 0.3, 4, 10]} />
              <meshStandardMaterial color={critter.color} roughness={0.55} />
            </mesh>
            <mesh position={[0.12, 0.42, 0]} rotation={[0, 0, -0.15]}>
              <capsuleGeometry args={[0.05, 0.3, 4, 10]} />
              <meshStandardMaterial color={critter.color} roughness={0.55} />
            </mesh>
          </>
        )}
        {critter.kind === "blob" && (
          <>
            <mesh position={[0, 0.4, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.22, 6]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
            <mesh position={[0, 0.54, 0]}>
              <sphereGeometry args={[0.055, 12, 12]} />
              <meshBasicMaterial color="#fef08a" />
            </mesh>
          </>
        )}
        {critter.kind === "bird" && (
          <>
            <mesh position={[0, 0.02, 0.34]} rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.06, 0.16, 8]} />
              <meshStandardMaterial color="#f59e0b" />
            </mesh>
            <mesh position={[-0.3, 0, 0]} rotation={[0, 0, 0.7]} scale={[1, 0.5, 0.7]}>
              <sphereGeometry args={[0.14, 12, 12]} />
              <meshStandardMaterial color={critter.color} roughness={0.55} />
            </mesh>
            <mesh position={[0.3, 0, 0]} rotation={[0, 0, -0.7]} scale={[1, 0.5, 0.7]}>
              <sphereGeometry args={[0.14, 12, 12]} />
              <meshStandardMaterial color={critter.color} roughness={0.55} />
            </mesh>
          </>
        )}
      </group>
      {/* blob shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.32, 20]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.16} />
      </mesh>
      {/* speech bubble / prompt */}
      {(msg || near) && (
        <Html center position={[0, 1.15, 0]} className="pointer-events-none select-none">
          {msg ? (
            <div className="w-48 rounded-2xl bg-white/95 px-3 py-2 text-center text-[12px] font-bold text-slate-800 shadow-lg">
              <span className="block text-[10px] font-extrabold uppercase tracking-wide text-slate-400">
                {critter.name}
              </span>
              {msg}
            </div>
          ) : (
            <div className="whitespace-nowrap rounded-full bg-slate-900/85 px-3 py-1 text-[11px] font-bold text-white shadow">
              press <kbd className="rounded bg-white/20 px-1">E</kbd> to say hi 👋
            </div>
          )}
        </Html>
      )}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Scenery                                                             */
/* ------------------------------------------------------------------ */

function Scenery() {
  const trees = useMemo(
    () =>
      [
        [4.5, 8.5], [-6, -6.5], [12, -2], [-12.5, 2], [2, 12.5], [-3, -11],
        [13, 7], [-9, 10.5],
      ] as [number, number][],
    [],
  );
  return (
    <>
      {/* island */}
      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[ISLAND_RADIUS, ISLAND_RADIUS - 1.5, 0.7, 48]} />
        <meshStandardMaterial color="#4ade80" roughness={0.8} />
      </mesh>
      <mesh position={[0, -3.2, 0]}>
        <coneGeometry args={[ISLAND_RADIUS - 1.2, 5.2, 48]} />
        <meshStandardMaterial color="#8b6f47" roughness={0.9} />
      </mesh>
      {/* platforms */}
      {PLATFORMS.map((p, i) => (
        <group key={i} position={[p.x, p.top - 0.15, p.z]}>
          <mesh>
            <cylinderGeometry args={[p.size, p.size * 0.82, 0.3, 8]} />
            <meshStandardMaterial color={i === PLATFORMS.length - 1 ? "#22d3ee" : "#f472b6"} roughness={0.6} />
          </mesh>
        </group>
      ))}
      {/* trees */}
      {trees.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.09, 0.11, 0.7, 8]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
          <mesh position={[0, 1.05, 0]}>
            <coneGeometry args={[0.55, 1.3, 8]} />
            <meshStandardMaterial color="#166534" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

type TutorialStep = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const TUTORIAL: Record<TutorialStep, string> = {
  0: "Click the world (or drag on a phone) and look around with your mouse!",
  1: "Nice! Now run with the W A S D keys (or arrows)!",
  2: "You're moving! Press SPACE to jump!",
  3: "Woohoo! Go collect the glowing stars — some are up on the pink platforms!",
  4: "See a little creature? Walk up close and press E to say hi!",
  5: "You made a friend! Walk into a glowing ring to open a lesson.",
  6: "ALL the stars?! You're officially a 3D explorer! ⭐",
};

export function FirstStepsPlayground({ lessons }: { lessons: WorldLesson[] }) {
  const inputRef = useInput();
  const yaw = useRef(0);
  const pitch = useRef(0);
  const playerPos = useRef(new Vector3(...SPAWN));
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [visited] = useState<string[]>(() => getVisitedLessons());
  const [collected, setCollected] = useState<string[]>(() => loadCollectedStars());
  const [step, setStep] = useState<TutorialStep>(0);

  const onLook = useCallback(() => {
    setStep((s) => (s === 0 ? 1 : s));
  }, []);
  const onMoved = useCallback(() => {
    setStep((s) => (s === 1 ? 2 : s));
  }, []);
  const onJumped = useCallback(() => {
    setStep((s) => (s === 2 ? 3 : s));
  }, []);
  const onInteract = useCallback(() => {
    setStep((s) => (s === 4 ? 5 : s));
  }, []);
  const onCollect = useCallback((id: string) => {
    setCollected((prev) => {
      if (prev.includes(id)) return prev;
      sfx.collect();
      const next = [...prev, id];
      saveCollectedStars(next);
      setStep((s) => {
        if (next.length >= STARS.length) return 6;
        if (s === 3 && next.length >= 3) return 4;
        return s;
      });
      return next;
    });
  }, []);

  const { locked, handlers } = useLook(containerRef, yaw, pitch, onLook);

  // touch helpers
  const handlePress = useCallback(
    (key: "forward" | "back" | "left" | "right" | "jump", down: boolean) => {
      inputRef.current[key] = down;
      if (down && key === "jump") inputRef.current.jumpQueued = true;
      if (down && key !== "jump") onMoved();
    },
    [inputRef, onMoved],
  );
  const handleWave = useCallback(() => {
    inputRef.current.interactQueued = true;
  }, [inputRef]);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full touch-none"
      {...handlers}
    >
      <Canvas
        camera={{ position: [SPAWN[0], EYE_HEIGHT, SPAWN[2]], fov: 70 }}
        dpr={[1, 1.75]}
      >
        <Sky sunPosition={[8, 5, -4]} turbidity={6} rayleigh={0.7} />
        <ambientLight intensity={0.85} />
        <directionalLight position={[8, 12, 6]} intensity={2.1} />
        <Scenery />
        {STARS.map((star) => (
          <Star
            key={star.id}
            star={star}
            collected={collected.includes(star.id)}
            playerPos={playerPos}
            onCollect={onCollect}
          />
        ))}
        {lessons.map((lesson, i) => (
          <LessonGate
            key={lesson.slug}
            lesson={lesson}
            angleDeg={140 + i * 44}
            visited={visited.includes(lesson.slug)}
            playerPos={playerPos}
            enabled={step >= 5 || visited.length > 0}
          />
        ))}
        <PlayerRig
          input={inputRef}
          yaw={yaw}
          pitch={pitch}
          playerPos={playerPos}
          onMoved={onMoved}
          onJumped={onJumped}
        />
        {CRITTERS.map((critter) => (
          <Critter
            key={critter.id}
            critter={critter}
            input={inputRef}
            playerPos={playerPos}
            onInteract={onInteract}
          />
        ))}
        <InputJanitor input={inputRef} />
      </Canvas>

      {/* crosshair */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80 shadow-[0_0_4px_rgba(0,0,0,0.5)]" />

      {/* click-to-play hint (desktop, when the mouse isn't captured) */}
      {!locked && step > 0 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-24 hidden justify-center [@media(pointer:fine)]:flex">
          <p className="rounded-full bg-slate-900/75 px-4 py-1.5 text-xs font-bold text-white shadow backdrop-blur">
            🖱 click to look around · ESC frees your mouse
          </p>
        </div>
      )}

      {/* Tutorial banner */}
      <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center px-4">
        <p className="rounded-2xl bg-white/90 px-5 py-2.5 text-center text-sm font-extrabold text-slate-800 shadow-lg backdrop-blur">
          {TUTORIAL[step]}
        </p>
      </div>

      {/* Star counter */}
      <div className="pointer-events-none absolute right-4 top-16 rounded-full bg-white/90 px-4 py-1.5 text-sm font-extrabold text-amber-600 shadow backdrop-blur sm:top-4 sm:right-4">
        ★ {collected.length} / {STARS.length}
      </div>

      {/* Key legend */}
      <div className="pointer-events-none absolute bottom-4 left-4 hidden select-none sm:block">
        <div className="flex flex-col items-center gap-1">
          <kbd className="rounded-lg bg-white/90 px-3 py-2 font-mono text-sm font-bold text-slate-800 shadow">W</kbd>
          <div className="flex gap-1">
            <kbd className="rounded-lg bg-white/90 px-3 py-2 font-mono text-sm font-bold text-slate-800 shadow">A</kbd>
            <kbd className="rounded-lg bg-white/90 px-3 py-2 font-mono text-sm font-bold text-slate-800 shadow">S</kbd>
            <kbd className="rounded-lg bg-white/90 px-3 py-2 font-mono text-sm font-bold text-slate-800 shadow">D</kbd>
          </div>
          <p className="mt-1 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold text-slate-600">
            run · SPACE jump · E say hi · mouse look
          </p>
        </div>
      </div>

      {/* Touch controls (phones/tablets) */}
      <div className="absolute bottom-4 left-4 flex select-none flex-col items-center gap-1 sm:hidden">
        <button
          aria-label="Run forward"
          className="h-12 w-12 rounded-xl bg-white/85 text-lg font-black text-slate-800 shadow active:bg-amber-200"
          onPointerDown={() => handlePress("forward", true)}
          onPointerUp={() => handlePress("forward", false)}
          onPointerLeave={() => handlePress("forward", false)}
        >
          ↑
        </button>
        <div className="flex gap-1">
          <button
            aria-label="Run left"
            className="h-12 w-12 rounded-xl bg-white/85 text-lg font-black text-slate-800 shadow active:bg-amber-200"
            onPointerDown={() => handlePress("left", true)}
            onPointerUp={() => handlePress("left", false)}
            onPointerLeave={() => handlePress("left", false)}
          >
            ←
          </button>
          <button
            aria-label="Run back"
            className="h-12 w-12 rounded-xl bg-white/85 text-lg font-black text-slate-800 shadow active:bg-amber-200"
            onPointerDown={() => handlePress("back", true)}
            onPointerUp={() => handlePress("back", false)}
            onPointerLeave={() => handlePress("back", false)}
          >
            ↓
          </button>
          <button
            aria-label="Run right"
            className="h-12 w-12 rounded-xl bg-white/85 text-lg font-black text-slate-800 shadow active:bg-amber-200"
            onPointerDown={() => handlePress("right", true)}
            onPointerUp={() => handlePress("right", false)}
            onPointerLeave={() => handlePress("right", false)}
          >
            →
          </button>
        </div>
      </div>
      <div className="absolute bottom-6 right-4 flex select-none flex-col items-center gap-2 sm:hidden">
        <button
          aria-label="Say hi"
          className="h-12 w-12 rounded-full bg-sky-400/90 text-xl shadow-lg active:bg-sky-500"
          onPointerDown={handleWave}
        >
          👋
        </button>
        <button
          aria-label="Jump"
          className="h-16 w-16 rounded-full bg-emerald-400/90 text-sm font-black text-white shadow-lg active:bg-emerald-500"
          onPointerDown={() => handlePress("jump", true)}
          onPointerUp={() => handlePress("jump", false)}
          onPointerLeave={() => handlePress("jump", false)}
        >
          JUMP
        </button>
      </div>
    </div>
  );
}
