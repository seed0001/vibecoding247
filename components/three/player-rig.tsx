"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type MutableRefObject,
} from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Group, MathUtils, Vector3 } from "three";

/* ------------------------------------------------------------------ */
/* Input                                                               */
/* ------------------------------------------------------------------ */

export interface InputState {
  forward: boolean;
  back: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  /** Set on keydown, consumed by the physics frame — quick taps always land. */
  jumpQueued: boolean;
  /** Set on E/Enter keydown, consumed by whoever is showing a prompt. */
  interactQueued: boolean;
}

export function useWorldInput(): MutableRefObject<InputState> {
  const inputRef = useRef<InputState>({
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
      const input = inputRef.current;
      switch (code) {
        case "KeyW":
        case "ArrowUp":
          input.forward = down;
          return true;
        case "KeyS":
        case "ArrowDown":
          input.back = down;
          return true;
        case "KeyA":
        case "ArrowLeft":
          input.left = down;
          return true;
        case "KeyD":
        case "ArrowRight":
          input.right = down;
          return true;
        case "Space":
          input.jump = down;
          if (down) input.jumpQueued = true;
          return true;
        case "KeyE":
          if (down) input.interactQueued = true;
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

  return inputRef;
}

export function useDragYaw(yawRef: MutableRefObject<number>, initial = 0) {
  const dragging = useRef(false);
  const lastX = useRef(0);
  useEffect(() => {
    yawRef.current = initial;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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
  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: stop,
    onPointerLeave: stop,
  };
}

/* ------------------------------------------------------------------ */
/* Player                                                              */
/* ------------------------------------------------------------------ */

export interface RigConfig {
  spawn: [number, number, number];
  /** Walkable radius around origin (circular world floor). */
  bounds: number;
  /** Extra raised surfaces: axis-aligned square platforms. */
  platforms?: { x: number; z: number; top: number; size: number }[];
  /** Follow-camera distance/height. */
  camDist?: number;
  camHeight?: number;
  speed?: number;
  /** Robot accent color so each world can tint the visitor. */
  tint?: string;
}

export function PlayerRig({
  inputRef,
  yawRef,
  playerPosRef,
  config,
}: {
  inputRef: MutableRefObject<InputState>;
  yawRef: MutableRefObject<number>;
  playerPosRef: MutableRefObject<Vector3>;
  config: RigConfig;
}) {
  const group = useRef<Group>(null);
  const velY = useRef(0);
  const grounded = useRef(true);
  const heading = useRef(0);
  const { camera } = useThree();

  const support = useCallback(
    (x: number, z: number): number => {
      let h = -Infinity;
      if (Math.hypot(x, z) <= config.bounds) h = 0;
      for (const p of config.platforms ?? []) {
        if (Math.abs(x - p.x) <= p.size && Math.abs(z - p.z) <= p.size) {
          h = Math.max(h, p.top);
        }
      }
      return h;
    },
    [config],
  );

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    if (!group.current) return;
    const pos = group.current.position;
    const inp = inputRef.current;

    let mx = 0;
    let mz = 0;
    if (inp.forward) mz -= 1;
    if (inp.back) mz += 1;
    if (inp.left) mx -= 1;
    if (inp.right) mx += 1;
    const moving = mx !== 0 || mz !== 0;
    if (moving) {
      const len = Math.hypot(mx, mz);
      const speed = config.speed ?? 5.2;
      const sin = Math.sin(yawRef.current);
      const cos = Math.cos(yawRef.current);
      const wx = (mx * cos - mz * sin) / len;
      const wz = (mx * sin + mz * cos) / len;
      pos.x += wx * speed * dt;
      pos.z += wz * speed * dt;
      heading.current = Math.atan2(wx, wz);
    }

    if ((inp.jump || inp.jumpQueued) && grounded.current) {
      velY.current = 7.6;
      grounded.current = false;
    }
    inp.jumpQueued = false;
    velY.current -= 19 * dt;
    const prevY = pos.y;
    pos.y += velY.current * dt;
    const h = support(pos.x, pos.z);
    if (velY.current <= 0 && prevY >= h - 0.01 && pos.y <= h) {
      pos.y = h;
      velY.current = 0;
      grounded.current = true;
    } else if (pos.y > h) {
      grounded.current = false;
    }

    if (pos.y < -14) {
      pos.set(...config.spawn);
      velY.current = 0;
    }

    group.current.rotation.y = MathUtils.lerp(
      group.current.rotation.y,
      heading.current,
      Math.min(dt * 10, 1),
    );
    const bob =
      moving && grounded.current
        ? Math.sin(state.clock.elapsedTime * 12) * 0.06
        : 0;
    group.current.children[0].position.y = 1.05 + bob;

    playerPosRef.current.copy(pos);

    const dist = config.camDist ?? 7;
    const height = config.camHeight ?? 3.2;
    const cx = pos.x + Math.sin(yawRef.current) * dist;
    const cz = pos.z + Math.cos(yawRef.current) * dist;
    camera.position.lerp(
      new Vector3(cx, pos.y + height, cz),
      Math.min(dt * 5, 1),
    );
    camera.lookAt(pos.x, pos.y + 1.2, pos.z);
  });

  const tint = config.tint ?? "#6366f1";

  return (
    <group ref={group} position={config.spawn}>
      <group position={[0, 1.05, 0]}>
        <mesh position={[0, -0.45, 0]}>
          <boxGeometry args={[0.55, 0.5, 0.4]} />
          <meshStandardMaterial color={tint} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.7, 0.55, 0.55]} />
          <meshStandardMaterial color="#c7d2fe" roughness={0.4} />
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
          <meshStandardMaterial color={tint} />
        </mesh>
        <mesh position={[0, 0.7, 0]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.5, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Touch controls (shared HUD)                                         */
/* ------------------------------------------------------------------ */

export function TouchControls({
  inputRef,
}: {
  inputRef: MutableRefObject<InputState>;
}) {
  const handlePress = useCallback(
    (key: "forward" | "back" | "left" | "right", down: boolean) => {
      inputRef.current[key] = down;
    },
    [inputRef],
  );
  const handleJump = useCallback(
    (down: boolean) => {
      inputRef.current.jump = down;
      if (down) inputRef.current.jumpQueued = true;
    },
    [inputRef],
  );
  const btn =
    "h-12 w-12 rounded-xl bg-white/85 text-lg font-black text-slate-800 shadow active:bg-amber-200";
  return (
    <>
      <div className="absolute bottom-4 left-4 flex select-none flex-col items-center gap-1 sm:hidden">
        <button aria-label="Walk forward" className={btn}
          onPointerDown={() => handlePress("forward", true)}
          onPointerUp={() => handlePress("forward", false)}
          onPointerLeave={() => handlePress("forward", false)}>↑</button>
        <div className="flex gap-1">
          <button aria-label="Walk left" className={btn}
            onPointerDown={() => handlePress("left", true)}
            onPointerUp={() => handlePress("left", false)}
            onPointerLeave={() => handlePress("left", false)}>←</button>
          <button aria-label="Walk back" className={btn}
            onPointerDown={() => handlePress("back", true)}
            onPointerUp={() => handlePress("back", false)}
            onPointerLeave={() => handlePress("back", false)}>↓</button>
          <button aria-label="Walk right" className={btn}
            onPointerDown={() => handlePress("right", true)}
            onPointerUp={() => handlePress("right", false)}
            onPointerLeave={() => handlePress("right", false)}>→</button>
        </div>
      </div>
      <button
        aria-label="Jump"
        className="absolute bottom-6 right-4 h-16 w-16 select-none rounded-full bg-emerald-400/90 text-sm font-black text-white shadow-lg active:bg-emerald-500 sm:hidden"
        onPointerDown={() => handleJump(true)}
        onPointerUp={() => handleJump(false)}
        onPointerLeave={() => handleJump(false)}
      >
        JUMP
      </button>
    </>
  );
}

export function KeyLegend({ hint }: { hint?: string }) {
  const kbd =
    "rounded-lg bg-white/90 px-3 py-2 font-mono text-sm font-bold text-slate-800 shadow";
  return (
    <div className="pointer-events-none absolute bottom-4 left-4 hidden select-none sm:block">
      <div className="flex flex-col items-center gap-1">
        <kbd className={kbd}>W</kbd>
        <div className="flex gap-1">
          <kbd className={kbd}>A</kbd>
          <kbd className={kbd}>S</kbd>
          <kbd className={kbd}>D</kbd>
        </div>
        <p className="mt-1 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold text-slate-600">
          {hint ?? "walk · SPACE = jump · drag = look"}
        </p>
      </div>
    </div>
  );
}
