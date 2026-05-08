import prisma from "@/lib/prisma/client";

export async function getPillars() {
  return prisma.pillar.findMany({
    orderBy: { createdAt: "asc" },
    include: { sections: { orderBy: { order: "asc" } } },
  });
}

export async function getPillarBySlug(slug: string) {
  return prisma.pillar.findUnique({
    where: { slug },
    include: { sections: { orderBy: { order: "asc" } } },
  });
}
