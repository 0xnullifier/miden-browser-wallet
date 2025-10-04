import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarGroup,
  SidebarGroupContent,
} from "../ui/sidebar";
import { Zap, SquarePlusIcon, List, Blocks } from "lucide-react";
import Link from "next/link";

const navigationItems = [
  {
    title: "QuickStart",
    icon: Zap,
    href: "#quickstart",
    items: [
      { title: "Getting Started", href: "/docs#getting-started" },
      { title: "Accounts", href: "/docs#accounts" },
      { title: "Minting Tokens", href: "/docs#tokens-minting" },
      { title: "Consuming Notes", href: "/docs#consuming" },
      { title: "Sending Tokens", href: "/docs#send" },
    ],
  },
  {
    title: "Concepts",
    icon: Blocks,
    href: "#concepts",
    items: [
      { title: "Unauthenticated Notes", href: "/docs#concepts-unauth" },
      { title: "Indexing Transactions", href: "/docs#concepts-indexing" },
    ],
  },
  {
    title: "Use Cases",
    icon: List,
    href: "#use-case",
  },
];

export function DocsSidebar() {
  return (
    <div className="sticky top-[60px] max-h-screen overflow-y-auto">
      <SidebarGroup className="max-w-xs">
        <SidebarGroupContent>
          <SidebarMenu>
            {navigationItems.map((section) => (
              <SidebarMenuItem key={section.title}>
                <SidebarMenuButton className="w-full">
                  <Link
                    href={section.href}
                    className="flex h-auto min-h-7 -translate-x-px items-center gap-2 rounded-md px-2 py-1 text-sm text-sidebar-foreground outline-hidden ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 group-data-[collapsible=icon]:hidden"
                  >
                    <section.icon className="mr-2 h-4 w-4 text-primary" />
                    <span className="text-md text-foreground">
                      {section.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
                <SidebarMenuSub className="gap-1">
                  {section.items?.map((item) => (
                    <SidebarMenuSubItem key={item.href}>
                      <Link
                        href={item.href}
                        className="flex h-auto min-h-7 -translate-x-px items-center gap-2 rounded-md px-2 py-1 text-sm text-sidebar-foreground outline-hidden ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 group-data-[collapsible=icon]:hidden"
                      >
                        <span className="whitespace-normal break-words text-muted-foreground">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </div>
  );
}
