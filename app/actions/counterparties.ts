"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CounterpartySchema = z.object({
  name: z.string().min(1, "Название обязательно").max(100).trim(),
});

async function getAuthSession() {
  const session = await getServerSession(authOptions);
  const teamId = (session?.user as any)?.activeTeamId;
  if (!session?.user || !teamId) throw new Error("Unauthorized");
  return { session, teamId };
}

export async function addCounterparty(formData: FormData) {
  const { teamId } = await getAuthSession();
  const validated = CounterpartySchema.safeParse({
    name: formData.get("name"),
  });
  if (!validated.success) throw new Error(validated.error.issues[0].message);

  const fields: Record<string, string> = {};
  formData.forEach((value, key) => {
    // Собираем и банковские (bank_) и кастомные (custom_) поля
    if (
      (key.startsWith("custom_") || key.startsWith("bank_")) &&
      typeof value === "string"
    ) {
      const fieldName = key.replace("custom_", "").replace("bank_", "").trim();
      if (fieldName) fields[fieldName] = value;
    }
  });

  await prisma.counterparty.create({
    data: {
      name: validated.data.name,
      teamId,
      fields: JSON.stringify(fields),
    },
  });
  revalidatePath("/counterparties");
}

export async function updateCounterparty(id: string, formData: FormData) {
  const { teamId } = await getAuthSession();
  const name = formData.get("name") as string;
  if (!name?.trim()) throw new Error("Имя обязательно");

  const fields: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (
      (key.startsWith("custom_") || key.startsWith("bank_")) &&
      typeof value === "string"
    ) {
      const fieldName = key.replace("custom_", "").replace("bank_", "").trim();
      if (fieldName) fields[fieldName] = value;
    }
  });

  const result = await prisma.counterparty.updateMany({
    where: { id, teamId },
    data: { name: name.trim(), fields: JSON.stringify(fields) },
  });

  if (result.count === 0) throw new Error("Доступ запрещен");
  revalidatePath("/counterparties");
}

export async function deleteCounterparty(id: string) {
  const { teamId } = await getAuthSession();
  // Удаляем только если ID и TeamId совпадают (безопасность)
  const result = await prisma.counterparty.deleteMany({
    where: { id, teamId },
  });
  if (result.count === 0) throw new Error("Ошибка удаления");
  revalidatePath("/counterparties");
}
