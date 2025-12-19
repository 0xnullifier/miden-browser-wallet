"use client";

import { useMidenSdkStore } from "@/providers/sdk-provider";
import { useEffect, useRef, useState } from "react";
import { useTransactionStore } from "@/providers/transaction-provider";
import { useBalanceStore } from "@/providers/balance-provider";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Droplets,
  Shield,
  Clock,
  XCircle,
  Scroll,
} from "lucide-react";
import { cn, numToString } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DECIMALS, NETWORK_ID, RPC_ENDPOINT } from "@/lib/constants";
import { UITransaction } from "@/store/transaction";
import { ScrollArea } from "@/components/ui/scroll-area";

function formatAmount(
  amount: bigint,
  decimals: number,
  symbol: string,
): string {
  const value = Number(amount) / 10 ** decimals;
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(0)}M`;
  } else if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(0)}k`;
  }
  return `${numToString(value)} ${symbol}`;
}

function getTransactionIcon(
  type: UITransaction["type"],
  status: UITransaction["status"],
) {
  if (status === "isPending") {
    return <Clock className="w-6 h-6 text-yellow-500" />;
  }
  if (status === "isFailed") {
    return <XCircle className="w-6 h-6 text-red-500" />;
  }

  switch (type) {
    case "Outgoing":
      return <ArrowUpRight className="w-6 h-6 text-red-500" />;
    case "Incoming":
      return <ArrowDownLeft className="w-6 h-6 text-green-500" />;
    case "Faucet":
      return <Droplets className="w-6 h-6 text-green-500" />;
    default:
      return <Shield className="w-6 h-6 text-purple-500" />;
  }
}

function getTransactionLabel(type: UITransaction["type"]): string {
  switch (type) {
    case "Outgoing":
      return "Sent";
    case "Incoming":
      return "Received";
    case "Faucet":
      return "Faucet Request";
    default:
      return type;
  }
}

function getAmountColor(
  type: UITransaction["type"],
  status: UITransaction["status"],
): string {
  if (status === "isFailed") return "text-red-500";
  if (status === "isPending") return "text-yellow-500";

  switch (type) {
    case "Outgoing":
      return "text-red-500";
    case "Incoming":
    case "Faucet":
      return "text-[#24D845]";
    default:
      return "text-[#24D845]";
  }
}

function TransactionItem({
  transaction,
  last,
}: {
  transaction: UITransaction;
  last?: boolean;
}) {
  const { type, amount, timestamp, blockNumber, status, id, address } =
    transaction;
  const faucetInfo = useBalanceStore((state) => state.faucets);
  const decimals =
    faucetInfo.find((faucet) => faucet.address === address)?.decimals ||
    DECIMALS;
  const symbol =
    faucetInfo.find((faucet) => faucet.address === address)?.symbol || "MDN";
  const isNegative = type === "Outgoing";
  const formattedAmount = formatAmount(amount, decimals, symbol);
  const displayAmount = isNegative
    ? `-${formattedAmount}`
    : `+${formattedAmount}`;
  return (
    <Card
      className={`cursor-pointer border-0 ${last ? "" : "border-b-[0.5px]"} border-border pt-4 pb-3 ${last ? "rounded-b-[10px]" : "rounded-none"}`}
      onClick={() => {
        window.open(`/dashboard/tx/${id}`, "_blank");
      }}
    >
      <CardContent className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="">{getTransactionIcon(type, status)}</div>
          <div className="">
            <div className="font-medium text-base">
              {getTransactionLabel(type)}
            </div>
            <div className="text-[#000000] font-normal text-[10px] opacity-50">
              #{blockNumber}
            </div>
          </div>
        </div>
        <div
          className={cn("font-medium text-base", getAmountColor(type, status))}
        >
          {displayAmount}
        </div>
      </CardContent>
    </Card>
  );
}

