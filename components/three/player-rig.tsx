"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type MutableRefObject,
} from "react";

/** Reactive media-query without setState-in-effect. */
function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
import { useFrame, useThree } from "@react-three/fiber";
import { Euler, MathUtils, Quaternion, Vector3 } from "three";

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
  /** Analog move vector from the touch joystick, each in [-1, 1]. */
  analogX: number;
  analogZ: number;
}

export function useWorldInput(): MutableRefObject<InputState> {
  const inputRef = useRef<InputState>({
    forward: false,
    back: false,
    left: false,
    right: false,
    jump: false,
    jumpQueued: false,
    analogX: 0,
    analogZ: 0,
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
        default:
          return false;
      }
    };
    const isTyping = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      return !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA");
    };
    const onDown = (e: KeyboardEvent) => {
      if (isTyping(e)) return;
      if (set(e.code, true)) e.preventDefault();
    };
    const onUp = (e: KeyboardEvent) => {
      if (isTyping(e)) return;
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

/* ------------------------------------------------------------------ */
/* Look: pointer-lock mouse on desktop, drag fallback on touch         */
/* ------------------------------------------------------------------ */

const PITCH_LIMIT = 1.35;

export function useMouseLook(
  containerRef: MutableRefObject<HTMLDivElement | null>,
  yawRef: MutableRefObject<number>,
  pitchRef: MutableRefObject<number>,
  initialYaw: number,
) {
  const [locked, setLocked] = useState(false);
  const finePointer = useMediaQuery("(pointer: fine)");
  const touchId = useRef<number | null>(null);
  const lastTouch = useRef<[number, number]>([0, 0]);

  useEffect(() => {
    yawRef.current = initialYaw;
    pitchRef.current = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onLockChange = () =>
      setLocked(document.pointerLockElement === el);
    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== el) return;
      yawRef.current -= e.movementX * 0.0024;
      pitchRef.current = MathUtils.clamp(
        pitchRef.current - e.movementY * 0.0024,
        -PITCH_LIMIT,
        PITCH_LIMIT,
      );
    };
    const onClick = (e: MouseEvent) => {
      // don't steal the pointer when clicking real UI (signs, buttons)
      const target = e.target as HTMLElement;
      if (target.closest("a,button")) return;
      if (
        window.matchMedia("(pointer: fine)").matches &&
        document.pointerLockElement !== el
      ) {
        el.requestPointerLock();
      }
    };

    // touch drag-look fallback (used when gyro is off/denied)
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      const target = e.target as HTMLElement;
      if (target.closest("a,button,[data-joystick]")) return;
      if (touchId.current === null) {
        touchId.current = e.pointerId;
        lastTouch.current = [e.clientX, e.clientY];
      }
    };
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerId !== touchId.current) return;
      const [lx, ly] = lastTouch.current;
      lastTouch.current = [e.clientX, e.clientY];
      yawRef.current -= (e.clientX - lx) * 0.005;
      pitchRef.current = MathUtils.clamp(
        pitchRef.current - (e.clientY - ly) * 0.005,
        -PITCH_LIMIT,
        PITCH_LIMIT,
      );
    };
    const onPointerEnd = (e: PointerEvent) => {
      if (e.pointerId === touchId.current) touchId.current = null;
    };

    document.addEventListener("pointerlockchange", onLockChange);
    document.addEventListener("mousemove", onMouseMove);
    el.addEventListener("click", onClick);
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerEnd);
    el.addEventListener("pointercancel", onPointerEnd);
    return () => {
      document.removeEventListener("pointerlockchange", onLockChange);
      document.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("click", onClick);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerEnd);
      el.removeEventListener("pointercancel", onPointerEnd);
    };
  }, [containerRef, yawRef, pitchRef]);

  return { locked, finePointer };
}

/* ------------------------------------------------------------------ */
/* Gyro look — move the phone to look around (AR-style)                */
/* ------------------------------------------------------------------ */

export interface GyroData {
  active: boolean;
  hasData: boolean;
  alpha: number;
  beta: number;
  gamma: number;
  orient: number;
}

