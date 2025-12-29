"use client";

import { Loader2, Copy, Check, Download } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Input } from "../ui/input";
import { useEffect, useRef, useState } from "react";
import { send } from "@/lib/actions";
import { successTxToast } from "@/components/success-tsx-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  BASE_URL,
  DECIMALS,
  GITHUB_FEEDBACK_URL,
  PRIVATE_NOTE_TRANSPORT_URL,
  RPC_ENDPOINT,
} from "@/lib/constants";
import { useMidenSdkStore } from "@/providers/sdk-provider";
import { useBalanceStore } from "@/providers/balance-provider";
import { useWebRtcStore } from "@/providers/webrtc-provider";
import { useReceiverRef } from "@/providers/receiver-provider";
import { MESSAGE_TYPE, WEBRTC_MESSAGE_TYPE } from "@/lib/types";
import { toast } from "sonner";
import { OneToMany } from "./one-to-many";
import { FaucetInfo } from "@/store/balance";

// Send Card Component
export function SendCard({ selectedFaucet }: { selectedFaucet: FaucetInfo }) {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [isOneToMany, setIsOneToMany] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [base64NoteStr, setBase64NoteStr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [note, setNote] = useState<any | null>(null);
  const account = useMidenSdkStore((state) => state.account);
  const balances = useBalanceStore((state) => state.balances);
  const balance = balances[selectedFaucet.address];
  const decimals = selectedFaucet.decimals || DECIMALS;

  const [receiverOfflineDialogOpen, setReceiverOfflineDialog] = useState(false);
  const clientRef = useRef<any | null>(null);

  const [retryNumber, setRetryNumber] = useState<number>(0);
  const [retryingDialog, setRetryingDialog] = useState(false);
  const [retryIntervalId, setRetryIntervalId] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [doItAsync, setDoItAsync] = useState(false);

  const ws = useWebRtcStore((state) => state.webSocket);
  const dc = useWebRtcStore((state) => state.dataChannel);
  const pc = useWebRtcStore((state) => state.peerConnection);
  const stage = useWebRtcStore((state) => state.stage);
  const setStage = useWebRtcStore((state) => state.setPrivateNoteStage);
  const setDataChannel = useWebRtcStore((state) => state.setDataChannel);
  const [delegate, setDelegate] = useState(true);

  const receiverRef = useReceiverRef();
  const [noteBytes, setNoteBytes] = useState<Array<number> | null>(null);
  const [tx, setTx] = useState<any | null>(null);

  useEffect(() => {
    receiverRef.current = recipient;
    console.log("Receiver reference updated:", receiverRef.current);
  }, [recipient]);

  const createOffer = async () => {
    console.log("Creating WebRTC offer...", isPrivate);
    if (ws && pc) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        ws.send(
          JSON.stringify({
            type: WEBRTC_MESSAGE_TYPE.CREATE_OFFER,
            offer: offer,
            to: recipient,
            from: account,
          }),
        );
      } catch (error) {
        console.error("Error creating offer:", error);
        toast.error(
          "Failed to create WebRTC offer: " +
            (error instanceof Error ? error.message : "Unknown error"),
        );
        setLoading(false);
        setAmount("");
        setRecipient("");
        setReceiverOfflineDialog(true);
      }
    } else {
      console.error("WebSocket or PeerConnection not initialized");
    }
  };

  const processTxAfterConnection = async () => {
    if (!account) return;
    const { WebClient, Address } = await import("@demox-labs/miden-sdk");
    if (clientRef.current instanceof WebClient) {
      try {
        const { tx, note } = await send(
          clientRef.current,
          account,
          recipient,
          Number(amount),
          isPrivate,
          selectedFaucet.address,
          decimals,
          delegate,
        );
        clientRef.current.sendPrivateNote(note, Address.fromBech32(recipient));
        console.log("note sent");
        // setNote(note);
        // successTxToast("Transaction sent successfully", tx);
        // setNoteBytes(Array.from(note.serialize()));
        // setTx(tx);
      } catch (error) {
        console.error("Error sending transaction:", error);
        toast.error(
          "Failed to send transaction: " +
            (error instanceof Error ? error.message : "Unknown error"),
        );
        setLoading(false);
        setAmount("");
        setRecipient("");
      } finally {
        if (clientRef.current) {
          clientRef.current.terminate();
          clientRef.current = null;
        }
      }
    }
  };

  const sendPrivateTx = async () => {
    if (!account) return;
    const { WebClient, Address } = await import("@demox-labs/miden-sdk");
    if (clientRef.current instanceof WebClient) {
      try {
        const { tx, note } = await send(
          clientRef.current,
          account,
          recipient,
          Number(amount),
          isPrivate,
          selectedFaucet.address,
          decimals,
          delegate,
        );
        successTxToast("Transaction sent successfully", tx);

        toast.promise(
          clientRef.current.sendPrivateNote(
            note,
            Address.fromBech32(recipient),
          ),
          {
            position: "top-right",
            loading: "Sending Private Note..",
            success: () => {
              setLoading(false);
              return "Private Note Sent! 🚀";
            },

            error: () => {
              setLoading(false);
              return "Failed";
            },
          },
        );
      } catch (error) {
        console.error("Error sending transaction:", error);
        toast.error(
          "Failed to send transaction: " +
            (error instanceof Error ? error.message : "Unknown error"),
        );
        setLoading(false);
        setAmount("");
        setRecipient("");
      } finally {
        if (clientRef.current) {
          clientRef.current.terminate();
          clientRef.current = null;
        }
      }
    }
  };

  const processOfflineTransaction = async () => {
    console.log("here");
    try {
      const { tx } = await send(
        clientRef.current,
        account,
        recipient,
        Number(amount),
        isPrivate,
        selectedFaucet.address,
        decimals,
        delegate,
      );
      successTxToast("Transaction sent successfully", tx);
    } catch (error) {
      console.error("Error sending transaction:", error);
      toast.error(
        "Failed to send transaction with unkown error. This should not have happend please report it",
        {
          action: (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                window.open(GITHUB_FEEDBACK_URL, "_blank");
              }}
            >
              Report
            </Button>
          ),
        },
      );
    } finally {
      setLoading(false);
      setAmount("");
      setRecipient("");
      clientRef.current.terminate();
    }
  };

  useEffect(() => {
    console.log("Stage changed:", stage);
    if (
      stage === "receiver-offline" &&
      !doItAsync &&
      !retryingDialog &&
      retryNumber === 0
    ) {
      if (!isPrivate) {
        console.log("Receiver is offline, no unauth note :( ...");
        // This is the case when we try sending a public note with unauthenticated notes
        processOfflineTransaction();
        return;
      }
      console.log("Receiver is offline, starting retry mechanism");
      if (retryIntervalId) {
        clearInterval(retryIntervalId);
      }
      setRetryingDialog(true);
      const intervalId = setInterval(async () => {
        console.log("Retrying connection...");
        await createOffer();
        setRetryNumber((prev) => prev + 1);
      }, 10000);
      setRetryIntervalId(intervalId);
    }

    // When connection is established (pongreceived), process the transaction
    if (stage === "pongreceived" && !noteBytes && !tx) {
      console.log("Connection established, processing transaction...");
      if (retryingDialog) {
        setRetryingDialog(false);
        setRetryNumber(0);
        if (retryIntervalId) {
          clearInterval(retryIntervalId);
          setRetryIntervalId(null);
        }
      }
      processTxAfterConnection();
    }
  }, [
    stage,
    doItAsync,
    retryingDialog,
    retryNumber,
    noteBytes,
    tx,
    retryIntervalId,
  ]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (retryIntervalId) {
        clearInterval(retryIntervalId);
      }
    };
  }, [retryIntervalId]);

  useEffect(() => {
    if (stage === "receiver-offline" && (retryNumber > 2 || doItAsync)) {
      console.log(
        "Retrying connection failed or user chose to continue offline",
      );
      if (retryIntervalId) {
        clearInterval(retryIntervalId);
        setRetryIntervalId(null);
      }
      setRetryingDialog(false);

      if (!noteBytes && !tx) {
        processTxAfterConnection();
      } else if (noteBytes) {
        const base64Note = btoa(String.fromCharCode(...noteBytes))
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "");
        setBase64NoteStr(base64Note);
        setReceiverOfflineDialog(true);
        setLoading(false);
        setAmount("");
      }
    }
  }, [retryNumber, doItAsync, stage, noteBytes, retryIntervalId, tx]);

  const onSend = async () => {
    setLoading(true);
    const { WebClient } = await import("@demox-labs/miden-sdk");
    clientRef.current = await WebClient.createClient(
      RPC_ENDPOINT,
      PRIVATE_NOTE_TRANSPORT_URL,
    );
    if (recipient === account) {
      toast.error("You cannot send payment to yourself");
      setLoading(false);
      setRecipient("");
      return;
    }

    if (!account || !clientRef.current) {
      console.error("No account or client found for sending payment");
      setLoading(false);
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      console.error("Invalid amount");
      toast.error("Please enter a valid amount");
      setLoading(false);
      return;
    }

    if (isPrivate) {
      toast.info("Establishing connection for private note transfer...", {
        position: "top-right",
      });
      await sendPrivateTx();
      return;
    } else {
      await processOfflineTransaction();
      return;
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const [downloadLoading, setDownloadLoading] = useState(false);
  const downloadNote = async () => {
    setDownloadLoading(true);
    const { WebClient, Note } = await import("@demox-labs/miden-sdk");
    if (!note) return;
    const client = await WebClient.createClient(RPC_ENDPOINT);
    try {
      await new Promise((resolve) => setTimeout(resolve, 10000));
      const noteBytes = (
        await client.exportNoteFile(note.id().toString(), "Full")
      ).serialize();

      const uint8Array = new Uint8Array(noteBytes);

      const blob = new Blob([uint8Array], { type: "application/octet-stream" });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `miden-note-${Date.now()}.miden`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Note downloaded successfully");
    } catch (error) {
      console.error("Failed to download note:", error);
      toast.error("Failed to download note");
    } finally {
      setDownloadLoading(false);
      client.terminate();
    }
  };

  const onPrivateNoteOpenChange = (open: boolean) => {
    setReceiverOfflineDialog(open);

    if (!open) {
      // Reset WebRTC and transaction states
      setStage("idle");
      setDoItAsync(false);

      // Reset form fields
      setRecipient("");
      setAmount("");

      // Reset transaction data
      setNoteBytes(null);
      setTx(null);
      setBase64NoteStr(null);

      // Reset UI states
      setLoading(false);
      setCopied(false);

      // Reset retry mechanism
      setRetryNumber(0);
      setRetryingDialog(false);
      if (retryIntervalId) {
        clearInterval(retryIntervalId);
        setRetryIntervalId(null);
      }

      if (clientRef.current) {
        clientRef.current.terminate();
        clientRef.current = null;
      }

      if (dc && dc.readyState === "open") {
        dc.close();
        setDataChannel(null);
      }
    }
  };

  const receiveLink = base64NoteStr
    ? `${BASE_URL}/receive?note=${base64NoteStr}:${receiverRef.current}`
    : "";

  return (
    <div className="w-full">
      <Card className="rounded-[10px] py-0 border-border gap-0 ">
        <CardHeader className="bg-[#F9F9F9] rounded-t-[10px] py-[10px] border-b-[0.5px] flex items-center justify-center">
          <div className="text-center text-xl font-medium">Send</div>
        </CardHeader>
        <CardContent className="px-0 gap-0">
          <Input
            type="text"
            inputMode="decimal"
            pattern="^[0-9]*[.,]?[0-9]*$"
            placeholder={`0 ${selectedFaucet.symbol}`}
            value={amount}
            onChange={(e) => {
              const value = e.target.value;
              // Allow only numbers and decimal point
              if (value === "" || /^\d*\.?\d*$/.test(value)) {
                setAmount(value);
              }
            }}
            className="text-center text-[40px] h-[90px] w-full border-0 ring-0 !outline-none !shadow-none focus:!outline-none bg-transparent placeholder:text-#00000087"
          />

          {/* Recipient Field */}
          <div className="flex items-center border-y-[0.5px] w-full">
            <div className="flex gap-2 w-full">
              <Input
                placeholder="mtst1qzv...5tfg"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="text-sm px-2 h-[48px] w-full border-0 ring-0 !outline-none !shadow-none focus:!outline-none bg-transparent placeholder:text-#2929299C resize-none text-center"
              />
            </div>
          </div>

          <OptionItem
            title="One to Many Payment"
            subTitle="Send to multiple recipients"
            value={isOneToMany}
            onToggle={setIsOneToMany}
            first={true}
          />
          <OptionItem
            title="Private Payment"
            subTitle="Keep transaction details private"
            value={isPrivate}
            onToggle={setIsPrivate}
          />
          <OptionItem
            title="Use Delegate Proving"
            subTitle="Outsource proof generation"
            value={delegate}
            onToggle={setDelegate}
          />
          {/* Send Button */}
        </CardContent>
      </Card>
      <Button
        className="w-full h-10 text-sm font-medium mt-[5px] rounded-[5px]"
        disabled={
          !amount ||
          !recipient ||
          loading ||
          isNaN(Number(amount)) ||
          Number(amount) <= 0 ||
          Number(amount) > balance
        }
        onClick={onSend}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending...
          </div>
        ) : (
          "Send Payment"
        )}
      </Button>
      {/* Retrying Connection Dialog */}
      <Dialog open={retryingDialog} onOpenChange={setRetryingDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Connecting to Receiver</DialogTitle>
            <DialogDescription>
              Trying to connect for private note transfer. If the recipient is
              not using the browser wallet, click "Continue Offline" to download
              and share the note manually.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div className="text-sm text-muted-foreground">
                Retry attempt {retryNumber} of 3
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              This may take a few moments while we try to reach the recipient.
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setDoItAsync(true);
              }}
            >
              Continue Offline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Private Note Dialog */}
      <Dialog
        open={receiverOfflineDialogOpen}
        onOpenChange={onPrivateNoteOpenChange}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Private Note Generated</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 ">
            <div className="py-2 text-sm">
              Share the link if the receiver is using the browser wallet,
              Download the note otherwise and send them manually.
            </div>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={receiveLink}
                className="flex-1 text-primary-foreground"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(receiveLink || "")}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={downloadNote}
              disabled={!noteBytes || downloadLoading}
              className="flex items-center gap-2"
            >
              {downloadLoading ? (
                <>
                  <Loader2 className="animate-spin" /> Downloading{" "}
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" /> Download Note
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              onClick={() => onPrivateNoteOpenChange(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <OneToMany
        isOneToMany={isOneToMany}
        setIsOneToMany={setIsOneToMany}
        amount={amount}
        receipient={recipient}
        selectedFaucetId={selectedFaucet}
      />
    </div>
  );
}

export const OptionItem = ({
  onToggle,
  title,
  subTitle,
  value,
  first,
}: {
  onToggle: (val: boolean) => void;
  title: string;
  subTitle: string;
  value: boolean;
  first?: boolean;
}) => {
  return (
    <div
      className={`flex items-center justify-between font-geist ${first ? "" : "border-t-[0.5px]"}`}
    >
      <div className="space-y-1 pl-5">
        <div className="text-sm font-medium text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground">{subTitle}</div>
      </div>
      <Switch2 value={value} onToggle={onToggle} />
    </div>
  );
};

const Switch2 = ({
  value,
  onToggle,
}: {
  value: boolean;
  onToggle: (val: boolean) => void;
}) => {
  useEffect(() => {
    if (typeof onToggle !== "undefined") onToggle(value);
  }, [value]);
  if (value) {
    return (
      <div className="flex">
        <div
          className="cursor-pointer text-primary w-[64px] h-[54px] text-sm bg-[#F9F9F9] border-x-[0.5px] flex items-center justify-center px-[1px]"
          onClick={() => onToggle(false)}
        >
          On
        </div>
        <div className="w-[64px] h-[54px] bg-background rounded-[10px]"></div>
      </div>
    );
  } else {
    return (
      <div className="flex">
        <div className="w-[64px] h-[54px] border-l-[0.5px]"></div>
        <div
          className="cursor-pointer text-primary text-sm w-[64px] h-[54px] flex items-center justify-center bg-[#F9F9F9] border-l-[0.5px] rounded-br-[10px]"
          onClick={() => onToggle(true)}
        >
          Off
        </div>
      </div>
    );
  }
};
