import { Layers, ClipboardList, BarChart2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const stats = [
  {
    label: "Pillars",
    value: "3",
    description: "Doradztwo · Edukacja · Career",
    icon: Layers,
    href: "/dashboard/pillars",
  },
  {
    label: "Review Sessions",
    value: "-",
    description: "No sessions yet",
    icon: ClipboardList,
    href: "/dashboard/reviews",
  },
  {
    label: "Analytics",
    value: "-",
    description: "Coming soon",
    icon: BarChart2,
    href: "/dashboard/analytics",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
          <Badge variant="secondary" className="text-xs">
            Foundation
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Website Review Hub - Profitia
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, description, icon: Icon, href }) => (
          <Card
            key={label}
            className="group relative overflow-hidden transition-colors hover:border-primary/40"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{description}</p>
              <Link href={href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  View <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick start */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Start</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>1. Run <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">npm run db:push</code> to apply the schema to Neon.</p>
          <p>2. Run <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">npm run db:seed</code> to seed Pillars and Sections.</p>
          <p>3. Navigate to <strong>Pillars</strong> to see the data.</p>
        </CardContent>
      </Card>
    </div>
  );
}
