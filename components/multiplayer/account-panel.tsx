"use client";

import { useState } from "react";
import type { SessionState } from "@/lib/use-session";

/**
 * Sign in / sign up + orb color. A small chip at the top-left of every
 * 3D experience; opens a modal. Handle + password only — no email.
 */
export function AccountPanel({ session }: { session: SessionState }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [color, setColor] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const chosenColor = color ?? session.orbColors[0] ?? "#818cf8";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const ok =
      mode === "signup"
        ? await session.signup(handle, password, chosenColor)
        : await session.login(handle, password);
    setBusy(false);
    if (ok) {
      setOpen(false);
      setPassword("");
    }
  };

  if (session.loading) return null;

  return (
    <>
      {/* status chip */}
      <div className="absolute left-4 top-4 z-[6]">
        {session.user ? (
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full bg-black/55 px-3.5 py-2 text-xs font-bold text-white backdrop-blur"
          >
            <span
              className="h-3 w-3 rounded-full"
              style={{
                backgroundColor: session.user.color,
                boxShadow: `0 0 8px ${session.user.color}`,
              }}
            />
            {session.user.handle}
          </button>
        ) : (
          <button
            onClick={() => setOpen(true)}
            className="rounded-full bg-white px-4 py-2 text-xs font-bold text-black shadow-lg"
          >
            Sign in to appear
          </button>
        )}
      </div>

      {open && (
        <div className="absolute inset-0 z-[8] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-zinc-900 p-6 ring-1 ring-white/15">
            {session.user ? (
              <>
                <h2 className="text-lg font-bold text-white">
                  Hey, {session.user.handle}
                </h2>
                <p className="mt-1 text-sm text-white/60">
                  Pick your orb color — it&apos;s how everyone sees you.
                </p>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {session.orbColors.map((c) => (
                    <button
                      key={c}
                      onClick={() => void session.setColor(c)}
                      aria-label={`Orb color ${c}`}
                      className="h-9 w-9 rounded-full transition-transform hover:scale-110"
                      style={{
                        backgroundColor: c,
                        boxShadow:
                          session.user?.color === c
                            ? `0 0 0 3px white, 0 0 14px ${c}`
                            : `0 0 10px ${c}66`,
                      }}
                    />
                  ))}
                </div>
                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => {
                      void session.logout();
                      setOpen(false);
                    }}
                    className="text-xs font-bold text-white/50 hover:text-white"
                  >
                    Sign out
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-lg bg-white px-4 py-2 text-xs font-bold text-black"
                  >
                    Done
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex gap-2">
                  {(["signup", "login"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                        mode === m
                          ? "bg-white text-black"
                          : "bg-white/10 text-white/60"
                      }`}
                    >
                      {m === "signup" ? "Create account" : "Sign in"}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-sm text-white/60">
                  {mode === "signup"
                    ? "Pick a handle, a password, and your orb color. No email needed."
                    : "Welcome back."}
                </p>
                <form onSubmit={submit} className="mt-4 space-y-3">
                  <input
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="Handle (3–20 letters/numbers)"
                    autoComplete="username"
                    className="w-full rounded-lg bg-black/50 px-3 py-2.5 text-sm text-white placeholder-white/35 outline-none ring-1 ring-white/15 focus:ring-white/40"
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password (8+ characters)"
                    autoComplete={
                      mode === "signup" ? "new-password" : "current-password"
                    }
                    className="w-full rounded-lg bg-black/50 px-3 py-2.5 text-sm text-white placeholder-white/35 outline-none ring-1 ring-white/15 focus:ring-white/40"
                  />
                  {mode === "signup" && (
                    <div>
                      <p className="text-xs font-bold text-white/50">
                        Your orb color
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {session.orbColors.map((c) => (
                          <button
                            type="button"
                            key={c}
                            onClick={() => setColor(c)}
                            aria-label={`Orb color ${c}`}
                            className="h-8 w-8 rounded-full transition-transform hover:scale-110"
                            style={{
                              backgroundColor: c,
                              boxShadow:
                                chosenColor === c
                                  ? `0 0 0 3px white, 0 0 12px ${c}`
                                  : `0 0 8px ${c}55`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {session.error && (
                    <p className="text-xs font-bold text-rose-400">
                      {session.error}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="text-xs font-bold text-white/50 hover:text-white"
                    >
                      Not now
                    </button>
                    <button
                      type="submit"
                      disabled={busy}
                      className="rounded-lg bg-white px-5 py-2 text-xs font-bold text-black disabled:opacity-50"
                    >
                      {busy
                        ? "…"
                        : mode === "signup"
                          ? "Create & enter"
                          : "Sign in"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
