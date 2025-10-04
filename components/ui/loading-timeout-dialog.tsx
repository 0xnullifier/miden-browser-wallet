"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Database, RefreshCw, Trash2 } from "lucide-react";

interface LoadingTimeoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onNukeDatabase: () => void;
  onRetry: () => void;
  elapsedTime: number;
}

export function LoadingTimeoutDialog({
  isOpen,
  onClose,
  onNukeDatabase,
  onRetry,
  elapsedTime,
}: LoadingTimeoutDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Loading Taking Too Long
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <p>
              The wallet has been loading for {Math.floor(elapsedTime / 1000)}{" "}
              seconds. This might indicate an issue with cached data.
            </p>
            <p className="text-sm text-muted-foreground">
              You can try refreshing or clearing the database to resolve this
              issue.
            </p>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={onRetry}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
          <Button
            variant="destructive"
            onClick={onNukeDatabase}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear Database
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
