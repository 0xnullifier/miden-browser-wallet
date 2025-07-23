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