export function ActivityCardList() {
  const transactions = useTransactionStore((state) => state.transactions);
  const loadTransactions = useTransactionStore(
    (state) => state.loadTransactions,
  );
  const clientRef = useRef<any | null>(null);
  const account = useMidenSdkStore((state) => state.account);
  const blockNum = useMidenSdkStore((state) => state.blockNum);
  const [clientInitialized, setClientInitialized] = useState(false);
  const [dates, setDates] = useState<Set<string>>(new Set());
  const [dateToFilter, setDateToFilter] = useState<string>("");
  const [txToDisplay, setTxToDisplay] = useState<UITransaction[]>([]);

  useEffect(() => {
    const initClient = async () => {
      const { WebClient } = await import("@demox-labs/miden-sdk");
      const clientInstance = await WebClient.createClient(RPC_ENDPOINT);
      clientInstance.terminate();
      clientRef.current = clientInstance;
      setClientInitialized(true);
    };
    initClient();

    return () => {
      if (clientRef.current) {
        clientRef.current.terminate();
        clientRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const uniqueDates = new Set<string>();
    transactions.forEach((tx) => {
      uniqueDates.add(tx.timestamp);
    });
    // Limit to 5 most recent dates
    const limitedDates = Array.from(uniqueDates).slice(0, 5);
    setDates(new Set(limitedDates));
  }, [transactions]);

  useEffect(() => {
    if (dateToFilter === "") {
      setTxToDisplay(transactions);
    } else {
      const filtered = transactions.filter(
        (tx) => tx.timestamp === dateToFilter,
      );
      setTxToDisplay(filtered);
    }
  }, [dateToFilter, transactions]);

  useEffect(() => {
    if (!account) return;
    if (!clientRef.current) {
      console.warn("Client not initialized yet, waiting for initialization...");
      return;
    }

    const fetchTransactions = async () => {
      try {
        const { TransactionFilter, NoteFilter, NoteFilterTypes, WebClient } =
          await import("@demox-labs/miden-sdk");
        if (clientRef.current instanceof WebClient) {
          const allTransactions = await clientRef.current.getTransactions(
            TransactionFilter.all(),
          );
          const Nid = await NETWORK_ID();
          const transactionRecords = allTransactions.filter(
            (tx) => tx.accountId().toBech32(Nid, 0) === account,
          );
          const inputNotes = await clientRef.current.getInputNotes(
            new NoteFilter(NoteFilterTypes.All),
          );
          const zippedInputeNotesAndTr = transactionRecords.map((tr) => {
            if (tr.outputNotes().notes().length > 0) {
              return { tr, inputNotes: undefined };
            } else {
              const inputNotesForTr = inputNotes.filter(
                (note) => note.consumerTransactionId() === tr.id().toHex(),
              );
              return { tr, inputNotes: inputNotesForTr };
            }
          });
          await loadTransactions(zippedInputeNotesAndTr);
        } else {
          console.error("wrong client");
        }
      } catch (error) {
        console.error("Error loading transactions:", error);
      }
    };

    fetchTransactions();
  }, [clientInitialized, account, blockNum]);

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 bg-muted/50 flex items-center justify-center mb-4">
          <Clock className="w-6 h-6 text-muted-foreground/60" />
        </div>
        <p className="text-muted-foreground/80 text-sm">No transactions yet</p>
        <p className="text-muted-foreground/60 text-xs mt-1">
          Your activity will appear here
        </p>
      </div>
    );
  }
  return (
    <Card className="rounded-[10px] py-0 border-border gap-0 ">
      <CardHeader className="bg-[#F9F9F9] rounded-t-[10px] py-[10px] border-b-[0.5px] flex items-center justify-center">
        <div className="text-center text-base font-medium">Recent Activity</div>
      </CardHeader>
      <CardContent className="pt-0 px-0">
        <div className="flex items-center gap-2 border-border border-b-[0.5px] h-[34px] px-[26px]">
          {Array.from(dates).map((val) => (
            <button
              key={val}
              className={
                "text-center bg-[#F9F9F9] px-2 py-1 text-[10px] border-border border-[0.5px] rounded-[3px] min-w-[34px] h-[17px] flex items-center font-medium " +
                (dateToFilter === val
                  ? "bg-primary text-primary-foreground border-primary"
                  : " border-neutral-400 dark:border-muted")
              }
              onClick={() => setDateToFilter(dateToFilter === val ? "" : val)}
            >
              {val}
            </button>
          ))}
        </div>
        <ScrollArea
          className="rounded-b-[10px]"
          style={{
            height: `${txToDisplay.length >= 3 ? 67.5 * 3 : 67.5 * txToDisplay.length}px`,
          }}
        >
          <div>
            {txToDisplay.map((transaction, index) => (
              <TransactionItem
                key={index}
                transaction={transaction}
                last={index == txToDisplay.length - 1}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
