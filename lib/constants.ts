const devnet = false; // if deploying in devnet turn to true
export const BASE_API_URL = process.env.NODE_ENV == "development" ? "http://localhost:8000" : "https://api.midenbrowserwallet.com"
export const MIDEN_WEB_WALLET_LOCAL_STORAGE_KEY = "miden-web-wallet";
export const FAUCET_ID = "0xc8631aee9dcb5b201457dad3575a9e"
export const DECIMALS = 1e8
export const RPC_ENDPOINT = process.env.NODE_ENV === "development" ? "https://rpc.testnet.miden.io:443" : (devnet ? "https://rpc.devnet.miden.io:443" : "https://rpc.testnet.miden.io:443");
export const FAUCET_API_ENDPOINT = (address: string, amount: string) => `${process.env.NODE_ENV === "development" ? "http://localhost:9090" : BASE_API_URL}/mint/${address}/${amount}`;
export const EXPLORER_URL = (txId: string) => `https://testnet.midenscan.com/tx/${txId}`
export const BASE_URL = typeof window !== "undefined" ? `${window.location.protocol}//${window.location.host}` : "http://localhost:5173"
export const WEBSOCKET_URL = "wss://api.midenbrowserwallet.com/signaling";
export const TX_PROVER_ENDPOINT = process.env.NODE_ENV === "development" ? "https://tx-prover.testnet.miden.io" : (devnet ? "https://tx-prover.devnet.miden.io" : 'https://tx-prover.testnet.miden.io');
export const ADD_ADDRESS_API = (address: string) => `${BASE_API_URL}/add/${address}`;
export const STATS_API = `${BASE_API_URL}/stats`;
export const LATEST_TRANSACTIONS_API = `${BASE_API_URL}/latest-transactions`;
export const GET_TRANSACTION = (txId: string) => `${BASE_API_URL}/transaction/${txId}`;
export const GET_CHART_DATA = `${BASE_API_URL}/chart-data`;
export const GET_ADDRESS_TRANSACTIONS = (address: string, page: number) => `${BASE_API_URL}/transactions/${address}/${page}`;
export const GET_TRANSACTION_COUNT = (address: string) => `${BASE_API_URL}/transactions/${address}/count`;
export const BECH32_PREFIX = "mdev";
export const ERROR_THROWN_ON_VERSION_MISMATCH = 'store error: error deserializing data from the store: unexpected EOF'
