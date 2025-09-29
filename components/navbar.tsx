"use client"

import Link from "next/link";
import { RotatingBlock } from "@/components/ui/rotating-block"
import { useMidenSdkStore } from "@/providers/sdk-provider";
import { Github } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"


const NAV_ITEMS = [
    { name: "WALLET", href: "/" },
    { name: "DASHBOARD", href: "/dashboard" },
    { name: "DOCS", href: "/docs" },
]

export function Navbar() {
    const blockNum = useMidenSdkStore((state) => state.blockNum);
    return (
        <header className="w-full sticky top-0 z-50 bg-background">
            <div className="max-w-6xl mx-auto px-4 py-4 md:px-6 md:py-6">
                {/* Mobile Layout */}
                <div className="flex flex-col gap-4 sm:hidden">
                    {/* Top row with block info */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-400/30 rounded-full min-w-[120px] justify-start">
                            <div className="flex items-center justify-center w-[14px] h-[14px]">
                                <RotatingBlock
                                    blockSize={14}
                                    rotationSpeed={2.3}
                                    blockColor="bg-orange-500/70"
                                    className="!w-[14px] !h-[14px] !max-w-none !mx-0 !mb-0 flex items-center justify-center"
                                />
                            </div>
                            <span className="text-[14px] font-medium text-muted-foreground leading-none">
                                {blockNum.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* Navigation links row */}
                    <nav className="flex items-center justify-center gap-4 overflow-x-auto">
                        {NAV_ITEMS.map((item) => (
                            <NavMobileItem
                                key={item.name}
                                name={item.name}
                                href={item.href}
                            />
                        ))}
                    </nav>
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:block">
                    <div className="relative flex items-center h-7">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-400/30 min-w-[120px] justify-start">
                            <div className="flex items-center justify-center w-[14px] h-[14px]">
                                <RotatingBlock
                                    blockSize={14}
                                    rotationSpeed={2.3}
                                    blockColor="bg-orange-500/70"
                                    className="!w-[14px] !h-[14px] !max-w-none !mx-0 !mb-0 flex items-center justify-center"
                                />
                            </div>
                            <span className="text-[14px] font-medium text-muted-foreground leading-none">
                                {blockNum.toLocaleString()}
                            </span>
                        </div>

                        <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-6">
                            {NAV_ITEMS.map((item) => (
                                <NavDesktopItem
                                    key={item.name}
                                    name={item.name}
                                    href={item.href}
                                />
                            ))}
                        </nav>

                        <div className="flex gap-5 items-center min-w-[48px] justify-end ml-auto">
                            <Tooltip >
                                <TooltipTrigger asChild>
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 cursor-pointer hover:opacity-80" onClick={() => window.open("https://github.com/0xnullifier/miden-browser-wallet/issues/new?template=feedback.md", "_blank")} >
                                        <path d="M7 0C3.13235 0 0 3.21153 0 7.17695C0 10.3529 2.00383 13.0352 4.78617 13.9857C5.13617 14.0487 5.26704 13.8334 5.26704 13.6449C5.26704 13.4746 5.25852 12.9098 5.25852 12.3082C3.5 12.6402 3.0453 11.8688 2.9053 11.4656C2.82617 11.2591 2.4853 10.6219 2.18704 10.4515C1.94235 10.3167 1.59235 9.98469 2.17852 9.97596C2.73 9.96722 3.12383 10.4964 3.2553 10.7117C3.8853 11.7977 4.89148 11.4919 5.29383 11.3034C5.3547 10.8372 5.53852 10.5233 5.74 10.3435C4.18235 10.1644 2.5553 9.54534 2.5553 6.8C2.5553 6.0199 2.82617 5.37397 3.27235 4.87159C3.20235 4.69185 2.95765 3.95606 3.34235 2.96938C3.34235 2.96938 3.92852 2.78091 5.26765 3.70518C5.82765 3.54354 6.42235 3.46303 7.01765 3.46303C7.61235 3.46303 8.20765 3.54416 8.76765 3.70518C10.1068 2.77217 10.6923 2.96938 10.6923 2.96938C11.0777 3.95606 10.8323 4.69185 10.7623 4.87159C11.2085 5.37397 11.48 6.01054 11.48 6.8C11.48 9.55408 9.84383 10.1638 8.28617 10.3435C8.54 10.5682 8.75852 10.9988 8.75852 11.6716C8.75852 12.6314 8.75 13.4028 8.75 13.6449C8.75 13.8334 8.88148 14.0581 9.23087 13.9863C11.9968 13.0352 14 10.3435 14 7.17695C14 3.21153 10.8677 0 7 0Z" fill="#FF5500" />
                                    </svg>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Give Feedback!</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </div>
        </header >
    )
}

function NavDesktopItem(
    { name, href }: { name: string; href: string }
) {
    return (
        <Link
            href={href}
            className="text-[14px] font-normal text-muted-foreground hover:text-primary transition-colors"
        >
            {name}
        </Link>
    )
}

function NavMobileItem(
    { name, href }: { name: string; href: string }
) {
    return (
        <Link
            href={href}
            className="text-[13px] font-normal text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
        >
            {name}
        </Link>
    )
}