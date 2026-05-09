import { CheckCircle2, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import prisma from "@/lib/prisma/client";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  COMPLETED: "Ukończona",
  IN_PROGRESS: "W toku",
  PENDING: "Oczekuje",
};

const severityLabel: Record<string, string> = {
  LOW: "Niski",
  MEDIUM: "Średni",
  HIGH: "Wysoki",
  CRITICAL: "Krytyczny",
};

export default async function ReviewsPage() {
  const sessions = await prisma.reviewSession.findMany({
    include: {
      pillar: true,
      reviews: {
        include: { section: true },
        orderBy: { section: { order: "asc" } },
      },
    },
    orderBy: { startedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Sesje ankiet</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Wszystkie sesje przeglądów z podziałem na filary i sekcje.
        </p>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Brak sesji. Rozpocznij ankietę z poziomu strony filaru.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const avgScore =
              session.reviews.length > 0
                ? Math.round(
                    session.reviews.reduce(
                      (acc, r) =>
                        acc +
                        (r.clarityScore + r.businessScore + r.trustScore + r.designScore + r.ctaScore) / 5,
                      0
                    ) / session.reviews.length
                  )
                : null;

            return (
              <Card key={session.id}>
                <CardHeader className="border-b pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {session.status === "COMPLETED" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                      )}
                      <div>
                        <CardTitle className="text-base">{session.pillar.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Rozpoczęta: {new Date(session.startedAt).toLocaleString("pl-PL")}
                          {session.completedAt && (
                            <> · Ukończona: {new Date(session.completedAt).toLocaleString("pl-PL")}</>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {avgScore !== null && (
                        <span className="text-sm font-semibold tabular-nums">
                          Śr. {avgScore}/5
                        </span>
                      )}
                      <Badge
                        variant={session.status === "COMPLETED" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {statusLabel[session.status]}
                      </Badge>
                      {session.status === "COMPLETED" && (
                        <Link
                          href={`/podsumowanie?sessionId=${session.id}`}
                          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                        >
                          Podsumowanie <ChevronRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </CardHeader>
                {session.reviews.length > 0 && (
                  <CardContent className="pt-3">
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {session.reviews.map((review) => {
                        const avg = Math.round(
                          (review.clarityScore + review.businessScore + review.trustScore + review.designScore + review.ctaScore) / 5
                        );
                        return (
                          <div
                            key={review.id}
                            className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                          >
                            <div>
                              <p className="font-medium">{review.section.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {severityLabel[review.severity]} · {review.feedbackTypes.join(", ")}
                              </p>
                            </div>
                            <span
                              className={`text-sm font-bold tabular-nums ${
                                avg >= 4 ? "text-emerald-600" : avg >= 3 ? "text-amber-600" : "text-red-600"
                              }`}
                            >
                              {avg}/5
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
