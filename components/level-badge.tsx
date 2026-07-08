import type { Level } from "@/lib/types";

const styles: Record<Level, string> = {
  Foundations: "bg-emerald-400/15 text-emerald-300 border-emerald-400/40",
  Intermediate: "bg-cyan-400/15 text-cyan-300 border-cyan-400/40",
  Advanced: "bg-amber-400/15 text-amber-300 border-amber-400/40",
};

export function LevelBadge({ level }: { level: Level }) {
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[level]}`}
    >
      {level}
    </span>
  );
}
