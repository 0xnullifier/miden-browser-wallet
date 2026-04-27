"use client";

import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import { send } from "@/lib/actions";
import { sucessTxToast } from "@/components/success-tsx-toast";
import {
  DECIMALS,
  GITHUB_FEEDBACK_URL,
  PRIVATE_NOTE_TRANSPORT_URL,
  RPC_ENDPOINT,
} from "@/lib/constants";
import { useMidenSdkStore } from "@/providers/sdk-provider";
import { useBalanceStore } from "@/providers/balance-provider";
import { toast } from "sonner";
import { OneToMany } from "./one-to-many";
import { FaucetInfo } from "@/store/balance";

export function SendCard({ selectedFaucet }: { selectedFaucet: FaucetInfo }) {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [isOneToMany, setIsOneToMany] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [delegate, setDelegate] = useState(true);
  const account = useMidenSdkStore((state) => state.account);
  const balances = useBalanceStore((state) => state.balances);
  const balance = balances[selectedFaucet.address];
  const decimals = selectedFaucet.decimals || DECIMALS;

  const onSend = async () => {
    if (!account) return;
    if (recipient === account) {
      toast.error("You cannot send payment to yourself");
      setRecipient("");
      return;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    setLoading(true);
    const { WasmWebClient, Address } = await import("@miden-sdk/miden-sdk");
    const client = await WasmWebClient.createClient(
      RPC_ENDPOINT,
      PRIVATE_NOTE_TRANSPORT_URL,
    );
    try {
      const { tx, note } = await send(
        client,
        account,
        recipient,
        Number(amount),
        isPrivate,
        selectedFaucet.address,
        decimals,
        undefined,
        delegate,
      );
      sucessTxToast("Transaction sent successfully", tx);
      if (isPrivate) {
        toast.promise(
          client.sendPrivateNote(note, Address.fromBech32(recipient)),
          {
            position: "top-right",
            loading: "Sending Private Note..",
            success: "Private Note Sent!",
            error: "Failed to send private note",
          },
        );
      }
    } catch (error) {
      console.error("Error sending transaction:", error);
      toast.error(
        "Failed to send transaction: " +
          (error instanceof Error ? error.message : "Unknown error"),
        {
          action: (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                window.open(GITHUB_FEEDBACK_URL, "_blank");
              }}
            >
              Report
            </Button>
          ),
        },
      );
    } finally {
      setAmount("");
      setRecipient("");
      setLoading(false);
      client.terminate();
    }
  };

  return (
    <div className="w-full">
      <Card className="rounded-[10px] py-0 border-border gap-0 ">
        <CardHeader className="bg-[#F9F9F9] rounded-t-[10px] py-[10px] border-b-[0.5px] flex items-center justify-center">
          <div className="text-center text-xl font-medium">Send</div>
        </CardHeader>
        <CardContent className="px-0 gap-0">
          <Input
            type="text"
            inputMode="decimal"
            pattern="^[0-9]*[.,]?[0-9]*$"
            placeholder={`0 ${selectedFaucet.symbol}`}
            value={amount}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "" || /^\d*\.?\d*$/.test(value)) {
                setAmount(value);
              }
            }}
            className="text-center text-[40px] h-[90px] w-full border-0 ring-0 !outline-none !shadow-none focus:!outline-none bg-transparent placeholder:text-#00000087"
          />

          <div className="flex items-center border-y-[0.5px] w-full">
            <div className="flex gap-2 w-full">
              <Input
                placeholder="mtst1qzv...5tfg"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="text-sm px-2 h-[48px] w-full border-0 ring-0 !outline-none !shadow-none focus:!outline-none bg-transparent placeholder:text-#2929299C resize-none text-center"
              />
            </div>
          </div>

          <OptionItem
            title="One to Many Payment"
            subTitle="Send to multiple recipients"
            value={isOneToMany}
            onToggle={setIsOneToMany}
            first={true}
          />
          <OptionItem
            title="Private Payment"
            subTitle="Keep transaction details private"
            value={isPrivate}
            onToggle={setIsPrivate}
          />
          <OptionItem
            title="Use Delegate Proving"
            subTitle="Outsource proof generation"
            value={delegate}
            onToggle={setDelegate}
          />
        </CardContent>
      </Card>
      <Button
        className="w-full h-10 text-sm font-medium mt-[5px] rounded-[5px]"
        disabled={
          !amount ||
          !recipient ||
          loading ||
          isNaN(Number(amount)) ||
          Number(amount) <= 0 ||
          Number(amount) > balance
        }
        onClick={onSend}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending...
          </div>
        ) : (
          "Send Payment"
        )}
      </Button>

      <OneToMany
        isOneToMany={isOneToMany}
        setIsOneToMany={setIsOneToMany}
        amount={amount}
        receipient={recipient}
        selectedFaucetId={selectedFaucet}
      />
    </div>
  );
}

export const OptionItem = ({
  onToggle,
  title,
  subTitle,
  value,
  first,
}: {
  onToggle: (val: boolean) => void;
  title: string;
  subTitle: string;
  value: boolean;
  first?: boolean;
}) => {
  return (
    <div
      className={`flex items-center justify-between font-geist ${first ? "" : "border-t-[0.5px]"}`}
    >
      <div className="space-y-1 pl-5">
        <div className="text-sm font-medium text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground">{subTitle}</div>
      </div>
      <Switch2 value={value} onToggle={onToggle} />
    </div>
  );
};

const Switch2 = ({
  value,
  onToggle,
}: {
  value: boolean;
  onToggle: (val: boolean) => void;
}) => {
  useEffect(() => {
    if (typeof onToggle !== "undefined") onToggle(value);
  }, [value]);
  if (value) {
    return (
      <div className="flex">
        <div
          className="cursor-pointer text-primary w-[64px] h-[54px] text-sm bg-[#F9F9F9] border-x-[0.5px] flex items-center justify-center px-[1px]"
          onClick={() => onToggle(false)}
        >
          On
        </div>
        <div className="w-[64px] h-[54px] bg-background rounded-[10px]"></div>
      </div>
    );
  } else {
    return (
      <div className="flex">
        <div className="w-[64px] h-[54px] border-l-[0.5px]"></div>
        <div
          className="cursor-pointer text-primary text-sm w-[64px] h-[54px] flex items-center justify-center bg-[#F9F9F9] border-l-[0.5px] rounded-br-[10px]"
          onClick={() => onToggle(true)}
        >
          Off
        </div>
      </div>
    );
  }
};
