// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: "file:./prisma/dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  console.log("🚀 Запуск сидинга новой структуры...");

  // 1. Создаем пользователя
  const user = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Админ",
      password: hashedPassword,
    },
  });

  // 2. Создаем команду
  const team = await prisma.team.create({
    data: {
      name: "Моя Компания",
    },
  });

  // 3. Привязываем пользователя к команде как владельца
  await prisma.teamMember.create({
    data: {
      userId: user.id,
      teamId: team.id,
      role: "OWNER",
    },
  });

  console.log("✅ База готова. Команда создана.");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
