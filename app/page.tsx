import { courses } from "@/lib/data/courses";
import { Onboarding } from "@/components/onboarding";

export default function HomePage() {
  const summaries = courses.map(({ slug, title, description }) => ({
    slug,
    title,
    description,
  }));

  return <Onboarding courses={summaries} />;
}
