import Link from "next/link";
import prisma from "@/lib/prisma/client";

export const dynamic = "force-dynamic";

export default async function PillarsPage() {
  const [pillars, contentSessionGroups] = await Promise.all([
    prisma.pillar.findMany({
      include: {
        sections: { orderBy: { order: "asc" } },
        sessions: { select: { status: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.contentSession.groupBy({
      by: ["pillarSlug"],
      _count: { id: true },
      where: { status: "COMPLETED" },
    }),
  ]);

  const contentBySlug: Record<string, number> = {};
  for (const g of contentSessionGroups) {
    contentBySlug[g.pillarSlug] = g._count.id;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Filary</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Obszary review z podziałem na sekcje i historią sesji.
        </p>
      </div>

      <div className="space-y-3">
        {pillars.map((pillar) => {
          const completed = pillar.sessions.filter((s) => s.status === "COMPLETED").length;
          const total = pillar.sessions.length;
          const contentReviews = contentBySlug[pillar.slug] ?? 0;
          return (
            <div key={pillar.id} className="rounded-xl border bg-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-base font-medium text-card-foreground">{pillar.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {pillar.sections.length} sekcji · {total} sesji ankiet ({completed} ukończonych) · {contentReviews} content review
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {pillar.sections.map((s) => (
                      <span
                        key={s.id}
                        className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
                <Link
                  href={`/filar/${pillar.slug}`}
                  className="shrink-0 text-xs font-medium text-primary hover:underline"
                >
                  Ankieta →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
