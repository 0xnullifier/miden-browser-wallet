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
    const setAccount = useMidenSdkStore((state) => state.setAccount)
    const [loading, setLoading] = useState(false)
    const [importLoading, setImportLoading] = useState(false)
    const [importDialogOpen, setImportDialogOpen] = useState(false)
    const [importAccountStr, setImportAccountStr] = useState("")
    const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
    // copy the private key to clipboard
    const handleExportAccount = async () => {
        setLoading(true)
        if (!account) {
            console.error("No account found to export private key")
            return
        }
        const { WebClient } = await import("@demox-labs/miden-sdk");
        const client = await WebClient.createClient(RPC_ENDPOINT);
        try {
            const json = await client.exportStore();
            const jsonStr = JSON.stringify(json);
            const bytes = new TextEncoder().encode(jsonStr);
            const blob = new Blob([bytes], { type: "application/octet-stream" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "wallet.account";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success("Account exported as wallet.account!", { position: "top-right" });
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

    const importAccount = async (e) => {
        if (!e.target.files || e.target.files.length === 0) {
            return;
        }
        const file = e.target.files[0];
        if (!file) return;
        setImportLoading(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const jsonStr = new TextDecoder().decode(arrayBuffer);
            const json = JSON.parse(jsonStr);
            const { WebClient, Account } = await import("@demox-labs/miden-sdk");
            const client = await WebClient.createClient(RPC_ENDPOINT);
            await client.forceImportStore(json);
            window.location.reload();
        } catch (error) {
            console.error("Failed to import account:", error);
            toast.error("Failed to import account. Please check the file format and try again.", { position: "top-right" });
        }
        // no need for false state
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
                        <DropdownMenuItem onClick={handleImportAccount}>
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
                        <div className="flex flex-col items-center">
                            <Alert variant="destructive" className="bg-red-100 my-4">
                                <AlertCircleIcon className="h-4 w-4 text-red-500" />
                                <AlertTitle className="text-[10px]">Danger</AlertTitle>
                                <AlertDescription>
                                    <p className="text-[9px]">Importing an account will <span className="font-semibold text-red-600">delete your current account</span> and replace it with the imported one. Make sure you have exported your current account if you want to keep it.</p>
                                </AlertDescription>
                            </Alert>
                            <Component
                                handleImportAccount={importAccount}
                                loading={importLoading}
                            />
                        </div>
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
                                className="border rounded px-3 py-2 text-sm"
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

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
function Component({ handleImportAccount, loading: importLoading }: { handleImportAccount: (e: React.ChangeEvent<HTMLInputElement> | { target: { files: FileList } }) => void, loading: boolean }) {
    const [dragActive, setDragActive] = useState(false);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleImportAccount({ target: { files: e.dataTransfer.files } });
        }
    };

    return (
        <Card className="shadow-xl ">
            <CardContent className="flex flex-col items-center">
                <div
                    className={`transition-colors duration-200 border-primary border-2 border-dashed rounded-xl flex flex-col gap-2 items-center cursor-pointer w-full max-w-xs ${dragActive
                        ? "border-primary bg-primary/10 shadow-lg"
                        : "border-muted bg-background"
                        }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById("file-input")?.click()}
                >
                    <FileIcon className="w-14 h-14 text-primary mb-2" />
                    <span className="text-base font-semibold text-foreground">
                        Import your wallet
                    </span>
                    <span className="text-sm text-muted-foreground text-center">
                        Drag & drop or <span className="underline text-primary">browse</span> for your <span className="font-semibold">.account</span> file
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                        Only .account files are supported
                    </span>
                    <Input
                        id="file-input"
                        type="file"
                        accept=".account,application/octet-stream"
                        onChange={handleImportAccount}
                        disabled={importLoading}
                        className="hidden"
                    />
                </div>
                {importLoading && (
                    <div className="flex items-center gap-2 text-primary font-medium">
                        <Loader2 className="animate-spin w-4 h-4" />
                        Importing account...
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function FileIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        </svg>
    )
}
