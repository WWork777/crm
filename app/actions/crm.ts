"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function getAuth() {
  const session = await getServerSession(authOptions);
  const teamId = (session?.user as any)?.activeTeamId;
  const role = (session?.user as any)?.role;
  if (!session || !teamId) throw new Error("Unauthorized");
  return { teamId, role };
}

export async function getLeadStatuses() {
  const { teamId } = await getAuth();
  let statuses = await prisma.leadStatus.findMany({
    where: { teamId },
    orderBy: { order: "asc" },
  });

  if (statuses.length === 0) {
    await prisma.leadStatus.createMany({
      data: [
        { title: "Новый лид", order: 0, color: "indigo", teamId },
        { title: "В работе", order: 1, color: "amber", teamId },
        { title: "Предложение", order: 2, color: "purple", teamId },
        { title: "Сделка", order: 3, color: "emerald", teamId },
      ],
    });
    return await prisma.leadStatus.findMany({
      where: { teamId },
      orderBy: { order: "asc" },
    });
  }
  return statuses;
}

export async function getLeads() {
  const { teamId } = await getAuth();
  return await prisma.lead.findMany({
    where: { teamId },
    orderBy: { createdAt: "desc" },
  });
}

export async function addLead(formData: FormData) {
  const { teamId } = await getAuth();

  await prisma.lead.create({
    data: {
      title: formData.get("title") as string,
      contactName: formData.get("contactName") as string,
      phone: formData.get("phone") as string,
      value: parseFloat(formData.get("value") as string) || 0,

      // Читаем тип оплаты из формы
      paymentType: (formData.get("paymentType") as string) || "FIXED",

      statusId: formData.get("statusId") as string,
      priority: (formData.get("priority") as string) || "MEDIUM",
      teamId,
    },
  });
  revalidatePath("/crm");
}

export async function updateLeadStatus(leadId: string, statusId: string) {
  const { teamId } = await getAuth();
  await prisma.lead.updateMany({
    where: { id: leadId, teamId },
    data: { statusId },
  });
  revalidatePath("/crm");
}

export async function deleteLead(leadId: string) {
  const { teamId, role } = await getAuth();
  if (role !== "OWNER") throw new Error("Only owners can delete leads");
  await prisma.lead.deleteMany({ where: { id: leadId, teamId } });
  revalidatePath("/crm");
}
export async function addLeadStatus(formData: FormData) {
  const { teamId } = await getAuth();
  const title = formData.get("title") as string;

  if (!title || !title.trim()) throw new Error("Название обязательно");

  const count = await prisma.leadStatus.count({ where: { teamId } });

  await prisma.leadStatus.create({
    data: {
      title: title.trim(),
      order: count,
      teamId,
      color: "indigo", // цвет по умолчанию
    },
  });

  revalidatePath("/crm");
}
export async function updateLeadDetails(leadId: string, formData: FormData) {
  const { teamId } = await getAuth();

  await prisma.lead.updateMany({
    where: { id: leadId, teamId },
    data: {
      title: formData.get("title") as string,
      contactName: formData.get("contactName") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      value: parseFloat(formData.get("value") as string) || 0,
      paymentType: formData.get("paymentType") as string,
      statusId: formData.get("statusId") as string,
      priority: formData.get("priority") as string,
    },
  });

  revalidatePath("/crm");
}
export async function updateStatusesOrder(statusIds: string[]) {
  const { teamId } = await getAuth();

  // Используем транзакцию, чтобы обновить всё одним махом
  await prisma.$transaction(
    statusIds.map((id, index) =>
      prisma.leadStatus.updateMany({
        where: { id, teamId },
        data: { order: index },
      }),
    ),
  );

  revalidatePath("/crm");
}
