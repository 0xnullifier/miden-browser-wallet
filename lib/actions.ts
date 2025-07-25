import { FAUCET_ID as _, RPC_ENDPOINT } from "./constants";

export async function send(client: any, from: string, to: string, amount: bigint, isPrivate: boolean) {
    const { AccountId, NoteType } = await import("@demox-labs/miden-sdk");
    const noteType = isPrivate ? NoteType.Private : NoteType.Public;
    const FAUCET_ID = AccountId.fromHex(_);
    const accountId = AccountId.fromHex(from)
    const toAccountId = to.startsWith("0x") ? AccountId.fromHex(to) : AccountId.fromBech32(to);
    const sendTxRequest = client.newSendTransactionRequest(
        accountId,
        toAccountId,
        FAUCET_ID,
        noteType,
        amount
    )
    let txResult = await client.newTransaction(accountId, sendTxRequest);
    await client.submitTransaction(txResult);
    return txResult
}

export async function importPrivateNote(noteBytes: any) {
    const { WebClient, NoteFilter, NoteFilterTypes } = await import("@demox-labs/miden-sdk")
    const client = await WebClient.createClient(RPC_ENDPOINT)
    try {
        const prevCount = (await client.getInputNotes(new NoteFilter(NoteFilterTypes.All))).length;
        let afterCount = prevCount;
        let retryNumber = 0;
        // somtimes the import is failed due to the note not being ready yet, so we retry until the note is imported
        while (afterCount !== prevCount + 1 && retryNumber < 4) {
            await client.importNote(noteBytes)
            afterCount = (await client.getInputNotes(new NoteFilter(NoteFilterTypes.All))).length;
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