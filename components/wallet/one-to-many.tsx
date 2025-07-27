"use client"

import { RefObject, useEffect, useState } from "react"
import { AlertCircle, Loader2, Plus, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DistributionRow {
    id: string
    address: string
    amount: string
}

interface OneToManyProps {
    isOneToMany: boolean
    setIsOneToMany: (open: boolean) => void,
    amount: string
    receipient: string
}

export function OneToMany({ isOneToMany, setIsOneToMany, amount, receipient }: OneToManyProps) {
    const [rows, setRows] = useState<DistributionRow[]>([])
    console.log("Initial rows:", rows)
    const [loading, setLoading] = useState(false)
    const [amountForEqualDist, setAmountForEqualDist] = useState("")
    const [bulkInput, setBulkInput] = useState("")
    const [bulkError, setBulkError] = useState<string | null>(null)
    const [mode, setMode] = useState<"table" | "bulk">("table")
    const account = useMidenSdkStore((state) => state.account)
    useEffect(() => {
        if (receipient && amount) {
            const initialRow: DistributionRow = {
                id: Date.now().toString(),
                address: receipient,
                amount: amount,
            }
            setRows([initialRow])
        } else {
            setRows([])
        }
    }, [receipient, amount])


    const addRow = () => {
        const newRow: DistributionRow = {
            id: Date.now().toString(),
            address: "",
            amount: "",
        }
        setRows([...rows, newRow])
    }

    const removeRow = (id: string) => {
        if (rows.length > 1) {
            setRows(rows.filter((row) => row.id !== id))
        }
    }

    const updateRow = (id: string, field: keyof DistributionRow, value: string) => {
        setRows(rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)))
    }

    const equalDistribution = () => {
        const totalAmount = parseFloat(amountForEqualDist)
        if (totalAmount > 0 && rows.length > 0) {
            const equalAmount = (totalAmount / rows.length).toFixed(2)
            setRows(rows.map((row) => ({ ...row, amount: equalAmount })))
        }
    }

    const handleSubmit = async () => {
        if (!account) return;
        setLoading(true)
        try {
            const txResult = await sendToMany(account, rows.map(row => ({ to: row.address, amount: BigInt(Math.trunc(parseFloat(row.amount))) })))
            console.log("Transaction Result:", txResult)
            toast.success("Payment sent successfully!", { position: "top-right" })
        } catch (error) {
            console.error("Error sending payment:", error)
        } finally {
            setLoading(false)
            setIsOneToMany(false)
        }
    }

    const parseBulkInput = () => {
        setBulkError("")

        if (!bulkInput.trim()) {
            setBulkError("Please enter some data")
            return
        }

        try {
            const lines = bulkInput.trim().split("\n")
            const newRows: DistributionRow[] = []

            lines.forEach((line, index) => {
                const trimmedLine = line.trim()
                if (!trimmedLine) return // Skip empty lines

                const parts = trimmedLine.split(",").map((part) => part.trim())

                if (parts.length !== 2) {
                    throw new Error(`Line ${index + 1}: Expected format "address,amount"`)
                }

                const [address, amountStr] = parts

                if (!address) {
                    throw new Error(`Line ${index + 1}: Address cannot be empty`)
                }

                const amount = Number.parseFloat(amountStr)
                if (isNaN(amount) || amount < 0) {
                    throw new Error(`Line ${index + 1}: Amount must be a valid positive number`)
                }

                newRows.push({
                    id: `bulk-${Date.now()}-${index}`,
                    address,
                    amount: amount.toString(),
                })
            })

            if (newRows.length === 0) {
                setBulkError("No valid rows found")
                return
            }

            setRows(newRows)
            setMode("table")
            setBulkInput("")
        } catch (error) {
            setBulkError(error instanceof Error ? error.message : "Invalid format")
        }
    }

    const isTableMode = mode === "table"
    return (
        <Dialog open={isOneToMany} onOpenChange={setIsOneToMany}>
            <DialogContent className="sm:max-w-[600px] max-h-[550px] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between pt-3">
                        <p className="mb-0">Send One to Many Payment</p>
                        <DropdownMenuForMode mode={mode} setMode={setMode} />
                    </DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                {isTableMode ? (
                    <div className="space-y-4 pb-4">
                        {/* Equal Distribution Button */}
                        <div className="flex justify-between">
                            <Input
                                type="text"
                                pattern="^\d+(\.\d{1,2})?$"
                                placeholder="Total Amount for Equal Distribution"
                                value={amountForEqualDist}
                                onChange={(e) => setAmountForEqualDist(e.target.value)}
                                className="max-w-40"
                                step="0.01"
                                min="0"
                            />
                            <Button onClick={equalDistribution} >
                                Equal Distribution
                            </Button>
                        </div>

                        {/* Header Row */}
                        <div className="grid grid-cols-12 gap-2 items-center font-medium text-sm text-muted-foreground">
                            <div className="col-span-5">
                                <Label>Address</Label>
                            </div>
                            <div className="col-span-5">
                                <Label>Amount</Label>
                            </div>
                        </div>

                        {/* Input Rows */}
                        <div className="space-y-3">
                            {rows.map((row, index) => (
                                <div key={row.id} className="grid grid-cols-12 gap-2 items-center">
                                    <div className="col-span-6">
                                        <Input
                                            placeholder={`Address ${index + 1}`}
                                            value={row.address}
                                            onChange={(e) => updateRow(row.id, "address", e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-5">
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            value={row.amount}
                                            onChange={(e) => updateRow(row.id, "amount", e.target.value)}
                                            step="0.01"
                                            min="0"
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
                        <Button variant="outline" onClick={addRow} className="w-full flex items-center gap-2 bg-transparent">
                            <Plus className="h-4 w-4" />
                            Add Row
                        </Button>

                        {/* Summary */}
                        <div className="pt-4 border-t">
                            <div className="flex justify-between items-center text-sm mt-1">
                                <span className="text-muted-foreground">Total Amount:</span>
                                <span className="font-medium">
                                    {rows.reduce((sum, row) => sum + (Number.parseFloat(row.amount) || 0), 0).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="space-y-3">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <Label htmlFor="bulk-input">Bulk Input (CSV Format)</Label>
                                    <Button size="sm"><Upload className="w-3 h-3" /></Button>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Enter one row per line in the format: address,amount
                                </p>

                            </div>

                            <Textarea
                                id="bulk-input"
                                placeholder={`0x1234567890abcdef1234567890abcdef12345678,100.50
0x9876543210fedcba9876543210fedcba98765432,250.75
0xabcdefabcdefabcdefabcdefabcdefabcdefabcd,75.25`}
                                value={bulkInput}
                                onChange={(e) => setBulkInput(e.target.value)}
                                className="min-h-[200px] font-mono text-sm"
                            />

                            {bulkError && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{bulkError}</AlertDescription>
                                </Alert>
                            )}

                            <div className="flex gap-2">
                                <Button onClick={parseBulkInput} className="flex items-center gap-2">
                                    Parse
                                </Button>
                                <Button variant="outline" onClick={() => setBulkInput("")} disabled={!bulkInput}>
                                    Clear
                                </Button>
                            </div>
                        </div>

                    </div>
                )
                }
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOneToMany(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={rows.length === 0 || loading}>
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
    )
}


import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown"
import { Textarea } from "../ui/textarea"
import { Alert, AlertDescription } from "../ui/alert"
import { sendToMany } from "@/lib/actions"
import { useMidenSdkStore } from "@/providers/sdk-provider"
import { toast } from "sonner"

export function DropdownMenuForMode({ mode, setMode }: { mode: "table" | "bulk", setMode: (mode: "table" | "bulk") => void }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">{mode.toUpperCase()}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuRadioGroup value={mode} onValueChange={setMode}>
                    <DropdownMenuRadioItem value="table">Table</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="bulk">Bulk</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
