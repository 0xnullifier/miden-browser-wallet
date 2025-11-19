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
} from "lucide-react";
import { cn, numToString } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DECIMALS, NETWORK_ID, RPC_ENDPOINT } from "@/lib/constants";
import { UITransaction } from "@/store/transaction";

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
    return <Clock className="w-5 h-5 text-yellow-500" />;
  }
  if (status === "isFailed") {
    return <XCircle className="w-5 h-5 text-red-500" />;
  }

  switch (type) {
    case "Outgoing":
      return <ArrowUpRight className="w-5 h-5 text-red-500" />;
    case "Incoming":
      return <ArrowDownLeft className="w-5 h-5 text-green-500" />;
    case "Faucet":
      return <Droplets className="w-5 h-5 text-green-500" />;
    default:
      return <Shield className="w-5 h-5 text-purple-500" />;
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
      return "text-green-500";
    default:
      return "text-green-500";
  }
}

function TransactionItem({ transaction }: { transaction: UITransaction }) {
  const { type, amount, timestamp, status, id, address } = transaction;
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
      className="hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={() => {
        window.open(`/dashboard/tx/${id}`, "_blank");
      }}
    >
      <CardContent className="flex items-center gap-4">
        <div className="flex-shrink-0">{getTransactionIcon(type, status)}</div>

        <div className="flex-1 min-w-0">
          <div className="text-foreground font-medium">
            {getTransactionLabel(type)}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono opacity-70">
            # {timestamp}
          </div>
        </div>

        <div className={cn("font-light", getAmountColor(type, status))}>
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
    <ScrollArea className="h-[298px]">
      <div className="space-y-3">
        {transactions.map((transaction, index) => (
          <TransactionItem key={index} transaction={transaction} />
        ))}
      </div>
    </ScrollArea>
  );
}
