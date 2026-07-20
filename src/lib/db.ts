import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function makeClient() {
  const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
  // Strip "file:" prefix for libsql
  const filePath = dbUrl.replace(/^file:/, "");
  const libsql = createClient({ url: `file:${filePath}` });
  const adapter = new PrismaLibSQL(libsql);
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? makeClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
