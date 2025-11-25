"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useBalanceStore } from "@/providers/balance-provider";
import { useMidenSdkStore } from "@/providers/sdk-provider";
import { WalletDropdown } from "./wallet-dropdown";
import { TickerDropdown } from "./ticker-dropdown";
import {
  SendSvg,
  ActivtySvg,
  ReceiveSvg,
  FaucetSvg,
} from "@/components/ui/icons";
import { FaucetInfo } from "@/store/balance";
import { numToString } from "@/lib/utils";
export type toShowType = "send" | "activity" | "receive" | "faucet";

interface WalletCardProps {
  faucet: FaucetInfo;
  setFaucet: (faucet: FaucetInfo) => void;
  toShow: toShowType;
  setToShow: (view: toShowType) => void;
}

export function Balance({ faucet }: { faucet: FaucetInfo }) {
  const balanceMap = useBalanceStore((state) => state.balances);
  const symbol = faucet.symbol || "MDN";
  return (
    <div className="text-4xl sm:text-5xl font-light leading-tight py-2 flex flex-col items-center">
      {numToString(balanceMap[faucet.address])}
      <p className="text-2xl text-primary font-normal">{symbol}</p>
    </div>
  );
}

const ACTIONS = (type: toShowType) => [
  {
    icon: <SendSvg active={type === "send"} />,
    label: "Send",
    type: "send" as toShowType,
  },
  {
    icon: <ActivtySvg active={type === "activity"} />,
    label: "Activity",
    type: "activity" as toShowType,
  },
  {
    icon: <ReceiveSvg active={type === "receive"} />,
    label: "Receive",
    type: "receive" as toShowType,
  },
  {
    icon: <FaucetSvg active={type === "faucet"} />,
    label: "Faucet",
    type: "faucet" as toShowType,
  },
];

export function WalletCard({
  faucet,
  setFaucet,
  setToShow,
  toShow,
}: WalletCardProps) {
  const [copied, setCopied] = useState(false);
  const [address, setAddress] = useState<string>("");
  const account = useMidenSdkStore((state) => state.account);
  useEffect(() => {
    if (account) {
      setAddress(account);
    }
  }, [account]);
  return (
    <div>
      <div className="w-full h-8 bg-primary flex items-center justify-center">
        <p className="text-white font-departureMono font-bold">
          MIDEN BROWSER WALLET
        </p>
      </div>
      <Card className="bg-card border-border ring-1 ring-primary/10 py-2 gap-0">
        <CardHeader className="border-b pb-0">
          <div className="flex justify-between items-center">
            <span
              className="font-mono cursor-pointer hover:text-primary relative transition-colors"
              onClick={async () => {
                await navigator.clipboard.writeText(address);
                setCopied(true);
                setTimeout(() => setCopied(false), 1200);
              }}
              title="Copy address"
            >
              {copied && (
                <span className="absolute left-1/2 -translate-x-1/2 -top-6 text-xs bg-popover border border-border px-2 py-0.5 z-10 text-popover-foreground">
                  Copied!
                </span>
              )}
              {`${address.slice(0, 8)}...${address.slice(-4)}`}
            </span>
            <div className="flex items-center gap-3">
              <WalletDropdown />
              <TickerDropdown
                selectedTicker={faucet}
                setSelectedTicker={setFaucet}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-0">
          {/* Balance */}
          <Balance faucet={faucet} />
          <div className="flex justify-between gap-2 py-4 border-t px-6">
            {ACTIONS(toShow).map((action) => (
              <ActionButton
                key={action.type}
                icon={action.icon}
                label={action.label}
                setToShow={setToShow}
                type={action.type}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  setToShow,
  type,
}: {
  icon: React.ReactNode;
  label: string;
  setToShow: (val: toShowType) => void;
  type: toShowType;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span onClick={() => setToShow(type)} className="cursor-pointer">
        {icon}
      </span>
      <span className="text-sm font-geist">{label}</span>
    </div>
  );
}
