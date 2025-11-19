import { SendPrivateNoteStages } from "@/lib/types";
import { create } from "zustand";

interface WebRtcState {
  webSocket: WebSocket | null;
  peerConnection: RTCPeerConnection | null;
  dataChannel: RTCDataChannel | null;
  stage: SendPrivateNoteStages | null;
  reset: boolean;
}

interface WebRtcActions {
  // Actions to set the state
  setPrivateNoteStage: (stage: SendPrivateNoteStages) => void;
  setWebSocket: (ws: WebSocket | null) => void;
  setDataChannel: (dc: RTCDataChannel | null) => void;
  setPeerConnection: (pc: RTCPeerConnection | null) => void;
  toggleReset: () => void;
}

export type WebRtcStore = WebRtcState & WebRtcActions;

export const createWebRtcStore = () =>
  create<WebRtcStore, [["zustand/immer", never]]>((set, get) => ({
    webSocket: null,
    peerConnection: null,
    dataChannel: null,
    stage: null,
    reset: false,
    setPrivateNoteStage: (stage) => set({ stage }),
    setWebSocket: (ws) => set({ webSocket: ws }),
    setDataChannel: (dc) => set({ dataChannel: dc }),
    setPeerConnection: (pc) => set({ peerConnection: pc }),
    toggleReset: () => set((state) => ({ ...state, reset: !state.reset })), // Toggle reset state
  }));
