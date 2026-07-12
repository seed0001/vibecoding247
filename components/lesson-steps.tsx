"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FirstStepsSection } from "@/lib/data/first-steps";

interface Step {
  heading: string;
  text: string;
  tryIt: boolean;
}

function buildSteps(sections: FirstStepsSection[]): Step[] {
  return sections.flatMap((section) => [
    ...section.paragraphs.map((text) => ({
      heading: section.heading,
      text,
      tryIt: false,
    })),
    ...(section.tryIt
      ? [{ heading: section.heading, text: section.tryIt, tryIt: true }]
      : []),
  ]);
}

/**
 * One small card at a time, with big buttons and a "read to me" voice —
 * so early readers can do lessons without a wall of text.
 */
export function LessonSteps({
  sections,
  color,
}: {
  sections: FirstStepsSection[];
  color: string;
}) {
  const [steps] = useState<Step[]>(() => buildSteps(sections));
  const [index, setIndex] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  const autoRead = useRef(false);

  const step = steps[index];

  useEffect(() => {
    setCanSpeak("speechSynthesis" in window);
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  const stop = useCallback(() => {
    autoRead.current = false;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback((s: Step) => {
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(
      s.tryIt ? `Try it! ${s.text}` : s.text,
    );
    u.rate = 0.95;
    u.pitch = 1.05;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(u);
  }, []);

  const readCurrent = useCallback(() => {
    autoRead.current = true;
    speak(steps[index]);
  }, [speak, steps, index]);

  const go = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(steps.length - 1, next));
      setIndex(clamped);
      // keep reading aloud as they page through, until they press stop
      if (autoRead.current && "speechSynthesis" in window) {
        speak(steps[clamped]);
      }
    },
    [steps, speak],
  );

  return (
    <div>
      {/* progress */}
      <div className="flex items-center gap-3">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${((index + 1) / steps.length) * 100}%`,
              backgroundColor: color,
            }}
          />
        </div>
        <p className="shrink-0 text-sm font-extrabold text-slate-500">
          {index + 1} / {steps.length}
        </p>
      </div>

      {/* the card */}
      <div
        className={`mt-5 rounded-2xl p-6 sm:p-8 ${
          step.tryIt
            ? "border-2 border-dashed border-amber-400 bg-amber-100/70"
            : "bg-white/80 shadow-sm"
        }`}
      >
        <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          {step.tryIt ? "⭐ Try it!" : step.heading}
        </p>
        <p className="mt-3 text-xl font-medium leading-relaxed text-slate-800 sm:text-2xl">
          {step.text}
        </p>
      </div>

      {/* controls */}
      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => go(index - 1)}
          disabled={index === 0}
          className="rounded-full bg-slate-200 px-5 py-3 text-sm font-extrabold text-slate-700 transition-colors hover:bg-slate-300 disabled:opacity-40"
        >
          ← Back
        </button>

        {canSpeak && (
          <button
            type="button"
            onClick={speaking ? stop : readCurrent}
            className={`rounded-full px-6 py-3 text-sm font-extrabold text-white shadow-md transition-colors ${
              speaking
                ? "bg-rose-500 hover:bg-rose-600"
                : "bg-indigo-500 hover:bg-indigo-600"
            }`}
          >
            {speaking ? "⏹ Stop" : "🔊 Read to me"}
          </button>
        )}

        <button
          type="button"
          onClick={() => go(index + 1)}
          disabled={index === steps.length - 1}
          className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-extrabold text-white shadow-md transition-colors hover:bg-emerald-600 disabled:opacity-40"
        >
          Next →
        </button>
      </div>

      {index === steps.length - 1 && (
        <p className="mt-4 text-center text-sm font-extrabold text-emerald-600">
          🎉 You finished this island — pick your next one below!
        </p>
      )}
    </div>
  );
}
