import { Badge } from "@/components/ui/badge";
import { ArrowDownLeft, ArrowUpRight, Droplets } from "lucide-react";

export const renderTransactionTypeBadge = (txKind: string) => {
  switch (txKind) {
    case "send":
      return (
        <Badge className="bg-red-500/10 text-red-600 border-red-500/20 backdrop-blur-sm hover:bg-red-500/20 transition-all duration-200 pr-4 py-2 text-sm font-semibold">
          <ArrowUpRight className="w-4 h-4" />
          Send
        </Badge>
      );
    case "receive":
      return (
        <Badge className="bg-green-500/10 text-green-600 border-green-500/20 backdrop-blur-sm hover:bg-green-500/20 transition-all duration-200  pr-4 py-2 text-sm font-semibold">
          <ArrowDownLeft className="w-4 h-4" />
          Receive
        </Badge>
      );
    case "faucet_request":
      return (
        <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 backdrop-blur-sm hover:bg-blue-500/20 transition-all duration-200 pr-4 py-2 text-sm font-semibold">
          <Droplets className="w-4 h-4" />
          Faucet Request
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="backdrop-blur-sm px-4 py-2 text-sm font-semibold"
        >
          {txKind}
        </Badge>
      );
  }
};

export const formatTimestamp = (timestamp: string) => {
  const date = new Date(parseInt(timestamp) * 1000);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export const formatTxKind = (kind: string) => {
  switch (kind) {
    case "send":
      return "Send";
    case "receive":
      return "Receive";
    case "faucet_request":
      return "Faucet Request";
    default:
      return kind;
  }
};

export const truncateAddress = (
  address: string,
  startLength = 6,
  endLength = 4,
) => {
  if (address.length <= startLength + endLength) return address;
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};
