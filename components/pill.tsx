const tones = {
  violet: "bg-accent/15 text-accent",
  cyan: "bg-accent-2/15 text-accent-2",
  pink: "bg-pink/15 text-pink",
  amber: "bg-amber/15 text-amber",
} as const;

export type PillTone = keyof typeof tones;

export function Pill({
  children,
  tone = "violet",
}: {
  children: React.ReactNode;
  tone?: PillTone;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
