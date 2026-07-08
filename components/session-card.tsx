import Link from "next/link";
import type { LiveSession } from "@/lib/types";
import { getCourse } from "@/lib/data/courses";

const dateFmt = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "long",
  day: "numeric",
  timeZone: "America/New_York",
});

const timeFmt = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/New_York",
  timeZoneName: "short",
});

export function SessionCard({ session }: { session: LiveSession }) {
  const start = new Date(session.startsAt);
  const course = session.courseSlug ? getCourse(session.courseSlug) : null;

  return (
    <article className="rounded-lg border border-border bg-background p-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-subtle">
        <time dateTime={session.startsAt} className="font-medium text-accent">
          {dateFmt.format(start)} · {timeFmt.format(start)}
        </time>
        <span>·</span>
        <span>{session.durationMinutes} min</span>
        <span>·</span>
        <span>{session.format}</span>
      </div>
      <h3 className="mt-2 text-lg font-semibold">{session.title}</h3>
      {course && (
        <p className="mt-0.5 text-sm text-subtle">
          Part of{" "}
          <Link
            href={`/courses/${course.slug}`}
            className="text-accent underline-offset-2 hover:underline"
          >
            {course.title}
          </Link>
        </p>
      )}
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {session.description}
      </p>
    </article>
  );
}
