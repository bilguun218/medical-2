import { PrismaClient, type Prisma } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const developmentLog: Prisma.PrismaClientOptions["log"] =
  process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"];

function normalizeDatabaseUrl(value?: string) {
  if (!value) {
    return undefined;
  }

  try {
    const url = new URL(value);
    const isNeonPooler = url.hostname.includes("-pooler.") && url.hostname.endsWith(".neon.tech");

    if (!isNeonPooler) {
      return value;
    }

    const poolerDefaults = {
      pgbouncer: "true",
      connection_limit: "1",
      pool_timeout: "10",
      connect_timeout: "10"
    };

    for (const [key, defaultValue] of Object.entries(poolerDefaults)) {
      if (!url.searchParams.has(key)) {
        url.searchParams.set(key, defaultValue);
      }
    }

    return url.toString();
  } catch {
    return value;
  }
}

const prismaOptions: Prisma.PrismaClientOptions = {
  log: developmentLog
};

const datasourceUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);

if (datasourceUrl) {
  prismaOptions.datasourceUrl = datasourceUrl;
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
