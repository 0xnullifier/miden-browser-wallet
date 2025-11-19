/// the transaction store
import { FAUCET_ID } from "@/lib/constants";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
export interface UITransaction {
  id: string;
  type: "Incoming" | "Outgoing" | "Faucet";
  amount: bigint;
  timestamp: string;
  address: string;
  status: "isCommited" | "isPending" | "isFailed";
}

export interface TransactionStore {
  loading: boolean;
  transactions: UITransaction[];
  loadTransactions: (
    record: { tr: any; inputNotes: any | undefined }[],
  ) => Promise<void>;
}

function transactionRecordToUITransaction({
  tr,
  inputNotes,
}: {
  tr: any;
  inputNotes: any | undefined;
}): UITransaction[] {
  if (inputNotes === undefined || inputNotes.length === 0) {
    const outputNotes = tr
      .outputNotes()
      .notes()
      .map((note) => note.intoFull());
    const transactions = outputNotes.map((note) => {
      const amount = note
        .assets()
        .fungibleAssets()
        .reduce((acc: bigint, asset) => acc + asset.amount(), BigInt(0));

      if (amount === BigInt(0)) {
        return null;
      }

      const faucetId = note
        ?.assets()
        .fungibleAssets()[0]
        ?.faucetId()
        .toString();
      const statusObject = tr.transactionStatus();
      return {
        id: tr.id().toHex(),
        type: "Outgoing",
        amount,
        address: faucetId,
        timestamp: tr.blockNum().toString(),
        status: statusObject.isCommitted()
          ? "isCommited"
          : statusObject.isPending()
            ? "isPending"
            : "isFailed",
      };
    });
    return transactions;
  } else {
    if (!inputNotes) {
      throw new Error(
        "Input notes do not match transaction input note nullifiers",
      );
    }
    const transactions = [];
    for (const inputNote of inputNotes) {
      const amount = inputNote
        .details()
        .assets()
        .fungibleAssets()
        .reduce((acc: bigint, asset) => {
          return acc + asset.amount();
        }, BigInt(0));

      if (amount === BigInt(0)) {
        return null;
      }
      // we know that there will be only one input note for incoming transaction
      const statusObject = tr.transactionStatus();
      const transactionType =
        inputNote.metadata()?.sender().toString() === FAUCET_ID.toString()
          ? "Faucet"
          : "Incoming";
      const faucetId = inputNote
        .details()
        .assets()
        .fungibleAssets()[0]
        ?.faucetId()
        .toString();
      transactions.push({
        id: tr.id().toHex(),
        address: faucetId,
        type: transactionType,
        amount: amount,
        timestamp: tr.blockNum().toString(),
        status: statusObject.isCommitted()
          ? "isCommited"
          : statusObject.isPending()
            ? "isPending"
            : "isFailed",
      });
    }
    return transactions;
  }
}

export const createTransactionStore = () =>
  create<TransactionStore, [["zustand/immer", never]]>(
    immer((set) => ({
      loading: false,
      transactions: [],
      loadTransactions: async (record) => {
        set({ loading: true });
        try {
          const transactions: UITransaction[] = record.flatMap((record) =>
            transactionRecordToUITransaction(record),
          );

          transactions.sort(
            (a, b) => Number(b.timestamp) - Number(a.timestamp),
          );
          set({ transactions });
        } catch (error) {
          console.error("Error loading transactions:", error);
        } finally {
          set({ loading: false });
        }
      },
    })),
  );
