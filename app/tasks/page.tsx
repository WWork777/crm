export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getTasks, getColumns } from "@/app/actions/tasks";
import KanbanBoard from "@/components/tasks/KanbanBoard";
import { LayoutDashboard, Sparkles, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function TasksPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const searchParams = await props.searchParams;

  // Безопасно извлекаем данные пользователя
  const teamId = (session.user as any).activeTeamId;
  const userRole = (session.user as any).role || "MEMBER";

  // Если у пользователя нет активной команды, отправляем в настройки или на главную
  if (!teamId) redirect("/");

  // Гарантируем строковые типы для TS
  const view = (
    typeof searchParams.view === "string" ? searchParams.view : "board"
  ) as string;

  // Параллельная загрузка данных (ускоряет страницу)
  const [columns, initialTasks, teamMembers] = await Promise.all([
    getColumns(),
    getTasks(),
    prisma.teamMember.findMany({
      where: { teamId },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
  ]);

  return (
    /* h-screen и overflow-hidden блокируют прокрутку всего окна */
    <div className="h-screen bg-[#030712] text-slate-400 flex flex-col overflow-hidden font-sans relative">
      {/* Атмосферные свечения (на заднем фоне) */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-600/5 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Обертка с min-w-0 для контроля ширины */}
      <div className="flex-1 flex flex-col min-w-0 w-full max-w-[1600px] mx-auto p-4 sm:p-10 space-y-8 overflow-hidden z-10">
        {/* ХЕДЕР */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 shrink-0">
          <div className="flex items-center gap-5">
            <div className="bg-indigo-500/10 border border-indigo-500/20 p-3.5 rounded-2xl text-indigo-400 shadow-lg shadow-indigo-500/5">
              <LayoutDashboard size={28} />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-[0.2em]">
                <Sparkles size={10} /> Workflow active
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight leading-none">
                Рабочая{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                  область
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-[#0f172a]/30 px-6 py-3 rounded-2xl border border-white/5 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-slate-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Команда: {teamMembers.length}
              </span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
              {userRole} ACCESS
            </div>
          </div>
        </header>

        {/* ОСНОВНОЙ КОНТЕНТ (min-w-0 обязателен для скролла) */}
        <main className="flex-1 min-w-0 w-full overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
          <KanbanBoard
            initialTasks={initialTasks}
            initialColumns={columns}
            userRole={userRole}
            teamMembers={teamMembers}
          />
        </main>
      </div>
    </div>
  );
}
