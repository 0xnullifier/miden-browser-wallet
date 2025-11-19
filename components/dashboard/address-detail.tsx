"use client";

import { useParams } from "next/navigation";
import { use, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BackendTransaction } from "@/lib/types";
import {
  formatTimestamp,
  renderTransactionTypeBadge,
  truncateAddress,
} from "./common";
import {
  GET_ADDRESS_TRANSACTIONS,
  GET_TRANSACTION_COUNT,
} from "@/lib/constants";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AddressComponent() {
  const { id } = useParams<{ id: string }>();
  const [paginatedTransactions, setPaginatedTransactions] = useState<
    Omit<BackendTransaction, "note_id">[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [svg, setSvg] = useState<string>("");
  const fetchAddressData = async (pageNum: number) => {
    const res = await axios.get(GET_ADDRESS_TRANSACTIONS(id, pageNum));
    const data = res.data;
    if (res.status !== 200) {
      throw new Error("Failed to fetch address transactions");
    }
    if (data.length === 0) {
      setEmpty(true);
      return;
    }
    setPaginatedTransactions(
      data.map((tx: any) => ({
        tx_id: tx.tx_id,
        sender: tx.sender,
        tx_kind: tx.tx_kind,
        timestamp: tx.timestamp,
        block_num: tx.block_num,
      })),
    );
  };

  const fetchTransactionCount = async () => {
    const res = await axios.get(GET_TRANSACTION_COUNT(id));
    const data = res.data;
    if (res.status !== 200) {
      throw new Error("Failed to fetch transaction count");
    }
    const totalCount = res.data;
    setTotalTransactions(totalCount);
    setTotalPages(Math.ceil(totalCount / 10));
  };

  useEffect(() => {
    // Generate SVG client-side only
    const generateSvg = async () => {
      if (typeof document !== "undefined") {
        const { toSvg } = await import("jdenticon");
        setSvg(toSvg(id, 60));
      }
    };
    generateSvg();

    (async () => {
      try {
        await fetchTransactionCount();
        await fetchAddressData(currentPage);
      } catch (error) {
        console.error("Error fetching address data:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  const handlePageForward = async () => {
    setLoading(true);
    setEmpty(false);
    try {
      await fetchAddressData(currentPage + 1);
      setCurrentPage(currentPage + 1);
    } catch (error) {
      console.error("Error fetching page data:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePageBackward = async () => {
    setLoading(true);
    setEmpty(false);
    try {
      await fetchAddressData(currentPage - 1);
      setCurrentPage(currentPage - 1);
    } catch (error) {
      console.error("Error fetching page data:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Error state
  if (error) {
    return (
      <div className="space-y-6 w-full max-w-6xl px-4">
        {/* Header Section */}
        <div className="border border-border rounded-lg p-6 bg-card">
          <div className="flex items-center gap-4">
            {/* SVG Avatar */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border" />
            </div>

            {/* Address and Stats */}
            <div className="flex-1 min-w-0">
              <div className="space-y-2">
                <div>
                  <div className="font-mono text-sm text-muted-foreground break-all">
                    {id}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      Total Transactions:
                    </span>
                    <span className="font-medium text-muted-foreground">—</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-base font-semibold text-primary">
          Recent Transactions
        </h2>
        <div className="border border-border rounded-lg p-8 text-center">
          <div className="space-y-3">
            <div className="text-lg font-medium text-destructive">
              Something went wrong
            </div>
            <div className="text-sm text-muted-foreground">
              There was an error loading the transactions. Please try again
              later or reach out for support.
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setError(false);
                setLoading(true);
                (async () => {
                  try {
                    await fetchTransactionCount();
                    await fetchAddressData(currentPage);
                  } catch (error) {
                    console.error("Error fetching address data:", error);
                    setError(true);
                  } finally {
                    setLoading(false);
                  }
                })();
              }}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (empty && !loading) {
    return (
      <div className="space-y-6 w-full max-w-6xl px-4">
        {/* Header Section */}
        <div className="border border-border rounded-lg p-6 bg-card">
          <div className="flex items-center gap-4">
            {/* SVG Avatar */}
            <div className="flex-shrink-0">
              <div
                className="w-16 h-16 rounded-full overflow-hidden border-2 border-border"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            </div>

            {/* Address and Stats */}
            <div className="flex-1 min-w-0">
              <div className="space-y-2">
                <div>
                  <h1 className="text-lg font-semibold text-foreground">
                    Wallet Address
                  </h1>
                  <div className="font-mono text-sm text-muted-foreground break-all">
                    {id}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      Total Transactions:
                    </span>
                    <span className="font-medium text-foreground">
                      {totalTransactions.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-base font-semibold text-primary">
          Recent Transactions
        </h2>
        <div className="border border-border rounded-lg p-8 text-center">
          <div className="space-y-3">
            <div className="text-lg font-medium">No transactions found</div>
            <div className="text-sm text-muted-foreground">
              This address doesn't have any transactions yet.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-6xl px-4">
      {/* Header Section */}
      <div className="border border-border rounded-lg p-4 bg-card">
        <div className="flex items-center gap-4">
          {/* SVG Avatar */}
          <div className="flex-shrink-0">
            <div
              className="w-16 h-16 rounded-full overflow-hidden border-2 border-border"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </div>

          {/* Address and Stats */}
          <div className="flex-1 min-w-0">
            <div className="space-y-2">
              <div>
                <div className="font-mono text-xl text-primary break-all">
                  {id}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    Total Transactions:
                  </span>
                  <span className="font-medium text-foreground">
                    {loading ? (
                      <Skeleton className="h-4 w-8 inline-block" />
                    ) : (
                      totalTransactions.toLocaleString()
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-base font-semibold text-primary">
        Recent Transactions
      </h2>
      <div className="border border-border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="text-center text-muted-foreground py-2">
                HASH
              </TableHead>
              <TableHead className="text-center text-muted-foreground py-2">
                TYPE
              </TableHead>
              <TableHead className="text-center text-muted-foreground py-2">
                BLOCK
              </TableHead>
              <TableHead className="text-center text-muted-foreground py-2">
                TIMESTAMP
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`} className="border-border">
                    <TableCell className="py-2">
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell className="py-2">
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell className="py-2">
                      <Skeleton className="h-4 w-12" />
                    </TableCell>
                    <TableCell className="py-2">
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                  </TableRow>
                ))
              : paginatedTransactions.map((transaction, index) => (
                  <TableRow key={index} className="border-border">
                    <TableCell
                      className="text-center font-mono text-sm text-primary hover:underline hover:underline-offset-2 cursor-pointer py-2"
                      onClick={() => {
                        if (typeof document !== "undefined") {
                          window.open(
                            `/dashboard/tx/${transaction.tx_id}`,
                            "_open",
                          );
                        }
                      }}
                    >
                      {truncateAddress(transaction.tx_id)}
                    </TableCell>
                    <TableCell className="text-center text-foreground py-2">
                      {renderTransactionTypeBadge(transaction.tx_kind)}
                    </TableCell>
                    <TableCell className="text-center text-sm text-foreground py-2">
                      {transaction.block_num}
                    </TableCell>
                    <TableCell className="text-center text-sm text-foreground py-2">
                      {formatTimestamp(transaction.timestamp)}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!loading && paginatedTransactions.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Showing page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6"
              onClick={handlePageBackward}
              disabled={currentPage === 1 || loading}
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <div className="flex items-center justify-center h-6 w-6 rounded-md bg-primary text-primary-foreground text-xs">
              {currentPage}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6"
              onClick={handlePageForward}
              disabled={currentPage === totalPages || loading}
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
