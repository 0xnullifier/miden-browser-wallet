export type SendPrivateNoteStages = "webrtcStarted" | "receiver-offline" | "pingsent" | "pongreceived" | "noteSent" | "noteReceived" | "noteReceivedAck";

export enum MESSAGE_TYPE {
    PING = "PING",
    PONG = "PONG",
    NOTE_BYTES = "NOTE_BYTES",
    NOTE_RECEIVED_ACK = "NOTE_RECEIVED_ACK",
}
export enum WEBRTC_MESSAGE_TYPE {
    RECEIVER_OFFLINE = "RECEIVER_OFFLINE",
    ANSWER = "ANSWER",
    OFFER = "OFFER",
    ICE_CANDIDATE = "ICE_CANDIDATE",
    CREATE_OFFER = "CREATE_OFFER",
    FORWARD_ANSWER = "FORWARD_ANSWER",
    FORWARD_ICE_CANDIDATE = "FORWARD_ICE_CANDIDATE",
}