"use client";

import { redirect } from "next/navigation";

export default function ImportDebugPage() {
  const handleFileImport = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          const { WebClient } = await import("@demox-labs/miden-sdk");
          const client = await WebClient.createClient();
          await client.forceImportStore(json);
          redirect("/debug");
        } catch (error) {
          console.error("Error:", error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleFileImport}
        style={{ display: "none" }}
        id="file-input"
      />
      <button onClick={() => document.getElementById("file-input")?.click()}>
        Import JSON File
      </button>
    </div>
  );
}
