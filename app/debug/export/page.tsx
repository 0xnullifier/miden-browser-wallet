"use client";

import { useEffect } from "react";

export default function ExportDebugPage() {
  useEffect(() => {
    async function exportStoreAndSaveToJsonFile() {
      const { WasmWebClient, exportStore } = await import(
        "@miden-sdk/miden-sdk"
      );
      const client = await WasmWebClient.createClient();
      const storeData = await exportStore(client.storeIdentifier());
      const dataStr =
        typeof storeData === "string"
          ? storeData
          : JSON.stringify(storeData, null, 2);
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
