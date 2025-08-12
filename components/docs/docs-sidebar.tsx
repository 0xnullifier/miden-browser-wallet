import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarGroup,
    SidebarGroupContent
} from "../ui/sidebar";
import { BookOpen, Wallet, Code, CreditCard, Zap, Cog, SquarePlusIcon, List, Blocks } from "lucide-react";
import Link from "next/link";

const navigationItems = [
    {
        title: "QuickStart",
        icon: Zap,
        items: [
            { title: "Installation", href: "/docs#installation" },
            { title: "Accounts", href: "/docs#accounts" },
            { title: "Mint Tokens", href: "/docs#mint" },
            { title: "Send Tokens", href: "/docs#send" },
            { title: "Receive Tokens", href: "/docs#receive" },
        ]
    },
    {
        title: "Use Cases",
        icon: List,
        items: [
            { title: "Payments", href: "/docs/webrtc" },
            { title: "DeFi", href: "/docs/api" },
            { title: "Identity", href: "/docs/sdk" },
        ]
    },
    {
        title: "Concepts",
        icon: Blocks,
        items: [
            { title: "Accounts", href: "/docs/webrtc" },
            { title: "Notes", href: "/docs/api" },
            { title: "Transactions", href: "/docs/api" },
        ]
    },
    {
        title: "Advanced",
        icon: SquarePlusIcon,
        items: [
            { title: "Unauthenticated Notes", href: "/docs/send" },
            { title: "Indexing Transactions", href: "/docs/receive" },
        ]
    }
];

export function DocsSidebar() {
    return (
        <SidebarGroup className="max-w-[200px] py-0">
            <SidebarGroupContent>
                <SidebarMenu>
                    {navigationItems.map((section) => (
                        <SidebarMenuItem key={section.title}>
                            <SidebarMenuButton className="w-full">
                                <section.icon className="mr-2 h-4 w-4 text-primary" />
                                <span className="text-md text-foreground">{section.title}</span>
                            </SidebarMenuButton>
                            <SidebarMenuSub className="gap-1">
                                {section.items.map((item) => (
                                    <SidebarMenuSubItem key={item.href}>
                                        <Link href={item.href} className="flex h-auto min-h-7 -translate-x-px items-center gap-2 rounded-md px-2 py-1 text-sm text-sidebar-foreground outline-hidden ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 group-data-[collapsible=icon]:hidden">
                                            <span className="whitespace-normal break-words text-muted-foreground">{item.title}</span>
                                        </Link>
                                    </SidebarMenuSubItem>
                                ))}
                            </SidebarMenuSub>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}