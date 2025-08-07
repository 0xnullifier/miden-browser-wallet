export const MIDEN_WEB_WALLET_LOCAL_STORAGE_KEY = "miden-web-wallet";
export const FAUCET_ID = "mtst1qp22s96v3mlr7gqm660cj749yugyqykl"
export const DECIMALS = 1e8
export const RPC_ENDPOINT = "https://rpc.testnet.miden.io:443";
export const FAUCET_API_ENDPOINT = (address: string, amount: string) => `http://api.midenbrowserwallet.com/faucet/${address}/${amount}`;
export const EXPLORER_URL = (txId: string) => `https://testnet.midenscan.com/tx/${txId}`
export const BASE_URL = typeof window !== "undefined" ? `${window.location.protocol}//${window.location.host}` : "http://localhost:5173"
export const WEBSOCKET_URL = "wss://api.midenbrowserwallet.com/signaling";
export const TX_PROVER_ENDPOINT = 'https://tx-prover.testnet.miden.io';

export const ADD_ADDRESS_API = (address: string) => `${process.env.NEXT_PUBLIC_API_URL}/add/${address}`;
export const STATS_API = `${process.env.NEXT_PUBLIC_API_URL}/stats`;
export const LATEST_TRANSACTIONS_API = `${process.env.NEXT_PUBLIC_API_URL}/latest-transactions`;
export const GET_TRANSACTION = (txId: string) => `${process.env.NEXT_PUBLIC_API_URL}/transaction/${txId}`;
export const GET_CHART_DATA = `${process.env.NEXT_PUBLIC_API_URL}/chart-data`;