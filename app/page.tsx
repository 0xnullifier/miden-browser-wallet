"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SendCard } from "@/components/wallet/send-card";
import { ActivityCardList } from "@/components/wallet/activity-card";
import { toShowType, WalletCard } from "@/components/wallet/wallet-card";
import { Faucet } from "@/components/wallet/faucet-card";
import { ReceiveCard } from "@/components/wallet/receive-card";
import { LoadingTimeoutDialog } from "@/components/ui/loading-timeout-dialog";
import { useMidenSdkStore } from "@/providers/sdk-provider";
import { useLoadingTimeout } from "@/hooks/use-loading-timeout";
import { nukeWalletDatabase } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "motion/react";
import { FaucetInfo } from "@/store/balance";
import { useBalanceStore } from "@/providers/balance-provider";

export default function WalletInterface() {
  const isLoading = useMidenSdkStore((state) => state.isLoading);
  const initializeSdk = useMidenSdkStore((state) => state.initializeSdk);
  const [toShow, setToShow] = useState<toShowType>("activity");
  const faucets = useBalanceStore((state) => state.faucets);
  const [faucet, setFaucet] = useState<FaucetInfo>(faucets[0]);
  const [showTimeoutDialog, setShowTimeoutDialog] = useState(false);

  const { isTimeoutReached, elapsedTime, resetTimeout } = useLoadingTimeout(
    isLoading,
    {
      onTimeout: () => {
        setShowTimeoutDialog(true);
      },
    },
  );

  const handleNukeDatabase = async () => {
    try {
      setShowTimeoutDialog(false);
      toast.loading("Clearing database...", { id: "nuke-db" });

      await nukeWalletDatabase();

      toast.success("Database cleared successfully! Reloading...", {
        id: "nuke-db",
      });

      // Small delay to show the success message
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Failed to nuke database:", error);
      toast.error("Failed to clear database. Please try again.", {
        id: "nuke-db",
      });
    }
  };

  const handleRetry = () => {
    setShowTimeoutDialog(false);
    resetTimeout();
    // Reinitialize the SDK
    initializeSdk({});
  };

  const handleCloseTimeoutDialog = () => {
    setShowTimeoutDialog(false);
  };

  if (isLoading) {
    return (
      <>
        <motion.div
          className="h-[600px] bg-background flex justify-center px-4 md:px-6 md:py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-md"
          >
            <Card className="bg-card border-border">
              <CardContent className="p-6 space-y-6">
                <motion.div
                  className="text-center space-y-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <motion.div
                    className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  ></motion.div>
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <h3 className="text-lg font-medium text-foreground">
                      Loading Wallet...
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Checking for existing wallet
                    </p>
                    {elapsedTime > 5000 && (
                      <motion.p
                        className="text-xs text-yellow-600 dark:text-yellow-400"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        Loading for {Math.floor(elapsedTime / 1000)} seconds...
                      </motion.p>
                    )}
                  </motion.div>
                </motion.div>

                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "75%" }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className="mx-auto"
                  >
                    <Skeleton className="h-4" />
                  </motion.div>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "50%" }}
                    transition={{ duration: 0.8, delay: 0.9 }}
                    className="mx-auto"
                  >
                    <Skeleton className="h-4" />
                  </motion.div>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "66%" }}
                    transition={{ duration: 0.8, delay: 1.1 }}
                    className="mx-auto"
                  >
                    <Skeleton className="h-4" />
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <LoadingTimeoutDialog
          isOpen={showTimeoutDialog}
          onClose={handleCloseTimeoutDialog}
          onNukeDatabase={handleNukeDatabase}
          onRetry={handleRetry}
          elapsedTime={elapsedTime}
        />
      </>
    );
  }

  return (
    <motion.div
      className="w-full justify-center px-4 py-4 md:px-6 md:py-6 flex gap-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="flex justify-center"
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="w-[24rem] sm:w-[429px] space-y-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
            mass: 0.8,
            delay: 0.1,
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
              mass: 0.8,
            }}
          >
            <WalletCard
              faucet={faucet}
              toShow={toShow}
              setFaucet={setFaucet}
              setToShow={setToShow}
            />
          </motion.div>
          {toShow === "activity" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
                mass: 0.8,
              }}
            >
              <ActivityCardList />
            </motion.div>
          )}
          {toShow === "faucet" && (
            <WalletActionCard>
              <Faucet onClose={() => setToShow("activity")} />
            </WalletActionCard>
          )}
          {toShow === "receive" && (
            <WalletActionCard>
              <ReceiveCard onClose={() => setToShow("activity")} />
            </WalletActionCard>
          )}
          {toShow === "send" && (
            <WalletActionCard>
              <SendCard selectedFaucet={faucet} />
            </WalletActionCard>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function WalletActionCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="flex justify-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 0.8,
      }}
    >
      <div className="w-[24rem] sm:w-[429px]">{children}</div>
    </motion.div>
  );
}
