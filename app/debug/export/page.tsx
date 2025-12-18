"use client";

import { useEffect } from "react";

export default function ExportDebugPage() {
  useEffect(() => {
    async function exportStoreAndSaveToJsonFile() {
      const { WebClient } = await import("@demox-labs/miden-sdk");
      const client = await WebClient.createClient();
      const storeData = await client.exportStore();
      const dataStr = JSON.stringify(storeData, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "store_export.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    exportStoreAndSaveToJsonFile();
  }, []);

  return <div>Export Debug Page</div>;
}
