import {
  DECIMALS,
  FAUCET_API_ENDPOINT,
  FAUCET_ID,
  METADATA_CACHE_KEY,
  RPC_ENDPOINT,
  TX_PROVER_ENDPOINT,
} from "@/lib/constants";
import axios from "axios";
import { create } from "zustand";
import { sucessTxToast } from "@/components/success-tsx-toast";
import { toast } from "sonner";
import { submitTransactionWithRetry } from "@/lib/helper";

export interface FaucetInfo {
  symbol: string;
  decimals: number;
  address: string;
}

export interface BalanceState {
  loading: boolean;
  faucetLoading: boolean;
  consumingLoading: boolean;
  faucets: FaucetInfo[];
  balances: {
    [key: string]: number;
  };
  loadBalance: (client: any, accountId: string) => Promise<void>;
  faucet: (accountId: string, amount: number) => Promise<void>;
}

export const createBalanceStore = () =>
  create<BalanceState, [["zustand/immer", never]]>((set, get) => ({
    loading: false,
    faucetLoading: false,
    consumingLoading: false,
    balances: {},
    faucets: [
      {
        symbol: "MDN",
        decimals: DECIMALS,
        address: FAUCET_ID,
      },
    ],
    loadBalance: async (client, _accountId) => {
      const { Address, WebClient } = await import("@miden-sdk/miden-sdk");
      if (client instanceof WebClient) {
        const address = Address.fromBech32(_accountId);
        const accountId = address.accountId();
        const { faucets, consumingLoading } = get();
        set({ loading: true });
        const accountRecord = await client.getAccount(accountId);
        if (!accountRecord) {
          set({ loading: false, balances: {} });
          throw new Error("Account Record not found");
        }
        const balances = {} as { [key: string]: number };
        await Promise.all(
          accountRecord
            .vault()
            .fungibleAssets()
            .map(async (asset) => {
              let tokenInfo = faucets.find(
                (faucet) => faucet.address === asset.faucetId().toString(),
              );
              if (!tokenInfo) {
                tokenInfo = await getTokenInfo(asset.faucetId().toString());
                set((state) => ({
                  faucets: [...state.faucets, tokenInfo],
                }));
              }
              const balanceInBaseDenom = asset.amount();
              const balance =
                Number(balanceInBaseDenom) / 10 ** tokenInfo.decimals;
              balances[asset.faucetId().toString()] = balance;
            }),
        );
        if (balances[FAUCET_ID] === undefined) {
          balances[FAUCET_ID] = 0;
        }
        set({ loading: false, balances });
        await client.fetchPrivateNotes();
        const consumableNotes = await client.getConsumableNotes();
        if (consumableNotes.length === 0) {
          console.info("No pending balance to consume");
          return;
        } else if (!consumingLoading) {
          set({ consumingLoading: true });
          // if consumable notes are found we consume them but terminate the client after consuming
          const { WebClient } = await import("@miden-sdk/miden-sdk");
          const newClient = await WebClient.createClient(RPC_ENDPOINT);
          try {
            toast.info(
              `Found ${consumableNotes.length} pending notes to consume, consuming...`,
              {
                position: "top-right",
              },
            );
            const notes = consumableNotes.map((note) =>
              note.inputNoteRecord().toNote(),
            );
            //TODO: open an issue on client note metadata does not have an attachment method
            const consumeTxRequest =
              newClient.newConsumeTransactionRequest(notes);
            const txId = await submitTransactionWithRetry(
              consumeTxRequest,
              newClient,
              accountId,
            );
            sucessTxToast(`Consumed ${notes.length} successfully`, txId);
          } catch (error) {
            console.error("Error consuming notes:", error);
          } finally {
            set({ consumingLoading: false });
            newClient.terminate();
          }
        }
      }
    },

    faucet: async (accountId, amount) => {
      set({ faucetLoading: true });
      try {
        const amountInBaseDenom = BigInt(
          Math.trunc(Number(amount) * 10 ** DECIMALS),
        );
        const txId = await axios.get(
          FAUCET_API_ENDPOINT(accountId, amountInBaseDenom.toString()),
        );
        sucessTxToast(
          "Faucet used successfully",
          txId.data.replaceAll(" ", ""),
        );
      } catch (error) {
        toast.error(
          "Faucet request failed, it may be overloaded. Reach out in telegram for help.",
          {
            position: "top-right",
            action: {
              label: "Join Telegram",
              onClick: () => {
                window.open("https://t.me/BuildOnMiden", "_blank");
              },
            },
          },
        );
        console.error("Faucet request failed:", error);
      } finally {
        set({ faucetLoading: false });
      }
    },
  }));

const getTokenInfo = async (id: string) => {
  const dump = localStorage.getItem(METADATA_CACHE_KEY);
  let cache = dump ? JSON.parse(dump) : {};
  if (cache[id]) {
    return cache[id];
  }

  const { AccountId, RpcClient, Endpoint, BasicFungibleFaucetComponent } =
    await import("@miden-sdk/miden-sdk");
  const accountId = AccountId.fromHex(id);
  const client = new RpcClient(Endpoint.testnet());
  const fetchedAccount = await client.getAccountDetails(accountId);
  const underlyingAccount = fetchedAccount.account();
  if (!underlyingAccount) {
    return {
      symbol: "Unknown",
      decimals: 0,
      address: id,
    };
  }
  const faucetComponent =
    BasicFungibleFaucetComponent.fromAccount(underlyingAccount);

  const metadata = {
    symbol: faucetComponent.symbol().toString(),
    decimals: faucetComponent.decimals(),
    address: id,
  };

  cache = { ...cache, [id]: metadata };
  localStorage.setItem(METADATA_CACHE_KEY, JSON.stringify(cache));
  return metadata;
};
