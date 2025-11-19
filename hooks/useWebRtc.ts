"use client";

import { importNote, importNoteFile } from "@/lib/actions";
import { WEBSOCKET_URL } from "@/lib/constants";
import {
  MESSAGE_TYPE,
  SendPrivateNoteStages,
  WEBRTC_MESSAGE_TYPE,
} from "@/lib/types";
import { useReceiverRef } from "@/providers/receiver-provider";
import { useMidenSdkStore } from "@/providers/sdk-provider";
import { useWebRtcStore } from "@/providers/webrtc-provider";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

const configuration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};
export const useWebRtc = () => {
  const account = useMidenSdkStore((state) => state.account);
  const receiverRef = useReceiverRef();
  const setWebSocket = useWebRtcStore((state) => state.setWebSocket);
  const setDataChannel = useWebRtcStore((state) => state.setDataChannel);
  const setPeerConnection = useWebRtcStore((state) => state.setPeerConnection);
  const setStage = useWebRtcStore((state) => state.setPrivateNoteStage);
  const webSocket = useWebRtcStore((state) => state.webSocket);
  const peerConnection = useWebRtcStore((state) => state.peerConnection);
  const dataChannel = useWebRtcStore((state) => state.dataChannel);
  const reset = useWebRtcStore((state) => state.reset);
  const toggleReset = useWebRtcStore((state) => state.toggleReset);
  const isReciever = useRef<boolean | null>(null);

  // Debug account changes
  useEffect(() => {
    console.log("🟡 Account changed to:", account);
  }, [account]);

  useEffect(() => {
    // in case the peer connection or data channel changes
  }, [peerConnection, dataChannel]);

  useEffect(() => {
    console.log("🟢 useWebRtc effect running with account:", account);
    if (account) {
      setStage("idle");
      const ws = new WebSocket(WEBSOCKET_URL);
      const pc = new RTCPeerConnection(configuration);
      const dc = pc.createDataChannel("privateNoteChannel");

      dc.onopen = () => {
        // if the user is not the receiver, send a PING message
        if (isReciever.current === false) {
          dc.send(JSON.stringify({ type: "PING" }));
          setStage("pingsent");
        }
        console.log("remote data channel is open");
      };
      dc.onmessage = async (event) =>
        await handleDataChannelMessage(event, dc, setStage, toggleReset);
      dc.onclose = () => {
        console.log("Data channel is closed");
      };

      pc.ondatachannel = (event) => {
        const incomingChannel = event.channel;
        incomingChannel.onmessage = async (event) =>
          await handleDataChannelMessage(
            event,
            incomingChannel,
            setStage,
            toggleReset,
          );
        incomingChannel.onopen = () => {
          console.log("Incoming data channel is open");
        };
        incomingChannel.onclose = () => {
          console.log("Incoming data channel is closed");
        };
        setDataChannel(incomingChannel);
      };

      ws.onopen = () => {
        console.log("🟢 WebSocket opened successfully");
        ws.send(JSON.stringify({ type: "REGISTER", wallet: account }));
      };

      ws.onclose = (event) => {
        console.log("🔴 WebSocket closed!");
        console.log("🔴 Close code:", event.code);
        console.trace("WebSocket close trace");
      };

      ws.onerror = (error) => {
        console.log("🔴 WebSocket error:", error);
      };

      ws.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        console.log(message);
        switch (message.type) {
          case WEBRTC_MESSAGE_TYPE.RECEIVER_OFFLINE:
            console.log(
              "Receiver is offline, waiting for them to come online...",
            );
            setStage("receiver-offline");
            break;
          case WEBRTC_MESSAGE_TYPE.ANSWER:
            if (message.answer) {
              const remoteDesc = new RTCSessionDescription(message.answer);
              await pc.setRemoteDescription(remoteDesc);
              console.log("Received answer from:", message.from);
              isReciever.current = false;
            }
            break;
          case WEBRTC_MESSAGE_TYPE.OFFER:
            console.log("Received offer from:", message.from);
            if (message.offer) {
              await pc.setRemoteDescription(message.offer);
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              ws.send(
                JSON.stringify({
                  type: WEBRTC_MESSAGE_TYPE.FORWARD_ANSWER,
                  answer: answer,
                  to: message.from,
                }),
              );
              console.log(pc);
              // the receiver in this case is the one who sent the offer
              receiverRef.current = message.from;
              isReciever.current = true;
            }
            break;
          case WEBRTC_MESSAGE_TYPE.ICE_CANDIDATE:
            console.log("Received ICE candidate from:", message.from);
            if (message.iceCandidate) {
              try {
                await pc.addIceCandidate(message.iceCandidate);
              } catch (e) {
                console.error("Error adding received ice candidate", e);
              }
            } else {
              await pc.addIceCandidate(null);
            }
            break;
        }
      };
      pc.onicecandidate = (event) => {
        try {
          if (event.candidate) {
            ws.send(
              JSON.stringify({
                type: WEBRTC_MESSAGE_TYPE.FORWARD_ICE_CANDIDATE,
                candidate: event.candidate,
                to: receiverRef.current,
              }),
            );
          } else {
            ws.send(
              JSON.stringify({
                type: WEBRTC_MESSAGE_TYPE.FORWARD_ICE_CANDIDATE,
                candidate: null,
                to: receiverRef.current,
              }),
            );
          }
        } catch (error: any) {}
      };

      pc.onicecandidateerror = (event) => {
        console.log("ICE Candidate Error:", event);
      };

      pc.addEventListener("connectionstatechange", (event) => {
        console.log("Connection state changed:", pc.connectionState);
        if (pc.connectionState === "connected") {
          console.log("Peer connection established");
        } else if (pc.connectionState === "disconnected") {
          console.log("Peer connection disconnected");
        } else if (pc.connectionState === "failed") {
          console.log("Peer connection failed", event);
        }
      });

      setPeerConnection(pc);
      setWebSocket(ws);

      return () => {
        console.log("🔴 useWebRtc cleanup running - WebSocket will be closed!");
        console.trace("WebSocket cleanup trace");
        if (ws.readyState === WebSocket.OPEN) {
          console.log("🔴 Closing WebSocket in cleanup");
          ws.close();
        }
        console.log("🔴 Closing PeerConnection in cleanup");
        pc.close();
        setDataChannel(null);
        setPeerConnection(null);
        setWebSocket(null);
      };
    }
  }, [account, reset]);

  // Separate cleanup on component unmount only
  useEffect(() => {
    return () => {
      console.log("🔴 Component unmounting - cleaning up WebRTC resources");
      if (webSocket && webSocket.readyState === WebSocket.OPEN) {
        console.log("🔴 Closing WebSocket on unmount");
        webSocket.close();
      }
      if (peerConnection) {
        console.log("🔴 Closing PeerConnection on unmount");
        peerConnection.close();
      }
      setDataChannel(null);
      setWebSocket(null);
      setPeerConnection(null);
    };
  }, []);
};

