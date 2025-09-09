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
import { AlertCircleIcon, Copy, CopyCheck, Delete, Download, Import, Loader2, MoreHorizontal, Settings, Trash2, Upload } from "lucide-react"
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
import { Input } from "../ui/input"

export function WalletDropdown() {
    const account = useMidenSdkStore((state) => state.account)
    const [loading, setLoading] = useState(false)
    const [importLoading, setImportLoading] = useState(false)
    const [importDialogOpen, setImportDialogOpen] = useState(false)
    const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
    const [importStr, setImportStr] = useState("")

    const handleExportAccount = async () => {
        setLoading(true)
        if (!account) {
            console.error("No account found to export private key")
            return
        }
        const { WebClient, AccountId } = await import("@demox-labs/miden-sdk");
        const client = await WebClient.createClient(RPC_ENDPOINT);

        try {
            // returns a array of bytes
            const exportAccount = await client.exportAccountFile(AccountId.fromBech32(account));
            console.log({ exportAccount });
            const base64String = btoa(String.fromCharCode(...exportAccount));
            const fullString = `${base64String}:${account}`;
            await navigator.clipboard.writeText(fullString);
            toast.success("Account exported and copied to clipboard!", { position: "top-right" });
        } catch (error) {
            toast.error("Failed to export account.", { position: "top-right" });
        } finally {
            setLoading(false);
            client.terminate();
        }

    }

    const handleBurnWallet = async () => {
        if (!account) {
            console.error("No account found to burn wallet")
            return
        }
        try {
            indexedDB.deleteDatabase("MidenClientDB")
            localStorage.removeItem(MIDEN_WEB_WALLET_LOCAL_STORAGE_KEY)
            window.location.reload()
        } catch (error) {
            console.error("Failed to burn wallet:", error)
            toast.error("Failed please try again later")
        }
    }

    const importAccount = async () => {
        const { WebClient, AccountId } = await import("@demox-labs/miden-sdk");
        const client = await WebClient.createClient(RPC_ENDPOINT);
        setImportLoading(true)
        if (!importStr || importStr.length === 0) {
            toast.error("Please enter a valid account string", { position: "top-right" });
            setImportLoading(false)
            return
        }

        try {

            indexedDB.deleteDatabase("MidenClientDB")
            const b64AccountString = importStr.split(":")[0];
            const newAccountId = importStr.split(":")[1];
            console.log({ b64AccountString, newAccountId })
            const byteArray = Uint8Array.from(atob(b64AccountString), c => c.charCodeAt(0));
            console.log({ byteArray })
            await client.importAccountFile(byteArray);
            const account = await client.getAccount(AccountId.fromBech32(newAccountId));
            if (!account) {
                throw new Error("Imported account not found after import");
            }
            localStorage.setItem(MIDEN_WEB_WALLET_LOCAL_STORAGE_KEY, account.serialize().toString());
            toast.success("Account imported successfully!", { position: "top-right" });
            window.location.reload()
        } catch (error) {
            console.error("Failed to import account:", error);
            toast.error("Failed to import account. Please ensure the string is correct.", { position: "top-right" });
        } finally {
            setImportLoading(false);
            client.terminate();
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
                        <DropdownMenuItem onClick={() => setSettingsDialogOpen(true)}>
                            <Settings className="mr-2 h-4 w-4" /> Wallet Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExportAccount}>
                            <Download className="mr-2 h-4 w-4" /> Export Account
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setImportDialogOpen(true)}>
                            <Upload className="mr-3 h-4 w-4" /> Import Account
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900"
                            onClick={handleBurnWallet}
                        >
                            <Trash2 className="mr-2 h-4 w-4" color="#ef4444" />
                            Burn Wallet
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Import Account</DialogTitle>
                        </DialogHeader>
                        <DialogContent className="p-2">
                            <Textarea
                                value={importStr}
                                onChange={(e) => setImportStr(e.target.value)}
                                placeholder="Paste your account string here"
                                rows={6}
                            />
                            <Button
                                disabled={importLoading}
                                onClick={importAccount}
                                className="mx-auto w-32"
                            >Import Account</Button>
                        </DialogContent>
                    </DialogContent>
                </Dialog>

                <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Wallet Settings</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col gap-4">
                            {/* <label htmlFor="prover-url" className="text-sm font-medium">
                                Transaction Prover URL
                            </label>
                            <input
                                id="prover-url"
                                type="text"
                                className="border px-3 py-2 text-sm"
                                value={localStorage.getItem("transactionProverUrl") || ""}
                                onChange={e => {
                                    localStorage.setItem("transactionProverUrl", e.target.value)
                                }}
                                placeholder="Enter transaction prover URL"
                            />
                            <span className="text-xs text-muted-foreground">
                                This URL will be used for transaction proving.
                            </span> */}
                        </div>
                    </DialogContent>
                </Dialog>
            </>
        )
    )
}
