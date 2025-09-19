import { toast } from "sonner";
import { RPC_ENDPOINT, TX_PROVER_ENDPOINT } from "./constants";
import { sucessTxToast } from "@/components/success-tsx-toast";

export async function send(client: any, from: string, to: string, amount: number, isPrivate: boolean, faucetId: string, decimals: number, delegate?: boolean) {
    const { WebClient, AccountId, Address, NoteType, TransactionProver, Note, NoteAssets, FungibleAsset, Felt, TransactionRequestBuilder, OutputNotesArray, OutputNote } = await import("@demox-labs/miden-sdk");
    if (client instanceof WebClient) {
        const noteType = isPrivate ? NoteType.Private : NoteType.Public;
        const FAUCET_ID = AccountId.fromHex(faucetId);
        const accountId = Address.fromBech32(from).accountId()
        const toAccountId = to.startsWith("0x") ? AccountId.fromHex(to) : Address.fromBech32(to).accountId();
        const amountInBaseDenom = BigInt(amount) * BigInt(10 ** decimals);
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
    const { TransactionProver, WebClient, Address, Note, NoteAndArgs, NoteAndArgsArray, TransactionRequestBuilder } = await import("@demox-labs/miden-sdk")
    const client = await WebClient.createClient(RPC_ENDPOINT)
    const prover = TransactionProver.newRemoteProver(TX_PROVER_ENDPOINT);
    try {
        const p2idNote = Note.deserialize(noteBytes);
        const noteIdAndArgs = new NoteAndArgs(p2idNote, null);

        const consumeRequest = new TransactionRequestBuilder()
            .withUnauthenticatedInputNotes(new NoteAndArgsArray([noteIdAndArgs]))
            .build();

        const txExecutionResult = await client.newTransaction(
            Address.fromBech32(receiver).accountId(),
            consumeRequest,
        );
        const digest = txExecutionResult.executedTransaction().id().toHex();

        await client.submitTransaction(txExecutionResult, prover);
        sucessTxToast("Received note successfully 🚀", digest)
    } catch (error) {
        console.error("Error importing private note:", error);
    } finally {
        client.terminate()
    }

}

export async function sendToMany(sender: string, receipients: { to: string, amount: bigint }[], _faucetId: string, decimals: number, delegate: boolean = true) {
    const { WebClient, Note, AccountId, Address, NoteAssets, FungibleAsset, NoteType, Felt, OutputNote, OutputNotesArray, TransactionRequestBuilder, TransactionProver } = await import("@demox-labs/miden-sdk");
    const client = await WebClient.createClient(RPC_ENDPOINT);
    const faucetId = AccountId.fromHex(_faucetId);
    try {
        const senderAccountId = Address.fromBech32(sender).accountId();
        const notes = new OutputNotesArray(receipients.map(({ to, amount }) => {
            const amountInBaseDenom = amount * BigInt(10 ** decimals);
            const toAccountId = to.startsWith("0x") ? AccountId.fromHex(to) : Address.fromBech32(to).accountId();
            const noteAssets = new NoteAssets([
                new FungibleAsset(faucetId, amountInBaseDenom)
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