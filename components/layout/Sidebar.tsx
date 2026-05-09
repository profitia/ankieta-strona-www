"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Layers,
  FileText,
  ClipboardList,
  Download,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const navItems = [
  { label: "Przegląd", href: "/dashboard", icon: LayoutGrid },
  { label: "Filary", href: "/dashboard/filary", icon: Layers },
  { label: "Strony", href: "/dashboard/strony", icon: FileText },
  { label: "Review", href: "/dashboard/review", icon: ClipboardList },
  { label: "Eksport", href: "/dashboard/eksport", icon: Download },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useAppStore();

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-border bg-sidebar transition-all duration-300 ease-in-out",
        sidebarOpen ? "w-56" : "w-16"
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-border px-4">
        <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-[#242F44] text-white text-xs font-semibold tracking-wide">
            P
          </div>
          {sidebarOpen && (
            <span className="truncate text-sm font-medium text-sidebar-foreground">
              Profitia Review
            </span>
          )}
        </Link>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 py-4">
        <nav className="flex flex-col gap-0.5 px-2">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(href);

            return (
              <Link key={href} href={href}>
                <span
                  className={cn(
                    "flex items-center gap-3 px-2.5 py-2 text-sm transition-colors rounded-sm",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {sidebarOpen && <span>{label}</span>}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Divider + admin links */}
        {sidebarOpen && (
          <div className="mt-6 px-4">
            <p className="text-[0.625rem] font-medium uppercase tracking-widest text-sidebar-foreground/30 mb-2">
              Admin
            </p>
            <div className="flex flex-col gap-0.5">
              {[
                { label: "Content Reviews", href: "/admin/content-reviews" },
                { label: "UX Reviews", href: "/admin/reviews" },
              ].map(({ label, href }) => (
                <Link key={href} href={href}>
                  <span className="flex items-center px-2.5 py-1.5 text-xs text-sidebar-foreground/40 hover:text-sidebar-foreground/70 transition-colors rounded-sm">
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Collapse */}
      <div className="border-t border-border p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="w-full justify-center text-sidebar-foreground/40 hover:text-sidebar-foreground"
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              !sidebarOpen && "rotate-180"
            )}
          />
        </Button>
      </div>
    </aside>
  );
}
