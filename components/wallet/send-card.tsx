"use client"

import { Camera, Loader2, Copy, Check } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { Input } from "../ui/input"
import { useEffect, useRef, useState } from "react"
import { Switch } from "@/components/ui/switch"
import { send } from "@/lib/actions"
import { sucessTxToast } from "@/components/success-tsx-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { BASE_URL, RPC_ENDPOINT, } from "@/lib/constants"
import { useMidenSdkStore } from "@/providers/sdk-provider"
import { useBalanceStore } from "@/providers/balance-provider"
import { useWebRtcStore } from "@/providers/webrtc-provider"
import { useReceiverRef } from "@/providers/receiver-provider"
import { MESSAGE_TYPE, WEBRTC_MESSAGE_TYPE } from "@/lib/types"
import { toast } from "sonner"


// Send Card Component
export function SendCard({ onClose }: { onClose: () => void }) {
    const [amount, setAmount] = useState("")
    const [recipient, setRecipient] = useState("")
    const [isOneToMany, setIsOneToMany] = useState(false)
    const [isPrivate, setIsPrivate] = useState(false)
    const [loading, setLoading] = useState(false)
    const [base64NoteStr, setBase64NoteStr] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)
    const account = useMidenSdkStore((state) => state.account)
    const balance = useBalanceStore((state) => state.balance)
    const [receiverOfflineDialogOpen, setReceiverOfflineDialog] = useState(false)
    const clientRef = useRef<any | null>(null);
    const [retryNumber, setRetryNumber] = useState<number>(0)
    const [retryingDialog, setRetryingDialog] = useState(false)
    const [retryNow, setRetryNow] = useState(false)
    const [retryIntervalId, setRetryIntervalId] = useState<NodeJS.Timeout | null>(null)
    const [doItAsync, setDoItAsync] = useState(false)

    const ws = useWebRtcStore((state) => state.webSocket);
    const dc = useWebRtcStore((state) => state.dataChannel);
    const pc = useWebRtcStore((state) => state.peerConnection);
    const stage = useWebRtcStore((state) => state.stage);
    const setStage = useWebRtcStore((state) => state.setPrivateNoteStage);
    const setDataChannel = useWebRtcStore((state) => state.setDataChannel);


    const receiverRef = useReceiverRef()
    const [noteBytes, setNoteBytes] = useState<Array<number> | null>(null)
    const [tx, setTx] = useState<any | null>(null)


    useEffect(() => {
        receiverRef.current = recipient;
        console.log("Receiver reference updated:", receiverRef.current);
    }, [recipient])

    const createOffer = async () => {
        if (ws && pc) {
            try {
                const offer = await pc.createOffer()
                await pc.setLocalDescription(offer);
                ws.send(JSON.stringify({ type: WEBRTC_MESSAGE_TYPE.CREATE_OFFER, offer: offer, to: recipient, from: account }))
            } catch (error) {
                console.error("Error creating offer:", error);
                toast.error("Failed to create WebRTC offer: " + (error instanceof Error ? error.message : "Unknown error"))
                setLoading(false)
                setAmount("")
                setRecipient("")
                setReceiverOfflineDialog(true)
            }
        } else {
            console.error("WebSocket or PeerConnection not initialized");
        }
    }

    const processTxAfterConnection = async () => {
        if (!account) return;

        if (!clientRef.current) {
            console.error("Miden SDK client not initialized for sending transaction");
        }

        try {
            const tx = await send(clientRef.current, account, recipient, BigInt(amount), isPrivate)
            sucessTxToast("Transaction sent successfully", tx.executedTransaction().id().toString())

            if (isPrivate) {
                const outputNote = tx.executedTransaction().outputNotes().getNote(0).id()
                // wait 10 seconds for the tx to be commited
                await new Promise((resolve) => setTimeout(resolve, 10000));
                const exportedNote = await clientRef.current.exportNote(outputNote.toString(), "Full")
                setNoteBytes(exportedNote)
                setTx(tx)
            } else {
                setLoading(false)
                setAmount("")
                setRecipient("")
            }
        } catch (error) {
            console.error("Error sending transaction:", error);
            toast.error("Failed to send transaction: " + (error instanceof Error ? error.message : "Unknown error"))
            setLoading(false)
            setAmount("")
            setRecipient("")
        } finally {
            if (clientRef.current) {
                clientRef.current.terminate()
                clientRef.current = null
            }
        }
    }


    useEffect(() => {
        // Only send note bytes if we're connected and not going offline
        if (stage === "pongreceived" && noteBytes && dc && dc.readyState === "open" && !doItAsync) {
            console.log("Sending note bytes through data channel...")
            dc.send(JSON.stringify({
                type: MESSAGE_TYPE.NOTE_BYTES,
                bytes: Array.from(noteBytes),
            }))
        }

        // If we have note bytes but should go offline (doItAsync=true), create the link
        if (noteBytes && doItAsync) {
            console.log("Creating offline link for note...")
            const base64Note = btoa(String.fromCharCode(...noteBytes))
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');
            setBase64NoteStr(base64Note)
            setReceiverOfflineDialog(true)
            setLoading(false)
            setRecipient("")
            setAmount("")
        }

        if (stage === "noteReceivedAck" && dc && dc.readyState === "open") {
            setLoading(false)
            setNoteBytes(null)
            setTx(null)
            setBase64NoteStr(null)
            toast.success("Private note sent successfully")
            setAmount("")
            setRecipient("")
            dc.close()
            setDataChannel(null);
            console.log("Private note received acknowledgment");
        }

    }, [stage, dc, noteBytes, doItAsync, pc, setDataChannel])

    useEffect(() => {
        console.log("Stage changed:", stage)
        if (stage === "receiver-offline" && !doItAsync && !retryingDialog && retryNumber === 0) {
            console.log("Receiver is offline, starting retry mechanism")
            if (retryIntervalId) {
                clearInterval(retryIntervalId)
            }
            setRetryingDialog(true)
            const intervalId = setInterval(async () => {
                console.log("Retrying connection...")
                await createOffer()
                setRetryNumber(prev => prev + 1)
            }, 10000)
            setRetryIntervalId(intervalId)
        }

        // When connection is established (pongreceived), process the transaction
        if (stage === "pongreceived" && !noteBytes && !tx) {
            console.log("Connection established, processing transaction...")
            if (retryingDialog) {
                setRetryingDialog(false)
                setRetryNumber(0)
                if (retryIntervalId) {
                    clearInterval(retryIntervalId)
                    setRetryIntervalId(null)
                }
            }
            processTxAfterConnection()
        }
    }, [stage, doItAsync, retryingDialog, retryNumber, noteBytes, tx, retryIntervalId])

    // Cleanup interval on unmount
    useEffect(() => {
        return () => {
            if (retryIntervalId) {
                clearInterval(retryIntervalId)
            }
        }
    }, [retryIntervalId])

    useEffect(() => {
        if (stage === "receiver-offline" && (retryNumber > 2 || doItAsync)) {
            console.log("Retrying connection failed or user chose to continue offline")
            if (retryIntervalId) {
                clearInterval(retryIntervalId)
                setRetryIntervalId(null)
            }
            setRetryingDialog(false)

            // If user chose to continue offline or retries failed, process transaction
            if (!noteBytes && !tx) {
                processTxAfterConnection()
            } else if (noteBytes) {
                // If transaction already processed, create the offline link
                const base64Note = btoa(String.fromCharCode(...noteBytes))
                    .replace(/\+/g, '-')
                    .replace(/\//g, '_')
                    .replace(/=+$/, '');
                setBase64NoteStr(base64Note)
                setReceiverOfflineDialog(true)
                setLoading(false)
                setRecipient("")
                setAmount("")
            }
        }
    }, [retryNumber, doItAsync, stage, noteBytes, retryIntervalId, tx])


    const onSend = async () => {
        setLoading(true)
        const { WebClient } = await import("@demox-labs/miden-sdk");
        clientRef.current = await WebClient.createClient(RPC_ENDPOINT)
        if (recipient === account) {
            toast.error("You cannot send payment to yourself")
            setLoading(false)
            setRecipient("")
            return;
        }


        if (!account || !clientRef.current) {
            console.error("No account or client found for sending payment");
            setLoading(false)
            return;
        }

        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            console.error("Invalid amount");
            toast.error("Please enter a valid amount");
            setLoading(false)
            return;
        }

        // For private payments, try WebSocket connection first
        if (isPrivate) {
            toast.info("Establishing connection for private note transfer...", { position: "top-right" })
            setStage("webrtcStarted")
            await createOffer()
            // Don't proceed with transaction yet - wait for connection or user decision
            return;
        }

        // For non-private payments, proceed directly
        try {
            const tx = await send(clientRef.current, account, recipient, BigInt(amount), isPrivate)
            sucessTxToast("Transaction sent successfully", tx.executedTransaction().id().toString())
        } catch (error) {
            console.error("Error sending transaction:", error);
            toast.error("Failed to send transaction: " + (error instanceof Error ? error.message : "Unknown error"))
        } finally {
            setLoading(false)
            setAmount("")
            setRecipient("")
            clientRef.current.terminate()
        }
    }

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            console.error("Failed to copy to clipboard:", error)
        }
    }

    const receiveLink = base64NoteStr ? `${BASE_URL}/receive?note=${base64NoteStr}` : ""


    return (
        <div className="w-full">
            <Card className="bg-card border-border shadow-lg shadow-primary/20 ring-1 ring-primary/10">
                <CardContent className="space-y-5">
                    {/* Amount Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Amount</label>
                        <div className="flex gap-2 relative">
                            <Input
                                type="text"
                                inputMode="decimal"
                                pattern="^[0-9]*[.,]?[0-9]*$"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    // Allow only numbers and decimal point
                                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                        setAmount(value);
                                    }
                                }}
                                className="text-base h-10 flex-1 pr-16"
                            />
                            <button
                                type="button"
                                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 text-white shadow focus:outline-none"
                                onClick={() => setAmount(balance ? balance.toString() : "")}
                                tabIndex={-1}
                            >
                                Max
                            </button>
                        </div>
                    </div>

                    {/* Recipient Field */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Recipient</label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="0x..."
                                value={recipient}
                                onChange={(e) => setRecipient(e.target.value)}
                                className="font-mono text-sm h-10 flex-1"
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-10 w-10 p-0 flex-shrink-0"
                                title=""
                            >
                                <Camera className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Toggle Options */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="text-sm font-medium text-foreground">One to Many Payment</div>
                                <div className="text-xs text-muted-foreground">Send to multiple recipients</div>
                            </div>
                            <Switch checked={isOneToMany} onCheckedChange={setIsOneToMany} />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="text-sm font-medium text-foreground">Private Payment</div>
                                <div className="text-xs text-muted-foreground">Keep transaction details private</div>
                            </div>
                            <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
                        </div>
                    </div>

                    {/* Send Button */}
                    <Button
                        className="w-full h-10 text-sm font-medium"
                        disabled={!amount || !recipient || loading || isNaN(Number(amount)) || Number(amount) <= 0}
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
                </CardContent>
            </Card>

            {/* Retrying Connection Dialog */}
            <Dialog open={retryingDialog} onOpenChange={setRetryingDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Connecting to Receiver</DialogTitle>
                        <DialogDescription>
                            Attempting to establish connection for private note transfer...
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
                            variant="outline"
                            onClick={() => {
                                setDoItAsync(true)
                            }}
                        >
                            Continue Offline
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Private Note Dialog */}
            <Dialog open={receiverOfflineDialogOpen} onOpenChange={setReceiverOfflineDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Private Note Generated</DialogTitle>

                    </DialogHeader>
                    <div className="space-y-4 ">
                        <div className="py-2 text-sm">The Receiver is offline. Please share the link below with them to complete the private payment.</div>
                        <div className="flex items-center gap-2">
                            <Input
                                readOnly
                                value={receiveLink}
                                className="flex-1"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => copyToClipboard(receiveLink || "")}
                            >
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>

                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setReceiverOfflineDialog(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    )
}