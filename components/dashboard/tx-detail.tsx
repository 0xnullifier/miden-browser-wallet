"use client"

import { GET_TRANSACTION } from "@/lib/constants";
import { BackendTransaction } from "@/lib/types";
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowUpRight, ArrowDownLeft, Droplets, Copy, Check } from "lucide-react";

export function TransactionDetails() {
    const [loading, setLoading] = useState(true);
    const { id } = useParams<{ id: string }>();
    const [transaction, setTransaction] = useState<BackendTransaction | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [copied, setCopied] = useState(false);
    const [senderCopied, setSenderCopied] = useState(false);

    const fetchTransaction = async () => {
        setLoading(true);
        setNotFound(false);
        try {
            const response = await axios.get(GET_TRANSACTION(id));
            console.log("Transaction response:", response.data);
            if (response.status === 200 && response.data) {
                setTransaction({
                    tx_id: response.data.tx_id,
                    sender: response.data.sender,
                    tx_kind: response.data.tx_kind,
                    timestamp: response.data.timestamp,
                    block_num: response.data.block_num,
                    note_id: response.data.note_id ? {
                        note_id: response.data.note_id.note_id,
                        note_type: response.data.note_id.note_type,
                        note_aux: response.data.note_id.note_aux
                    } : undefined
                })
            } else {
                setNotFound(true);
            }
        } catch (error) {
            console.error("Error fetching transaction:", error);
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    }

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(parseInt(timestamp) * 1000);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const formatTxKind = (kind: string) => {
        switch (kind) {
            case 'send':
                return 'Send';
            case 'receive':
                return 'Receive';
            case 'faucet_request':
                return 'Faucet Request';
            default:
                return kind;
        }
    };

    const renderTransactionTypeBadge = (txKind: string) => {
        switch (txKind) {
            case 'send':
                return (
                    <Badge className="rounded-3xl bg-red-500/10 text-red-600 border-red-500/20 backdrop-blur-sm hover:bg-red-500/20 transition-all duration-200 shadow-lg pr-4 py-2 text-sm font-semibold">
                        <ArrowUpRight className="w-4 h-4" />
                        Send
                    </Badge>
                );
            case 'receive':
                return (
                    <Badge className="rounded-3xl bg-green-500/10 text-green-600 border-green-500/20 backdrop-blur-sm hover:bg-green-500/20 transition-all duration-200 shadow-lg  pr-4 py-2 text-sm font-semibold">
                        <ArrowDownLeft className="w-4 h-4" />
                        Receive
                    </Badge>
                );
            case 'faucet_request':
                return (
                    <Badge className="rounded-3xl bg-blue-500/10 text-blue-600 border-blue-500/20 backdrop-blur-sm hover:bg-blue-500/20 transition-all duration-200 shadow-lg pr-4 py-2 text-sm font-semibold">
                        <Droplets className="w-4 h-4" />
                        Faucet Request
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="backdrop-blur-sm px-4 py-2 text-sm font-semibold">
                        {txKind}
                    </Badge>
                );
        }
    };

    const truncateAddress = (address: string, startLength = 6, endLength = 4) => {
        if (address.length <= startLength + endLength) return address;
        return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
    };
    useEffect(() => {
        fetchTransaction();
    }, [])

    // Loading state
    if (loading) {
        return (
            <div className="bg-background max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="space-y-6 sm:space-y-8">
                    {/* Loading header */}
                    <div className="text-center pb-6 sm:pb-8">
                        <Skeleton className="h-3 w-24 mx-auto mb-3" />
                        <Skeleton className="h-5 sm:h-6 w-full max-w-xs sm:max-w-md mx-auto" />
                    </div>

                    {/* Loading details */}
                    <div className="space-y-4 sm:space-y-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0 py-4 border-b border-border">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-40 sm:w-32" />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0 py-4 border-b border-border">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-28" />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-4 sm:gap-8 py-4 border-b border-border">
                            <div className="flex flex-col">
                                <Skeleton className="h-4 w-12 mb-2" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <div className="flex flex-col">
                                <Skeleton className="h-4 w-20 mb-2" />
                                <Skeleton className="h-4 w-36" />
                            </div>
                        </div>
                    </div>

                    {/* Loading note details */}
                    <div className="space-y-4 mt-6 sm:mt-8">
                        <Skeleton className="h-5 w-28" />
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0 py-2 border-b border-border">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0 py-2 border-b border-border">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0 py-2 border-b border-border">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-8" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Not found state
    if (notFound) {
        return (
            <div className="bg-background max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] space-y-4 sm:space-y-6">
                    <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted">
                        <Search className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
                    </div>
                    <div className="text-center space-y-2 px-4">
                        <h2 className="text-xl sm:text-2xl font-semibold">Transaction Not Found</h2>
                        <p className="text-muted-foreground text-sm sm:text-base max-w-md">
                            The transaction with ID <span className="font-mono font-medium break-all">{id}</span> could not be found. The transaction indexing started at block number 382100. If the transaction is from before this block, it may not be indexed yet.
                        </p>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className="bg-background max-w-6xl mx-auto px-4 sm:px-10 lg:px-8">
            {/* Main Content */}
            <div className="space-y-6 sm:space-y-8">
                {/* Hash - Center Focus */}
                <div className="text-center pb-6 sm:pb-8">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Transaction ID</p>
                    <div className="flex items-center justify-center gap-2">
                        <p className="text-primary font-mono text-lg sm:text-xl font-medium break-all leading-relaxed">
                            <span className="hidden sm:inline">{`${transaction.tx_id.slice(0, 10)}...${transaction.tx_id.slice(-10)}`}</span>
                            <span className="sm:hidden">{`${transaction.tx_id.slice(0, 6)}...${transaction.tx_id.slice(-6)}`}</span>
                        </p>
                        <button
                            type="button"
                            className="ml-2 p-1 rounded hover:bg-muted transition"
                            onClick={() => {
                                navigator.clipboard.writeText(transaction.tx_id);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 750);
                            }}
                            title="Copy Transaction ID"
                        >
                            {copied ? <Check className="w-4 h-4 text-green-300" onClick={() => setCopied(false)} /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                        </button>
                    </div>
                </div>

                {/* Details Stack */}
                <div className="space-y-4 sm:space-y-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0 py-3 sm:py-4 border-b border-border">
                        <span className="text-muted-foreground text-sm sm:text-base">Transaction Sender</span>
                        <span className="font-medium flex gap-2 font-mono text-sm sm:text-base break-all" title={transaction.sender}>
                            <button
                                type="button"
                                className="ml-2 p-1 rounded hover:bg-muted transition"
                                onClick={() => {
                                    navigator.clipboard.writeText(transaction.tx_id);
                                    setSenderCopied(true);
                                    setTimeout(() => setSenderCopied(false), 750);
                                }}
                                title="Copy Transaction ID"
                            >
                                {senderCopied ? <Check className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                            </button>
                            <span className="hidden sm:inline">{transaction.sender}</span>
                            <span className="sm:hidden">{`${transaction.sender.slice(0, 10)}...${transaction.sender.slice(-8)}`}</span>
                        </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0 py-3 sm:py-4 border-b border-border">
                        <span className="text-muted-foreground text-sm sm:text-base">Type</span>
                        <div className="flex items-center justify-start sm:justify-end">
                            {renderTransactionTypeBadge(transaction.tx_kind)}
                        </div>
                    </div>
                    <div className="flex justify-between sm:gap-8 py-3 sm:py-4 border-b border-border">
                        {/* Block */}
                        <div className="flex flex-col">
                            <span className="text-muted-foreground pb-2 text-sm sm:text-base">Block</span>
                            <span className="font-medium text-sm sm:text-base">{transaction.block_num}</span>
                        </div>
                        {/* Executed At */}
                        <div className="flex flex-col">
                            <span className="text-muted-foreground pb-2 text-sm sm:text-base">Executed At</span>
                            <span className="font-medium text-sm sm:text-base">{formatTimestamp(transaction.timestamp)}</span>
                        </div>
                    </div>
                </div>

                {/* Note Details Section - Only show if note_id exists */}
                {transaction.note_id && (
                    <div className="space-y-4 mt-6 sm:mt-8">
                        <h3 className="text-lg font-semibold">Note Details</h3>
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0 py-2 border-b border-border">
                                <span className="text-muted-foreground text-sm sm:text-base">Note ID</span>
                                <span className="font-mono font-medium text-sm sm:text-base break-all" title={transaction.note_id.note_id}>
                                    <span className="hidden sm:inline">{truncateAddress(transaction.note_id.note_id, 8, 6)}</span>
                                    <span className="sm:hidden">{truncateAddress(transaction.note_id.note_id, 10, 8)}</span>
                                </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0 py-2 border-b border-border">
                                <span className="text-muted-foreground text-sm sm:text-base">Note Type</span>
                                <span className="font-medium capitalize text-sm sm:text-base ">{transaction.note_id.note_type}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0 py-2 border-b border-border">
                                <span className="text-muted-foreground text-sm sm:text-base">Auxiliary Field</span>
                                <span className="font-medium text-sm sm:text-base">{transaction.note_id.note_aux}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
