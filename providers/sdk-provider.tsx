'use client'

import { useEffect, useState } from "react";
import { type ReactNode, createContext, useRef, useContext } from 'react'
import { useStore } from 'zustand'
import { type MidenSdkStore, createMidenSdkStore } from "@/store/sdk";
import { RPC_ENDPOINT } from "@/lib/constants";

export type MidenSdkStoreApi = ReturnType<typeof createMidenSdkStore>;

export const MidenSdkStoreContext = createContext<MidenSdkStoreApi | undefined>(undefined);

export interface MidenSdkProviderProps {
    children: ReactNode;
}


export const MidenSdkProvider = ({ children }: MidenSdkProviderProps) => {
    const storeRef = useRef<MidenSdkStoreApi | null>(null);

    if (storeRef.current === null) {
        storeRef.current = createMidenSdkStore();
    }

    return (
        <MidenSdkStoreContext.Provider value={storeRef.current}>
            {children}
        </MidenSdkStoreContext.Provider>
    );
}

export const useMidenSdkStore = <T,>(
    selector: (store: MidenSdkStore) => T,
): T => {
    const midenSdkStoreContext = useContext(MidenSdkStoreContext)

    if (!midenSdkStoreContext) {
        throw new Error(`useCounterStore must be used within CounterStoreProvider`)
    }

    return useStore(midenSdkStoreContext, selector)
}




export const tickInterval = 1000; // 1 second
export function useInitAndPollSyncState() {
    const [tick, setTick] = useState(0);
    const syncState = useMidenSdkStore((state) => state.syncState);
    const initializeSdk = useMidenSdkStore((state) => state.initializeSdk);
    const [client, setClient] = useState<any | null>(null);

    useEffect(() => {
        initializeSdk({})

        const initClient = async () => {
            const { WebClient } = await import("@demox-labs/miden-sdk");
            const clientInstance = await WebClient.createClient(RPC_ENDPOINT);
            setClient(clientInstance);
        };
        initClient();
    }, [])


    useEffect(() => {
        if (client) {
            syncState(client);
        }
    }, [tick, client, syncState]);

    useEffect(() => {
        const intervalId = setInterval(() => setTick((tick) => tick + 1), tickInterval);
        return () => clearInterval(intervalId);
    }, []);
}



