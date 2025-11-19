import { RPC_ENDPOINT } from "./constants";
import { sucessTxToast } from "@/components/success-tsx-toast";
import { FaucetInfo } from "@/store/balance";
import { submitTransactionWithRetry } from "./helper";

export async function send(
  client: any,
  from: string,
  to: string,
  amount: number,
  isPrivate: boolean,
  faucetId: string,
  decimals: number,
  delegate?: boolean,
) {
  console.log("Send called");
  const {
    WebClient,
    AccountId,
    Address,
    NoteType,
    Note,
    NoteAssets,
    FungibleAsset,
    Felt,
    TransactionRequestBuilder,
    MidenArrays,
    OutputNote,
  } = await import("@demox-labs/miden-sdk");
  if (client instanceof WebClient) {
    const noteType = isPrivate ? NoteType.Private : NoteType.Public;
    const FAUCET_ID = AccountId.fromHex(faucetId);
    const accountId = Address.fromBech32(from).accountId();
    const toAccountId = Address.fromBech32(to).accountId();
    const amountInBaseDenom = BigInt(amount * 10 ** decimals);
    const noteAssets = new NoteAssets([
      new FungibleAsset(FAUCET_ID, amountInBaseDenom),
    ]);
    const p2idNote = Note.createP2IDNote(
      accountId,
      toAccountId,
      noteAssets,
      noteType,
      new Felt(BigInt(0)),
    );
    console.log("p2id note", p2idNote.id().toString());
    console.log("p2id note", p2idNote.assets().fungibleAssets()[0].amount());
    const outputP2ID = OutputNote.full(p2idNote);
    let sendTxRequest = new TransactionRequestBuilder()
      .withOwnOutputNotes(new MidenArrays.OutputNoteArray([outputP2ID]))
      .build();
    console.log(
      sendTxRequest
        .expectedOutputOwnNotes()[0]
        .assets()
        .fungibleAssets()[0]
        .amount(),
    );
    let txResult = await submitTransactionWithRetry(
      sendTxRequest,
      client,
      accountId,
      delegate,
    );
    return { tx: txResult, note: p2idNote };
  }
}

export async function importNote(noteBytes: any, receiver: string) {
  const {
    WebClient,
    Address,
    Note,
    NoteAndArgs,
    NoteAndArgsArray,
    TransactionRequestBuilder,
  } = await import("@demox-labs/miden-sdk");
  const client = await WebClient.createClient(RPC_ENDPOINT);
  try {
    console.log("Importing note for receiver:", receiver);
    const p2idNote = Note.deserialize(noteBytes);
    const noteIdAndArgs = new NoteAndArgs(p2idNote, null);

    const consumeRequest = new TransactionRequestBuilder()
      .withUnauthenticatedInputNotes(new NoteAndArgsArray([noteIdAndArgs]))
      .build();

    const digest = await submitTransactionWithRetry(
      consumeRequest,
      client,
      Address.fromBech32(receiver).accountId(),
    );
    sucessTxToast("Received note successfully 🚀", digest);
  } catch (error) {
    console.error("Error importing private note:", error);
  } finally {
    client.terminate();
  }
}

export async function importNoteFile(noteBytes: any) {
  const { NoteFile, WebClient } = await import("@demox-labs/miden-sdk");
  const client = await WebClient.createClient(RPC_ENDPOINT);
  try {
    const prevCount = (await client.getConsumableNotes()).length;
    let afterCount = prevCount;
    let retryNumber = 0;
    // somtimes the import is failed due to the note not being ready yet, so we retry until the note is imported
    while (afterCount !== prevCount + 1 && retryNumber < 5) {
      await client.importNoteFile(NoteFile.deserialize(noteBytes));
      afterCount = (await client.getConsumableNotes()).length;
      console.log("Trying to import, number:", retryNumber);
      retryNumber += 1;
    }
    console.log(afterCount);
  } catch (error) {
    console.error("Error importing private note:", error);
  } finally {
    client.terminate();
  }
}

export async function sendToMany(
  sender: string,
  receipients: { to: string; amount: number; faucet: FaucetInfo }[],
  delegate: boolean = true,
) {
  const {
    WebClient,
    Note,
    AccountId,
    Address,
    NoteAssets,
    FungibleAsset,
    NoteType,
    Felt,
    OutputNote,
    MidenArrays,
    TransactionRequestBuilder,
    TransactionProver,
  } = await import("@demox-labs/miden-sdk");
  const client = await WebClient.createClient(RPC_ENDPOINT);
  try {
    const senderAccountId = Address.fromBech32(sender).accountId();
    const notes = new MidenArrays.OutputNoteArray(
      receipients.map(({ to, amount, faucet }) => {
        const amountInBaseDenom = BigInt(amount * 10 ** faucet.decimals);
        const toAccountId = Address.fromBech32(to).accountId();
        const faucetId = AccountId.fromHex(faucet.address);
        const noteAssets = new NoteAssets([
          new FungibleAsset(faucetId, amountInBaseDenom),
        ]);
        const p2idNote = Note.createP2IDNote(
          senderAccountId,
          toAccountId,
          noteAssets,
          NoteType.Public,
          new Felt(BigInt(0)),
        );
        return OutputNote.full(p2idNote);
      }),
    );
    const txRequest = new TransactionRequestBuilder()
      .withOwnOutputNotes(notes)
      .build();
    const txId = await submitTransactionWithRetry(
      txRequest,
      client,
      senderAccountId,
    );
    return txId;
  } catch (error) {
    console.error("Error sending to many:", error);
    throw new Error(
      "Failed to send to many. Please check the input data and try again.",
    );
  } finally {
    client.terminate();
  }
}
