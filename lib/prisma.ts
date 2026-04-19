// lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// В Prisma 7 мы просто передаем объект с url напрямую в адаптер,
// импортировать сам better-sqlite3 больше не нужно.
const adapter = new PrismaBetterSqlite3({ url: "file:./prisma/dev.db" });

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
