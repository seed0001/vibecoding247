import type { Level } from "@/lib/types";

const styles: Record<Level, string> = {
  Foundations: "bg-emerald-50 text-emerald-800 border-emerald-200",
  Intermediate: "bg-blue-50 text-blue-800 border-blue-200",
  Advanced: "bg-amber-50 text-amber-900 border-amber-200",
};

export function LevelBadge({ level }: { level: Level }) {
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[level]}`}
    >
      {level}
    </span>
  );
}
