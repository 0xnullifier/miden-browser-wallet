"use client"

import { Button } from "@/components/ui/button"
import { ChevronDown, ExternalLink } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown"
import { ScrollArea } from "@/components/ui/scroll-area"
import { EXPLORER_ADDRESS_URL } from "@/lib/constants"
import { useBalanceStore } from "@/providers/balance-provider"

interface Props {
    selectedTicker: string
    setSelectedTicker: (ticker: string) => void
}

const sliceAddress = (address: string) => {
    if (address.length <= 12) return address
    return `${address.slice(0, 8)}...${address.slice(-6)}`
}

const accountIdToBech32 = async (accountId: string) => {
    const { AccountId, NetworkId } = await import("@demox-labs/miden-sdk");
    return AccountId.fromHex(accountId).toBech32(NetworkId.Testnet, 0);
}

export function TickerDropdown({ selectedTicker, setSelectedTicker }: Props) {
    const faucetInfo = useBalanceStore((state) => state.faucets);
    const loading = useBalanceStore((state) => state.loading);
    const balances = useBalanceStore((state) => state.balances);
    const symbol = faucetInfo.find((faucet) => faucet.address === selectedTicker)?.symbol || "MDN"
    if (balances[selectedTicker] === undefined) {
        return <div className="h-8 w-20 rounded-md animate-pulse bg-muted" />
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <span className="flex items-center font-mono pl-1 py-1 hover:bg-accent text-foreground font-medium focus:ring-0 focus:outline-none">
                    {symbol}
                    <ChevronDown className="h-4 w-4 ml-1" />
                </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[290px] bg-background border-border p-0">
                <ScrollArea className="h-[300px]">
                    <div className="p-1">
                        {faucetInfo.map((asset, index) => {
                            return (
                                <DropdownMenuItem
                                    key={asset.address}
                                    onClick={() => setSelectedTicker(asset.address)}
                                    className={`p-4 focus:ring-0 focus:outline-none`}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="font-semibold text-foreground">{asset.symbol}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {balances[asset.address] === undefined ? (
                                                    <div className="h-4 w-16 rounded-md bg-muted animate-pulse" />
                                                ) : (
                                                    <span className="text-sm font-medium text-foreground">
                                                        {balances[asset.address].toFixed(2) || "0.00"}
                                                    </span>
                                                )
                                                }

                                                <span className="text-muted-foreground text-xl ">·</span>
                                                <span className="flex items-center justify-center text-sm text-muted-foreground font-mono hover:text-primary/80 cursor-pointer" onClick={
                                                    async () => {
                                                        const address = await accountIdToBech32(asset.address)
                                                        window.open(EXPLORER_ADDRESS_URL(address), "_blank")
                                                    }
                                                }>
                                                    {sliceAddress(asset.address)}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 px-2 text-xs text-primary focus:ring-0 focus:outline-none"
                                                    >
                                                        <ExternalLink className="h-3 w-3 mr-1" />
                                                    </Button>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </DropdownMenuItem>
                            )
                        })}
                    </div>
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
