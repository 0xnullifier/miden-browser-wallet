import { TX_PROVER_ENDPOINT } from "@/lib/constants";

export async function submitTransactionWithRetry(
  transactionRequest: import("@miden-sdk/miden-sdk").TransactionRequest,
  client: import("@miden-sdk/miden-sdk").WebClient,
  accountId: import("@miden-sdk/miden-sdk").AccountId,
  delegate: boolean = true,
) {
  const { TransactionProver } = await import("@miden-sdk/miden-sdk");
  const prover = TransactionProver.newRemoteProver(TX_PROVER_ENDPOINT);
  if (delegate) {
    try {
      const txId = await client.submitNewTransactionWithProver(
        accountId,
        transactionRequest,
        prover,
      );
      return txId.toHex();
    } catch (error) {
      // prover failed prove locally
      const txId = await client.submitNewTransactionWithProver(
        accountId,
        transactionRequest,
        TransactionProver.newLocalProver(),
      );
      return txId.toHex();
    }
  } else {
    const txId = await client.submitNewTransactionWithProver(
      accountId,
      transactionRequest,
      TransactionProver.newLocalProver(),
    );
    return txId.toHex();
  }
}
