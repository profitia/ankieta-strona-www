import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill in the values.");
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // ---------------------------------------------------------------------------
  // Pillars
  // ---------------------------------------------------------------------------
  const pillarsData = [
    { slug: "doradztwo", name: "Doradztwo" },
    { slug: "edukacja", name: "Edukacja" },
    { slug: "career", name: "Career" },
  ];

  const sectionsData = [
    { slug: "hero", name: "Hero", order: 0 },
    { slug: "value-proposition", name: "Value Proposition", order: 1 },
    { slug: "offer", name: "Offer", order: 2 },
    { slug: "cta", name: "CTA", order: 3 },
    { slug: "footer", name: "Footer", order: 4 },
  ];

  for (const pillarInput of pillarsData) {
    const pillar = await prisma.pillar.upsert({
      where: { slug: pillarInput.slug },
      update: { name: pillarInput.name },
      create: { slug: pillarInput.slug, name: pillarInput.name },
    });

    console.log(`  ✓ Pillar: ${pillar.name}`);

    for (const sectionInput of sectionsData) {
      await prisma.section.upsert({
        where: { pillarId_slug: { pillarId: pillar.id, slug: sectionInput.slug } },
        update: { name: sectionInput.name, order: sectionInput.order },
        create: {
          pillarId: pillar.id,
          slug: sectionInput.slug,
          name: sectionInput.name,
          order: sectionInput.order,
        },
      });

      console.log(`    ✓ Section: ${sectionInput.name}`);
    }
  }

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