export function useGyroLook() {
  const gyroRef = useRef<GyroData>({
    active: false,
    hasData: false,
    alpha: 0,
    beta: 0,
    gamma: 0,
    orient: 0,
  });
  const [active, setActive] = useState(false);
  const coarsePointer = useMediaQuery("(pointer: coarse)");
  const supported =
    coarsePointer &&
    typeof window !== "undefined" &&
    "DeviceOrientationEvent" in window;
  const detach = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => detach.current?.();
  }, []);

  const request = useCallback(async () => {
    if (gyroRef.current.active || !("DeviceOrientationEvent" in window)) {
      return;
    }
    try {
      const D = DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<string>;
      };
      if (typeof D.requestPermission === "function") {
        const result = await D.requestPermission();
        if (result !== "granted") return;
      }
      const onOrient = (e: DeviceOrientationEvent) => {
        if (e.alpha === null) return;
        const g = gyroRef.current;
        g.alpha = e.alpha;
        g.beta = e.beta ?? 0;
        g.gamma = e.gamma ?? 0;
        g.orient = window.screen.orientation?.angle ?? 0;
        g.hasData = true;
      };
      window.addEventListener("deviceorientation", onOrient);
      detach.current = () =>
        window.removeEventListener("deviceorientation", onOrient);
      gyroRef.current.active = true;
      setActive(true);
    } catch {
      /* permission denied — drag-look fallback stays available */
    }
  }, []);

  return { gyroRef, active, supported, request };
}

/* Device orientation → camera quaternion (three.js DeviceOrientationControls math) */
const zee = new Vector3(0, 0, 1);
const worldY = new Vector3(0, 1, 0);
const tmpEuler = new Euler();
const q0 = new Quaternion();
const qScreen = new Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
const tmpFwd = new Vector3();
const qYawFix = new Quaternion();

function deviceQuaternion(out: Quaternion, g: GyroData) {
  const alpha = MathUtils.degToRad(g.alpha);
  const beta = MathUtils.degToRad(g.beta);
  const gamma = MathUtils.degToRad(g.gamma);
  const orient = MathUtils.degToRad(g.orient);
  tmpEuler.set(beta, alpha, -gamma, "YXZ");
  out.setFromEuler(tmpEuler);
  out.multiply(qScreen);
  out.multiply(q0.setFromAxisAngle(zee, -orient));
  return out;
}

function yawOf(q: Quaternion): number {
  tmpFwd.set(0, 0, -1).applyQuaternion(q);
  return Math.atan2(-tmpFwd.x, -tmpFwd.z);
}

/* ------------------------------------------------------------------ */
/* First-person player                                                 */
/* ------------------------------------------------------------------ */

const EYE_HEIGHT = 1.55;

export interface RigConfig {
  spawn: [number, number, number];
  /** Walkable radius around origin (circular world floor). */
  bounds: number;
  /** Extra raised surfaces: axis-aligned square platforms. */
  platforms?: { x: number; z: number; top: number; size: number }[];
  speed?: number;
}

export function PlayerRig({
  inputRef,
  yawRef,
  pitchRef,
  gyroRef,
  playerPosRef,
  config,
}: {
  inputRef: MutableRefObject<InputState>;
  yawRef: MutableRefObject<number>;
  pitchRef: MutableRefObject<number>;
  gyroRef?: MutableRefObject<GyroData>;
  playerPosRef: MutableRefObject<Vector3>;
  config: RigConfig;
}) {
  const posRef = useRef(new Vector3(...config.spawn));
  const velY = useRef(0);
  const grounded = useRef(true);
  const gyroQuat = useRef(new Quaternion());
  const gyroPhi = useRef<number | null>(null);
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

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const pos = posRef.current;
    const inp = inputRef.current;

    // ---- look ----
    const g = gyroRef?.current;
    if (g?.active && g.hasData) {
      deviceQuaternion(gyroQuat.current, g);
      if (gyroPhi.current === null) {
        // calibrate so your current facing is preserved when gyro kicks in
        gyroPhi.current = yawRef.current - yawOf(gyroQuat.current);
      }
      qYawFix.setFromAxisAngle(worldY, gyroPhi.current);
      camera.quaternion.copy(qYawFix).multiply(gyroQuat.current);
      yawRef.current = yawOf(camera.quaternion);
    } else {
      camera.rotation.set(pitchRef.current, yawRef.current, 0, "YXZ");
    }

    // ---- move (camera-relative) ----
    let mx = (inp.left ? -1 : 0) + (inp.right ? 1 : 0) + inp.analogX;
    let mz = (inp.forward ? -1 : 0) + (inp.back ? 1 : 0) + inp.analogZ;
    const len = Math.hypot(mx, mz);
    if (len > 1) {
      mx /= len;
      mz /= len;
    }
    if (len > 0.01) {
      const speed = config.speed ?? 5.2;
      const theta = yawRef.current;
      const sin = Math.sin(theta);
      const cos = Math.cos(theta);
      pos.x += (mx * cos + mz * sin) * speed * dt;
      pos.z += (mz * cos - mx * sin) * speed * dt;
    }

    // ---- jump + gravity ----
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

    playerPosRef.current.copy(pos);
    camera.position.set(pos.x, pos.y + EYE_HEIGHT, pos.z);
  });

  return null;
}

/* ------------------------------------------------------------------ */
/* HUD pieces                                                          */
/* ------------------------------------------------------------------ */

