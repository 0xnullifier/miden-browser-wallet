/// the transaction store
import { FAUCET_ID } from "@/lib/constants";
import { time } from "console";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
export interface UITransaction {
  id: string;
  type: "Incoming" | "Outgoing" | "Faucet";
  amount: bigint;
  blockNumber: string;
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
    const transactions: UITransaction[] = outputNotes.map((note) => {
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
        blockNumber: tr.blockNum().toString(),
        timestamp: formatDate(new Date(Number(tr.creationTimestamp()) * 1000)),
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
    const transactions: UITransaction[] = [];
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
        blockNumber: tr.blockNum().toString(),
        timestamp: formatDate(new Date(Number(tr.creationTimestamp()) * 1000)),
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
            (a, b) => Number(b.blockNumber) - Number(a.blockNumber),
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

const formatDate = (date: Date) => {
  const yyyy = date.getFullYear();
  let mm = date.getMonth() + 1; // Months start at 0!
  let dd = date.getDate();
  let ddStr = dd.toString();
  let mmStr = mm.toString();
  if (dd < 10) ddStr = "0" + dd;
  if (mm < 10) mmStr = "0" + mm;

  return dd + "." + mm + "." + yyyy;
};
