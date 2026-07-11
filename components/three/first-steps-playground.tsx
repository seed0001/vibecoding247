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
}

function useInput(): MutableRefObject<InputState> {
  const input = useRef<InputState>({
    forward: false,
    back: false,
    left: false,
    right: false,
    jump: false,
    jumpQueued: false,
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
/* Player + camera                                                     */
/* ------------------------------------------------------------------ */

function Player({
  input: inputRef,
  yaw,
  playerPos,
  onMoved,
  onJumped,
}: {
  input: MutableRefObject<InputState>;
  yaw: MutableRefObject<number>;
  playerPos: MutableRefObject<Vector3>;
  onMoved: () => void;
  onJumped: () => void;
}) {
  const group = useRef<Group>(null);
  const vel = useRef(new Vector3());
  const grounded = useRef(true);
  const heading = useRef(0);
  const { camera } = useThree();

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    if (!group.current) return;
    const pos = group.current.position;
    const inp = inputRef.current;

    // movement relative to camera yaw
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
      const sin = Math.sin(yaw.current);
      const cos = Math.cos(yaw.current);
      const wx = (mx * cos - mz * sin) / len;
      const wz = (mx * sin + mz * cos) / len;
      pos.x += wx * speed * dt;
      pos.z += wz * speed * dt;
      heading.current = Math.atan2(wx, wz);
    }

    // jumping + gravity
    if ((inp.jump || inp.jumpQueued) && grounded.current) {
      vel.current.y = 7.6;
      grounded.current = false;
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
    }

    // face travel direction, add a happy walk-bob
    group.current.rotation.y = MathUtils.lerp(
      group.current.rotation.y,
      heading.current,
      Math.min(dt * 10, 1),
    );
    const bob = moving && grounded.current
      ? Math.sin(state.clock.elapsedTime * 12) * 0.06
      : 0;
    group.current.children[0].position.y = 1.05 + bob;

    playerPos.current.copy(pos);

    // follow camera
    const dist = 7.5;
    const height = 3.4;
    const cx = pos.x + Math.sin(yaw.current) * dist;
    const cz = pos.z + Math.cos(yaw.current) * dist;
    camera.position.lerp(new Vector3(cx, pos.y + height, cz), Math.min(dt * 5, 1));
    camera.lookAt(pos.x, pos.y + 1.2, pos.z);
  });

  return (
    <group ref={group} position={SPAWN}>
      {/* body group (bobs while walking) */}
      <group position={[0, 1.05, 0]}>
        <mesh position={[0, -0.45, 0]}>
          <boxGeometry args={[0.55, 0.5, 0.4]} />
          <meshStandardMaterial color="#6366f1" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.7, 0.55, 0.55]} />
          <meshStandardMaterial color="#a5b4fc" roughness={0.4} />
        </mesh>
        <mesh position={[-0.16, 0.13, 0.29]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshBasicMaterial color="#0ea5e9" />
        </mesh>
        <mesh position={[0.16, 0.13, 0.29]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshBasicMaterial color="#0ea5e9" />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.3, 8]} />
          <meshStandardMaterial color="#4f46e5" />
        </mesh>
        <mesh position={[0, 0.7, 0]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
      </group>
      {/* fake blob shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.5, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.18} />
      </mesh>
    </group>
  );
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
/* Camera drag control                                                 */
/* ------------------------------------------------------------------ */

function useDragYaw(yawRef: MutableRefObject<number>) {
  const dragging = useRef(false);
  const lastX = useRef(0);
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    lastX.current = e.clientX;
  }, []);
  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - lastX.current;
      lastX.current = e.clientX;
      yawRef.current -= dx * 0.006;
    },
    [yawRef],
  );
  const stop = useCallback(() => {
    dragging.current = false;
  }, []);
  return { onPointerDown, onPointerMove, onPointerUp: stop, onPointerLeave: stop };
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

type TutorialStep = 0 | 1 | 2 | 3 | 4;

const TUTORIAL: Record<TutorialStep, string> = {
  0: "Press the W A S D keys (or arrows) to walk!",
  1: "You're moving! Now press SPACE to jump!",
  2: "Woohoo! Go collect the glowing stars — some are up on the pink platforms!",
  3: "You're navigating like a gamer! Walk into a glowing ring to open a lesson.",
  4: "ALL the stars?! You're officially a 3D explorer! ⭐",
};

