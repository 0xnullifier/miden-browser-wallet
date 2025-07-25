import { FAUCET_API_ENDPOINT, FAUCET_ID, RPC_ENDPOINT } from "@/lib/constants";
import axios from "axios";
import { create } from "zustand";
import { sucessTxToast } from "@/components/success-tsx-toast";
import { toast } from "sonner";


export interface BalanceState {
    loading: boolean;
    faucetLoading: boolean;
    consumingLoading: boolean;
    balance: bigint;
    loadBalance: (client: any, accountId: string) => Promise<void>;
    faucet: (accountId: string, amount: string) => Promise<void>;
}

export const createBalanceStore = () => create<BalanceState, [["zustand/immer", never]]>((set, get) => ({
    loading: false,
    faucetLoading: false,
    consumingLoading: false,
    balance: BigInt(0),


    loadBalance: async (client, _accountId) => {
        const { AccountId } = await import("@demox-labs/miden-sdk");
        const accountId = AccountId.fromHex(_accountId);
        const { consumingLoading } = get()
        set({ loading: true });
        const accountRecord = await client.getAccount(accountId)
        if (!accountRecord) {
            set({ loading: false, balance: BigInt(0) });
            throw new Error("Account Record not found");
        }
        const balance = accountRecord.vault().getBalance(AccountId.fromHex(FAUCET_ID));
        set({ loading: false, balance });

        const consumableNotes = await client.getConsumableNotes();
        if (consumableNotes.length === 0) {
            console.log("No pending balance to consume");
            return;
        } else if (!consumingLoading) {

            set({ consumingLoading: true });
            try {
                toast.info(`Found ${consumableNotes.length} pending notes to consume, consuming...`, {
                    position: "top-right"
                });
                const noteIds = consumableNotes.map((note: any) => note.inputNoteRecord().id().toString());
                const consumeTxRequest = client.newConsumeTransactionRequest(noteIds)
                const txResult = await client.newTransaction(accountId, consumeTxRequest)
                const txId = txResult.executedTransaction().id().toHex()
                await client.submitTransaction(txResult)
                sucessTxToast(`Consumed ${noteIds.length} successfully`, txId)
            } catch (error) {
                console.error("Error consuming notes:", error);
            } finally {
                set({ consumingLoading: false });
            }
        }

    },

    faucet: async (accountId, amount) => {
        set({ faucetLoading: true });
        try {
            const txId = await axios.get(FAUCET_API_ENDPOINT(accountId, amount.toString()))
            sucessTxToast("Faucet used successfully", txId.data);
        } catch (error) {
            console.error("Faucet request failed:", error);
        } finally {
            set({ faucetLoading: false });
        }
    }
}));
