import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex max-w-6xl mx-auto px-2 sm:px-4">
        <div className="sticky top-[60px] max-h-screen overflow-y-auto hidden md:block min-w-[200px]">
          <DocsSidebar />
        </div>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </SidebarProvider>
  );
}
