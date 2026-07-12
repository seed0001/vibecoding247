"use client";

/**
 * Proximity voice: a WebRTC audio mesh between everyone in the room who
 * joined voice, spatialized with WebAudio panners driven by orb
 * positions — voices come from where people stand and fade with
 * distance. The presence WebSocket is the signaling channel.
 *
 * Deterministic initiator (lower connection id offers) means no glare
 * handling is needed. Mic-denied users join listen-only.
 */

export type VoiceStatus = "off" | "connecting" | "on" | "listen";

interface PeerAudio {
  pc: RTCPeerConnection;
  panner: PannerNode | null;
  source: MediaStreamAudioSourceNode | null;
  element: HTMLAudioElement | null;
  pendingCandidates: RTCIceCandidateInit[];
}

const ICE_SERVERS = [
  { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
];

function connNumber(id: string): number {
  return Number(id.replace(/\D/g, "")) || 0;
}

export class VoiceEngine {
  private ctx: AudioContext | null = null;
  private mic: MediaStream | null = null;
  private peers = new Map<string, PeerAudio>();
  private selfId = "";
  private active = false;
  private sendSignal: (to: string, data: unknown) => void;
  onStatus: ((status: VoiceStatus) => void) | null = null;
  muted = false;

  constructor(sendSignal: (to: string, data: unknown) => void) {
    this.sendSignal = sendSignal;
  }

  private setStatus(status: VoiceStatus) {
    this.onStatus?.(status);
  }

  async join(selfId: string, voicePeerIds: string[]) {
    this.selfId = selfId;
    this.active = true;
    this.setStatus("connecting");
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    await this.ctx.resume().catch(() => {});
    try {
      this.mic = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      this.mic.getAudioTracks().forEach((t) => (t.enabled = !this.muted));
      this.setStatus("on");
    } catch {
      this.mic = null;
      this.setStatus("listen"); // still hear everyone
    }
    for (const id of voicePeerIds) this.peerJoinedVoice(id);
  }

  leave() {
    this.active = false;
    for (const id of [...this.peers.keys()]) this.closePeer(id);
    this.mic?.getTracks().forEach((t) => t.stop());
    this.mic = null;
    this.setStatus("off");
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    this.mic?.getAudioTracks().forEach((t) => (t.enabled = !muted));
  }

  /** Lower conn id is the offerer — deterministic, no glare. */
  private isInitiator(peerId: string): boolean {
    return connNumber(this.selfId) < connNumber(peerId);
  }

  peerJoinedVoice(peerId: string) {
    if (!this.active || this.peers.has(peerId)) return;
    if (this.isInitiator(peerId)) {
      this.createPeer(peerId, true);
    }
    // otherwise: wait for their offer, createPeer happens in handleSignal
  }

  peerLeft(peerId: string) {
    this.closePeer(peerId);
  }

  private createPeer(peerId: string, initiator: boolean): PeerAudio {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    const peer: PeerAudio = {
      pc,
      panner: null,
      source: null,
      element: null,
      pendingCandidates: [],
    };
    this.peers.set(peerId, peer);

    if (this.mic) {
      for (const track of this.mic.getAudioTracks()) {
        pc.addTrack(track, this.mic);
      }
    } else {
      pc.addTransceiver("audio", { direction: "recvonly" });
    }

    pc.ontrack = (event) => {
      const stream = event.streams[0] ?? new MediaStream([event.track]);
      this.attachStream(peer, stream);
    };
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal(peerId, { candidate: event.candidate.toJSON() });
      }
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed") this.closePeer(peerId);
    };
    if (initiator) {
      pc.onnegotiationneeded = async () => {
        try {
          await pc.setLocalDescription(await pc.createOffer());
          this.sendSignal(peerId, { sdp: pc.localDescription });
        } catch {
          /* negotiation aborted — peer probably left */
        }
      };
    }
    return peer;
  }

  async handleSignal(from: string, data: Record<string, unknown>) {
    if (!this.active) return;
    let peer = this.peers.get(from);
    if (!peer) peer = this.createPeer(from, false);
    const { pc } = peer;
    try {
      if (data.sdp) {
        const desc = data.sdp as RTCSessionDescriptionInit;
        await pc.setRemoteDescription(desc);
        for (const candidate of peer.pendingCandidates) {
          await pc.addIceCandidate(candidate).catch(() => {});
        }
        peer.pendingCandidates = [];
        if (desc.type === "offer") {
          await pc.setLocalDescription(await pc.createAnswer());
          this.sendSignal(from, { sdp: pc.localDescription });
        }
      } else if (data.candidate) {
        const candidate = data.candidate as RTCIceCandidateInit;
        if (pc.remoteDescription) {
          await pc.addIceCandidate(candidate).catch(() => {});
        } else {
          peer.pendingCandidates.push(candidate);
        }
      }
    } catch {
      /* malformed / stale signal — safe to ignore */
    }
  }

  private attachStream(peer: PeerAudio, stream: MediaStream) {
    const ctx = this.ctx;
    if (!ctx) return;
    // Chrome quirk: remote WebRTC audio must be attached to a media
    // element (muted is fine) or the WebAudio graph receives silence.
    const element = new Audio();
    element.srcObject = stream;
    element.muted = true;
    void element.play().catch(() => {});
    peer.element = element;

    const source = ctx.createMediaStreamSource(stream);
    const panner = ctx.createPanner();
    panner.panningModel = "equalpower";
    panner.distanceModel = "inverse";
    panner.refDistance = 2;
    panner.maxDistance = 60;
    panner.rolloffFactor = 1.6;
    source.connect(panner);
    panner.connect(ctx.destination);
    peer.source = source;
    peer.panner = panner;
  }

  private closePeer(peerId: string) {
    const peer = this.peers.get(peerId);
    if (!peer) return;
    this.peers.delete(peerId);
    try {
      peer.pc.close();
    } catch {
      /* already closed */
    }
    peer.source?.disconnect();
    peer.panner?.disconnect();
    if (peer.element) {
      peer.element.srcObject = null;
    }
  }

  /**
   * Called at network tick: positions the listener (you) and every
   * peer's voice in 3D space. yaw follows the camera so left/right
   * pan matches where you're looking.
   */
  updatePositions(
    listener: { x: number; y: number; z: number; yaw: number },
    peerPositions: Map<string, [number, number, number, number]>,
  ) {
    const ctx = this.ctx;
    if (!ctx || !this.active) return;
    const l = ctx.listener;
    const fx = -Math.sin(listener.yaw);
    const fz = -Math.cos(listener.yaw);
    if (l.positionX) {
      l.positionX.value = listener.x;
      l.positionY.value = listener.y;
      l.positionZ.value = listener.z;
      l.forwardX.value = fx;
      l.forwardY.value = 0;
      l.forwardZ.value = fz;
      l.upX.value = 0;
      l.upY.value = 1;
      l.upZ.value = 0;
    } else {
      // older Safari
      l.setPosition(listener.x, listener.y, listener.z);
      l.setOrientation(fx, 0, fz, 0, 1, 0);
    }
    for (const [id, peer] of this.peers) {
      const pos = peerPositions.get(id);
      const panner = peer.panner;
      if (!pos || !panner) continue;
      if (panner.positionX) {
        panner.positionX.value = pos[0];
        panner.positionY.value = pos[1] + 1.4;
        panner.positionZ.value = pos[2];
      } else {
        panner.setPosition(pos[0], pos[1] + 1.4, pos[2]);
      }
    }
  }
}
