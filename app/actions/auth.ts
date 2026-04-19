"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";

// Схема валидации
const registerSchema = z.object({
  name: z.string().min(2, "Имя слишком короткое").max(50),
  email: z.string().email("Некорректный формат Email"),
  password: z.string().min(8, "Пароль должен быть не менее 8 символов"),
});

export async function registerUser(formData: FormData) {
  // 1. Извлекаем и валидируем данные
  const rawData = Object.fromEntries(formData.entries());
  const validated = registerSchema.safeParse(rawData);

  if (!validated.success) {
    // В Zod массив ошибок называется issues
    const errorMessage = validated.error.issues[0].message;
    throw new Error(errorMessage);
  }

  const { name, email, password } = validated.data;

  try {
    // 2. Проверяем уникальность (Prisma сделает это быстро благодаря @unique)
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error("Этот email уже занят");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Используем ТРАНЗАКЦИЮ
    // Нам нужно, чтобы создался И пользователь, И его команда.
    // Если команда не создастся, пользователь нам не нужен — транзакция откатит всё назад.
    await prisma.$transaction(async (tx) => {
      // Создаем команду
      const team = await tx.team.create({
        data: {
          name: `Команда ${name}`,
        },
      });

      // Создаем пользователя и сразу привязываем к команде
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          activeTeamId: team.id, // Делаем эту команду активной
        },
      });

      // Добавляем пользователя в команду как OWNER
      await tx.teamMember.create({
        data: {
          userId: newUser.id,
          teamId: team.id,
          role: "OWNER",
        },
      });
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    throw new Error(error.message || "Ошибка при регистрации");
  }

  redirect("/login?registered=true");
}
