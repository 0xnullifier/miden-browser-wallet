"use client"

import Link from "next/link";
import { ModeToggle } from "@/components/ui/mode-toggle";
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
                    {/* Top row with block info and mode toggle */}
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
                        <ModeToggle />
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
                                    <Github className="cursor-pointer" onClick={() => window.open("https://github.com/0xnullifier/miden-browser-wallet/issues/new?template=feedback.md", "_blank")} />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Give Feedback!</p>
                                </TooltipContent>
                            </Tooltip>

                            <ModeToggle />
                        </div>
                    </div>
                </div>
            </div>
        </header>
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