import { FAUCET_ID as _, DECIMALS, RPC_ENDPOINT, TX_PROVER_ENDPOINT } from "./constants";

export async function send(client: any, from: string, to: string, amount: number, isPrivate: boolean, delegate?: boolean) {
    const { WebClient, AccountId, NoteType, TransactionProver, Note, NoteAssets, FungibleAsset, Felt, Word, TransactionRequestBuilder, OutputNotesArray, OutputNote } = await import("@demox-labs/miden-sdk");
    if (client instanceof WebClient) {
        const noteType = isPrivate ? NoteType.Private : NoteType.Public;
        const FAUCET_ID = AccountId.fromBech32(_);
        const accountId = AccountId.fromBech32(from)
        const toAccountId = to.startsWith("0x") ? AccountId.fromHex(to) : AccountId.fromBech32(to);
        const amountInBaseDenom = BigInt(Math.trunc(amount * DECIMALS))
        // const sendTxRequest = client.newSendTransactionRequest(
        //     accountId,
        //     toAccountId,
        //     FAUCET_ID,
        //     noteType,
        //     amountInBaseDenom
        // )
        const noteAssets = new NoteAssets([
            new FungibleAsset(FAUCET_ID, amountInBaseDenom)
        ])
        const randomNums = crypto.getRandomValues(new Uint32Array(4));
        const serialNum = Word.newFromFelts([new Felt(BigInt(randomNums[0])), new Felt(BigInt(randomNums[1])), new Felt(BigInt(randomNums[2])), new Felt(BigInt(randomNums[3]))]);
        const p2idNote = Note.createP2IDNote(
            accountId,
            toAccountId,
            noteAssets,
            noteType,
            serialNum,
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

export async function importPrivateNote(noteBytes: any) {
    const { WebClient, NoteFilter, NoteFilterTypes } = await import("@demox-labs/miden-sdk")
    const client = await WebClient.createClient(RPC_ENDPOINT)
    try {
        const prevCount = (await client.getConsumableNotes()).length;
        let afterCount = prevCount;
        let retryNumber = 0;
        // somtimes the import is failed due to the note not being ready yet, so we retry until the note is imported
        while (afterCount !== prevCount + 1 && retryNumber < 10) {
            await client.importNote(noteBytes)
            afterCount = (await client.getConsumableNotes()).length;
            console.log("Trying to import, number:", retryNumber);
            retryNumber += 1;
        }
        console.log(afterCount)
    } catch (error) {
        console.error("Error importing note:", error);
        throw new Error("Failed to import note. Please check the note format and try again.");
    } finally {
        client.terminate()
    }
}

export async function sendToMany(sender: string, receipients: { to: string, amount: bigint }[], delegate: boolean = true) {
    const { WebClient, Note, AccountId, NoteAssets, FungibleAsset, NoteType, Word, Felt, OutputNote, OutputNotesArray, TransactionRequestBuilder, TransactionProver } = await import("@demox-labs/miden-sdk");
    const client = await WebClient.createClient(RPC_ENDPOINT);
    const faucetId = AccountId.fromBech32(_);
    try {
        const senderAccountId = AccountId.fromBech32(sender);
        const notes = new OutputNotesArray(receipients.map(({ to, amount }) => {
            const toAccountId = to.startsWith("0x") ? AccountId.fromHex(to) : AccountId.fromBech32(to);
            const noteAssets = new NoteAssets([
                new FungibleAsset(faucetId, amount)
            ])
            const randomNums = crypto.getRandomValues(new Uint32Array(4));
            const serialNum = Word.newFromFelts([new Felt(BigInt(randomNums[0])), new Felt(BigInt(randomNums[1])), new Felt(BigInt(randomNums[2])), new Felt(BigInt(randomNums[3]))]);
            const p2idNote = Note.createP2IDNote(senderAccountId, toAccountId, noteAssets, NoteType.Public, serialNum, new Felt(BigInt(0)));
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