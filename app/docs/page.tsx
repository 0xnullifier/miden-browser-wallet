import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { QuickStart } from "@/components/docs/quickstart";
import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";

export default function Dashboard() {
    return (
        <div className="pl-6 max-w-6xl mx-auto">
            <QuickStart />
        </div>
    )
}
