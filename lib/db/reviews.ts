import prisma from "@/lib/prisma/client";

export async function getSessionsByPillar(pillarId: string) {
  return prisma.reviewSession.findMany({
    where: { pillarId },
    include: { reviews: true },
    orderBy: { startedAt: "desc" },
  });
}

export async function getSessionById(id: string) {
  return prisma.reviewSession.findUnique({
    where: { id },
    include: {
      reviews: { include: { section: true } },
      pillar: true,
    },
  });
}

export async function completeSession(id: string) {
  return prisma.reviewSession.update({
    where: { id },
    data: { status: "COMPLETED", completedAt: new Date() },
  });
}
