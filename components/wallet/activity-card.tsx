'use client'

import { useMidenSdkStore } from "@/providers/sdk-provider"
import { useEffect, useState } from "react"
import { useTransactionStore } from "@/providers/transaction-provider"
import { useBalanceStore } from "@/providers/balance-provider"
import { ArrowUpRight, ArrowDownLeft, Droplets, Shield, Clock, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RPC_ENDPOINT } from "@/lib/constants"
import { UITransaction } from "@/store/transaction"



function formatAmount(amount: bigint): string {
    const value = Number(amount)
    if (Math.abs(value) >= 1000000) {
        return `$${(value / 1000000).toFixed(0)}M`
    } else if (Math.abs(value) >= 1000) {
        return `$${(value / 1000).toFixed(0)}k`
    }
    return `$${value}`
}

function getTransactionIcon(type: UITransaction["type"], status: UITransaction["status"]) {
    if (status === "isPending") {
        return <Clock className="w-5 h-5 text-yellow-500" />
    }
    if (status === "isFailed") {
        return <XCircle className="w-5 h-5 text-red-500" />
    }

    switch (type) {
        case "Outgoing":
            return <ArrowUpRight className="w-5 h-5 text-red-500" />
        case "Incoming":
            return <ArrowDownLeft className="w-5 h-5 text-green-500" />
        case "Faucet":
            return <Droplets className="w-5 h-5 text-green-500" />
        default:
            return <Shield className="w-5 h-5 text-purple-500" />
    }
}

function getTransactionLabel(type: UITransaction["type"]): string {
    switch (type) {
        case "Outgoing":
            return "Transfer"
        case "Incoming":
            return "Received"
        case "Faucet":
            return "Faucet Request"
        default:
            return type
    }
}

function getAmountColor(type: UITransaction["type"], status: UITransaction["status"]): string {
    if (status === "isFailed") return "text-red-500"
    if (status === "isPending") return "text-yellow-500"

    switch (type) {
        case "Outgoing":
            return "text-red-500"
        case "Incoming":
        case "Faucet":
            return "text-green-500"
        default:
            return "text-green-500"
    }
}

function TransactionItem({ transaction }: { transaction: UITransaction }) {
    const { type, amount, timestamp, status } = transaction
    const isNegative = type === "Outgoing"
    const formattedAmount = formatAmount(amount)
    const displayAmount = isNegative ? `-${formattedAmount}` : `+${formattedAmount}`

    return (
        <Card className="">
            <CardContent className="flex items-center gap-4">
                <div className="flex-shrink-0">{getTransactionIcon(type, status)}</div>

                <div className="flex-1 min-w-0">
                    <div className="text-white font-medium ">{getTransactionLabel(type)}</div>
                    <div className="text-gray-400 text-sm font-mono">{timestamp}</div>
                </div>

                <div className={cn("font-light", getAmountColor(type, status))}>{displayAmount}</div>
            </CardContent>
        </Card>
    )
}

export function ActivityCardList() {
    const transactions = useTransactionStore((state) => state.transactions)
    const loading = useTransactionStore((state) => state.loading)
    const loadTransactions = useTransactionStore((state) => state.loadTransactions)
    const [client, setClient] = useState<unknown | null>(null)
    const account = useMidenSdkStore((state) => state.account)
    const balance = useBalanceStore((state) => state.balance)

    useEffect(() => {
        const initClient = async () => {
            const { WebClient } = await import("@demox-labs/miden-sdk");
            const clientInstance = await WebClient.createClient(RPC_ENDPOINT);
            setClient(clientInstance);
        };
        initClient();
    }, [])


    useEffect(() => {
        if (!client || !account) return;

        const fetchTransactions = async () => {
            try {
                const { TransactionFilter, NoteFilter, NoteFilterTypes } = await import("@demox-labs/miden-sdk");
                const transactionReacords = (await client.getTransactions(TransactionFilter.all())).filter((tx: any) => tx.accountId().toString() === account);
                const inputNotes = (await client.getInputNotes(new NoteFilter(NoteFilterTypes.All)))
                await loadTransactions(transactionReacords, inputNotes)
            } catch (error) {
                console.error("Error loading transactions:", error)
            }
        }

        fetchTransactions()
    }, [client, account, balance])

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6 text-muted-foreground/60" />
                </div>
                <p className="text-muted-foreground/80 text-sm">No transactions yet</p>
                <p className="text-muted-foreground/60 text-xs mt-1">Your activity will appear here</p>
            </div>
        )
    }

    return (
        <ScrollArea className="h-[400px]">
            <div className="space-y-3">
                {transactions.map((transaction, index) => (
                    <TransactionItem key={index} transaction={transaction} />
                ))}
            </div>
        </ScrollArea>
    )
}
