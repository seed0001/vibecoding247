const tones = {
  neutral: "border-border-strong text-muted",
  accent: "border-accent/40 text-accent",
  positive: "border-positive/40 text-positive",
  warning: "border-warning/40 text-warning",
  critical: "border-critical/40 text-critical",
} as const;

export type PillTone = keyof typeof tones;

export function Pill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: PillTone;
}) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
