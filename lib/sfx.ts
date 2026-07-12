/**
 * Tiny synthesized sound effects for the First Steps playground.
 * Everything is generated with the Web Audio API — no audio files.
 * The context is created lazily on the first play (always after a user
 * gesture like a key press, so autoplay policies are satisfied).
 */

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null; // no audio support — play silently
  }
}

interface ToneOpts {
  /** start frequency in Hz */
  from: number;
  /** end frequency (glide), defaults to `from` */
  to?: number;
  /** seconds */
  dur: number;
  type?: OscillatorType;
  /** peak gain 0..1 */
  vol?: number;
  /** seconds from now to start */
  at?: number;
}

function tone({ from, to, dur, type = "sine", vol = 0.15, at = 0 }: ToneOpts) {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + at;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t0);
  osc.frequency.exponentialRampToValueAtTime(to ?? from, t0 + dur);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export const sfx = {
  /** springy rising boing */
  jump() {
    tone({ from: 220, to: 520, dur: 0.16, type: "triangle", vol: 0.14 });
  },

  /** classic two-note coin sparkle */
  collect() {
    tone({ from: 988, dur: 0.09, type: "square", vol: 0.08 });
    tone({ from: 1319, dur: 0.22, type: "square", vol: 0.08, at: 0.08 });
  },

  /** cheerful two-note chirp; pitch varies per creature */
  critter(pitch = 1) {
    tone({ from: 520 * pitch, to: 780 * pitch, dur: 0.1, vol: 0.12 });
    tone({ from: 700 * pitch, to: 900 * pitch, dur: 0.14, vol: 0.12, at: 0.12 });
  },

  /** quiet single peep for idle creatures nearby */
  peep(pitch = 1) {
    tone({ from: 620 * pitch, to: 820 * pitch, dur: 0.08, vol: 0.04 });
  },

  /** falling whoosh, then a soft pop back at spawn */
  respawn() {
    tone({ from: 420, to: 90, dur: 0.5, type: "sawtooth", vol: 0.06 });
    tone({ from: 330, to: 660, dur: 0.18, type: "triangle", vol: 0.1, at: 0.55 });
  },

  /** warm chime for stepping into a lesson ring */
  gate() {
    tone({ from: 523, dur: 0.3, vol: 0.1 });
    tone({ from: 659, dur: 0.3, vol: 0.1, at: 0.1 });
    tone({ from: 784, dur: 0.45, vol: 0.1, at: 0.2 });
  },
};
