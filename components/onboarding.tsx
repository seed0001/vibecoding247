"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mascot } from "@/components/mascot";
import {
  AGE_OPTIONS,
  KNOWLEDGE_OPTIONS,
  PATH_FOR_LEVEL,
  clearProfile,
  loadProfile,
  saveProfile,
  type AgeGroup,
  type KnowledgeLevel,
  type LearnerProfile,
} from "@/lib/profile";

type Step = "greet" | "name" | "age" | "knowledge" | "result";

interface CourseSummary {
  slug: string;
  title: string;
  description: string;
}

function useTypewriter(text: string, speed = 22) {
  const [state, setState] = useState({ text, count: 0 });
  // reset during render when the target text changes (React's
  // "adjust state when props change" pattern)
  if (state.text !== text) {
    setState({ text, count: 0 });
  }
  useEffect(() => {
    const timer = setInterval(() => {
      setState((s) => {
        if (s.count >= s.text.length) {
          clearInterval(timer);
          return s;
        }
        return { ...s, count: s.count + 1 };
      });
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);
  const shown = state.text.slice(0, state.count);
  return { shown, done: state.count >= state.text.length };
}

function SpeechBubble({ text }: { text: string }) {
  const { shown } = useTypewriter(text);
  return (
    <div className="relative max-w-xl rounded-3xl border border-border bg-card px-6 py-5 text-lg leading-relaxed shadow-[0_0_40px_rgba(139,92,246,0.25)]">
      <span
        className="absolute -top-2 left-10 h-4 w-4 rotate-45 border-l border-t border-border bg-card"
        aria-hidden
      />
      {shown}
      <span className="animate-glow text-accent-2">▍</span>
    </div>
  );
}

function ChoiceButton({
  onClick,
  emoji,
  label,
  detail,
}: {
  onClick: () => void;
  emoji: string;
  label: string;
  detail?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="animate-pop w-full rounded-2xl border-2 border-border bg-card px-5 py-4 text-left transition-all hover:-translate-y-0.5 hover:border-accent-2 hover:shadow-[0_0_24px_rgba(34,211,238,0.35)]"
    >
      <span className="flex items-center gap-3">
        <span className="text-2xl" aria-hidden>
          {emoji}
        </span>
        <span>
          <span className="block font-bold">{label}</span>
          {detail && <span className="block text-sm text-subtle">{detail}</span>}
        </span>
      </span>
    </button>
  );
}

export function Onboarding({ courses }: { courses: CourseSummary[] }) {
  const [step, setStep] = useState<Step>("greet");
  const [name, setName] = useState("");
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null);
  const [knowledgeLevel, setKnowledgeLevel] = useState<KnowledgeLevel | null>(null);
  const [returning, setReturning] = useState(false);

  // localStorage is only readable after mount (SSR renders the greet
  // step), so this post-mount state sync is unavoidable here.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const existing = loadProfile();
    if (existing) {
      setName(existing.name);
      setAgeGroup(existing.ageGroup);
      setKnowledgeLevel(existing.knowledgeLevel);
      setReturning(true);
      setStep("result");
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const finish = (level: KnowledgeLevel) => {
    setKnowledgeLevel(level);
    if (ageGroup) {
      const profile: LearnerProfile = { name, ageGroup, knowledgeLevel: level };
      saveProfile(profile);
    }
    setStep("result");
  };

  const restart = () => {
    clearProfile();
    setName("");
    setAgeGroup(null);
    setKnowledgeLevel(null);
    setReturning(false);
    setStep("greet");
  };

  const friendly = name.trim() ? name.trim() : "friend";
  const recommended =
    knowledgeLevel &&
    courses.find((c) => c.slug === PATH_FOR_LEVEL[knowledgeLevel]);

  return (
    <section className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      {/* twinkling stars */}
      <span className="animate-twinkle absolute left-[12%] top-[18%] text-2xl" aria-hidden>✦</span>
      <span className="animate-twinkle absolute right-[14%] top-[30%] text-xl [animation-delay:0.8s]" aria-hidden>✦</span>
      <span className="animate-twinkle absolute left-[20%] bottom-[22%] text-xl [animation-delay:1.4s]" aria-hidden>✦</span>
      <span className="animate-twinkle absolute right-[22%] bottom-[14%] text-2xl [animation-delay:0.4s]" aria-hidden>✦</span>

      <Mascot />

      {step === "greet" && (
        <>
          <SpeechBubble text="Hi! I'm Byte, your guide to the world of vibe coding! Ready for an adventure? Let's find the perfect starting point for you." />
          <button
            onClick={() => setStep("name")}
            className="animate-pop rounded-2xl bg-accent px-8 py-4 text-lg font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]"
          >
            Let&apos;s go! 🎮
          </button>
        </>
      )}

      {step === "name" && (
        <>
          <SpeechBubble text="Awesome! First things first — what should I call you?" />
          <form
            className="animate-pop flex w-full max-w-md gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              setStep("age");
            }}
          >
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
              placeholder="Type your name…"
              className="w-full rounded-2xl border-2 border-border bg-card px-5 py-4 text-lg outline-none transition-colors placeholder:text-subtle focus:border-accent-2"
            />
            <button
              type="submit"
              className="rounded-2xl bg-accent px-6 py-4 font-bold text-white transition-colors hover:bg-accent-hover"
            >
              →
            </button>
          </form>
          <button
            onClick={() => setStep("age")}
            className="text-sm text-subtle underline-offset-4 hover:text-foreground hover:underline"
          >
            Skip this
          </button>
        </>
      )}

      {step === "age" && (
        <>
          <SpeechBubble
            text={
              name.trim()
                ? `Nice to meet you, ${friendly}! How many trips around the sun have you taken?`
                : "Nice to meet you! How many trips around the sun have you taken?"
            }
          />
          <div className="grid w-full max-w-md gap-3">
            {AGE_OPTIONS.map((opt) => (
              <ChoiceButton
                key={opt.value}
                emoji={opt.emoji}
                label={opt.label}
                onClick={() => {
                  setAgeGroup(opt.value);
                  setStep("knowledge");
                }}
              />
            ))}
          </div>
        </>
      )}

      {step === "knowledge" && (
        <>
          <SpeechBubble text="Last question, and it's the big one: when it comes to AI, what's your experience level?" />
          <div className="grid w-full max-w-md gap-3">
            {KNOWLEDGE_OPTIONS.map((opt) => (
              <ChoiceButton
                key={opt.value}
                emoji={opt.emoji}
                label={opt.label}
                detail={opt.detail}
                onClick={() => finish(opt.value)}
              />
            ))}
          </div>
        </>
      )}

      {step === "result" && recommended && (
        <>
          <SpeechBubble
            text={
              returning
                ? `Welcome back, ${friendly}! Your adventure continues right where you left off.`
                : `Perfect, ${friendly}! I found your starting point. This path is going to be great for you!`
            }
          />
          <div className="animate-pop w-full max-w-xl rounded-3xl border-2 border-accent bg-card p-8 text-left shadow-[0_0_50px_rgba(139,92,246,0.3)]">
            <p className="text-sm font-bold uppercase tracking-wider text-accent-2">
              ⭐ Your learning path
            </p>
            <h2 className="mt-2 text-2xl font-bold">{recommended.title}</h2>
            <p className="mt-3 leading-relaxed text-muted">
              {recommended.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/courses/${recommended.slug}`}
                className="rounded-2xl bg-accent px-6 py-3 font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]"
              >
                Start my adventure →
              </Link>
              <Link
                href="/courses"
                className="rounded-2xl border-2 border-border px-6 py-3 font-bold transition-colors hover:border-accent-2 hover:text-accent-2"
              >
                See all paths
              </Link>
            </div>
          </div>
          <button
            onClick={restart}
            className="text-sm text-subtle underline-offset-4 hover:text-foreground hover:underline"
          >
            Not you? Start over
          </button>
        </>
      )}
    </section>
  );
}
