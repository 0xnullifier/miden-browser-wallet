import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { MIDEN_WEB_WALLET_LOCAL_STORAGE_KEY } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Clears all wallet data including IndexedDB and localStorage
 * This is useful when the app is stuck loading or has corrupted data
 */
export function nukeWalletDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Clear IndexedDB
      const deleteDB = indexedDB.deleteDatabase("MidenClientDB");

      deleteDB.onsuccess = () => {
        // Clear localStorage
        localStorage.removeItem(MIDEN_WEB_WALLET_LOCAL_STORAGE_KEY);

        resolve();
      };

      deleteDB.onerror = () => {
        console.error("Failed to delete IndexedDB:", deleteDB.error);
        reject(deleteDB.error);
      };

      deleteDB.onblocked = () => {
        console.warn(
          "Database deletion blocked, attempting localStorage cleanup only",
        );
        localStorage.removeItem(MIDEN_WEB_WALLET_LOCAL_STORAGE_KEY);
        resolve();
      };
    } catch (error) {
      console.error("Failed to nuke wallet database:", error);
      reject(error);
    }
  });
}

export function numToString(num: number): string {
  if (!num) return "0.00";
  const decimals = num.toString().split(".")[1]?.length;
  if (decimals > 2) {
    return num.toString();
  } else {
    return num.toFixed(2);
  }
}
