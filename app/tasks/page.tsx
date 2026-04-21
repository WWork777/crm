export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getColumns, getBoards } from "@/app/actions/tasks";
import KanbanBoard from "@/components/tasks/KanbanBoard";
import BoardTabs from "@/components/tasks/BoardTabs";
import { LayoutDashboard, Sparkles, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function TasksPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const searchParams = await props.searchParams;
  const teamId = (session.user as any).activeTeamId;
  const userRole = (session.user as any).role || "MEMBER";

  if (!teamId) redirect("/");

  // 1. Сначала получаем все доски
  const boards = await getBoards();

  // 2. Определяем активную доску
  const activeBoardId = (
    typeof searchParams.boardId === "string"
      ? searchParams.boardId
      : boards[0]?.id
  ) as string;

  // 3. Загружаем данные только для этой доски
  const [columns, tasks, teamMembers] = await Promise.all([
    getColumns(activeBoardId), // Передаем ID
    prisma.task.findMany({
      where: { boardId: activeBoardId, teamId },
      include: { assignee: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.teamMember.findMany({
      where: { teamId },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
  ]);

  return (
    <div className="h-screen bg-[#030712] text-slate-400 flex flex-col overflow-hidden font-sans relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="flex-1 flex flex-col min-w-0 w-full max-w-[1600px] mx-auto p-4 sm:p-10 space-y-8 overflow-hidden z-10">
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 shrink-0">
          <div className="flex items-center gap-5">
            <div className="bg-indigo-500/10 border border-indigo-500/20 p-3.5 rounded-2xl text-indigo-400">
              <LayoutDashboard size={28} />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-white tracking-tight">
                Рабочая область
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-[#0f172a]/30 px-6 py-3 rounded-2xl border border-white/5 backdrop-blur-md">
            <Users size={16} className="text-slate-500" />
            <span className="text-[10px] font-black uppercase text-slate-400">
              Команда: {teamMembers.length}
            </span>
          </div>
        </header>

        {/* Навигация по доскам */}
        <BoardTabs boards={boards} activeBoardId={activeBoardId} />

        <main className="flex-1 min-w-0 w-full overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
          <KanbanBoard
            initialTasks={tasks as any}
            initialColumns={columns}
            userRole={userRole}
            teamMembers={teamMembers}
            activeBoardId={activeBoardId} // Обязательно передаем!
          />
        </main>
      </div>
    </div>
  );
}