const handleDataChannelMessage = async (
  event: MessageEvent<any>,
  dc: RTCDataChannel,
  setStage: (stage: SendPrivateNoteStages) => void,
  toggleReset: () => void,
) => {
  const message = JSON.parse(event.data);
  switch (message.type) {
    case MESSAGE_TYPE.PING:
      dc.send(JSON.stringify({ type: "PONG" }));
      break;
    case MESSAGE_TYPE.PONG:
      setStage("pongreceived");
      break;
    case MESSAGE_TYPE.NOTE_BYTES:
      console.log("Received private note bytes:", message);
      try {
        //TODO: added this above importing the note because importing note sometimes takes too long and the dc is closed by then
        // ideally we should keep the dc open until the note is imported successfully or fails
        // but for now this will do. until the remote prover situation is fixed.
        toast.promise(importNote(message.bytes, message.receiver), {
          position: "top-right",
          loading: "Importing note...",
          success: () => {
            dc.send(JSON.stringify({ type: MESSAGE_TYPE.NOTE_RECEIVED_ACK }));
            toggleReset();
            return "Note imported successfully!";
          },
          error: () => {
            console.log("failed");
            return "Unauthnotes failed demading note bytes";
          },
        });
        setStage("noteReceived");
      } catch (error) {
        console.error("Error processing note bytes:", error);
        dc.send(
          JSON.stringify({ type: MESSAGE_TYPE.NOTE_RECIEVED_BUT_IMPORT_ERROR }),
        );
        toast.error("Failed to process private note bytes");
      }
      break;
    case MESSAGE_TYPE.NOTE_RECEIVED_ACK:
      setStage("noteReceivedAck");
      toggleReset();
      break;
    default:
      console.error("Unknown message type:", message);
      break;
  }
};
