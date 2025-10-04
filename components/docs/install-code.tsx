"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check } from "lucide-react";

interface PackageManager {
  id: string;
  label: string;
  command: string;
}

export function InstallComponent({
  packageManagers,
}: {
  packageManagers: PackageManager[];
}) {
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [activeTab, setActiveTab] = useState(packageManagers[0]?.id || "pnpm");

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [id]: false }));
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div
      className="bg-background rounded-lg max-w-[50rem] border border-border overflow-hidden mt-5"
      id="installation"
    >
      <Tabs
        defaultValue={activeTab}
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="flex items-center justify-between border-b border-border bg-muted/10">
          <TabsList className="bg-transparent border-none h-auto p-1 m-1">
            {packageManagers.map((pm) => (
              <TabsTrigger
                key={pm.id}
                value={pm.id}
                className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground px-3 py-1.5 text-sm font-medium rounded-md transition-all"
              >
                {pm.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="p-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={() => {
                const activeCommand =
                  packageManagers.find((pm) => pm.id === activeTab)?.command ||
                  packageManagers[0].command;
                copyToClipboard(activeCommand, "install-command");
              }}
            >
              {copiedStates["install-command"] ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {packageManagers.map((pm) => (
          <TabsContent key={pm.id} value={pm.id} className="m-0">
            <div className="p-4 font-mono text-foreground bg-muted/5">
              {pm.command}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
