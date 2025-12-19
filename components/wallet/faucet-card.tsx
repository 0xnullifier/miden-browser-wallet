"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Input } from "../ui/input";
import { Alert, AlertDescription } from "../ui/alert";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useBalanceStore } from "@/providers/balance-provider";
import { useMidenSdkStore } from "@/providers/sdk-provider";

export function Faucet({ onClose }: { onClose: () => void }) {
  const [amount, setAmount] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const faucet = useBalanceStore((state) => state.faucet);
  const faucetLoading = useBalanceStore((state) => state.faucetLoading);
  const account = useMidenSdkStore((store) => store.account);

  const onMint = async () => {
    if (!account) {
      console.error("No account found for faucet request");
      return;
    }
    if (amount) {
      await faucet(account, parseFloat(amount));
    }
  };
  return (
    <div className="w-full font-geist">
      <Card className="rounded-[10px] py-0 border-border gap-4">
        <CardHeader className="bg-[#F9F9F9] rounded-t-[10px] py-[7px] border-b-[0.5px] flex items-center justify-center">
          <div className="text-center text font-medium">Faucet</div>
        </CardHeader>
        <CardContent className="pt-0 px-0">
          <div className="flex flex-col gap-2 border-border border-b-[0.5px] pb-3 px-[26px]">
            <div className="flex gap-2 items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Amount
              </label>
              <div className="flex gap-2">
                {[100, 500, 1000].map((val) => (
                  <button
                    key={val}
                    className={
                      "text-center bg-[#F9F9F9] px-2 py-1 text-[10px] border-border border-[0.5px] rounded-[3px] min-w-[34px] h-[17px] flex items-center font-medium " +
                      (amount === val.toString()
                        ? "bg-primary text-primary-foreground border-primary"
                        : " border-neutral-400 dark:border-muted")
                    }
                    onClick={() => setAmount(val.toString())}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <Input
            type="text"
            value={amount.toString()}
            placeholder="Type in a number up to 10,000"
            onChange={(e) => {
              setAmount(e.target.value);
              if (parseFloat(e.target.value) > 10000) {
                setShowAlert(true);
              } else {
                setShowAlert(false);
              }
            }}
            className="text-sm px-2 h-[38px] w-full border-0 ring-0 !outline-none !shadow-none focus:!outline-none bg-transparent placeholder:text-#000000 placeholder:font-medium resize-none text-center flex items-center mt-0 placeholder:mt-0"
          />
          {showAlert && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Amount cannot exceed 10,000. Please enter a smaller amount.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Button
        className="w-full h-10 text-sm flex items-center justify-center bg-primary mt-5 font-bold"
        disabled={!amount || faucetLoading || showAlert}
        onClick={onMint}
        variant="default"
      >
        {faucetLoading ? (
          <Loader2 className="animate-spin h-4 w-4 mr-2" />
        ) : null}
        {faucetLoading ? "Minting..." : "Mint"}
      </Button>
    </div>
  );
}
