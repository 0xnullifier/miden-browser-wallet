"use client"


import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "../ui/card"
import { Button } from "../ui/button"
import { Activity, Droplets, MoreHorizontal, QrCode, Send } from "lucide-react"
import { useBalanceStore } from "@/providers/balance-provider"
import { useMidenSdkStore } from "@/providers/sdk-provider"
export type toShowType = "send" | "activity" | "recieve" | "faucet"

interface WalletCardProps {
    setToShow: (view: toShowType) => void
}

export function Balance() {
    const balance = useBalanceStore((state) => state.balance)
    return <div className="text-4xl sm:text-5xl font-light mb-4 leading-tight py-3">${Number(balance).toFixed(2)}</div>
}

export function WalletCard({ setToShow }: WalletCardProps) {
    const [copied, setCopied] = useState(false)
    const [address, setAddress] = useState<string>("")
    const account = useMidenSdkStore((state) => state.account)
    useEffect(() => {
        if (account) {
            setAddress(account)
        }
    }, [account])
    return (

        <Card className="bg-card border-border shadow-lg shadow-primary/20 ring-1 ring-primary/10">
            <CardHeader className="pb-1">
                <div className="flex justify-between items-center">
                    <span
                        className="text-muted-foreground font-mono cursor-pointer hover:text-primary relative transition-colors"
                        onClick={async () => {
                            await navigator.clipboard.writeText(address)
                            setCopied(true)
                            setTimeout(() => setCopied(false), 1200)
                        }}
                        title="Copy address"
                    >
                        {copied && (
                            <span className="absolute left-1/2 -translate-x-1/2 -top-6 text-xs bg-popover border border-border rounded px-2 py-0.5 shadow-md z-10 text-popover-foreground">
                                Copied!
                            </span>
                        )}
                        {`${address.slice(0, 6)}...${address.slice(-4)}`}
                    </span>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-accent">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-2 mt-[-15px]">
                {/* Balance */}
                <Balance />
                <div className="flex justify-between gap-2 pb-5">
                    <div className="flex flex-col items-center gap-2">
                        <Button
                            variant="secondary"
                            className="rounded-full bg-orange-500 hover:bg-orange-600 dark:bg-primary dark:hover:bg-primary/90 p-0 h-12 w-12 sm:h-14 sm:w-14 flex items-center justify-center shadow-lg shadow-primary/25"
                            onClick={() => setToShow("send")}
                        >
                            <Send className="h-4 w-4 sm:h-5 sm:w-5 text-white dark:text-primary-foreground" />
                        </Button>
                        <span className="text-xs text-muted-foreground">Send</span>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <Button
                            variant="secondary"
                            className="rounded-full bg-orange-500 hover:bg-orange-600 dark:bg-primary dark:hover:bg-primary/90 p-0 h-12 w-12 sm:h-14 sm:w-14 flex items-center justify-center"
                            onClick={() => setToShow("faucet")}
                        >
                            <Droplets className="h-4 w-4 sm:h-5 sm:w-5 text-white dark:text-primary-foreground" />
                        </Button>
                        <span className="text-xs text-muted-foreground">Faucet</span>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <Button
                            variant="secondary"
                            className="rounded-full bg-orange-500 hover:bg-orange-600 dark:bg-primary dark:hover:bg-primary/90 p-0 h-12 w-12 sm:h-14 sm:w-14 flex items-center justify-center"
                            onClick={() => setToShow("recieve")}
                        >
                            <QrCode className="h-4 w-4 sm:h-5 sm:w-5 text-white dark:text-primary-foreground" />
                        </Button>
                        <span className="text-xs text-muted-foreground">Receive</span>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <Button
                            variant="secondary"
                            className="rounded-full bg-orange-500 hover:bg-orange-600 dark:bg-primary dark:hover:bg-primary/90 p-0 h-12 w-12 sm:h-14 sm:w-14 flex items-center justify-center"
                            onClick={() => setToShow("activity")}
                        >
                            <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-white dark:text-primary-foreground" />
                        </Button>
                        <span className="text-xs text-muted-foreground">Activity</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}