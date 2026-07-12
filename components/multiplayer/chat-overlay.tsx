"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/use-presence";
import type { VoiceStatus } from "@/lib/voice-engine";

/**
 * Room chat. Press T (or tap the bubble) to talk; ESC closes.
 * Recent messages fade in above the input.
 */
export function ChatOverlay({
  chat,
  sendChat,
  connected,
  signedIn,
  voiceStatus,
  micMuted,
  joinVoice,
  leaveVoice,
  toggleMute,
}: {
  chat: ChatMessage[];
  sendChat: (text: string) => void;
  connected: boolean;
  signedIn: boolean;
  voiceStatus: VoiceStatus;
  micMuted: boolean;
  joinVoice: () => void;
  leaveVoice: () => void;
  toggleMute: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA";
      if (e.code === "KeyT" && !typing && signedIn) {
        e.preventDefault();
        setOpen(true);
      } else if (e.code === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, signedIn]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [chat]);

  const recent = chat.slice(-8);

  const voiceOn = voiceStatus === "on" || voiceStatus === "listen";

  return (
    <div className="absolute bottom-4 right-4 z-[6] flex w-72 flex-col items-end gap-2 sm:bottom-6 sm:right-6">
      {signedIn && connected && (
        <div className="flex items-center gap-1.5">
          {!voiceOn ? (
            <button
              onClick={joinVoice}
              disabled={voiceStatus === "connecting"}
              className="rounded-full bg-emerald-500/90 px-4 py-2 text-xs font-bold text-white shadow-lg backdrop-blur transition-colors hover:bg-emerald-500 disabled:opacity-60"
            >
              {voiceStatus === "connecting" ? "Joining…" : "🎙 Join voice"}
            </button>
          ) : (
            <>
              {voiceStatus === "listen" ? (
                <span className="rounded-full bg-black/55 px-3 py-2 text-[11px] font-bold text-amber-300 backdrop-blur">
                  👂 Listening (mic blocked)
                </span>
              ) : (
                <button
                  onClick={toggleMute}
                  className={`rounded-full px-4 py-2 text-xs font-bold shadow-lg backdrop-blur transition-colors ${
                    micMuted
                      ? "bg-rose-500/90 text-white hover:bg-rose-500"
                      : "bg-black/55 text-white hover:bg-black/75"
                  }`}
                >
                  {micMuted ? "🔇 Unmute" : "🎙 Mute"}
                </button>
              )}
              <button
                onClick={leaveVoice}
                className="rounded-full bg-black/55 px-3 py-2 text-[11px] font-bold text-white/60 backdrop-blur hover:text-white"
              >
                Leave
              </button>
            </>
          )}
        </div>
      )}
      {(open || recent.length > 0) && (
        <div
          ref={listRef}
          className="max-h-48 w-full space-y-1 overflow-y-auto rounded-xl bg-black/55 p-2.5 backdrop-blur"
        >
          {recent.length === 0 && (
            <p className="text-[11px] text-white/40">
              Say something — everyone in this realm hears you.
            </p>
          )}
          {recent.map((m, i) => (
            <p key={`${m.ts}-${i}`} className="text-[12px] leading-snug text-white/90">
              <span className="font-bold" style={{ color: m.color }}>
                {m.self ? "you" : m.handle}
              </span>{" "}
              {m.text}
            </p>
          ))}
        </div>
      )}
      {open ? (
        <form
          className="flex w-full gap-1.5"
          onSubmit={(e) => {
            e.preventDefault();
            sendChat(draft);
            setDraft("");
          }}
        >
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={280}
            placeholder={connected ? "Say hi…" : "Connecting…"}
            className="min-w-0 flex-1 rounded-lg bg-black/70 px-3 py-2 text-sm text-white placeholder-white/40 outline-none ring-1 ring-white/20 backdrop-blur focus:ring-white/50"
          />
          <button
            type="submit"
            className="rounded-lg bg-white px-3 text-xs font-bold text-black"
          >
            Send
          </button>
        </form>
      ) : (
        signedIn && (
          <button
            onClick={() => setOpen(true)}
            className="rounded-full bg-black/55 px-4 py-2 text-xs font-bold text-white/80 backdrop-blur transition-colors hover:text-white"
          >
            💬 Chat <span className="hidden text-white/40 sm:inline">— T</span>
          </button>
        )
      )}
    </div>
  );
}
