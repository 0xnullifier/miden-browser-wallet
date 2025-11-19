"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TickerDropdown } from "./ticker-dropdown";
import { FaucetInfo } from "@/store/balance";
import { useMidenSdkStore } from "@/providers/sdk-provider";
import { sendToMany } from "@/lib/actions";
import { sucessTxToast } from "../success-tsx-toast";
import { useBalanceStore } from "@/providers/balance-provider";
import { toast } from "sonner";

interface DistributionRow {
  id: string;
  address: string;
  amount: string;
  faucetId: FaucetInfo;
}

interface OneToManyProps {
  isOneToMany: boolean;
  setIsOneToMany: (open: boolean) => void;
  amount: string;
  receipient: string;
  selectedFaucetId: FaucetInfo;
}

export function OneToMany({
  isOneToMany,
  setIsOneToMany,
  amount,
  receipient,
  selectedFaucetId,
}: OneToManyProps) {
  const [rows, setRows] = useState<DistributionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const account = useMidenSdkStore((state) => state.account);
  const balances = useBalanceStore((state) => state.balances);

  useEffect(() => {
    if (receipient && amount) {
      const initialRow: DistributionRow = {
        id: Date.now().toString(),
        address: receipient,
        amount: amount,
        faucetId: selectedFaucetId,
      };
      setRows([initialRow]);
    } else {
      setRows([]);
    }
  }, [receipient, amount]);

  const addRow = () => {
    const newRow: DistributionRow = {
      id: (rows.length + 1).toString(),
      address: "",
      amount: "",
      faucetId: selectedFaucetId,
    };
    setRows([...rows, newRow]);
  };

  const removeRow = (id: string) => {
    if (rows.length > 1) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const updateRow = (
    id: string,
    field: keyof DistributionRow,
    value: string,
  ) => {
    setRows(
      rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };
  const setSelectedFaucetForRow = (id: string) => {
    return (faucetId: FaucetInfo) =>
      setRows(rows.map((row) => (row.id === id ? { ...row, faucetId } : row)));
  };

  const validateRow = (row: DistributionRow) => {
    if (parseFloat(row.amount) > balances[row.faucetId.address]) {
      toast.error(
        `Insufficient balance for ${row.faucetId.symbol} in row ${row.id}`,
        {
          position: "top-right",
        },
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!account) return;
    setLoading(true);
    try {
      const validRows = rows
        .map((row) => validateRow(row))
        .reduce((prev, curr) => prev && curr, true);
      if (!validRows) {
        setLoading(false);
        return;
      }
      const txId = await sendToMany(
        account,
        rows.map((row) => ({
          to: row.address,
          amount: parseFloat(row.amount),
          faucet: row.faucetId,
        })),
      );
      sucessTxToast("One to many payment sent successfully 🚀", txId);
    } catch (error) {
      console.error("Error sending payment:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOneToMany} onOpenChange={setIsOneToMany}>
      <DialogContent className="max-h-[550px] overflow-y-auto px-3">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pt-3">
            <p className="mb-0 text-sm">Send One to Many Payment</p>
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pb-4">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-2 items-center font-medium text-sm text-muted-foreground">
            <div className="col-span-5">
              <Label>Address</Label>
            </div>
            <div className="col-span-3">
              <Label>Amount</Label>
            </div>
            <div className="col-span-2">
              <Label>Faucet</Label>
            </div>
            <div className="col-span-1">
              <span>Actions</span>
            </div>
          </div>

          {/* Input Rows */}
          <div className="space-y-3">
            {rows.map((row, index) => (
              <div
                key={row.id}
                className="grid grid-cols-12 gap-2 items-center"
              >
                <div className="col-span-5">
                  <Input
                    placeholder={`Address ${index + 1}`}
                    value={row.address}
                    onChange={(e) =>
                      updateRow(row.id, "address", e.target.value)
                    }
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={row.amount}
                    onChange={(e) =>
                      updateRow(row.id, "amount", e.target.value)
                    }
                    step="0.01"
                    min="0"
                  />
                </div>
                <div className="col-span-2">
                  <TickerDropdown
                    selectedTicker={row.faucetId}
                    setSelectedTicker={setSelectedFaucetForRow(row.id)}
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRow(row.id)}
                    disabled={rows.length === 1}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove row</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Row Button */}
          <Button
            variant="outline"
            onClick={addRow}
            className="w-full flex items-center gap-2 bg-transparent"
          >
            <Plus className="h-4 w-4" />
            Add Row
          </Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOneToMany(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rows.length === 0 || loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>Send Payment</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
