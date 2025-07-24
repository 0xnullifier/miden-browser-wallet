"use client";

import { RPC_ENDPOINT, WEBSOCKET_URL } from "@/lib/constants";
import { MESSAGE_TYPE, SendPrivateNoteStages, WEBRTC_MESSAGE_TYPE } from "@/lib/types";
import { useReceiverRef } from "@/providers/receiver-provider";
import { useMidenSdkStore } from "@/providers/sdk-provider";
import { useWebRtcStore } from "@/providers/webrtc-provider";
import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";

const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] }
export const useWebRtc = () => {
    const account = useMidenSdkStore((state) => state.account);
    const receiverRef = useReceiverRef()
    const setWebSocket = useWebRtcStore((state) => state.setWebSocket);
    const setDataChannel = useWebRtcStore((state) => state.setDataChannel);
    const setPeerConnection = useWebRtcStore((state) => state.setPeerConnection);
    const setStage = useWebRtcStore((state) => state.setPrivateNoteStage);
    useEffect(() => {
        if (account) {
            const ws = new WebSocket(WEBSOCKET_URL);
            const pc = new RTCPeerConnection(configuration);
            const dc = pc.createDataChannel("privateNoteChannel");

            dc.onopen = () => {
                if (receiverRef.current !== account) {
                    dc.send(JSON.stringify({ type: "PING" }));
                    setStage("pingsent")
                }
                console.log("remote data channel is open");
            }
            dc.onmessage = async (event) => await handleDataChannelMessage(event, dc, setStage)
            dc.onclose = () => {
                console.log("Data channel is closed");
            }

            pc.ondatachannel = (event) => {
                const incomingChannel = event.channel;
                incomingChannel.onmessage = async (event) => await handleDataChannelMessage(event, incomingChannel, setStage);
                incomingChannel.onopen = () => {
                    console.log("Incoming data channel is open");
                }
                incomingChannel.onclose = () => {
                    console.log("Incoming data channel is closed");
                }
                setDataChannel(incomingChannel)
            }

            ws.onopen = () => {
                ws.send(JSON.stringify({ type: "REGISTER", wallet: account }))
            }

            ws.onmessage = async (event) => {
                const message = JSON.parse(event.data);
                console.log("Received message:", message);
                switch (message.type) {
                    case WEBRTC_MESSAGE_TYPE.RECEIVER_OFFLINE:
                        console.log("Receiver is offline, waiting for them to come online...");
                        setStage("receiver-offline");
                        break;
                    case WEBRTC_MESSAGE_TYPE.ANSWER:
                        if (message.answer) {
                            const remoteDesc = new RTCSessionDescription(message.answer);
                            await pc.setRemoteDescription(remoteDesc)
                            console.log("Received answer from:", message.from);
                        }
                        break;
                    case WEBRTC_MESSAGE_TYPE.OFFER:
                        console.log("Received offer from:", message.from);
                        if (message.offer) {
                            await pc.setRemoteDescription(message.offer)
                            const answer = await pc.createAnswer();
                            await pc.setLocalDescription(answer);
                            ws.send(JSON.stringify({
                                type: WEBRTC_MESSAGE_TYPE.FORWARD_ANSWER,
                                answer: answer,
                                to: message.from,
                            }))
                            console.log(pc)
                            // the receiver in this case is the one who sent the offer
                            receiverRef.current = message.from;
                        }
                        break;
                    case WEBRTC_MESSAGE_TYPE.ICE_CANDIDATE:
                        console.log("Received ICE candidate from:", message.from);
                        if (message.iceCandidate) {
                            try {
                                await pc.addIceCandidate(message.iceCandidate);
                            } catch (e) {
                                console.error('Error adding received ice candidate', e);
                            }
                        } else {
                            await pc.addIceCandidate(null)
                        }
                        break;
                }
            }
            pc.onicecandidate = (event) => {
                console.log("ICE candidate event:", event);
                if (event.candidate) {
                    ws.send(JSON.stringify({
                        type: WEBRTC_MESSAGE_TYPE.FORWARD_ICE_CANDIDATE,
                        candidate: event.candidate,
                        to: receiverRef.current,
                    }));
                } else {
                    ws.send(JSON.stringify({
                        type: WEBRTC_MESSAGE_TYPE.FORWARD_ICE_CANDIDATE,
                        candidate: null,
                        to: receiverRef.current,
                    }));
                }
            }

            pc.addEventListener('connectionstatechange', (event) => {
                console.log('Connection state changed:', pc.connectionState);
                if (pc.connectionState === 'connected') {
                    console.log('Peer connection established');
                } else if (pc.connectionState === 'disconnected') {
                    console.log('Peer connection disconnected');
                } else if (pc.connectionState === 'failed') {
                    console.log('Peer connection failed');
                }
            })

            setPeerConnection(pc);
            setWebSocket(ws);

            // Cleanup function
            return () => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.close();
                }
                pc.close();
                setDataChannel(null);
            };
        }

    }, [account])

}


const handleDataChannelMessage = async (event: MessageEvent<any>, dc: RTCDataChannel, setStage: (stage: SendPrivateNoteStages) => void) => {
    const message = JSON.parse(event.data);
    switch (message.type) {
        case MESSAGE_TYPE.PING:
            dc.send(JSON.stringify({ type: "PONG" }));
            break;
        case MESSAGE_TYPE.PONG:
            setStage("pongreceived")
            break;
        case MESSAGE_TYPE.NOTE_BYTES:
            try {
                const { WebClient } = await import("@demox-labs/miden-sdk")
                const client = await WebClient.createClient(RPC_ENDPOINT)
                await client.importNote(message.bytes)
                console.log("Received note bytes:", message.bytes);
                setStage("noteReceived")
                toast.success("Private note received successfully");
                dc.send(JSON.stringify({ type: MESSAGE_TYPE.NOTE_RECEIVED_ACK }));
            } catch (error) {
                console.error("Error processing note bytes:", error);
                toast.error("Failed to process private note bytes");
            }
            break;
        case MESSAGE_TYPE.NOTE_RECEIVED_ACK:
            setStage("noteReceivedAck");
            break;
        default:
            console.error("Unknown message type:", message);
            break;
    }
}