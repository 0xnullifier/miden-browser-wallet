"use client";

import {
  Search,
  Activity,
  Clock,
  Users,
  FileText,
  Droplets,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { ChartLineInteractive } from "@/components/dashboard/line-chart";
import { Badge } from "../ui/badge";
import { useTheme } from "@/components/ui/theme-provider";
import axios from "axios";
import {
  GET_TRANSACTION,
  LATEST_TRANSACTIONS_API,
  STATS_API,
} from "@/lib/constants";
import { BackendTransaction } from "@/lib/types";
import Link from "next/link";

export function Dashboard() {
  const [transactions, setTransactions] = useState<BackendTransaction[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [stats, setStats] = useState<{
    totalTransactions: string;
    transactionsLastHour: string;
    accountsCreated: string;
    notesCreated: string;
    faucetRequests: string;
  }>({
    totalTransactions: "0",
    transactionsLastHour: "0",
    accountsCreated: "0",
    notesCreated: "0",
    faucetRequests: "0",
  });

  const callStasApi = async () => {
    const res = await axios.get(STATS_API);
    if (res.status === 200) {
      const data = res.data;
      setStats({
        totalTransactions: data.total_transactions,
        transactionsLastHour: data.transactions_in_last_hour,
        accountsCreated: data.wallets_created,
        notesCreated: data.notes_created,
        faucetRequests: data.faucet_request,
      });
    } else {
      console.error("Failed to fetch stats");
    }
  };

  const fetchLatestTransactions = async () => {
    const res = await axios.get(LATEST_TRANSACTIONS_API);
    if (res.status === 200) {
      const transactionsData = res.data.map((tx) => ({
        tx_id: tx.tx_id,
        tx_kind: tx.tx_kind,
        sender: tx.sender,
        timestamp: tx.timestamp,
        block_num: tx.block_num,
        note_id: tx.note_id
          ? {
              note_id: tx.note_id.note_id,
              note_type: tx.note_id.note_type,
              note_aux: tx.note_id.note_aux,
            }
          : null,
      }));
      setTransactions(transactionsData);
    } else {
      console.error("Failed to fetch latest transactions");
    }
  };

  useEffect(() => {
    callStasApi();
    const interval = setInterval(callStasApi, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchLatestTransactions();
    const interval = setInterval(fetchLatestTransactions, 30000); // Refresh 20s
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setIsSearching(value.length > 0);
  };

  function formatAmount(amount: number): string {
    if (Math.abs(amount) >= 1000000) {
      return `$${(amount / 1000000).toFixed(0)}M`;
    } else if (Math.abs(amount) >= 1000) {
      return `$${(amount / 1000).toFixed(0)}k`;
    }
    return `${amount}`;
  }

  return (
    <div className="w-full px-4 md:px-8 max-w-6xl mx-auto">
      <div className="bg-background">
        <SearchBar
          value={searchValue}
          onChange={handleSearch}
          isSearching={isSearching}
        />

        {/* Stats - Mobile: 2 columns, Desktop: 5 columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
          <StatsCard
            icon={Activity}
            title="Total Transactions"
            value={stats.totalTransactions}
            color="blue"
          />
          <StatsCard
            icon={Clock}
            title="Transactions (1h)"
            value={stats.transactionsLastHour}
            color="green"
          />
          <StatsCard
            icon={Users}
            title="Accounts Created"
            value={stats.accountsCreated}
            color="purple"
            className="hidden md:block"
          />
          <StatsCard
            icon={FileText}
            title="Notes Created"
            value={stats.notesCreated}
            color="orange"
            className="hidden md:block"
          />
          <StatsCard
            icon={Droplets}
            title="Faucet Requests"
            value={stats.faucetRequests}
            color="cyan"
            className="hidden md:block"
          />
        </div>
      </div>

      {/* Mobile Layout: Chart on top, Transactions on bottom */}
      <div className="block md:hidden pt-6 space-y-6">
        {/* Chart */}
        <div className="space-y-3">
          <h3 className="text-sm text-muted-foreground">
            TRANSACTION ANALYTICS
          </h3>
          <ChartLineInteractive />
        </div>

        {/* Transactions */}
        <div>
          <TransactionList transactions={transactions} isMobile={true} />
        </div>
      </div>

      {/* Desktop Layout: Side by side */}
      <div className="hidden md:grid grid-cols-5 gap-8 pt-8">
        {/* Chart */}
        <div className="col-span-3 space-y-3">
          <h3 className="text-muted-foreground text-sm">
            TRANSACTION ANALYTICS
          </h3>
          <ChartLineInteractive />
        </div>

        <div className="col-span-2">
          <TransactionList transactions={transactions} isMobile={false} />
        </div>
      </div>
    </div>
  );
}

function StatsCard({
  icon: Icon,
  title,
  value,
  color,
  className = "",
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  color: string;
  className?: string;
}) {
  const theme = useTheme();
  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue":
        return "text-blue-600 bg-white dark:text-blue-400 dark:bg-blue-950/30";
      case "green":
        return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/30";
      case "purple":
        return "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/30";
      case "orange":
        return "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/30";
      case "cyan":
        return "text-cyan-600 bg-cyan-50 dark:text-cyan-400 dark:bg-cyan-950/30";
      default:
        return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950/30";
    }
  };

  return (
    <div
      className={`p-3 rounded-lg border border-border/40 bg-card/30 hover:bg-card/50 transition-colors ${className}`}
    >
      <div className="flex items-center space-x-2 mb-2">
        <div className={`p-1.5 rounded-md ${getColorClasses(color)}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="text-xs text-muted-foreground">{title}</div>
      </div>
      <div className="text-lg font-semibold text-foreground">{value}</div>
    </div>
  );
}
function SearchBar({
  value,
  onChange,
  isSearching,
}: {
  value: string;
  onChange: (value: string) => void;
  isSearching: boolean;
}) {
  const [isFocused, setIsFocused] = useState(false);

  const handleSearchRedirect = () => {
    if (value.startsWith("0x") || value.startsWith("mtst")) {
      window.open(`/dashboard/address/${value}`, "_blank");
      return;
    }
    window.open(`/dashboard/tx/${value}`, "_blank");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && value.trim()) {
      handleSearchRedirect();
    }
  };

  return (
    <div className="pb-8 w-full space-y-6">
      {/* Search */}
      <motion.div
        className="relative"
        animate={{
          scale: isSearching && isFocused ? 1.02 : 1,
          y: isSearching && isFocused ? -2 : 0,
        }}
        transition={{ duration: 0.2 }}
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Search by Tx Hash, address"
          className="pl-10 bg-muted/30 border border-border border-solid transition-all duration-200 focus:bg-muted/50 focus:border-primary/40"
        />

        <AnimatePresence>
          {isSearching && isFocused && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full mt-2 w-full bg-card border border-border border-solid rounded-lg shadow-lg z-50 p-4"
            >
              <div className="text-sm text-muted-foreground">
                Search for:{" "}
                <span
                  className="text-primary font-mono cursor-pointer hover:text-primary/80 hover:bg-primary/10 px-2 py-1 rounded-md transition-all duration-200 hover:scale-105"
                  onClick={handleSearchRedirect}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchRedirect()}
                  tabIndex={0}
                  role="button"
                  aria-label={`Search for ${value}`}
                >
                  {value}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function TransactionList({
  transactions,
  isMobile = false,
}: {
  transactions: BackendTransaction[];
  isMobile?: boolean;
}) {
  const formatTxKind = (txKind: "send" | "receive" | "faucet_request") => {
    switch (txKind) {
      case "send":
        return (
          <Badge className="rounded-3xl bg-red-500/10 text-red-600 border-red-500/20 backdrop-blur-sm hover:bg-red-500/20 transition-all duration-200 shadow-sm text-xs">
            <ArrowUpRight className="w-2.5 h-2.5" />
            Send
          </Badge>
        );
      case "receive":
        return (
          <Badge className="rounded-3xl bg-green-500/10 text-green-600 border-green-500/20 backdrop-blur-sm hover:bg-green-500/20 transition-all duration-200 shadow-sm text-xs">
            <ArrowDownLeft className="w-2.5 h-2.5" />
            Receive
          </Badge>
        );
      case "faucet_request":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 backdrop-blur-sm hover:bg-blue-500/20 transition-all duration-200 shadow-sm text-xs">
            <Droplets className="w-2.5 h-2.5" />
            Faucet
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="backdrop-blur-sm text-xs">
            Unknown
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm text-muted-foreground">LATEST TRANSACTIONS</h3>
      <div className="border border-border rounded-lg overflow-hidden">
        <ScrollArea className={`h-[348px] w-full bg-card/50`}>
          <AnimatePresence mode="popLayout">
            {transactions.map((tx, i) => (
              <motion.div
                key={tx.tx_id}
                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.95 }}
                transition={{
                  duration: 0.3,
                  delay: i * 0.05,
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
                layout
              >
                <div
                  className="flex p-3 justify-between hover:bg-muted/20 transition-colors cursor-pointer border-b border-border/90"
                  onClick={() =>
                    window.open(`/dashboard/tx/${tx.tx_id}`, "_blank")
                  }
                >
                  <div className="flex flex-col space-y-2">
                    <div className="text-primary text-sm">{`${tx.tx_id.slice(0, 8)}...${tx.tx_id.slice(-8)}`}</div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {new Date(
                          Number(tx.timestamp) * 1000,
                        ).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <div className="h-3 mt-3">{formatTxKind(tx.tx_kind)}</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </ScrollArea>
      </div>
    </div>
  );
}
