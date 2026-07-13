/**
 * Tiny in-memory per-key sliding-window rate limiter for the auth
 * routes. Single-instance by design, like the rest of the stores.
 */

interface LimiterState {
  buckets: Map<string, number[]>;
}

const g = globalThis as unknown as { __vc247Limiter?: LimiterState };
const state = (g.__vc247Limiter ??= {
  buckets: new Map<string, number[]>(),
});

const gSweep = globalThis as unknown as { __vc247LimiterSweep?: boolean };
if (!gSweep.__vc247LimiterSweep) {
  gSweep.__vc247LimiterSweep = true;
  const sweep = setInterval(
    () => {
      const cutoff = Date.now() - 3_600_000;
      for (const [key, hits] of state.buckets) {
        if (hits.length === 0 || hits[hits.length - 1] < cutoff) {
          state.buckets.delete(key);
        }
      }
    },
    10 * 60_000,
  );
  sweep.unref?.();
}

/** Returns true if this hit is allowed, false if the key is over limit. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (state.buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    state.buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  state.buckets.set(key, hits);
  return true;
}

/** Best-available client IP behind the Railway proxy. */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : "local";
}
