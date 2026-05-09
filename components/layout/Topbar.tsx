"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAppStore } from "@/stores/app-store";
import { usePathname } from "next/navigation";

const breadcrumbMap: Record<string, string> = {
  "/dashboard": "Przegląd",
  "/dashboard/filary": "Filary",
  "/dashboard/strony": "Strony",
  "/dashboard/review": "Review",
  "/dashboard/eksport": "Eksport",
  "/admin/content-reviews": "Content Reviews",
  "/admin/reviews": "UX Reviews",
};

function getBreadcrumb(pathname: string): string {
  if (breadcrumbMap[pathname]) return breadcrumbMap[pathname];
  // Find the longest matching prefix (most specific)
  const key = Object.keys(breadcrumbMap)
    .filter((k) => pathname.startsWith(k) && k !== "/dashboard")
    .sort((a, b) => b.length - a.length)[0];
  return key ? breadcrumbMap[key] : "Profitia Review";
}

export function Topbar() {
  const { toggleSidebar } = useAppStore();
  const pathname = usePathname();
  const title = getBreadcrumb(pathname);

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-5" />

      <h1 className="text-sm font-medium text-foreground">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        <span className="hidden text-xs text-muted-foreground sm:block">
          Website Review Hub
        </span>
      </div>
    </header>
  );
}
