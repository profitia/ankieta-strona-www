import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const adapter = new PrismaNeon({ connectionString });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getPrismaInstance(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

// Lazy proxy — the actual client is only created on first method call (at request time),
// not at module evaluation time (build time). This allows Next.js to import the module
// during static build without DATABASE_URL being present.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getPrismaInstance() as unknown as Record<string | symbol, unknown>)[prop as string | symbol];
  },
});

export default prisma;
