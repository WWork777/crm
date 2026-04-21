"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";

// Схема валидации задачи
const TaskSchema = z.object({
  title: z
    .string()
    .min(1, "Название обязательно")
    .max(100, "Слишком длинное название"),
  description: z.string().max(1000, "Описание слишком длинное").optional(),
  status: z.string().min(1, "Статус обязателен"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  dueDate: z.string().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
});

/**
 * Вспомогательная функция для проверки доступа.
 * Теперь она возвращает всё необходимое для любого экшена.
 */
export async function getTeamAccess() {
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

export async function getTasks() {
  try {
    const { teamId } = await getTeamAccess();
    return await prisma.task.findMany({
      where: { teamId },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("getTasks error:", error);
    return [];
  }
}

export async function addTask(formData: FormData) {
  const { teamId } = await getTeamAccess();
  const boardId = formData.get("boardId") as string; // Получаем из скрытого поля формы

  if (!boardId) throw new Error("Не указана доска для задачи");

  const validated = TaskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    status: formData.get("columnId"), // ID колонки
    priority: formData.get("priority"),
    dueDate: formData.get("dueDate"),
    assigneeId: formData.get("assigneeId"),
  });

  if (!validated.success) {
    throw new Error(validated.error.issues[0].message);
  }

  const { title, description, status, priority, dueDate, assigneeId } =
    validated.data;

  await prisma.task.create({
    data: {
      title,
      description: description || "",
      status, // Это ID колонки
      teamId,
      boardId, // ОБЯЗАТЕЛЬНОЕ ПОЛЕ ТЕПЕРЬ
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      assigneeId: assigneeId || null,
    },
  });

  revalidatePath("/tasks");
}

export async function updateTaskStatus(taskId: string, newStatus: string) {
  const { teamId } = await getTeamAccess();

  await prisma.task.updateMany({
    where: { id: taskId, teamId },
    data: { status: newStatus },
  });

  revalidatePath("/tasks");
}

export async function updateTaskDetails(taskId: string, formData: FormData) {
  const { teamId } = await getTeamAccess();

  const validated = TaskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    status: formData.get("columnId"),
    priority: formData.get("priority"),
    dueDate: formData.get("dueDate"),
    assigneeId: formData.get("assigneeId"),
  });

  if (!validated.success) {
    throw new Error(validated.error.issues[0].message);
  }

  const { title, description, status, priority, dueDate, assigneeId } =
    validated.data;

  const result = await prisma.task.updateMany({
    where: { id: taskId, teamId },
    data: {
      title,
      description: description || "",
      status,
      priority, // <--- Добавили обновление приоритета
      assigneeId: assigneeId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });

  if (result.count === 0)
    throw new Error("Задача не найдена или доступ запрещен");

  revalidatePath("/tasks");
}

export async function deleteTask(taskId: string) {
  const { teamId, role } = await getTeamAccess();

  if (role !== "OWNER") {
    throw new Error("Только владелец команды может удалять задачи");
  }

  await prisma.task.deleteMany({
    where: { id: taskId, teamId },
  });

  revalidatePath("/tasks");
}

/**
 * Колонки доски
 */

export async function getColumns(boardId: string) {
  // ИСПРАВЛЕНО: заменено getAuth на getTeamAccess
  const { teamId } = await getTeamAccess();

  const columns = await prisma.boardColumn.findMany({
    where: {
      boardId: boardId,
      teamId: teamId,
    },
    orderBy: { order: "asc" },
  });

  if (columns.length === 0) {
    await prisma.boardColumn.createMany({
      data: [
        { title: "К выполнению", order: 0, teamId, boardId },
        { title: "В работе", order: 1, teamId, boardId },
        { title: "Готово", order: 2, teamId, boardId },
      ],
    });

    return await prisma.boardColumn.findMany({
      where: { boardId, teamId },
      orderBy: { order: "asc" },
    });
  }

  return columns;
}

export async function addColumn(formData: FormData) {
  const { teamId } = await getTeamAccess();
  const titleValue = formData.get("title");
  const boardId = formData.get("boardId") as string; // ДОБАВЛЕНО: получаем boardId из формы

  if (!boardId) throw new Error("ID доски отсутствует");
  if (typeof titleValue !== "string" || !titleValue.trim()) {
    throw new Error("Название колонки обязательно");
  }

  const title = titleValue.trim();
  const count = await prisma.boardColumn.count({
    where: { teamId, boardId }, // ИСПРАВЛЕНО: считаем колонки конкретной доски
  });

  await prisma.boardColumn.create({
    data: {
      title,
      order: count,
      teamId,
      boardId, // ДОБАВЛЕНО: обязательно для новой схемы
    },
  });

  revalidatePath("/tasks");
}

export async function deleteColumn(columnId: string) {
  const { teamId, role } = await getTeamAccess();
  if (role !== "OWNER") throw new Error("Доступ запрещен");

  // Транзакция: сначала задачи этой колонки, потом саму колонку
  await prisma.$transaction([
    prisma.task.deleteMany({ where: { status: columnId, teamId } }),
    prisma.boardColumn.deleteMany({ where: { id: columnId, teamId } }),
  ]);

  revalidatePath("/tasks");
}
export async function updateColumnsOrder(columnIds: string[]) {
  const { teamId } = await getTeamAccess();

  // Обновляем индексы всех колонок в одной транзакции
  await prisma.$transaction(
    columnIds.map((id, index) =>
      prisma.boardColumn.updateMany({
        where: { id, teamId },
        data: { order: index },
      }),
    ),
  );

  revalidatePath("/tasks");
}
export async function createBoard(name: string) {
  const { teamId } = await getTeamAccess();

  const board = await prisma.board.create({
    data: { name, teamId },
  });

  // Авто-создание колонок для новой доски
  await prisma.boardColumn.createMany({
    data: [
      { title: "Нужно сделать", order: 0, boardId: board.id, teamId },
      { title: "В работе", order: 1, boardId: board.id, teamId },
      { title: "Готово", order: 2, boardId: board.id, teamId },
    ],
  });

  revalidatePath("/tasks");
  return board;
}

export async function getBoards() {
  const { teamId } = await getTeamAccess();
  let boards = await prisma.board.findMany({
    where: { teamId },
    orderBy: { createdAt: "asc" },
  });

  // Если досок вообще нет, создаем "Общее"
  if (boards.length === 0) {
    const defaultBoard = await createBoard("Общее");
    return [defaultBoard];
  }

  return boards;
}
