import {
  ADD_ADDRESS_API,
  ERROR_THROWN_ON_VERSION_MISMATCH,
  ERROR_THROWN_ON_VERSION_MISMATCH_11_TO_12,
  MIDEN_WEB_WALLET_LOCAL_STORAGE_KEY,
  NETWORK_ID,
  RPC_ENDPOINT,
} from "@/lib/constants";
import axios from "axios";
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

export const createMidenSdkStore = () =>
  create<MidenSdkStore>()(
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
            state.error =
              "Cannot instantiate Miden SDK client outside of browser environment";
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
          set((state) => {
            state.error = null;
          });

          await get().initializeAccount(client);
          await get().syncState(client);
          set((state) => {
            state.isLoading = false;
          });
        } catch (error) {
          console.error("Miden SDK initialization error:", error);
          // client was on previous version, clear indexedDB and reload
          if (error.toString().includes(ERROR_THROWN_ON_VERSION_MISMATCH)) {
            indexedDB.deleteDatabase("MidenClientDB");
            window.location.reload();
            return;
          }
          if (
            error.toString().includes(ERROR_THROWN_ON_VERSION_MISMATCH_11_TO_12)
          ) {
            indexedDB.deleteDatabase("MidenClientDB");
            localStorage.clear();
            window.location.reload();
            return;
          }

          set((state) => {
            state.error =
              error instanceof Error
                ? error.message
                : "Failed to initialize Miden SDK client";
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
            state.error =
              error instanceof Error ? error.message : "Failed to sync state";
          });
        }
      },

      initializeAccount: async (client: any) => {
        const { setAccount, error } = get();

        const { AccountStorageMode, WebClient, AccountInterface, Address } =
          await import("@demox-labs/miden-sdk");
        if (!(client instanceof WebClient)) {
          throw new Error("Miden SDK client not initialized");
        }
        const accountID = localStorage.getItem(
          MIDEN_WEB_WALLET_LOCAL_STORAGE_KEY,
        );
        if (accountID) {
          try {
            setAccount(accountID);
            return;
          } catch (error) {
            console.error("Failed to deserialize saved account:", error);
            set((state) => {
              state.error =
                error instanceof Error
                  ? error.message
                  : "Failed to deserialize saved account";
            });
          }

          try {
            axios.get(ADD_ADDRESS_API(accountID));
          } catch (error) {
            console.error("Failed to add address to backend:", error);
            set((state) => {
              state.error =
                error instanceof Error
                  ? error.message
                  : "Failed to add address to backend";
            });
          }
        } else {
          const newAccount = await client.newWallet(
            AccountStorageMode.private(),
            false,
            0,
          );
          const NID = await NETWORK_ID();
          const newAccountId = newAccount
            .id()
            .toBech32(NID, AccountInterface.BasicWallet);
          setAccount(newAccountId);
          localStorage.setItem(
            MIDEN_WEB_WALLET_LOCAL_STORAGE_KEY,
            newAccountId,
          );

          try {
            await axios.get(ADD_ADDRESS_API(newAccountId));
          } catch {
            console.error("Cannot call address API", error);
          }
        }
      },

      createNewAccount: async () => {
        const { WebClient, AccountStorageMode } = await import(
          "@demox-labs/miden-sdk"
        );
        const NID = await NETWORK_ID();
        const client = await WebClient.createClient(RPC_ENDPOINT);
        const { setAccount } = get();
        if (!client) {
          throw new Error(
            "Miden SDK client or account storage not initialized",
          );
        }
        const newAccount = await client.newWallet(
          AccountStorageMode.private(),
          false,
          0,
        );
        setAccount(newAccount.id().toBech32(NID, 0));
        localStorage.setItem(
          MIDEN_WEB_WALLET_LOCAL_STORAGE_KEY,
          newAccount.serialize().toString(),
        );
        return newAccount;
      },
    })),
  );
