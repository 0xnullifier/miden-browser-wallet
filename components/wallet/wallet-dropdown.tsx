import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown"
import { MIDEN_WEB_WALLET_LOCAL_STORAGE_KEY, RPC_ENDPOINT } from "@/lib/constants"
import { useMidenSdkStore } from "@/providers/sdk-provider"
import { AlertCircleIcon, Copy, CopyCheck, Delete, Import, Loader2, MoreHorizontal, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { LoadingSpinner } from "../ui/loading-spinner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { DialogClose } from "@radix-ui/react-dialog"
import { Textarea } from "../ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"

export function WalletDropdown() {
    const account = useMidenSdkStore((state) => state.account)
    const setAccount = useMidenSdkStore((state) => state.setAccount)
    const [loading, setLoading] = useState(false)
    const [importLoading, setImportLoading] = useState(false)
    const [importDialogOpen, setImportDialogOpen] = useState(false)
    const [importAccountStr, setImportAccountStr] = useState("")

    // copy the private key to clipboard
    const handleExportAccount = async () => {
        setLoading(true)
        if (!account) {
            console.error("No account found to export private key")
            return
        }
        const { WebClient, AccountId } = await import("@demox-labs/miden-sdk");
        const client = await WebClient.createClient(RPC_ENDPOINT);
        try {

            const fullAccount = await client.getAccount(AccountId.fromBech32(account));
            if (!fullAccount) {
                console.error("Account not found");
                setLoading(false);
                return;
            }
            // 500 kb yikes
            // const bytes = await client.exportStore()
            const fullAccountStr = btoa(String.fromCharCode(...fullAccount.serialize()))
            await navigator.clipboard.writeText(fullAccountStr);
            toast.success("Account exported to clipboard!", { position: "top-right" })
        } catch (error) {
            console.error("Failed to export account:", error);
            toast.error("Failed to export account.", { position: "top-right" });
        } finally {
            setLoading(false);
            client.terminate();
        }
    }

    const handleImportAccount = async () => {
        setImportDialogOpen(true)
    }

    const importAccount = async () => {
        if (!importAccountStr) return;
        setImportLoading(true)
        try {
            const { WebClient, AccountId, Account } = await import("@demox-labs/miden-sdk");
            const client = await WebClient.createClient(RPC_ENDPOINT);
            const accountBytes = Uint8Array.from(atob(importAccountStr), c => c.charCodeAt(0));
            client.importAccount(accountBytes)
            const account = Account.deserialize(accountBytes);
            if (!account) {
                toast.error("Failed to import account. Please check the format and try again.", { position: "top-right" })
                return;
            }
            setAccount(account.id().toBech32());
            localStorage.setItem(MIDEN_WEB_WALLET_LOCAL_STORAGE_KEY, account.serialize().toString());
            // reload page
            window.location.reload();
        } catch (error) {
            console.error("Failed to import account:", error);
            toast.error("Failed to import account. Please check the format and try again.", { position: "top-right" })
        } finally {
            setImportDialogOpen(false)
            setImportLoading(false)
        }
    }

    return (
        loading ? (
            <LoadingSpinner />
        ) : (
            <>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4 rotate-90" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" side="bottom">
                        <DropdownMenuItem onClick={handleExportAccount}>
                            <Copy className="mr-2 h-4 w-4" /> Export Account
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleImportAccount}>
                            <Import className="mr-2 h-4 w-4" /> Import Account
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-400">
                            <Trash2 className="mr-2 h-4 w-4" color="#ef4444" />
                            Burn Wallet
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Import Account</DialogTitle>
                            <DialogDescription>
                                <Alert variant="destructive" className="py-2">
                                    <AlertCircleIcon />
                                    <AlertDescription className="text-destructive">
                                        This will delete your current account
                                    </AlertDescription>
                                </Alert>

                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center gap-2">
                            <Textarea value={importAccountStr} onChange={(e) => setImportAccountStr(e.target.value)} />
                        </div>
                        <DialogFooter className="sm:justify-start">
                            <DialogClose asChild >
                                <div className="flex w-full items-center justify-between">
                                    <Button type="button" variant="secondary">
                                        Close
                                    </Button>
                                    <Button onClick={importAccount} disabled={importAccountStr === "" || importLoading}>{importLoading && <Loader2 className="animate-spin" />} Import</Button>
                                </div>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </>
        )
    )
}
