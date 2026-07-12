"use client";

import { Component, type ReactNode } from "react";

/**
 * If a 3D chunk fails to load or crashes on mount (flaky network,
 * mid-deploy chunk swap), show a reload button instead of hanging on
 * the loading text forever.
 */
export class CanvasBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-black text-center">
          <p className="text-sm text-white/60">
            The world didn&apos;t load — usually a hiccup mid-update.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-black"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
