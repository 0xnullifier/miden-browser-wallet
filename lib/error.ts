// Format errors given by sdk for frontend

export function formatError(error: any): string {
  const errorStr = error.toString();

  if (errorStr.includes("failed to submit transaction with prover")) {
    return "Prover service is currently unavailable. Proving locally...";
  }
}
