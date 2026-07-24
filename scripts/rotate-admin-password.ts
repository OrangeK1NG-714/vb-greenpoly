import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const minimumPasswordLength = 20;
const bcryptCost = 12;

function requiredAdminPassword() {
  const password = process.env.GREENPOLY_ADMIN_PASSWORD ?? "";
  if (Buffer.byteLength(password) < minimumPasswordLength || Buffer.byteLength(password) > 256 || /[\r\n]/.test(password)) {
    throw new Error(`GREENPOLY_ADMIN_PASSWORD must be ${minimumPasswordLength}-256 bytes without line breaks`);
  }
  return password;
}

function configuredAdminEmail() {
  const email = process.env.GREENPOLY_ADMIN_EMAIL || process.env.SEED_ADMIN_EMAIL || "admin@greenpoly.com";
  if (email.length > 320 || /[\r\n]/.test(email)) {
    throw new Error("configured administrator email is invalid");
  }
  return email;
}

function databaseUrl() {
  const value = process.env.DATABASE_URL ?? "";
  if (!value) throw new Error("DATABASE_URL must be configured");
  return value.startsWith("file:") ? value : `file:${value}`;
}

async function main() {
  const password = requiredAdminPassword();
  const email = configuredAdminEmail();
  const prisma = new PrismaClient({ adapter: new PrismaLibSql({ url: databaseUrl() }) });

  try {
    const administrator = await prisma.adminUser.findUnique({ where: { email }, select: { id: true } });
    if (!administrator) throw new Error("configured administrator does not exist");

    const passwordHash = await bcrypt.hash(password, bcryptCost);
    await prisma.adminUser.update({ where: { id: administrator.id }, data: { passwordHash } });
    console.log("GreenPoly administrator password rotated.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "administrator password rotation failed");
  process.exit(1);
});
