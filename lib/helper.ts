import { TX_PROVER_ENDPOINT } from "@/lib/constants";

export async function submitTransactionWithRetry(
  transactionRequest: any,
  client: any,
  accountId: any,
  delegate: boolean = true,
) {
  const { TransactionRequest, WebClient, AccountId, TransactionProver } =
    await import("@demox-labs/miden-sdk");
  const prover = TransactionProver.newRemoteProver(TX_PROVER_ENDPOINT);
  // just to get types
  if (
    transactionRequest instanceof TransactionRequest &&
    client instanceof WebClient &&
    accountId instanceof AccountId
  ) {
    const executedTransaction = await client.executeTransaction(
      accountId,
      transactionRequest,
    );
    let provenTx: any;
    if (delegate) {
      try {
        provenTx = await client.proveTransaction(executedTransaction, prover);
      } catch (error) {
        console.log("proving locally");
        // prover failed prove locally
        provenTx = await client.proveTransaction(
          executedTransaction,
          TransactionProver.newLocalProver(),
        );
      }
    } else {
      // do not delegate
      provenTx = await client.proveTransaction(
        executedTransaction,
        TransactionProver.newLocalProver(),
      );
    }
    console.log(provenTx);
    const submissionHeight = await client.submitProvenTransaction(
      provenTx,
      executedTransaction,
    );
    console.log(submissionHeight);
    await client.applyTransaction(executedTransaction, submissionHeight);
    return executedTransaction.id().toHex();
  }
}
