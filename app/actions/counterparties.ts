"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// 1. Описываем схему данных. Это защищает от "мусора" в базе.
const CounterpartySchema = z.object({
  name: z
    .string()
    .min(1, "Название обязательно")
    .max(100, "Название слишком длинное")
    .trim(),
});

export async function addCounterparty(formData: FormData) {
  const session = await getServerSession(authOptions);
  // Проверка сессии
  if (!session?.user) throw new Error("Unauthorized");

  const teamId = (session.user as any).activeTeamId;
  if (!teamId) throw new Error("No active team found");

  // Валидация основного имени
  const validated = CounterpartySchema.safeParse({
    name: formData.get("name"),
  });

  if (!validated.success) {
    // Обращаемся к issues вместо errors
    const errorMessage = validated.error.issues[0].message;
    throw new Error(errorMessage);
  }

  const { name } = validated.data;

  // Безопасный сбор динамических полей
  const dynamicFields: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (key.startsWith("custom_") && typeof value === "string") {
      const fieldName = key.replace("custom_", "").trim();
      // Ограничиваем длину значения, чтобы не забить базу
      if (fieldName) dynamicFields[fieldName] = value.slice(0, 500);
    }
  });

  await prisma.counterparty.create({
    data: {
      name,
      teamId, // Берем ТОЛЬКО из сессии сервера
      fields: JSON.stringify(dynamicFields),
    },
  });

  revalidatePath("/counterparties");
}

export async function updateCounterparty(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const teamId = (session.user as any).activeTeamId;

  // Валидация
  const name = formData.get("name") as string;
  if (!name || name.trim().length === 0)
    throw new Error("Имя не может быть пустым");

  const dynamicFields: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (key.startsWith("custom_") && typeof value === "string") {
      const fieldName = key.replace("custom_", "");
      dynamicFields[fieldName] = value;
    }
  });

  // 3. ЗАЩИТА ОТ IDOR: Мы ищем контрагента не только по id,
  // но и по teamId текущего пользователя.
  // Если я попробую обновить чужой ID, Prisma просто не найдет запись и выдаст ошибку.
  const result = await prisma.counterparty.updateMany({
    where: {
      id: id,
      teamId: teamId, // Ключевой момент безопасности!
    },
    data: {
      name: name.trim(),
      fields: JSON.stringify(dynamicFields),
    },
  });

  if (result.count === 0) {
    throw new Error("Контрагент не найден или доступ запрещен");
  }

  revalidatePath("/counterparties");
}
