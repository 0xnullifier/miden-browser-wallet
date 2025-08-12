import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";


export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <div className="px-6 max-w-6xl flex mx-auto">
                <DocsSidebar />
                {children}
            </div>
        </SidebarProvider>
    );
}