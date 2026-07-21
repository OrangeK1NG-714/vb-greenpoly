// Seed the DB with an admin user + product catalog.
// Run: npm run db:seed

import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PRODUCTS } from "../src/lib/products-data";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const url = dbUrl.startsWith("file:") ? dbUrl : `file:${dbUrl}`;
const adapter = new PrismaLibSql({ url });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Admin user
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@greenpoly.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "changeme123";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: { email: adminEmail, passwordHash, name: "Admin", role: "ADMIN" },
  });

  console.log(`✓ Admin user: ${adminEmail} / ${adminPassword}`);
  console.log(`  CHANGE THE PASSWORD before deploying.`);

  // Products
  for (const cat of PRODUCTS) {
    for (const grade of cat.grades) {
      await prisma.product.upsert({
        where: { sku: grade.code },
        update: {},
        create: {
          sku: grade.code,
          slug: `${cat.slug}-${grade.code.toLowerCase()}`,
          category: cat.category,
          nameEn: `${cat.name.en} — ${grade.code}`,
          nameZh: `${cat.name.zh} — ${grade.code}`,
          descEn: grade.application,
          color: grade.color,
          mfi: grade.mfi,
          density: grade.density,
          processType: grade.process,
          application: grade.application,
          priceFrom: grade.priceUSD,
          imageUrl: cat.hero,
          isFeatured: cat.grades[0].code === grade.code,
        },
      });
    }
  }

  const count = await prisma.product.count();
  console.log(`✓ ${count} products seeded`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