/** Left-thumb virtual joystick + right-thumb jump (touch only). */
export function TouchControls({
  inputRef,
}: {
  inputRef: MutableRefObject<InputState>;
}) {
  const [knob, setKnob] = useState<{ x: number; y: number } | null>(null);
  const originRef = useRef<{ x: number; y: number } | null>(null);
  const RADIUS = 52;

  const onDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    originRef.current = { x: e.clientX, y: e.clientY };
    setKnob({ x: 0, y: 0 });
  }, []);
  const onMove = useCallback(
    (e: React.PointerEvent) => {
      if (!originRef.current) return;
      e.stopPropagation();
      let dx = e.clientX - originRef.current.x;
      let dy = e.clientY - originRef.current.y;
      const d = Math.hypot(dx, dy);
      if (d > RADIUS) {
        dx = (dx / d) * RADIUS;
        dy = (dy / d) * RADIUS;
      }
      inputRef.current.analogX = dx / RADIUS;
      inputRef.current.analogZ = dy / RADIUS;
      setKnob({ x: dx, y: dy });
    },
    [inputRef],
  );
  const onEnd = useCallback(() => {
    originRef.current = null;
    inputRef.current.analogX = 0;
    inputRef.current.analogZ = 0;
    setKnob(null);
  }, [inputRef]);

  const handleJump = useCallback(
    (down: boolean) => {
      inputRef.current.jump = down;
      if (down) inputRef.current.jumpQueued = true;
    },
    [inputRef],
  );

  return (
    <>
      {/* left-thumb joystick */}
      <div
        data-joystick
        className="absolute bottom-6 left-6 h-32 w-32 touch-none select-none rounded-full border-2 border-white/25 bg-white/10 backdrop-blur-sm sm:hidden"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onEnd}
        onPointerCancel={onEnd}
      >
        <div
          className="absolute left-1/2 top-1/2 h-14 w-14 rounded-full bg-white/70 shadow-lg"
          style={{
            transform: `translate(calc(-50% + ${knob?.x ?? 0}px), calc(-50% + ${knob?.y ?? 0}px))`,
          }}
        />
        {!knob && (
          <p className="absolute inset-x-0 top-full mt-1.5 text-center text-[10px] font-bold text-white/60">
            walk
          </p>
        )}
      </div>
      {/* right-thumb jump */}
      <button
        aria-label="Jump"
        className="absolute bottom-8 right-6 h-16 w-16 select-none rounded-full bg-white/20 text-xs font-black text-white backdrop-blur-sm active:bg-white/40 sm:hidden"
        onPointerDown={() => handleJump(true)}
        onPointerUp={() => handleJump(false)}
        onPointerLeave={() => handleJump(false)}
      >
        JUMP
      </button>
    </>
  );
}

/** Small centered dot shown while the pointer is locked. */
export function Crosshair({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80 shadow-[0_0_6px_rgba(0,0,0,0.6)]" />
  );
}

/** "Move your phone to look" opt-in, shown on touch devices until enabled. */
export function GyroButton({
  supported,
  active,
  onEnable,
}: {
  supported: boolean;
  active: boolean;
  onEnable: () => void;
}) {
  if (!supported || active) return null;
  return (
    <button
      onClick={onEnable}
      className="absolute right-4 top-4 rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-white backdrop-blur transition-colors active:bg-white/30 sm:hidden"
    >
      📱 Move phone to look
    </button>
  );
}

/**
 * Eyelid blink — you're not watching an avatar, you ARE the avatar.
 * Opens like waking up on mount, then blinks occasionally.
 */
export function BlinkOverlay() {
  const [closed, setClosed] = useState(true);

  useEffect(() => {
    // Open once on mount like waking up, then stay open (recurring blink disabled).
    const timer = setTimeout(() => setClosed(false), 450);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ zIndex: 17000000 }}
      aria-hidden
    >
      <div
        className="absolute -left-[10%] h-[55%] w-[120%] bg-black transition-transform duration-200 ease-in-out"
        style={{
          top: 0,
          borderBottomLeftRadius: "50% 30%",
          borderBottomRightRadius: "50% 30%",
          transform: closed ? "translateY(0)" : "translateY(-101%)",
        }}
      />
      <div
        className="absolute -left-[10%] h-[55%] w-[120%] bg-black transition-transform duration-200 ease-in-out"
        style={{
          bottom: 0,
          borderTopLeftRadius: "50% 30%",
          borderTopRightRadius: "50% 30%",
          transform: closed ? "translateY(0)" : "translateY(101%)",
        }}
      />
    </div>
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
        <p className="mt-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white/80">
          {hint ?? "move · mouse = look · SPACE = jump · ESC = cursor"}
        </p>
      </div>
    </div>
  );
}
