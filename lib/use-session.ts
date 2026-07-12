"use client";

import { useCallback, useEffect, useState } from "react";

export interface SessionUser {
  id: string;
  handle: string;
  color: string;
}

export interface SessionState {
  user: SessionUser | null;
  orbColors: string[];
  loading: boolean;
  error: string | null;
  signup: (handle: string, password: string, color: string) => Promise<boolean>;
  login: (handle: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setColor: (color: string) => Promise<void>;
}

export function useSession(): SessionState {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [orbColors, setOrbColors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (disposed) return;
        setUser(d.user ?? null);
        setOrbColors(Array.isArray(d.orbColors) ? d.orbColors : []);
        setLoading(false);
      })
      .catch(() => {
        if (!disposed) setLoading(false);
      });
    return () => {
      disposed = true;
    };
  }, []);

  const call = useCallback(
    async (path: string, body: object): Promise<boolean> => {
      setError(null);
      try {
        const res = await fetch(path, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(String(data.error ?? "Something went wrong."));
          return false;
        }
        setUser(data.user ?? null);
        return true;
      } catch {
        setError("Network error — try again.");
        return false;
      }
    },
    [],
  );

  const signup = useCallback(
    (handle: string, password: string, color: string) =>
      call("/api/auth/signup", { handle, password, color }),
    [call],
  );
  const login = useCallback(
    (handle: string, password: string) =>
      call("/api/auth/login", { handle, password }),
    [call],
  );
  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);
  const setColor = useCallback(
    async (color: string) => {
      await call("/api/auth/color", { color });
    },
    [call],
  );

  return { user, orbColors, loading, error, signup, login, logout, setColor };
}