export function FirstStepsPlayground({ lessons }: { lessons: WorldLesson[] }) {
  const inputRef = useInput();
  const yaw = useRef(0);
  const playerPos = useRef(new Vector3(...SPAWN));
  const drag = useDragYaw(yaw);

  const [visited] = useState<string[]>(() => getVisitedLessons());
  const [collected, setCollected] = useState<string[]>(() => loadCollectedStars());
  const [step, setStep] = useState<TutorialStep>(0);

  const onMoved = useCallback(() => {
    setStep((s) => (s === 0 ? 1 : s));
  }, []);
  const onJumped = useCallback(() => {
    setStep((s) => (s === 1 ? 2 : s));
  }, []);
  const onCollect = useCallback((id: string) => {
    setCollected((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      saveCollectedStars(next);
      setStep((s) => {
        if (next.length >= STARS.length) return 4;
        if (s === 2 && next.length >= 3) return 3;
        return s;
      });
      return next;
    });
  }, []);

  // touch helpers
  const handlePress = useCallback(
    (key: "forward" | "back" | "left" | "right" | "jump", down: boolean) => {
      inputRef.current[key] = down;
      if (down && key === "jump") inputRef.current.jumpQueued = true;
      if (down && key !== "jump") onMoved();
    },
    [inputRef, onMoved],
  );

  return (
    <div
      className="relative h-full w-full touch-none"
      {...drag}
    >
      <Canvas camera={{ position: [0, 3.6, 13], fov: 55 }} dpr={[1, 1.75]}>
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
            enabled={step >= 3 || visited.length > 0}
          />
        ))}
        <Player
          input={inputRef}
          yaw={yaw}
          playerPos={playerPos}
          onMoved={onMoved}
          onJumped={onJumped}
        />
      </Canvas>

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
            walk · SPACE = jump · drag = look
          </p>
        </div>
      </div>

      {/* Touch controls (phones/tablets) */}
      <div className="absolute bottom-4 left-4 flex select-none flex-col items-center gap-1 sm:hidden">
        <button
          aria-label="Walk forward"
          className="h-12 w-12 rounded-xl bg-white/85 text-lg font-black text-slate-800 shadow active:bg-amber-200"
          onPointerDown={() => handlePress("forward", true)}
          onPointerUp={() => handlePress("forward", false)}
          onPointerLeave={() => handlePress("forward", false)}
        >
          ↑
        </button>
        <div className="flex gap-1">
          <button
            aria-label="Walk left"
            className="h-12 w-12 rounded-xl bg-white/85 text-lg font-black text-slate-800 shadow active:bg-amber-200"
            onPointerDown={() => handlePress("left", true)}
            onPointerUp={() => handlePress("left", false)}
            onPointerLeave={() => handlePress("left", false)}
          >
            ←
          </button>
          <button
            aria-label="Walk back"
            className="h-12 w-12 rounded-xl bg-white/85 text-lg font-black text-slate-800 shadow active:bg-amber-200"
            onPointerDown={() => handlePress("back", true)}
            onPointerUp={() => handlePress("back", false)}
            onPointerLeave={() => handlePress("back", false)}
          >
            ↓
          </button>
          <button
            aria-label="Walk right"
            className="h-12 w-12 rounded-xl bg-white/85 text-lg font-black text-slate-800 shadow active:bg-amber-200"
            onPointerDown={() => handlePress("right", true)}
            onPointerUp={() => handlePress("right", false)}
            onPointerLeave={() => handlePress("right", false)}
          >
            →
          </button>
        </div>
      </div>
      <button
        aria-label="Jump"
        className="absolute bottom-6 right-4 h-16 w-16 select-none rounded-full bg-emerald-400/90 text-sm font-black text-white shadow-lg active:bg-emerald-500 sm:hidden"
        onPointerDown={() => handlePress("jump", true)}
        onPointerUp={() => handlePress("jump", false)}
        onPointerLeave={() => handlePress("jump", false)}
      >
        JUMP
      </button>
    </div>
  );
}
