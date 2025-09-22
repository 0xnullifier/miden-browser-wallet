"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { SendCard } from "@/components/wallet/send-card"
import { ActivityCardList } from "@/components/wallet/activity-card"
import { toShowType, WalletCard } from "@/components/wallet/wallet-card"
import { Faucet } from "@/components/wallet/faucet-card"
import { ReceiveCard } from "@/components/wallet/receve-card"
import { LoadingTimeoutDialog } from "@/components/ui/loading-timeout-dialog"
import { useMidenSdkStore } from "@/providers/sdk-provider"
import { useLoadingTimeout } from "@/hooks/use-loading-timeout"
import { nukeWalletDatabase } from "@/lib/utils"
import { FAUCET_ID } from "@/lib/constants"
import { toast } from "sonner"


export default function WalletInterface() {
    const isLoading = useMidenSdkStore((state) => state.isLoading)
    const initializeSdk = useMidenSdkStore((state) => state.initializeSdk)
    const [toShow, setToShow] = useState<toShowType>("activity")
    const [faucetAddress, setFaucetAddress] = useState<string>(FAUCET_ID)
    const [showTimeoutDialog, setShowTimeoutDialog] = useState(false)

    const { isTimeoutReached, elapsedTime, resetTimeout } = useLoadingTimeout(isLoading, {
        onTimeout: () => {
            setShowTimeoutDialog(true)
        }
    })

    const handleNukeDatabase = async () => {
        try {
            setShowTimeoutDialog(false)
            toast.loading("Clearing database...", { id: "nuke-db" })

            await nukeWalletDatabase()

            toast.success("Database cleared successfully! Reloading...", { id: "nuke-db" })

            // Small delay to show the success message
            setTimeout(() => {
                window.location.reload()
            }, 1000)
        } catch (error) {
            console.error("Failed to nuke database:", error)
            toast.error("Failed to clear database. Please try again.", { id: "nuke-db" })
        }
    }

    const handleRetry = () => {
        setShowTimeoutDialog(false)
        resetTimeout()
        // Reinitialize the SDK
        initializeSdk({})
    }

    const handleCloseTimeoutDialog = () => {
        setShowTimeoutDialog(false)
    }

    if (isLoading) {
        return (
            <>
                <div className="h-[600px] bg-background flex justify-center px-4 md:px-6 md:py-6">
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
                                    {elapsedTime > 5000 && (
                                        <p className="text-xs text-yellow-600 dark:text-yellow-400">
                                            Loading for {Math.floor(elapsedTime / 1000)} seconds...
                                        </p>
                                    )}
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

                <LoadingTimeoutDialog
                    isOpen={showTimeoutDialog}
                    onClose={handleCloseTimeoutDialog}
                    onNukeDatabase={handleNukeDatabase}
                    onRetry={handleRetry}
                    elapsedTime={elapsedTime}
                />
            </>
        )
    }

    return (
        <div className="bg-background px-4 py-4 md:px-6 md:py-6" >
            <div className="max-w-[1200px] mx-auto">
                <div className="h-full relative gap-4">
                    <div className={`flex justify-center`}>
                        <div className="w-full max-w-[400px] space-y-4">
                            <WalletCard
                                faucetAddress={faucetAddress}
                                setFaucetAddress={setFaucetAddress}
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
                                <SendCard selectedAddress={faucetAddress} />
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
