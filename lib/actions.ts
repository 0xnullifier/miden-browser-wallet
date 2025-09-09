import { toast } from "sonner";
import { FAUCET_ID as _, DECIMALS, RPC_ENDPOINT, TX_PROVER_ENDPOINT } from "./constants";
import { sucessTxToast } from "@/components/success-tsx-toast";

export async function send(client: any, from: string, to: string, amount: number, isPrivate: boolean, delegate?: boolean) {
    const { WebClient, AccountId, NoteType, TransactionProver, Note, NoteAssets, FungibleAsset, Felt, TransactionRequestBuilder, OutputNotesArray, OutputNote } = await import("@demox-labs/miden-sdk");
    if (client instanceof WebClient) {
        const noteType = isPrivate ? NoteType.Private : NoteType.Public;
        const FAUCET_ID = AccountId.fromHex(_);
        const accountId = AccountId.fromBech32(from)
        const toAccountId = to.startsWith("0x") ? AccountId.fromHex(to) : AccountId.fromBech32(to);
        const amountInBaseDenom = BigInt(Math.trunc(amount * DECIMALS))
        const noteAssets = new NoteAssets([
            new FungibleAsset(FAUCET_ID, amountInBaseDenom)
        ])
        const p2idNote = Note.createP2IDNote(
            accountId,
            toAccountId,
            noteAssets,
            noteType,
            new Felt(BigInt(0))
        );
        const outputP2ID = OutputNote.full(p2idNote);
        let sendTxRequest = new TransactionRequestBuilder()
            .withOwnOutputNotes(new OutputNotesArray([outputP2ID]))
            .build()

        const prover = delegate ? TransactionProver.newRemoteProver(TX_PROVER_ENDPOINT) : null
        let txResult = await client.newTransaction(accountId, sendTxRequest);
        await client.submitTransaction(txResult, prover);
        return { tx: txResult, note: p2idNote };
    }
}

export async function importNote(noteBytes: any, receiver: string) {
    const { TransactionProver, WebClient, Note, NoteAndArgs, NoteAndArgsArray, TransactionRequestBuilder, AccountId } = await import("@demox-labs/miden-sdk")
    const client = await WebClient.createClient(RPC_ENDPOINT)
    const prover = TransactionProver.newRemoteProver(TX_PROVER_ENDPOINT);
    try {
        const p2idNote = Note.deserialize(noteBytes);
        console.log("Deserialized Note:", p2idNote);
        console.log("Receiver Account ID:", receiver);
        const noteIdAndArgs = new NoteAndArgs(p2idNote, null);

        const consumeRequest = new TransactionRequestBuilder()
            .withUnauthenticatedInputNotes(new NoteAndArgsArray([noteIdAndArgs]))
            .build();

        const txExecutionResult = await client.newTransaction(
            AccountId.fromBech32(receiver),
            consumeRequest,
        );
        const digest = txExecutionResult.executedTransaction().id().toString();

        await client.submitTransaction(txExecutionResult, prover);
        sucessTxToast("Received note successfully 🚀", digest)
    } catch (error) {
        console.error("Error importing private note:", error);
    } finally {
        client.terminate()
    }

}

export async function sendToMany(sender: string, receipients: { to: string, amount: bigint }[], delegate: boolean = true) {
    const { WebClient, Note, AccountId, NoteAssets, FungibleAsset, NoteType, Felt, OutputNote, OutputNotesArray, TransactionRequestBuilder, TransactionProver } = await import("@demox-labs/miden-sdk");
    const client = await WebClient.createClient(RPC_ENDPOINT);
    const faucetId = AccountId.fromBech32(_);
    try {
        const senderAccountId = AccountId.fromBech32(sender);
        const notes = new OutputNotesArray(receipients.map(({ to, amount }) => {
            const toAccountId = to.startsWith("0x") ? AccountId.fromHex(to) : AccountId.fromBech32(to);
            const noteAssets = new NoteAssets([
                new FungibleAsset(faucetId, amount)
            ])
            const p2idNote = Note.createP2IDNote(senderAccountId, toAccountId, noteAssets, NoteType.Public, new Felt(BigInt(0)));
            return OutputNote.full(p2idNote);
        }))
        const txRequest = new TransactionRequestBuilder()
            .withOwnOutputNotes(notes)
            .build()
        const txResult = await client.newTransaction(senderAccountId, txRequest);
        const prover = delegate ? TransactionProver.newRemoteProver(TX_PROVER_ENDPOINT) : null
        await client.submitTransaction(txResult, prover);
        return txResult;
    } catch (error) {
        console.error("Error sending to many:", error);
        throw new Error("Failed to send to many. Please check the input data and try again.");
    } finally {
        client.terminate()
    }
}