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
          const dump = e.target?.result as string;
          const { importStore } = await import("@miden-sdk/miden-sdk");
          await importStore("MidenClientDB_mtst", dump);
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
