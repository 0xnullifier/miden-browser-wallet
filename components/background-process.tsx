"use client";

import { useObserveBalance } from "@/providers/balance-provider";
import { useInitAndPollSyncState } from "@/providers/sdk-provider";

export function BackgroundProcesses() {
  useInitAndPollSyncState();
  useObserveBalance();
  return null;
}
