"use client"

import { Camera, Loader2, Copy, Check } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { Input } from "../ui/input"
import { useEffect, useState } from "react"
import { Switch } from "@/components/ui/switch"
import { send } from "@/lib/action"
import { sucessTxToast } from "@/components/success-tsx-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { BASE_URL, RPC_ENDPOINT, } from "@/lib/constants"
import { useMidenSdkStore } from "@/providers/sdk-provider"
import { useBalanceStore } from "@/providers/balance-provider"


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
    const [dialogOpen, setDialogOpen] = useState(false)
    const [client, setClient] = useState<any | null>(null)

    useEffect(() => {
        const initializeClient = async () => {
            const { WebClient } = await import("@demox-labs/miden-sdk");
            const clientInstance = await WebClient.createClient(RPC_ENDPOINT);
            setClient(clientInstance);
        }
        initializeClient();
    }, [])


    const onSend = async () => {
        setLoading(true)
        if (!account) {
            console.error("No account or client found for sending payment");
            setLoading(false)
            return;
        }
        try {
            const tx = await send(client, account, recipient, BigInt(amount), isPrivate)
            sucessTxToast("Transaction sent successfully", tx.executedTransaction().id().toString())
            if (isPrivate) {
                await new Promise((resolve) => setTimeout(resolve, 10000))
                const outputNote = tx.executedTransaction().outputNotes().getNote(0).id()
                const noteBytes = new Uint8Array(await client.exportNote(outputNote.toString(), "Full"))
                const base64Note = btoa(String.fromCharCode(...noteBytes))
                    .replace(/\+/g, '-')
                    .replace(/\//g, '_')
                    .replace(/=+$/, '');
                setBase64NoteStr(base64Note)
                setDialogOpen(true)
            }
        } catch (error) {
            console.error("Error sending transaction:", error);
        } finally {
            setLoading(false)
        }
        setAmount("")
        setRecipient("")

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

    const receiveLink = base64NoteStr ? `${BASE_URL}/recieve?note=${base64NoteStr}` : ""


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
                                onChange={(e) => setAmount(e.target.value)}
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
                        disabled={!amount || !recipient || loading}
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

            {/* Private Note Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Private Note Generated</DialogTitle>
                        <DialogDescription>
                            Your private note has been generated successfully. You can share it with the recipient.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Input
                                readOnly
                                value={base64NoteStr || ""}
                                className="flex-1"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => copyToClipboard(base64NoteStr || "")}
                            >
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                        {receiveLink && (
                            <a href={receiveLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                Open Receive Link
                            </a>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setDialogOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    )
}