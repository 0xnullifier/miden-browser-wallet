"use client";

import { createWebRtcStore, WebRtcStore } from "@/store/webrtc";
import { createContext, useContext, useRef } from "react";
import { useStore } from "zustand";

export type WebRtcStoreApi = ReturnType<typeof createWebRtcStore>;

export const WebRtcContext = createContext<WebRtcStoreApi | undefined>(
  undefined,
);

export interface WebRtcProviderProps {
  children: React.ReactNode;
}

export const WebRtcProvider = ({ children }: WebRtcProviderProps) => {
  const storeRef = useRef<WebRtcStoreApi | null>(null);

  if (storeRef.current === null) {
    storeRef.current = createWebRtcStore();
  }

  return (
    <WebRtcContext.Provider value={storeRef.current}>
      {children}
    </WebRtcContext.Provider>
  );
};

export const useWebRtcStore = <T,>(selector: (store: WebRtcStore) => T): T => {
  const webRtcContext = useContext(WebRtcContext);

  if (!webRtcContext) {
    throw new Error(`useWebRtcStore must be used within WebRtcProvider`);
  }

  return useStore(webRtcContext, selector);
};
