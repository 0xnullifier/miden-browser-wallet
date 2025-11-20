"use client";

import { useEffect, useState } from "react";
import { type ReactNode, createContext, useRef, useContext } from "react";
import { useStore } from "zustand";
import { type BalanceState, createBalanceStore } from "@/store/balance";
import { PRIVATE_NOTE_TRANSPORT_URL, RPC_ENDPOINT } from "@/lib/constants";
import { useMidenSdkStore } from "./sdk-provider";

export type Balancestore = ReturnType<typeof createBalanceStore>;

export const MidenSdkStoreContext = createContext<Balancestore | undefined>(
  undefined,
);

export interface BalanceStoreProviderProps {
  children: ReactNode;
}

export const BalanceProvider = ({ children }: BalanceStoreProviderProps) => {
  const storeRef = useRef<Balancestore | null>(null);

  if (storeRef.current === null) {
    storeRef.current = createBalanceStore();
  }

  return (
    <MidenSdkStoreContext.Provider value={storeRef.current}>
      {children}
    </MidenSdkStoreContext.Provider>
  );
};

export const useBalanceStore = <T,>(
  selector: (store: BalanceState) => T,
): T => {
  const midenSdkStoreContext = useContext(MidenSdkStoreContext);

  if (!midenSdkStoreContext) {
    throw new Error(`useCounterStore must be used within CounterStoreProvider`);
  }

  return useStore(midenSdkStoreContext, selector);
};

export const useObserveBalance = () => {
  const blockNum = useMidenSdkStore((state) => state.blockNum);
  const account = useMidenSdkStore((state) => state.account);
  const loadBalance = useBalanceStore((state) => state.loadBalance);
  const [client, setClient] = useState<any | null>(null);

  useEffect(() => {
    const initClient = async () => {
      const { WebClient } = await import("@demox-labs/miden-sdk");
      const clientInstance = await WebClient.createClient(
        RPC_ENDPOINT,
        PRIVATE_NOTE_TRANSPORT_URL,
      );
      setClient(clientInstance);
    };
    initClient();
    return () => {
      if (client) {
        client.terminate();
      }
      setClient(null);
    };
  }, []);

  useEffect(() => {
    if (!client || !account) {
      console.warn(
        "Miden SDK client or account address not initialized for balance observation",
      );
      return;
    }
    loadBalance(client, account);
  }, [client, blockNum, account]);
};
