"use server";

import { unstable_noStore as noStore, revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";

/**
 * Вспомогательная функция для жесткой проверки прав доступа.
 * Гарантирует, что пользователь авторизован и реально состоит в команде.
 */
async function getAuthenticatedAccess(requireOwner = false) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const teamId = (session?.user as any)?.activeTeamId;

  if (!userId || !teamId) {
    throw new Error(
      "Сессия истекла или команда не выбрана. Перезайдите в систему.",
    );
  }

  const member = await prisma.teamMember.findUnique({
    where: {
      userId_teamId: { userId, teamId },
    },
  });

  if (!member) {
    throw new Error(
      "Доступ заблокирован: вы не являетесь участником этой команды.",
    );
  }

  if (requireOwner && member.role !== "OWNER") {
    throw new Error(
      "Недостаточно прав: это действие доступно только владельцу.",
    );
  }

  return {
    userId,
    teamId,
    userRole: member.role,
    userEmail: session?.user?.email,
  };
}

// Схемы валидации
const emailSchema = z.string().email("Введите корректный Email адрес");
const teamNameSchema = z
  .string()
  .min(2, "Название слишком короткое")
  .max(50, "Название слишком длинное");

/**
 * Пригласить пользователя в команду
 */
export async function inviteUserToTeam(email: string) {
  const { teamId } = await getAuthenticatedAccess(true); // Только Owner

  const validatedEmail = emailSchema.parse(email);

  // Проверяем, не состоит ли пользователь уже в команде
  const existingUser = await prisma.user.findUnique({
    where: { email: validatedEmail },
  });
  if (existingUser) {
    const alreadyMember = await prisma.teamMember.findUnique({
      where: { userId_teamId: { userId: existingUser.id, teamId } },
    });
    if (alreadyMember)
      throw new Error("Пользователь уже является участником команды");
  }

  // Используем upsert: если приглашение было, обновляем (или ничего не делаем), если нет — создаем.
  await prisma.teamInvitation.upsert({
    where: {
      email_teamId: { email: validatedEmail, teamId },
    },
    update: { role: "MEMBER" },
    create: {
      email: validatedEmail,
      teamId,
      role: "MEMBER",
    },
  });

  revalidatePath("/settings/team");
}

/**
 * Принять приглашение в команду
 */
export async function acceptInvitation(invitationId: string) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const userEmail = session?.user?.email;

  if (!userId || !userEmail) throw new Error("Не авторизован");

  const invite = await prisma.teamInvitation.findUnique({
    where: { id: invitationId },
  });

  if (!invite || invite.email !== userEmail) {
    throw new Error("Приглашение не найдено или оно не для вас");
  }

  // ТРАНЗАКЦИЯ: Все три действия должны выполниться вместе
  await prisma.$transaction([
    // 1. Добавляем в участники
    prisma.teamMember.create({
      data: { userId, teamId: invite.teamId, role: invite.role },
    }),
    // 2. Делаем команду активной
    prisma.user.update({
      where: { id: userId },
      data: { activeTeamId: invite.teamId },
    }),
    // 3. Удаляем приглашение
    prisma.teamInvitation.delete({
      where: { id: invitationId },
    }),
  ]);

  revalidatePath("/", "layout");
}

/**
 * Отклонить приглашение
 */
export async function rejectInvitation(invitationId: string) {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;

  const invite = await prisma.teamInvitation.findUnique({
    where: { id: invitationId },
  });

  if (!invite || invite.email !== userEmail) throw new Error("Доступ запрещен");

  await prisma.teamInvitation.delete({ where: { id: invitationId } });
  revalidatePath("/settings/team");
}

/**
 * Получить список команд пользователя
 */
export async function getUserTeams() {
  noStore();
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return [];

  const members = await prisma.teamMember.findMany({
    where: { userId },
    include: { team: true },
  });

  return members.map((m) => ({
    id: m.team.id,
    name: m.team.name,
    role: m.role,
  }));
}

/**
 * Переключить активную команду (БЕЗОПАСНО)
 */
export async function switchActiveTeam(teamId: string) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error("Не авторизован");

  // ПРОВЕРКА: Нельзя переключиться на команду, в которой не состоишь
  const membership = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId, teamId } },
  });

  if (!membership) throw new Error("Вы не являетесь участником этой команды");

  await prisma.user.update({
    where: { id: userId },
    data: { activeTeamId: teamId },
  });

  revalidatePath("/", "layout");
}

/**
 * Переименовать команду
 */
export async function renameTeam(formData: FormData) {
  const { teamId } = await getAuthenticatedAccess(true); // Только Owner

  const name = formData.get("name") as string;
  const validated = teamNameSchema.parse(name);

  await prisma.team.update({
    where: { id: teamId },
    data: { name: validated.trim() },
  });

  revalidatePath("/", "layout");
}

/**
 * Удалить участника (Только для Owner)
 */
export async function removeMember(formData: FormData) {
  const { teamId, userId: currentUserId } = await getAuthenticatedAccess(true);
  const targetUserId = formData.get("userId") as string;

  if (targetUserId === currentUserId)
    throw new Error("Нельзя удалить самого себя");

  await prisma.$transaction([
    // Удаляем из участников
    prisma.teamMember.delete({
      where: { userId_teamId: { userId: targetUserId, teamId } },
    }),
    // Сбрасываем активную команду удаленному юзеру
    prisma.user.updateMany({
      where: { id: targetUserId, activeTeamId: teamId },
      data: { activeTeamId: null },
    }),
  ]);

  revalidatePath("/settings/team");
}

/**
 * Покинуть команду
 */
export async function leaveTeam() {
  const { userId, teamId, userRole } = await getAuthenticatedAccess();

  if (userRole === "OWNER") {
    throw new Error(
      "Владелец не может покинуть команду. Удалите её или передайте права.",
    );
  }

  await prisma.$transaction([
    prisma.teamMember.delete({
      where: { userId_teamId: { userId, teamId } },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { activeTeamId: null },
    }),
  ]);

  revalidatePath("/", "layout");
}

/**
 * УДАЛИТЬ КОМАНДУ (Полная очистка данных)
 */
export async function deleteTeam() {
  const { teamId, userId } = await getAuthenticatedAccess(true); // Только Owner

  // Атомарное удаление всех связанных данных
  await prisma.$transaction([
    prisma.task.deleteMany({ where: { teamId } }),
    prisma.transaction.deleteMany({ where: { teamId } }),
    prisma.counterparty.deleteMany({ where: { teamId } }),
    prisma.boardColumn.deleteMany({ where: { teamId } }),
    prisma.teamInvitation.deleteMany({ where: { teamId } }),
    prisma.teamMember.deleteMany({ where: { teamId } }),
    prisma.team.delete({ where: { id: teamId } }),
    prisma.user.update({
      where: { id: userId },
      data: { activeTeamId: null },
    }),
  ]);

  revalidatePath("/", "layout");
}

/**
 * Изменить роль участника
 */
export async function changeMemberRole(targetUserId: string, newRole: string) {
  const { teamId, userId: currentUserId } = await getAuthenticatedAccess(true);

  if (targetUserId === currentUserId)
    throw new Error("Нельзя менять роль самому себе");

  await prisma.teamMember.update({
    where: { userId_teamId: { userId: targetUserId, teamId } },
    data: { role: newRole as any },
  });

  revalidatePath("/settings/team");
}
