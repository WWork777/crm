// app/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

async function getActiveTeamId() {
  const session = await getServerSession(authOptions);
  const teamId = (session?.user as any)?.activeTeamId;
  if (!teamId) throw new Error("Отказано в доступе: команда не найдена");
  return teamId;
}

export async function getTransactions(
  monthFilter?: string,
  typeFilter?: string,
  categoryFilter?: string,
  passedTeamId?: string,
) {
  const teamId = passedTeamId || (await getActiveTeamId());
  let whereClause: any = { teamId: teamId };

  // ИСПРАВЛЕНО: Правильный поиск по DateTime
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
}

export async function addTransaction(formData: FormData) {
  const teamId = await getActiveTeamId();
  const amount = parseFloat(formData.get("amount") as string);

  // ИСПРАВЛЕНО: Оборачиваем дату в new Date()
  const dateStr = formData.get("date") as string;
  const transactionDate = dateStr ? new Date(dateStr) : new Date();

  await prisma.transaction.create({
    data: {
      teamId: teamId,
      type: formData.get("type") as string,
      amount: amount,
      category: formData.get("category") as string,
      counterparty: formData.get("counterparty") as string,
      date: transactionDate, // <--- ИСПРАВЛЕНО ТУТ
      status: formData.get("status") as string,
      description: formData.get("description") as string,
    },
  });

  revalidatePath("/");
}

export async function deleteTransaction(formData: FormData) {
  const id = formData.get("id") as string;
  const teamId = await getActiveTeamId();

  await prisma.transaction.deleteMany({
    where: {
      id: id,
      teamId: teamId,
    },
  });

  revalidatePath("/");
}

export async function toggleStatus(formData: FormData) {
  const id = formData.get("id") as string;
  const currentStatus = formData.get("currentStatus") as string;
  const teamId = await getActiveTeamId();

  const newStatus = currentStatus === "paid" ? "pending" : "paid";

  await prisma.transaction.updateMany({
    where: {
      id: id,
      teamId: teamId,
    },
    data: { status: newStatus },
  });

  revalidatePath("/");
}

export async function updateTransaction(formData: FormData) {
  const id = formData.get("id") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const teamId = await getActiveTeamId();

  // ИСПРАВЛЕНО: Оборачиваем дату в new Date()
  const dateStr = formData.get("date") as string;
  const transactionDate = dateStr ? new Date(dateStr) : new Date();

  await prisma.transaction.updateMany({
    where: {
      id: id,
      teamId: teamId,
    },
    data: {
      type: formData.get("type") as string,
      amount: amount,
      category: formData.get("category") as string,
      counterparty: formData.get("counterparty") as string,
      date: transactionDate, // <--- ИСПРАВЛЕНО ТУТ
      status: formData.get("status") as string,
      description: formData.get("description") as string,
    },
  });

  revalidatePath("/");
}
