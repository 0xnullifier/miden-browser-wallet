import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dropdown";
import {
  MIDEN_WEB_WALLET_LOCAL_STORAGE_KEY,
  NETWORK_ID,
  RPC_ENDPOINT,
} from "@/lib/constants";
import { useMidenSdkStore } from "@/providers/sdk-provider";
import {
  AlertCircleIcon,
  Copy,
  CopyCheck,
  Delete,
  Download,
  Import,
  Loader2,
  MoreHorizontal,
  Network,
  Settings,
  Trash2,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { LoadingSpinner } from "../ui/loading-spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "../ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";

export function WalletDropdown() {
  const account = useMidenSdkStore((state) => state.account);
  const [loading, setLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importStr, setImportStr] = useState("");
  const isMobile = useIsMobile();

  const handleExportAccount = async () => {
    setLoading(true);
    if (!account) {
      console.error("No account found to export private key");
      return;
    }
    const { WebClient, Address } = await import("@demox-labs/miden-sdk");
    const client = await WebClient.createClient(RPC_ENDPOINT);

    try {
      // returns a array of bytes
      const exportAccount = (
        await client.exportAccountFile(Address.fromBech32(account).accountId())
      ).serialize();
      const base64String = btoa(String.fromCharCode(...exportAccount));
      const fullString = `${base64String}:${account}`;
      await navigator.clipboard.writeText(fullString);
      toast.success("Account exported and copied to clipboard!", {
        position: "top-right",
      });
    } catch (error) {
      toast.error("Failed to export account.", { position: "top-right" });
    } finally {
      setLoading(false);
      client.terminate();
    }
  };

  const handleBurnWallet = async () => {
    if (!account) {
      console.error("No account found to burn wallet");
      return;
    }
    try {
      indexedDB.deleteDatabase("MidenClientDB");
      localStorage.removeItem(MIDEN_WEB_WALLET_LOCAL_STORAGE_KEY);
      window.location.reload();
    } catch (error) {
      console.error("Failed to burn wallet:", error);
      toast.error("Failed please try again later");
    }
  };

  const importAccount = async () => {
    const { WebClient, Address, AccountInterface, AccountFile } = await import(
      "@demox-labs/miden-sdk"
    );
    const client = await WebClient.createClient(RPC_ENDPOINT);
    setImportLoading(true);
    if (!importStr || importStr.length === 0) {
      toast.error("Please enter a valid account string", {
        position: "top-right",
      });
      setImportLoading(false);
      return;
    }

    try {
      indexedDB.deleteDatabase("MidenClientDB");
      const b64AccountString = importStr.split(":")[0];
      const newAccountId = importStr.split(":")[1];
      console.log(newAccountId);
      const byteArray = Uint8Array.from(atob(b64AccountString), (c) =>
        c.charCodeAt(0),
      );
      await client.importAccountFile(AccountFile.deserialize(byteArray));
      const account = await client.getAccount(
        Address.fromBech32(newAccountId).accountId(),
      );
      if (!account) {
        throw new Error("Imported account not found after import");
      }
      const NID = await NETWORK_ID();
      localStorage.setItem(
        MIDEN_WEB_WALLET_LOCAL_STORAGE_KEY,
        account.id().toBech32(NID, AccountInterface.BasicWallet),
      );
      toast.success("Account imported successfully!", {
        position: "top-right",
      });
      window.location.reload();
    } catch (error) {
      console.error("Failed to import account:", error);
      toast.error(
        "Failed to import account. Please ensure the string is correct.",
        { position: "top-right" },
      );
    } finally {
      setImportLoading(false);
      client.terminate();
    }
  };

  return loading ? (
    <LoadingSpinner />
  ) : (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4 rotate-90" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="bottom">
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
            >
              Import Account
            </Button>
          </DialogContent>
        </DialogContent>
      </Dialog>
    </>
  );
}
