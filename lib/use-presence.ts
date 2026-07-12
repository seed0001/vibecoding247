"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import type { Vector3 } from "three";

export interface Peer {
  id: string;
  handle: string;
  color: string;
  /** latest network position: x, y, z, yaw */
  target: [number, number, number, number];
}

export interface ChatMessage {
  id: string;
  handle: string;
  color: string;
  text: string;
  ts: number;
  self?: boolean;
}

const POS_INTERVAL_MS = 100;
const MAX_CHAT = 60;

/**
 * Connects to the presence server for one room. Peer positions are
 * mutated in peersRef at network rate (read them from useFrame);
 * peerList re-renders the orb list on membership changes.
 */
export function usePresence(
  room: string,
  enabled: boolean,
  playerPosRef: MutableRefObject<Vector3>,
  yawRef: MutableRefObject<number>,
) {
  const peersRef = useRef<Map<string, Peer>>(new Map());
  const [peerList, setPeerList] = useState<Peer[]>([]);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const selfIdRef = useRef<string>("");

  useEffect(() => {
    if (!enabled) return;
    const peers = peersRef.current;
    let disposed = false;
    let ws: WebSocket | null = null;
    let posTimer: ReturnType<typeof setInterval> | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      if (disposed) return;
      const proto = window.location.protocol === "https:" ? "wss" : "ws";
      ws = new WebSocket(`${proto}://${window.location.host}/ws`);
      wsRef.current = ws;

      ws.onopen = () => {
        if (disposed) return;
        setConnected(true);
        ws?.send(JSON.stringify({ type: "join", room }));
        posTimer = setInterval(() => {
          if (ws?.readyState !== 1) return;
          const p = playerPosRef.current;
          ws.send(
            JSON.stringify({
              type: "pos",
              pos: [
                Math.round(p.x * 100) / 100,
                Math.round(p.y * 100) / 100,
                Math.round(p.z * 100) / 100,
                Math.round(yawRef.current * 100) / 100,
              ],
            }),
          );
        }, POS_INTERVAL_MS);
      };

      ws.onmessage = (event) => {
        let msg: Record<string, unknown>;
        try {
          msg = JSON.parse(String(event.data));
        } catch {
          return;
        }
        if (msg.type === "welcome" && Array.isArray(msg.peers)) {
          selfIdRef.current = String(msg.selfId ?? "");
          peers.clear();
          for (const p of msg.peers as Array<Record<string, unknown>>) {
            peers.set(String(p.id), {
              id: String(p.id),
              handle: String(p.handle),
              color: String(p.color),
              target: (p.pos as Peer["target"]) ?? [0, 0, 0, 0],
            });
          }
          setPeerList([...peers.values()]);
        } else if (msg.type === "enter") {
          peers.set(String(msg.id), {
            id: String(msg.id),
            handle: String(msg.handle),
            color: String(msg.color),
            target: (msg.pos as Peer["target"]) ?? [0, 0, 0, 0],
          });
          setPeerList([...peers.values()]);
        } else if (msg.type === "leave") {
          peers.delete(String(msg.id));
          setPeerList([...peers.values()]);
        } else if (msg.type === "pos") {
          const peer = peers.get(String(msg.id));
          if (peer && Array.isArray(msg.pos)) {
            peer.target = msg.pos as Peer["target"];
          }
        } else if (msg.type === "chat") {
          setChat((prev) =>
            [
              ...prev,
              {
                id: String(msg.id),
                handle: String(msg.handle),
                color: String(msg.color),
                text: String(msg.text),
                ts: Number(msg.ts) || Date.now(),
                self: String(msg.id) === selfIdRef.current,
              },
            ].slice(-MAX_CHAT),
          );
        }
      };

      const onGone = () => {
        setConnected(false);
        if (posTimer) clearInterval(posTimer);
        posTimer = null;
        if (!disposed) retryTimer = setTimeout(connect, 3000);
      };
      ws.onclose = onGone;
      ws.onerror = () => ws?.close();
    };

    connect();
    return () => {
      disposed = true;
      if (posTimer) clearInterval(posTimer);
      if (retryTimer) clearTimeout(retryTimer);
      ws?.close();
      wsRef.current = null;
      peers.clear();
      setPeerList([]);
      setConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room, enabled]);

  const sendChat = useCallback((text: string) => {
    const ws = wsRef.current;
    const trimmed = text.trim();
    if (!ws || ws.readyState !== 1 || !trimmed) return;
    // the server echoes chat back to everyone in the room, sender included
    ws.send(JSON.stringify({ type: "chat", text: trimmed }));
  }, []);

  return { peersRef, peerList, chat, sendChat, connected };
}
