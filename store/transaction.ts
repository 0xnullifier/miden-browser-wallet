/// the transaction store

import { FAUCET_ID } from "@/lib/constants";

export interface UITransaction {
    type: "Incoming" | "Outgoing" | "Faucet";
    amount: bigint;
    timestamp: string;
    status: "isCommited" | "isPending" | "isFailed";
}


export interface TransactionStore {
    loading: boolean;
    transactions: UITransaction[];
    loadTransactions: (transactionReacords: any, inputNotes: any) => Promise<void>;
}
function transactionRecordToUITransaction(transactionRecord: any, inputNote?: any): UITransaction {
    const outputNotes = transactionRecord.outputNotes().notes().map(note => note.intoFull()).filter((note) => note !== undefined);
    const isOutgoing = outputNotes.length > 0;
    if (isOutgoing) {
        const amount = outputNotes.reduce((acc: bigint, note) => {
            const fungibleAssets = note.assets().fungibleAssets();
            return acc + fungibleAssets.reduce((sum: bigint, asset) => sum + asset.amount(), 0n);
        }, 0n);
        const statusObject = transactionRecord.transactionStatus()
        return {
            type: "Outgoing",
            amount,
            timestamp: transactionRecord.blockNum().toString(),
            status: (statusObject.isCommitted()) ? "isCommited" : (statusObject.isPending()) ? "isPending" : "isFailed"
        }
    }

    const inputNoteNullifier = transactionRecord.inputNoteNullifiers();
    if (inputNoteNullifier.length > 0) {
        if (!inputNote || inputNote.length !== inputNoteNullifier.length) {
            throw new Error("Input notes do not match transaction input note nullifiers");
        }

        const amount = inputNote.reduce((acc: bigint, note) => {
            const fungibleAssets = note.details().assets().fungibleAssets();
            return acc + fungibleAssets.reduce((sum: bigint, asset) => sum + asset.amount(), 0n);
        }, 0n);

        const statusObject = transactionRecord.transactionStatus()
        const transactionType = inputNote[0].metadata()?.sender().toString() === FAUCET_ID.toString() ? "Faucet" : "Incoming";
        return {
            type: transactionType,
            amount: amount,
            timestamp: transactionRecord.blockNum().toString(),
            status: (statusObject.isCommitted()) ? "isCommited" : (statusObject.isPending()) ? "isPending" : "isFailed"
        }
    }
    throw new Error("Transaction does not have input or output notes");
}


import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const createTransactionStore = () => create<TransactionStore, [["zustand/immer", never]]>(
    immer((set) => ({
        loading: false,
        transactions: [],
        loadTransactions: async (transactionRecords, inputNotes) => {
            set({ loading: true });
            try {
                const transactions: UITransaction[] = transactionRecords.map((transactionRecord) => {
                    const inputNoteNullifiers = transactionRecord.inputNoteNullifiers().map(note => note.toHex());
                    const inputNotesForTr = inputNotes.filter(note => inputNoteNullifiers.includes(note.nullifier()))
                    return transactionRecordToUITransaction(transactionRecord, inputNotesForTr);
                })
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


