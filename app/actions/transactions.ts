"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";

// 1. Схема валидации транзакции
const TransactionSchema = z.object({
  type: z.enum(["income", "expense", "debt"]),
  status: z.enum(["paid", "pending"]),
  amount: z.preprocess(
    (val) => parseFloat(val as string),
    z
      .number()
      .positive("Сумма должна быть больше 0")
      .max(1000000000, "Слишком большая сумма"),
  ),
  category: z
    .string()
    .max(100, "Название категории слишком длинное")
    .optional()
    .nullable(),
  counterparty: z.string().min(1, "Укажите контрагента").max(200),
  date: z.string().min(1, "Дата обязательна"),
  description: z
    .string()
    .max(1000, "Описание слишком длинное")
    .optional()
    .nullable(),
});

/**
 * Вспомогательная функция для безопасного получения ID команды и Роли
 */
async function getTeamAccess() {
  const session = await getServerSession(authOptions);
  const teamId = (session?.user as any)?.activeTeamId;
  const role = (session?.user as any)?.role;
  const userId = (session?.user as any)?.id;

  if (!session || !teamId || !userId) {
    throw new Error(
      "Отказано в доступе: вы не авторизованы или команда не выбрана",
    );
  }

  return { teamId, role, userId };
}

export async function getTransactions(
  monthFilter?: string,
  typeFilter?: string,
  categoryFilter?: string,
) {
  try {
    const { teamId } = await getTeamAccess();

    let whereClause: any = { teamId };

    // Поиск по дате (Месяц)
    if (monthFilter) {
      const startDate = new Date(`${monthFilter}-01T00:00:00.000Z`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);

      whereClause.date = {
        gte: startDate,
        lt: endDate,
      };
    }

    if (typeFilter) whereClause.type = typeFilter;
    if (categoryFilter) whereClause.category = categoryFilter;

    return await prisma.transaction.findMany({
      where: whereClause,
      orderBy: { date: "desc" },
    });
  } catch (error) {
    console.error("Ошибка при получении транзакций:", error);
    return [];
  }
}

export async function addTransaction(formData: FormData) {
  const { teamId } = await getTeamAccess();

  // Валидация
  const rawData = Object.fromEntries(formData.entries());
  const validated = TransactionSchema.safeParse(rawData);

  if (!validated.success) {
    throw new Error(validated.error.issues[0].message);
  }

  const { type, amount, category, counterparty, date, status, description } =
    validated.data;

  await prisma.transaction.create({
    data: {
      teamId,
      type,
      amount,
      category: category || "Без категории",
      counterparty,
      date: new Date(date),
      status,
      description: description || "",
    },
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
}

export async function deleteTransaction(formData: FormData) {
  const id = formData.get("id") as string;
  const { teamId, role } = await getTeamAccess();

  // ЗАЩИТА: Только OWNER может удалять финансы
  if (role !== "OWNER") {
    throw new Error("Только владелец может удалять транзакции из реестра");
  }

  await prisma.transaction.deleteMany({
    where: { id, teamId },
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
}

export async function toggleStatus(formData: FormData) {
  const id = formData.get("id") as string;
  const currentStatus = formData.get("currentStatus") as string;
  const { teamId, role } = await getTeamAccess();

  if (role !== "OWNER")
    throw new Error("Нет прав на изменение финансового статуса");

  const newStatus = currentStatus === "paid" ? "pending" : "paid";

  await prisma.transaction.updateMany({
    where: { id, teamId },
    data: { status: newStatus },
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
}

export async function updateTransaction(formData: FormData) {
  const id = formData.get("id") as string;
  const { teamId, role } = await getTeamAccess();

  if (role !== "OWNER")
    throw new Error("Нет прав на редактирование финансовых записей");

  // Валидация
  const rawData = Object.fromEntries(formData.entries());
  const validated = TransactionSchema.safeParse(rawData);

  if (!validated.success) {
    throw new Error(validated.error.issues[0].message);
  }

  const { type, amount, category, counterparty, date, status, description } =
    validated.data;

  const result = await prisma.transaction.updateMany({
    where: { id, teamId },
    data: {
      type,
      amount,
      category: category || "Без категории",
      counterparty,
      date: new Date(date),
      status,
      description: description || "",
    },
  });

  if (result.count === 0)
    throw new Error("Запись не найдена или доступ запрещен");

  revalidatePath("/");
  revalidatePath("/dashboard");
}
