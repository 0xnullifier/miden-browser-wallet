export const MIDEN_WEB_WALLET_LOCAL_STORAGE_KEY = "miden-web-wallet";
export const FAUCET_ID = "0xd022f4185c25c82068c50b468f8b59"
export const DECIMALS = 1e8
export const RPC_ENDPOINT = "https://rpc.testnet.miden.io:443";
export const FAUCET_API_ENDPOINT = (address: string, amount: string) => `https://faucet.zeroleaks.xyz/mint/${address}/${amount}`
export const EXPLORER_URL = (txId: string) => `https://testnet.midenscan.com/tx/${txId}`
export const BASE_URL = typeof window !== "undefined" ? `${window.location.protocol}//${window.location.host}` : "http://localhost:5173"
