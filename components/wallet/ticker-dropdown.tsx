"use client"

import { ChevronRight } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useBalanceStore } from "@/providers/balance-provider"
import { useIsMobile } from "@/hooks/use-mobile"
import { useState } from "react"
import { FaucetInfo } from "@/store/balance"

interface Props {
    selectedTicker: FaucetInfo
    setSelectedTicker: (ticker: FaucetInfo) => void
}

const sliceAddress = (address: string) => {
    if (address.length <= 12) return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function TickerDropdown({ selectedTicker, setSelectedTicker }: Props) {
    const faucetInfo = useBalanceStore((state) => state.faucets);
    const balances = useBalanceStore((state) => state.balances);
    const isMobile = useIsMobile();
    const symbol = faucetInfo.find((faucet) => faucet.address === selectedTicker.address)?.symbol || "MDN"

    const [displayedItems, setDisplayedItems] = useState(4);
    const itemsPerPage = 4;
    const totalItems = faucetInfo.length;
    const hasMoreItems = totalItems > displayedItems;

    const handleSeeAll = () => {
        const newDisplayedItems = Math.min(displayedItems + itemsPerPage, totalItems);
        setDisplayedItems(newDisplayedItems);
    };
    console.log(balances, selectedTicker.symbol);
    if (balances[selectedTicker.address] === undefined) {
        return <div className="h-8 w-20 rounded-md animate-pulse bg-muted" />
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <span className="flex items-center font-mono pl-1 py-1 hover:bg-accent text-foreground font-medium focus:ring-0 focus:outline-none">
                    {symbol}
                    <ChevronRight className="h-4 w-4 ml-1" />
                </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align={isMobile ? "end" : "start"}
                side={isMobile ? "bottom" : "right"}
                sideOffset={isMobile ? 0 : 25}
                className="w-[254px] bg-background border-border p-0 translate-y-[-10px]"
            >
                <div className="">
                    <div className="">
                        {faucetInfo.slice(0, displayedItems).map((asset, index) => {
                            if (balances[asset.address] === undefined) {
                                console.log(balances[asset.address])
                                return null
                            };
                            return (
                                <DropdownMenuItem
                                    key={asset.address}
                                    onClick={() => setSelectedTicker(asset)}
                                    className={`focus:ring-0 focus:outline-none p-0`}
                                >
                                    <div className="flex items-center justify-between w-full border-b px-2">
                                        <div className="flex items-center">
                                            <Logo />
                                            <div className="flex flex-col" >
                                                <span className="text-xs flex gap-2 items-center">{asset.symbol} <p className="text-[8px] text-[#B8B8B8]">MIDEN</p></span>
                                                <span className="text-[10px]">{sliceAddress(asset.address)}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-base">{balances[asset.address].toFixed(2)}</span>
                                            <span className="flex justify-end text-xs font-normal">{asset.symbol}</span>
                                        </div>
                                    </div>
                                </DropdownMenuItem>
                            )
                        })}
                        {hasMoreItems && (
                            <div
                                onClick={handleSeeAll}
                                className="w-full text-center text-xs flex items-center justify-center text-primary h-6 cursor-pointer italic"
                            >
                                SEE ALL
                            </div>
                        )}
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}




function Logo() {
    return (
        <svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[22px] h-[22px] mr-2">
            <path d="M5.61766 4.80976L6.55372 5.84008C6.63365 5.92782 6.77959 5.87135 6.77959 5.75321V3.286C6.77959 3.25159 6.7932 3.21858 6.81745 3.19417C6.8417 3.16975 6.87463 3.15592 6.90904 3.15569H8.62913C9.38406 3.15569 10.0834 3.5501 10.4704 4.19383L10.8101 4.75851C10.8327 4.79595 10.8645 4.82693 10.9025 4.84847C10.9406 4.87 10.9835 4.88136 11.0273 4.88143H11.0403C11.1076 4.88132 11.1721 4.8545 11.2197 4.80685C11.2673 4.75921 11.294 4.69465 11.294 4.62733V2.06109C11.294 1.99377 11.2673 1.92921 11.2197 1.88157C11.1721 1.83392 11.1076 1.8071 11.0403 1.80699H7.03891C6.97014 1.80699 6.90418 1.77967 6.85555 1.73103C6.80692 1.6824 6.77959 1.61644 6.77959 1.54767V0.375749C6.77959 0.26846 6.69272 0.181152 6.585 0.181152H5.67761C5.57032 0.181152 5.48301 0.268026 5.48301 0.375749V1.54767C5.48301 1.69101 5.36703 1.80742 5.22369 1.80742H0.254539C0.187296 1.80742 0.122795 1.83407 0.0751663 1.88154C0.0275374 1.929 0.000664255 1.99341 0.000434367 2.06066V2.66616C0.000434367 2.73132 0.0256276 2.79387 0.0703674 2.84121L5.64633 7.82514C5.69091 7.87217 5.71575 7.93451 5.71575 7.99932C5.71575 8.06412 5.69091 8.12646 5.64633 8.1735L0.069933 13.1579C0.0250789 13.2051 4.99253e-05 13.2678 0 13.3329V13.9384C0 14.0787 0.113804 14.1921 0.254104 14.1921H5.22326C5.3666 14.1921 5.48258 14.3085 5.48258 14.4518V15.6238C5.48258 15.731 5.56945 15.8183 5.67717 15.8183H6.58456C6.69185 15.8183 6.77916 15.7315 6.77916 15.6238V14.4518C6.77916 14.3085 6.89514 14.1925 7.03804 14.1925H11.0394C11.0729 14.1926 11.1061 14.186 11.137 14.1732C11.1679 14.1604 11.196 14.1416 11.2197 14.1179C11.2433 14.0942 11.2621 14.0661 11.2748 14.0352C11.2876 14.0042 11.2941 13.971 11.294 13.9375V11.3717C11.294 11.3043 11.2672 11.2397 11.2195 11.1921C11.1719 11.1444 11.1073 11.1176 11.0399 11.1176H11.0277C10.9838 11.1176 10.9407 11.1288 10.9025 11.1504C10.8643 11.1719 10.8323 11.203 10.8096 11.2406L10.4704 11.8052C10.2791 12.1223 10.0091 12.3845 9.68653 12.5664C9.36398 12.7483 8.99987 12.8437 8.62956 12.8434H6.90904C6.89198 12.8433 6.8751 12.8399 6.85937 12.8333C6.84363 12.8267 6.82935 12.8171 6.81733 12.805C6.80531 12.7929 6.79579 12.7786 6.78931 12.7628C6.78284 12.747 6.77954 12.7301 6.77959 12.7131V10.2459C6.7797 10.2196 6.77182 10.1939 6.757 10.1723C6.74218 10.1506 6.72113 10.1339 6.69662 10.1245C6.67212 10.1151 6.64533 10.1133 6.61981 10.1195C6.59428 10.1257 6.57124 10.1394 6.55372 10.159L5.61766 11.1893C5.53079 11.2849 5.48301 11.4091 5.48301 11.5385V12.7135C5.48301 12.7478 5.46937 12.7808 5.4451 12.805C5.42082 12.8293 5.3879 12.8429 5.35357 12.8429H2.16358C2.15632 12.8431 2.14914 12.8414 2.14274 12.838C2.13634 12.8346 2.13095 12.8295 2.12709 12.8234C2.12282 12.8161 2.12091 12.8077 2.12161 12.7993C2.12231 12.7909 2.12559 12.7829 2.131 12.7765L7.10146 8.10574L7.10233 8.10443C7.12649 8.07464 7.13967 8.03745 7.13967 7.9991C7.13967 7.96074 7.12649 7.92356 7.10233 7.89377L7.10146 7.8929L2.131 3.22259C2.12559 3.21613 2.12231 3.20815 2.12161 3.19975C2.12091 3.19135 2.12282 3.18294 2.12709 3.17568C2.13095 3.16952 2.13634 3.16448 2.14274 3.16106C2.14914 3.15763 2.15632 3.15593 2.16358 3.15613H5.35357C5.42481 3.15613 5.48301 3.2139 5.48301 3.28557V4.46053C5.48301 4.58954 5.53079 4.7142 5.61766 4.80976Z" fill="#FF5500" />
        </svg>
    )
}