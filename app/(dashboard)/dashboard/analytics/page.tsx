import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import prisma from "@/lib/prisma/client";

export const dynamic = "force-dynamic";

const dimensionLabels: Record<string, string> = {
  clarityScore: "Jasność komunikacji",
  businessScore: "Wartość dla klienta",
  trustScore: "Wiarygodność",
  designScore: "Jakość designu",
  ctaScore: "Skuteczność CTA",
};

const severityColors: Record<string, string> = {
  LOW: "bg-emerald-100 text-emerald-800",
  MEDIUM: "bg-amber-100 text-amber-800",
  HIGH: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-red-100 text-red-800",
};

const severityLabels: Record<string, string> = {
  LOW: "Niski",
  MEDIUM: "Średni",
  HIGH: "Wysoki",
  CRITICAL: "Krytyczny",
};

function ScoreBar({ score, max = 5 }: { score: number; max?: number }) {
  const pct = Math.round((score / max) * 100);
  const color = score >= 4 ? "bg-emerald-500" : score >= 3 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-semibold tabular-nums w-8 text-right">{score.toFixed(1)}</span>
    </div>
  );
}

export default async function AnalyticsPage() {
  const reviews = await prisma.sectionReview.findMany({
    include: {
      section: { include: { pillar: true } },
      session: { select: { status: true } },
    },
    where: { session: { status: "COMPLETED" } },
  });

  const allReviews = await prisma.sectionReview.findMany({
    include: { session: { select: { status: true } } },
  });

  const totalSessions = await prisma.reviewSession.count();
  const completedSessions = await prisma.reviewSession.count({ where: { status: "COMPLETED" } });

  if (reviews.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Analytics</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Zbiorcze wyniki i trendy ze wszystkich ukończonych sesji.
          </p>
        </div>
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Brak ukończonych sesji. Ukończ przynajmniej jedną ankietę, aby zobaczyć analityki.
          </CardContent>
        </Card>
      </div>
    );
  }

  // Aggregate scores across all completed reviews
  const avg = (field: keyof typeof reviews[0]) =>
    reviews.reduce((acc, r) => acc + (r[field] as number), 0) / reviews.length;

  const dimensions = Object.keys(dimensionLabels) as (keyof typeof dimensionLabels)[];

  const dimScores = dimensions.map((dim) => ({
    key: dim,
    label: dimensionLabels[dim],
    score: avg(dim as keyof typeof reviews[0]),
  }));

  const overallAvg = dimScores.reduce((acc, d) => acc + d.score, 0) / dimScores.length;

  // Per-pillar breakdown
  const pillarMap = new Map<string, { name: string; scores: number[]; count: number }>();
  for (const r of reviews) {
    const pillarName = r.section.pillar.name;
    const sectionAvg =
      (r.clarityScore + r.businessScore + r.trustScore + r.designScore + r.ctaScore) / 5;
    if (!pillarMap.has(pillarName)) pillarMap.set(pillarName, { name: pillarName, scores: [], count: 0 });
    const entry = pillarMap.get(pillarName)!;
    entry.scores.push(sectionAvg);
    entry.count++;
  }
  const pillarStats = Array.from(pillarMap.values()).map((p) => ({
    name: p.name,
    avg: p.scores.reduce((a, b) => a + b, 0) / p.scores.length,
    count: p.count,
  }));

  // Severity distribution
  const severityCount: Record<string, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
  for (const r of reviews) severityCount[r.severity]++;

  // Feedback types frequency
  const typeCount: Record<string, number> = {};
  for (const r of reviews) {
    for (const t of r.feedbackTypes) {
      typeCount[t] = (typeCount[t] ?? 0) + 1;
    }
  }
  const topTypes = Object.entries(typeCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Analytics</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Zbiorcze wyniki i trendy ze wszystkich ukończonych sesji.
        </p>
      </div>

      {/* Top stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Średnia ogólna</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{overallAvg.toFixed(1)}<span className="text-base font-normal text-muted-foreground">/5</span></p>
            <p className="text-xs text-muted-foreground mt-1">{reviews.length} ocen sekcji</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ukończone sesje</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{completedSessions}<span className="text-base font-normal text-muted-foreground">/{totalSessions}</span></p>
            <p className="text-xs text-muted-foreground mt-1">Wszystkich sesji</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Najsłabszy wymiar</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const worst = [...dimScores].sort((a, b) => a.score - b.score)[0];
              return (
                <>
                  <p className="text-lg font-bold">{worst.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">Śr. {worst.score.toFixed(1)}/5</p>
                </>
              );
            })()}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Score by dimension */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Wyniki wg wymiaru</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dimScores
              .sort((a, b) => b.score - a.score)
              .map((d) => (
                <div key={d.key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{d.label}</span>
                  </div>
                  <ScoreBar score={d.score} />
                </div>
              ))}
          </CardContent>
        </Card>

        {/* Per-pillar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Wyniki wg filaru</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pillarStats.length === 0 ? (
              <p className="text-sm text-muted-foreground">Brak danych.</p>
            ) : (
              pillarStats
                .sort((a, b) => b.avg - a.avg)
                .map((p) => (
                  <div key={p.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{p.name}</span>
                      <span className="text-xs text-muted-foreground">{p.count} sekcji</span>
                    </div>
                    <ScoreBar score={p.avg} />
                  </div>
                ))
            )}
          </CardContent>
        </Card>

        {/* Severity distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rozkład severity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(severityCount).map(([sev, count]) => (
                <div key={sev} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${severityColors[sev]}`}>
                    {severityLabels[sev]}
                  </span>
                  <span className="text-sm font-bold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top feedback types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Najczęstsze typy feedbacku</CardTitle>
          </CardHeader>
          <CardContent>
            {topTypes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Brak danych.</p>
            ) : (
              <div className="space-y-2">
                {topTypes.map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <Badge variant="secondary" className="text-xs font-normal">{type}</Badge>
                    <span className="font-semibold tabular-nums">{count}×</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
