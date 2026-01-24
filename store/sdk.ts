import {
  ADD_ADDRESS_API,
  ERROR_THROWN_ON_VERSION_MISMATCH,
  ERROR_THROWN_ON_VERSION_MISMATCH_11_TO_12,
  MIDEN_WEB_WALLET_LOCAL_STORAGE_KEY,
  NETWORK_ID,
  NETWORK_TO_RPC_ENDPOINT,
  RPC_ENDPOINT,
} from "@/lib/constants";
import { Network } from "@/lib/types";
import axios from "axios";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export interface MidenSdkConfig {
  networkType: Network;
}

export interface MidenSdkState {
  networkType: Network | null;
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
  setNetworkType: (network: Network) => void;
}

export type MidenSdkStore = MidenSdkState & MidenSdkActions;

export const createMidenSdkStore = () =>
  create<MidenSdkStore>()(
    immer((set, get) => ({
      isLoading: false,
      error: null,
      networkType: null,
      config: {
        networkType: null,
      },
      blockNum: 0,
      account: "",

      setNetworkType: (networkType: Network) => {
        localStorage.setItem("networkType", networkType);
        set((state) => {
          state.networkType = networkType;
        });
      },

      setAccount: (account: string) => {
        localStorage.setItem(MIDEN_WEB_WALLET_LOCAL_STORAGE_KEY, account);
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
          const { WebClient } = await import("@miden-sdk/miden-sdk");
          ///@ts-ignore
          const client = await WebClient.createClient(
            NETWORK_TO_RPC_ENDPOINT.get(config.networkType),
          );
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

      syncState: async (client: import("@miden-sdk/miden-sdk").WebClient) => {
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

      initializeAccount: async (
        client: import("@miden-sdk/miden-sdk").WebClient,
      ) => {
        const { setAccount, error } = get();

        const { AccountStorageMode, WebClient, AccountInterface, Address } =
          await import("@miden-sdk/miden-sdk");
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
            1,
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
          "@miden-sdk/miden-sdk"
        );
        const NID = await NETWORK_ID();
        const client = new WebClient();
        await client.createClient(RPC_ENDPOINT);
        //
        const { setAccount } = get();
        if (!client) {
          throw new Error(
            "Miden SDK client or account storage not initialized",
          );
        }
        const newAccount = await client.newWallet(
          AccountStorageMode.private(),
          false,
          1,
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
