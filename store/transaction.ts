/// the transaction store

import { FAUCET_ID } from "@/lib/constants";

export interface UITransaction {
    id: string,
    type: "Incoming" | "Outgoing" | "Faucet";
    amount: bigint;
    timestamp: string;
    status: "isCommited" | "isPending" | "isFailed";
}


export interface TransactionStore {
    loading: boolean;
    transactions: UITransaction[];
    loadTransactions: (record: { tr: any, inputNote: any | undefined }[]) => Promise<void>;
}
function transactionRecordToUITransaction({ tr, inputNote }: { tr: any, inputNote: any | undefined }): UITransaction {
    console.log(inputNote)
    if (inputNote === undefined || inputNote.length === 0) {
        const outputNotes = tr.outputNotes().notes().map((note) => note.intoFull())
        const amount = outputNotes.reduce((acc: bigint, note) => {
            const fungibleAssets = note?.assets().fungibleAssets().filter((asset) => asset.faucetId().toString() === FAUCET_ID);
            return acc + (fungibleAssets?.reduce((sum: bigint, asset) => sum + asset.amount(), BigInt(0)) || BigInt(0));
        }, BigInt(0));
        const statusObject = tr.transactionStatus()
        return {
            id: tr.id().toHex(),
            type: "Outgoing",
            amount,
            timestamp: tr.blockNum().toString(),
            status: (statusObject.isCommitted()) ? "isCommited" : (statusObject.isPending()) ? "isPending" : "isFailed"
        }
    } else {
        if (!inputNote) {
            throw new Error("Input notes do not match transaction input note nullifiers");
        }

        const amount = inputNote.reduce((acc: bigint, note) => {
            const fungibleAssets = note.details().assets().fungibleAssets().filter((asset) => asset.faucetId().toString() === FAUCET_ID);
            return acc + fungibleAssets.reduce((sum: bigint, asset) => sum + asset.amount(), BigInt(0));
        }, BigInt(0));

        const statusObject = tr.transactionStatus()
        const transactionType = inputNote[0].metadata()?.sender().toString() === FAUCET_ID.toString() ? "Faucet" : "Incoming";
        return {
            id: tr.id().toHex(),
            type: transactionType,
            amount: amount,
            timestamp: tr.blockNum().toString(),
            status: (statusObject.isCommitted()) ? "isCommited" : (statusObject.isPending()) ? "isPending" : "isFailed"
        }
    }
}


import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const createTransactionStore = () => create<TransactionStore, [["zustand/immer", never]]>(
    immer((set) => ({
        loading: false,
        transactions: [],
        loadTransactions: async (record) => {
            set({ loading: true });
            try {
                const transactions: UITransaction[] = record.map((record) => transactionRecordToUITransaction(record))
                transactions.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
                set({ transactions });
            } catch (error) {
                console.error("Error loading transactions:", error);
            } finally {
                set({ loading: false });
            }
        },
    }))
);


