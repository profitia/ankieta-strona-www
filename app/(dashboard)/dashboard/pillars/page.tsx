import Link from "next/link";
import prisma from "@/lib/prisma/client";

export const dynamic = "force-dynamic";

export default async function PillarsPage() {
  const pillars = await prisma.pillar.findMany({
    include: {
      sections: { orderBy: { order: "asc" } },
      sessions: { select: { status: true } },
    },
    orderBy: { name: "asc" },
  });

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
          return (
            <div key={pillar.id} className="rounded-xl border bg-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-base font-medium text-card-foreground">{pillar.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {pillar.sections.length} sekcji · {total} sesji ({completed} ukończonych)
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
