"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { SendCard } from "@/components/wallet/send-card"
import { ActivityCardList } from "@/components/wallet/activity-card"
import { toShowType, WalletCard } from "@/components/wallet/wallet-card"
import { Faucet } from "@/components/wallet/faucet-card"
import { ReceiveCard } from "@/components/wallet/receve-card"
import { useMidenSdkStore } from "@/providers/sdk-provider"
import { toast } from "sonner"


export default function WalletInterface() {
    const isLoading = useMidenSdkStore((state) => state.isLoading)
    const [toShow, setToShow] = useState<toShowType>("activity")
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex justify-center px-4 py-4 md:px-6 md:py-6">
                <Card className="w-full max-w-md bg-card border-border">
                    <CardContent className="p-6 space-y-6">
                        <div className="text-center space-y-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-medium text-foreground">
                                    Loading Wallet...
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Checking for existing wallet
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Skeleton className="h-4 w-3/4 mx-auto" />
                            <Skeleton className="h-4 w-1/2 mx-auto" />
                            <Skeleton className="h-4 w-2/3 mx-auto" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="bg-background px-4 py-4 md:px-6 md:py-6" >
            <div className="max-w-[1200px] mx-auto">
                <div className="h-full relative gap-4">
                    <div className={`flex justify-center`}>
                        <div className="w-full max-w-[400px] space-y-4">
                            <WalletCard
                                setToShow={setToShow}
                            />
                            {toShow === "activity" && (
                                <ActivityCardList />
                            )}
                        </div>
                    </div>
                    {toShow === "send" && (
                        <div className="flex justify-center w-full pt-3">
                            <div className="w-full max-w-[400px]">
                                <SendCard onClose={() => setToShow("activity")} />
                            </div>
                        </div>
                    )}
                    {toShow === "faucet" && (
                        <div className="flex justify-center w-full pt-3">
                            <div className="w-full max-w-[400px]">
                                <Faucet onClose={() => setToShow("activity")} />
                            </div>
                        </div>
                    )}
                    {toShow === "receive" && (
                        <div className="flex justify-center w-full pt-3">
                            <div className="w-full max-w-[400px]">
                                <ReceiveCard onClose={() => setToShow("activity")} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div >
    )
}
