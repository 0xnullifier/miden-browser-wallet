import {
  DECIMALS,
  FAUCET_API_ENDPOINT,
  FAUCET_ID,
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
      const { Address, WebClient } = await import("@demox-labs/miden-sdk");
      if (client instanceof WebClient) {
        console.log(_accountId);
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
              console.log(asset);
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
        console.log(consumableNotes.length);
        if (consumableNotes.length === 0) {
          console.info("No pending balance to consume");
          return;
        } else if (!consumingLoading) {
          set({ consumingLoading: true });
          // if consumable notes are found we consume them but terminate the client after consuming
          const { WebClient, TransactionProver } = await import(
            "@demox-labs/miden-sdk"
          );
          const newClient = await WebClient.createClient(RPC_ENDPOINT);
          try {
            toast.info(
              `Found ${consumableNotes.length} pending notes to consume, consuming...`,
              {
                position: "top-right",
              },
            );
            const noteIds = consumableNotes.map((note: any) =>
              note.inputNoteRecord().id().toString(),
            );
            const consumeTxRequest =
              newClient.newConsumeTransactionRequest(noteIds);
            const txId = await submitTransactionWithRetry(
              consumeTxRequest,
              newClient,
              accountId,
            );
            sucessTxToast(`Consumed ${noteIds.length} successfully`, txId);
          } catch (error) {
            console.error("Error consuming notes:", error);
          } finally {
            console.log("Terminating client after consuming pending notes");
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
  const { AccountId, WebClient } = await import("@demox-labs/miden-sdk");
  const accountId = AccountId.fromHex(id);
  const client = await WebClient.createClient(RPC_ENDPOINT);
  let tokenAcc = await client.getAccount(accountId);
  if (!tokenAcc) {
    await client.importAccountById(accountId);
    await client.syncState();
    tokenAcc = await client.getAccount(accountId);
    if (!tokenAcc) {
      toast.error("Failed to import token info");
    }
  }
  const storageItem = tokenAcc.storage().getItem(2);
  if (!storageItem) {
    throw new Error("No storage item at key 0");
  }
  const valueWord = storageItem.toHex();

  const hex = valueWord.slice(2); // Remove '0x' prefix
  const reversed = hex.match(/.{2}/g)!.reverse(); // Split into pairs and reverse them

  // Create an array of 4 elements, each 32 bits (4 bytes) in size
  const array = [];
  for (let i = 0; i < 4; i++) {
    const startIndex = i * 8; // Each element is 8 hex digits (4 bytes)
    const slice = reversed.slice(startIndex, startIndex + 8).join(""); // Join pairs for each element
    array.push(parseInt(slice, 16)); // Convert the slice from hex to a number
  }

  let val = array[1];
  let symbol = decodeFeltToSymbol(val);

  let decimals = array[2];
  return {
    symbol,
    decimals,
    address: id,
  };
};

const TokenSymbol = {
  MAX_ENCODED_VALUE: 0xffffffffffff, // Example max value
  ALPHABET_LENGTH: 26, // A-Z (26 letters)
  MAX_SYMBOL_LENGTH: 10, // Example maximum length for token symbols
};

function decodeFeltToSymbol(encodedFelt: number): string | string {
  // Check if the encoded value is within the valid range
  if (encodedFelt > TokenSymbol.MAX_ENCODED_VALUE) {
    return `Error: Value ${encodedFelt} is too large`;
  }

  let decodedString = "";
  let remainingValue = encodedFelt;

  // Get the token symbol length
  const tokenLen = remainingValue % TokenSymbol.ALPHABET_LENGTH;
  if (tokenLen === 0 || tokenLen > TokenSymbol.MAX_SYMBOL_LENGTH) {
    return `Error: Invalid token length: ${tokenLen}`;
  }
  remainingValue = Math.floor(remainingValue / TokenSymbol.ALPHABET_LENGTH);

  for (let i = 0; i < tokenLen; i++) {
    const digit = remainingValue % TokenSymbol.ALPHABET_LENGTH;
    const char = String.fromCharCode(digit + 65); // 'A' is 65 in ASCII
    decodedString = char + decodedString; // Insert at the start to reverse the order
    remainingValue = Math.floor(remainingValue / TokenSymbol.ALPHABET_LENGTH);
  }

  // Return an error if some data still remains after specified number of characters
  if (remainingValue !== 0) {
    return "Error: Data not fully decoded";
  }

  return decodedString;
}
