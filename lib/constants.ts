const devnet = process.env.NEXT_PUBLIC_CHAIN === "devnet"; // if deploying in devnet turn to true
export const BASE_API_URL =
  process.env.NODE_ENV == "development"
    ? "http://localhost:8000"
    : "https://api.midenbrowserwallet.com";
export const MIDEN_WEB_WALLET_LOCAL_STORAGE_KEY = "miden-web-wallet-v11.1.0";
export const FAUCET_ID = process.env.NEXT_PUBLIC_FAUCET_ID;
export const DECIMALS = 8;
export const RPC_ENDPOINT = devnet
  ? "https://rpc.devnet.miden.io:443"
  : "https://rpc.testnet.miden.io:443";
export const FAUCET_API_ENDPOINT = (address: string, amount: string) =>
  `${process.env.NODE_ENV === "development" ? "http://localhost:9090" : BASE_API_URL}/mint/${address}/${amount}`;
export const EXPLORER_URL = (txId: string) =>
  devnet
    ? `https://devnet.midenscan.com/tx/${txId}`
    : `https://testnet.midenscan.com/tx/${txId}`;
export const EXPLORER_ADDRESS_URL = (address: string) =>
  `https://testnet.midenscan.com/account/${address}`;
export const BASE_URL =
  typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.host}`
    : "http://localhost:5173";
export const WEBSOCKET_URL = "wss://api.midenbrowserwallet.com/signaling";
export const TX_PROVER_ENDPOINT = devnet
  ? "https://tx-prover.devnet.miden.io"
  : "https://tx-prover.testnet.miden.io";
export const ADD_ADDRESS_API = (address: string) =>
  `${BASE_API_URL}/add/${address}`;
export const STATS_API = `${BASE_API_URL}/stats`;
export const LATEST_TRANSACTIONS_API = `${BASE_API_URL}/latest-transactions`;
export const GET_TRANSACTION = (txId: string) =>
  `${BASE_API_URL}/transaction/${txId}`;
export const GET_CHART_DATA = `${BASE_API_URL}/chart-data`;
export const GET_ADDRESS_TRANSACTIONS = (address: string, page: number) =>
  `${BASE_API_URL}/transactions/${address}/${page}`;
export const GET_TRANSACTION_COUNT = (address: string) =>
  `${BASE_API_URL}/transactions/${address}/count`;
export const BECH32_PREFIX = "mdev";
export const ERROR_THROWN_ON_VERSION_MISMATCH =
  "store error: error deserializing data from the store: unexpected EOF";
export const ERROR_THROWN_ON_VERSION_MISMATCH_11_TO_12 =
  "Failed to initialize WebStore";
export const GITHUB_FEEDBACK_URL =
  "https://github.com/0xnullifier/miden-browser-wallet/issues/new?template=feedback.md";
export const NETWORK_ID = async () => {
  const { NetworkId } = await import("@demox-labs/miden-sdk");
  return devnet ? NetworkId.Devnet : NetworkId.Testnet;
};
export const PRIVATE_NOTE_TRANSPORT_URL = "https://transport.miden.io";
