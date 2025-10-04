import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EXPLORER_URL } from "@/lib/constants";

export const sucessTxToast = (message: string, txId: string) => {
  toast.success(message, {
    position: "top-right",
    action: (
      <Button
        className="bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:from-orange-500 hover:to-orange-700"
        onClick={() => window.open(EXPLORER_URL(txId), "_blank")}
      >
        View Transaction
      </Button>
    ),
  });
};
