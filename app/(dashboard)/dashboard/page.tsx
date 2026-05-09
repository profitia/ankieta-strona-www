import { Layers, ClipboardList, BarChart2, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import prisma from "@/lib/prisma/client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [pillars, sessions] = await Promise.all([
    prisma.pillar.findMany({ include: { sections: true } }),
    prisma.reviewSession.findMany({
      include: { pillar: true, reviews: { select: { id: true } } },
      orderBy: { startedAt: "desc" },
      take: 5,
    }),
  ]);

  const allSessions = await prisma.reviewSession.findMany({ select: { status: true } });
  const completedCount = allSessions.filter((s) => s.status === "COMPLETED").length;
  const totalReviews = sessions.reduce((acc, s) => acc + s.reviews.length, 0);

  const stats = [
    {
      label: "Filary",
      value: pillars.length.toString(),
      description: pillars.map((p) => p.name).join(" · "),
      icon: Layers,
      href: "/dashboard/pillars",
    },
    {
      label: "Sesje ankiet",
      value: allSessions.length.toString(),
      description: `${completedCount} ukończonych`,
      icon: ClipboardList,
      href: "/dashboard/reviews",
    },
    {
      label: "Oceny sekcji",
      value: totalReviews.toString(),
      description: "Z ostatnich 5 sesji",
      icon: BarChart2,
      href: "/dashboard/analytics",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
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
                  Zobacz <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ostatnie sesje</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Brak sesji. Rozpocznij pierwszą ankietę z poziomu strony filaru.</p>
          ) : (
            sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                <div className="flex items-center gap-3">
                  {s.status === "COMPLETED" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                  )}
                  <div>
                    <span className="font-medium">{s.pillar.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {s.reviews.length} sekcji · {new Date(s.startedAt).toLocaleDateString("pl-PL")}
                    </span>
                  </div>
                </div>
                <Badge variant={s.status === "COMPLETED" ? "default" : "secondary"} className="text-xs">
                  {s.status === "COMPLETED" ? "Ukończona" : s.status === "IN_PROGRESS" ? "W toku" : "Oczekuje"}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
