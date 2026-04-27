export interface BackendTransaction {
  tx_id: string;
  tx_kind: "send" | "receive" | "faucet_request";
  sender: string;
  timestamp: string; // timestamp in UNIX format in seconds
  block_num: string;
  note_id?: {
    note_id: string;
    note_type: string;
    note_aux: string;
  };
}
