import { ADD_ADDRESS_API, BECH32_PREFIX, ERROR_THROWN_ON_VERSION_MISMATCH, MIDEN_WEB_WALLET_LOCAL_STORAGE_KEY, RPC_ENDPOINT } from "@/lib/constants";
import axios from "axios";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export interface MidenSdkConfig {
    endpoint?: string;
}

export interface MidenSdkState {
    isLoading: boolean;
    error: string | null;
    blockNum: number;
    config: MidenSdkConfig;
    account: string;
}

export interface MidenSdkActions {
    initializeSdk: (config: MidenSdkConfig) => Promise<void>;
    syncState: (client: any) => Promise<void>;
    initializeAccount: (client: any) => Promise<void>;
    createNewAccount: () => Promise<any>;
    setAccount: (account: string) => void;
}

export type MidenSdkStore = MidenSdkState & MidenSdkActions;


export const createMidenSdkStore = () => create<MidenSdkStore>()(
    immer((set, get) => ({
        isLoading: false,
        error: null,
        config: { endpoint: RPC_ENDPOINT },
        blockNum: 0,
        account: "",
        setAccount: (account: string) => {
            set((state) => {
                state.account = account;
            });
        },

        initializeSdk: async (config: MidenSdkConfig) => {
            if (typeof window === "undefined") {
                set((state) => {
                    state.error = "Cannot instantiate Miden SDK client outside of browser environment";
                });
                return;
            }

            set((state) => {
                state.isLoading = true;
                state.error = null;
                state.config = { ...state.config, ...config };
            });

            try {
                const { WebClient } = await import("@demox-labs/miden-sdk");
                const client = await WebClient.createClient(RPC_ENDPOINT);
                console.log("Miden SDK client initialized:", client);
                set((state) => {
                    state.error = null;
                });

                await get().initializeAccount(client);
                await get().syncState(client);
                set((state) => {
                    state.isLoading = false
                })
            } catch (error) {

                // client was on previous version, clear indexedDB and reload
                if (error.toString().includes(ERROR_THROWN_ON_VERSION_MISMATCH)) {
                    indexedDB.deleteDatabase("MidenClientDB")
                    window.location.reload();
                    return;
                }

                console.error("Miden SDK initialization error:", error);
                console.log(error.toString())
                set((state) => {
                    state.error = error instanceof Error ? error.message : "Failed to initialize Miden SDK client";
                    state.isLoading = false;
                });
            }
        },

        syncState: async (client: any) => {
            if (!client) {
                console.warn("Cannot sync state: client not initialized");
                return;
            }

            try {
                const value = await client.syncState();
                set((state) => {
                    state.blockNum = value.blockNum();
                    state.error = null;
                });
            } catch (error) {
                console.error("Error syncing Miden SDK client state:", error);
                set((state) => {
                    state.error = error instanceof Error ? error.message : "Failed to sync state";
                });
            }
        },

        initializeAccount: async (client: any) => {
            const { setAccount, error } = get();

            const { AccountStorageMode, NetworkId, WebClient, Address } = await import("@demox-labs/miden-sdk");
            if (!(client instanceof WebClient)) {
                throw new Error("Miden SDK client not initialized");
            }
            const accountID = localStorage.getItem(MIDEN_WEB_WALLET_LOCAL_STORAGE_KEY);
            if (accountID) {
                try {
                    setAccount(accountID);
                    return;
                } catch (error) {
                    console.error("Failed to deserialize saved account:", error);
                    set((state) => {
                        state.error = error instanceof Error ? error.message : "Failed to deserialize saved account";
                    });
                }

                try {
                    axios.get(ADD_ADDRESS_API(accountID));
                } catch (error) {
                    console.error("Failed to add address to backend:", error);
                    set((state) => {
                        state.error = error instanceof Error ? error.message : "Failed to add address to backend";
                    });
                }
            } else {
                console.log("No saved account found, creating new account...");
                const newAccount = await client.newWallet(AccountStorageMode.private(), true);
                const newAccountId = newAccount.id().toBech32(NetworkId.Devnet, 0);
                setAccount(newAccountId);
                localStorage.setItem(MIDEN_WEB_WALLET_LOCAL_STORAGE_KEY, newAccountId)
                console.log("New account created and saved:", newAccount);
                await axios.get(ADD_ADDRESS_API(newAccountId));
            }
        },

        createNewAccount: async () => {
            console.log("Creating new account in Miden SDK");
            const { WebClient, AccountStorageMode, NetworkId } = await import("@demox-labs/miden-sdk");
            const client = await WebClient.createClient(RPC_ENDPOINT);
            const { setAccount } = get();
            console.log("Current client:", client);
            if (!client) {
                throw new Error("Miden SDK client or account storage not initialized");
            }
            const newAccount = await client.newWallet(AccountStorageMode.private(), true)
            console.log("New account generated:", newAccount);
            setAccount(newAccount.id().toBech32(NetworkId.Devnet, 0));
            console.log("New account created:", newAccount);
            localStorage.setItem(MIDEN_WEB_WALLET_LOCAL_STORAGE_KEY, newAccount.serialize().toString())
            return newAccount;
        }
    }))
);


