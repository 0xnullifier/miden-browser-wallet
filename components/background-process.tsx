"use client";

import { useWebRtc } from "@/hooks/useWebRtc";
import { useObserveBalance } from "@/providers/balance-provider";
import { useInitAndPollSyncState } from "@/providers/sdk-provider";

/**
 * This component handles all background processes that need to run continuously.
 * It's isolated so that its internal state updates don't cause parent components to re-render.
 */
export function BackgroundProcesses() {
  useInitAndPollSyncState();
  useObserveBalance();
  useWebRtc();

  // This component renders nothing but handles all background processes
  return null;
}
