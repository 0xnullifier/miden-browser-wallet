import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";


export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <div className="flex max-w-6xl mx-auto">
                <div className="">
                    <div className="sticky top-[60px] max-h-screen overflow-y-auto">
                        <DocsSidebar />
                    </div>
                </div>
                <div >
                    {children}
                </div>
            </div>
        </SidebarProvider>
    );
}