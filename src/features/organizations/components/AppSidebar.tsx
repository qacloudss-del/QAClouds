"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  FolderOpen,
  Settings,
  Users,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrgRole } from "@prisma/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  org: { id: string; name: string; slug: string; logoUrl: string | null };
  userRole: OrgRole;
  allOrgs: { id: string; name: string; slug: string }[];
  user: { name: string; email: string; avatarUrl: string | null };
}

export function AppSidebar({ org, allOrgs }: Props) {
  const pathname = usePathname();
  const base = `/${org.slug}`;

  const navItems = [
    { href: base, label: "Dashboard", icon: LayoutDashboard },
    { href: `${base}/projects`, label: "Projects", icon: FolderOpen },
    { href: `${base}/settings/members`, label: "Members", icon: Users },
    { href: `${base}/settings`, label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-56 shrink-0 border-r bg-sidebar flex flex-col h-screen sticky top-0">
      {/* Org switcher */}
      <div className="p-3 border-b">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium hover:bg-sidebar-accent transition-colors">
              <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-[11px] font-bold text-primary">
                  {org.name[0]?.toUpperCase()}
                </span>
              </div>
              <span className="flex-1 truncate text-left text-sidebar-foreground">
                {org.name}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            {allOrgs.map((o) => (
              <DropdownMenuItem key={o.id} asChild>
                <Link href={`/${o.slug}`} className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-primary">
                      {o.name[0]?.toUpperCase()}
                    </span>
                  </div>
                  <span className="truncate">{o.name}</span>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === base ? pathname === base : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-primary font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t">
        <div className="flex items-center gap-2.5">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </aside>
  );
}
