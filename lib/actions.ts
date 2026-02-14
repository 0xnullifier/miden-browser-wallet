import { RPC_ENDPOINT } from "./constants";
import { sucessTxToast } from "@/components/success-tsx-toast";
import { FaucetInfo } from "@/store/balance";
import { submitTransactionWithRetry } from "./helper";

export async function send(
  client: import("@miden-sdk/miden-sdk").WebClient,
  from: string,
  to: string,
  amount: number,
  isPrivate: boolean,
  faucetId: string,
  decimals: number,
  message?: string,
  delegate?: boolean,
) {
  const {
    AccountId,
    Address,
    NoteType,
    Note,
    NoteAssets,
    FungibleAsset,
    TransactionRequestBuilder,
    MidenArrays,
    OutputNote,
    NoteAttachment,
    NoteAttachmentScheme,
  } = await import("@miden-sdk/miden-sdk");
  const noteType = isPrivate ? NoteType.Private : NoteType.Public;
  const FAUCET_ID = AccountId.fromHex(faucetId);
  const accountId = Address.fromBech32(from).accountId();
  const toAccountId = Address.fromBech32(to).accountId();
  const amountInBaseDenom = BigInt(amount * 10 ** decimals);
  const noteAssets = new NoteAssets([
    new FungibleAsset(FAUCET_ID, amountInBaseDenom),
  ]);
  console.log("Note assets:", message); // --- IGNORE ---
  const messageAttachment = NoteAttachment.newWord(
    NoteAttachmentScheme.none(),
    await emptyWord(),
  );
  console.log("Message attachment:", messageAttachment); // --- IGNORE ---
  const p2idNote = Note.createP2IDNote(
    accountId,
    toAccountId,
    noteAssets,
    noteType,
    messageAttachment,
  );
  const outputP2ID = OutputNote.full(p2idNote);
  let sendTxRequest = new TransactionRequestBuilder()
    .withOwnOutputNotes(new MidenArrays.OutputNoteArray([outputP2ID]))
    .build();
  let txResult = await submitTransactionWithRetry(
    sendTxRequest,
    client,
    accountId,
    delegate,
  );
  return { tx: txResult, note: p2idNote };
}

export async function importNote(noteBytes: any, receiver: string) {
  const {
    WebClient,
    Address,
    Note,
    NoteAndArgs,
    NoteAndArgsArray,
    TransactionRequestBuilder,
  } = await import("@miden-sdk/miden-sdk");
  const client = new WebClient();
  client.createClient(RPC_ENDPOINT);
  try {
    const p2idNote = Note.deserialize(noteBytes);
    const noteIdAndArgs = new NoteAndArgs(p2idNote, null);

    const consumeRequest = new TransactionRequestBuilder()
      .withInputNotes(new NoteAndArgsArray([noteIdAndArgs]))
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
  const { NoteFile, WebClient } = await import("@miden-sdk/miden-sdk");
  const client = new WebClient();
  client.createClient(RPC_ENDPOINT);
  try {
    const prevCount = (await client.getConsumableNotes()).length;
    let afterCount = prevCount;
    let retryNumber = 0;
    // somtimes the import is failed due to the note not being ready yet, so we retry until the note is imported
    while (afterCount !== prevCount + 1 && retryNumber < 5) {
      await client.importNoteFile(NoteFile.deserialize(noteBytes));
      afterCount = (await client.getConsumableNotes()).length;
      retryNumber += 1;
    }
  } catch (error) {
    console.error("Error importing private note:", error);
  } finally {
    client.terminate();
  }
}

export async function sendToMany(
  sender: string,
  receipients: { to: string; amount: number; faucet: FaucetInfo }[],
) {
  const {
    WebClient,
    Note,
    AccountId,
    Address,
    NoteAssets,
    FungibleAsset,
    NoteType,
    OutputNote,
    MidenArrays,
    TransactionRequestBuilder,
    NoteAttachment,
    NoteAttachmentScheme,
  } = await import("@miden-sdk/miden-sdk");
  const client = new WebClient();
  client.createClient(RPC_ENDPOINT);

  const emptyNoteAttachment = NoteAttachment.newWord(
    NoteAttachmentScheme.none(),
    await emptyWord(),
  );
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
          emptyNoteAttachment,
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

export const messageToWord = async (
  message: string,
): Promise<import("@miden-sdk/miden-sdk").FeltArray> => {
  const { Felt, FeltArray } = await import("@miden-sdk/miden-sdk");
  // one felt can encode 7 ascii bytes, so we convert each character to its char code and create felts
  const messageBytes = Array.from(new TextEncoder().encode(message));
  const felts = [];
  for (let i = 0; i < messageBytes.length; i += 4) {
    let feltValue = BigInt(0);
    for (let j = 0; j < 7; j++) {
      if (i + j < messageBytes.length) {
        feltValue += BigInt(messageBytes[i + j]) << BigInt(8 * j);
      }
    }
    felts.push(new Felt(feltValue));
  }
  return new FeltArray(felts);
};

export const emptyWord = async () => {
  const { Word, Felt } = await import("@miden-sdk/miden-sdk");
  // an empty word is 4 felts of value 0
  return Word.newFromFelts([
    new Felt(BigInt(1)),
    new Felt(BigInt(2)),
    new Felt(BigInt(3)),
    new Felt(BigInt(4)),
  ]);
};
