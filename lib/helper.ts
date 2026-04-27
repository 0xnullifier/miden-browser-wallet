import { TX_PROVER_ENDPOINT } from "@/lib/constants";

export async function submitTransactionWithRetry(
  transactionRequest: any,
  client: any,
  accountId: any,
  delegate: boolean = true,
) {
  const { TransactionRequest, WasmWebClient, AccountId, TransactionProver } =
    await import("@miden-sdk/miden-sdk");
  const prover = TransactionProver.newRemoteProver(TX_PROVER_ENDPOINT);
  if (
    transactionRequest instanceof TransactionRequest &&
    client instanceof WasmWebClient &&
    accountId instanceof AccountId
  ) {
    const executedTransaction = await client.executeTransaction(
      accountId,
      transactionRequest,
    );
    let provenTx: any;
    if (delegate) {
      try {
        provenTx = await client.proveTransactionWithProver(
          executedTransaction,
          prover,
        );
      } catch (error) {
        console.log("proving locally");
        provenTx = await client.proveTransactionWithProver(
          executedTransaction,
          TransactionProver.newLocalProver(),
        );
      }
    } else {
      provenTx = await client.proveTransactionWithProver(
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
