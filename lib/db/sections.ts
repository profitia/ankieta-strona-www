import prisma from "@/lib/prisma/client";

export async function getSectionsByPillar(pillarId: string) {
  return prisma.section.findMany({
    where: { pillarId },
    orderBy: { order: "asc" },
  });
}
