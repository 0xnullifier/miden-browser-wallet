"use client"

import { X, AlertTriangle } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader } from "../ui/card"
import { Input } from "../ui/input"
import { Alert, AlertDescription } from "../ui/alert"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useBalanceStore } from "@/providers/balance-provider"
import { useMidenSdkStore } from "@/providers/sdk-provider"
import { sucessTxToast } from "../success-tsx-toast"


export function Faucet({ onClose }: { onClose: () => void }) {
    const [amount, setAmount] = useState("")
    const [showAlert, setShowAlert] = useState(false)
    const faucet = useBalanceStore((state) => state.faucet)
    const faucetLoading = useBalanceStore((state) => state.faucetLoading)
    const account = useMidenSdkStore(store => store.account)

    const onMint = async () => {
        if (!account) {
            console.error("No account found for faucet request");
            return;
        }
        if (amount) {
            const txId = await faucet(account, amount)
        }
    }
    return (
        <div className="w-full">
            <Card className="bg-card border-border shadow-lg shadow-primary/20 ring-1 ring-primary/10">
                <CardContent className="space-y-3 p-4 pt-0">
                    <div className="">
                        <label className="text-md font-medium text-foreground pb-3">Amount</label>
                        <Input
                            type="text"
                            inputMode="decimal"
                            pattern="^[0-9]*[.,]?[0-9]*$"
                            value={amount}
                            placeholder="0.00"
                            onChange={e => {
                                const value = e.target.value.replace(/[^0-9.,]/g, "");
                                setAmount(value);
                                if (value && parseFloat(value) > 10000) {
                                    setShowAlert(true);
                                } else {
                                    setShowAlert(false);
                                }
                            }}
                            className="text-base h-10"
                        />
                    </div>

                    {showAlert && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                Amount cannot exceed 10,000. Please enter a smaller amount.
                            </AlertDescription>
                        </Alert>
                    )}

                    <Button
                        className="w-full h-10 text-sm font-medium flex items-center justify-center"
                        disabled={!amount || faucetLoading || showAlert}
                        onClick={onMint}
                    >
                        {faucetLoading ? (
                            <Loader2 className="animate-spin h-4 w-4 mr-2" />
                        ) : null}
                        {faucetLoading ? "Minting..." : "Mint"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}