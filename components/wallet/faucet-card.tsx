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
import { useEffect } from "react"


export function Faucet({ onClose }: { onClose: () => void }) {
    const [amount, setAmount] = useState("")
    const [showAlert, setShowAlert] = useState(false)
    const faucet = useBalanceStore((state) => state.faucet)
    const faucetLoading = useBalanceStore((state) => state.faucetLoading)
    const account = useMidenSdkStore(store => store.account)
    useEffect(() => {
        console.log("Faucet component mounted, account:", account)
    }, [])
    console.log("Faucet account:", account)
    console.log(amount)
    const onMint = async () => {
        if (!account) {
            console.error("No account found for faucet request");
            return;
        }
        if (amount) {
            await faucet(account, parseFloat(amount))
        }
    }
    return (
        <div className="w-full">
            <Card className="bg-card border-border ring-1 ring-primary/10">
                <CardContent className="space-y-3 p-4 pt-0">
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2 mb-2 items-center justify-between px-2">
                            <label className="text-md font-medium text-foreground">Amount</label>
                            <div className="flex gap-2">
                                {[100, 500, 1000].map(val => (
                                    <button
                                        key={val}
                                        className={
                                            "text-center px-2 py-1 text-xs border " +
                                            (amount === val.toString()
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-background border-neutral-400 dark:border-muted")
                                        }
                                        onClick={() => setAmount(val.toString())}
                                        style={{ minWidth: "32px", height: "24px" }}
                                    >
                                        {val}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <Input
                            type="text"
                            value={amount.toString()}
                            placeholder="0.00"
                            onChange={e => {
                                setAmount(e.target.value);
                                if (parseFloat(e.target.value) > 10000) {
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