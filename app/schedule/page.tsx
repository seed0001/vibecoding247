import type { Metadata } from "next";
import { sessions } from "@/lib/data/sessions";
import { SessionCard } from "@/components/session-card";

export const metadata: Metadata = {
  title: "Live Class Schedule",
  description:
    "Upcoming live lectures, workshops, code reviews, and office hours at Vibe Coding 24/7.",
};

export default function SchedulePage() {
  const ordered = [...sessions].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  );

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        Live class schedule
      </h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted">
        Live instruction runs weekly: lectures, hands-on workshops, code
        reviews, and open office hours. Times are shown in Eastern Time.
        Enrollment and session registration are coming soon.
      </p>

      <div className="mt-10 space-y-5">
        {ordered.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
    </div>
  );
}
