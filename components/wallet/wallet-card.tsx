"use client"


import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "../ui/card"
import { Button } from "../ui/button"
import { Activity, Droplets, MoreHorizontal, QrCode, Send } from "lucide-react"
import { useBalanceStore } from "@/providers/balance-provider"
import { useMidenSdkStore } from "@/providers/sdk-provider"
import { WalletDropdown } from "./wallet-dropdown"
import { DECIMALS } from "@/lib/constants"
export type toShowType = "send" | "activity" | "receive" | "faucet"

interface WalletCardProps {
    setToShow: (view: toShowType) => void
}

export function Balance() {
    const balance = useBalanceStore((state) => state.balance)
    const balanceInToken = Number(balance) / DECIMALS
    return <div className="text-4xl sm:text-5xl font-light mb-4 leading-tight py-3 flex items-end gap-2">{Number(balanceInToken).toFixed(2)}<p className="text-2xl">MDN</p></div>
}

const ACTIONS = [
    {
        icon: Send,
        label: "SEND",
        type: "send" as toShowType,
    },
    {
        icon: Activity,
        label: "ACTIVITY",
        type: "activity" as toShowType,
    },
    {
        icon: QrCode,
        label: "RECEIVE",
        type: "receive" as toShowType,
    },
    {
        icon: Droplets,
        label: "FAUCET",
        type: "faucet" as toShowType,
    },
]



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

        <Card className="bg-card border-border ring-1 ring-primary/10">
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
                            <span className="absolute left-1/2 -translate-x-1/2 -top-6 text-xs bg-popover border border-border px-2 py-0.5 z-10 text-popover-foreground">
                                Copied!
                            </span>
                        )}
                        {`${address.slice(0, 8)}...${address.slice(-4)}`}
                    </span>
                    <WalletDropdown />
                </div>
            </CardHeader>

            <CardContent className="space-y-2 mt-[-15px]">
                {/* Balance */}
                <Balance />
                <div className="flex justify-between gap-2 pb-5">
                    {ACTIONS.map((action) => (
                        <ActionButton
                            key={action.type}
                            icon={action.icon}
                            label={action.label}
                            setToShow={setToShow}
                            type={action.type}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

function ActionButton({ icon: Icon, label, setToShow, type }: { icon: React.ComponentType<any>, label: string, setToShow: (val: toShowType) => void, type: toShowType }) {

    return (
        <div className="flex flex-col items-center gap-2">
            <Button
                variant="secondary"
                className="rounded-full bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/10 p-0 h-12 w-12 sm:h-14 sm:w-14 flex items-center justify-center"
                onClick={() => setToShow(type)}
            >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white dark:text-primary-foreground" />
            </Button>
            <span className="text-xs text-muted-foreground">{label}</span>
        </div>
    )

}