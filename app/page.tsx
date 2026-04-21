// app/page.tsx
export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  CreditCard,
  Clock,
  TrendingUp,
  LayoutGrid,
  Users,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const teamId = (session.user as any).activeTeamId;

  const [tasks, payments, membersCount] = await Promise.all([
    prisma.task.findMany({
      where: { teamId, NOT: { status: { contains: "DONE" } } },
      orderBy: { dueDate: "asc" },
      take: 4,
    }),
    prisma.transaction.findMany({
      where: { teamId, status: "pending" },
      orderBy: { date: "asc" },
      take: 4,
    }),
    prisma.teamMember.count({ where: { teamId } }),
  ]);

  const totalPending = payments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-400 p-4 sm:p-10 font-sans relative overflow-hidden">
      {/* Атмосферные свечения на фоне */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-cyan-600/5 rounded-full blur-[100px] pointer-events-none z-0" />

      <div className="max-w-[1600px] mx-auto space-y-6 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* ХЕДЕР */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#0f172a]/40 p-6 rounded-[2rem] border border-white/5 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-2xl text-indigo-400">
              <LayoutGrid size={24} />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-[0.2em]">
                <Sparkles size={10} /> Система активна
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight leading-none">
                Обзор{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                  команды
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-[#0f172a]/50 px-5 py-2.5 rounded-2xl border border-white/5 shadow-inner shrink-0">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <Users size={14} className="text-slate-500" /> {membersCount}{" "}
              участников
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <Calendar size={14} className="text-slate-500" />{" "}
              {new Date().toLocaleDateString("ru-RU")}
            </div>
          </div>
        </header>

        {/* СЕТКА ГЛАВНЫХ ВИДЖЕТОВ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Финансовый виджет (Большой) */}
          <div className="md:col-span-2 bg-[#0f172a]/40 border border-white/5 rounded-[2rem] p-6 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden group hover:border-white/10 transition-all backdrop-blur-sm">
            <div className="relative z-10 space-y-3 text-center md:text-left w-full md:w-auto">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Ожидаемые транзакции
                </p>
              </div>
              <h3 className="text-4xl font-black text-white tracking-tighter">
                {totalPending.toLocaleString("ru-RU")}{" "}
                <span className="text-xl text-slate-600 font-medium">₽</span>
              </h3>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-[10px] font-black text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest pt-2"
              >
                Открыть дашборд <ArrowRight size={12} />
              </Link>
            </div>

            {/* График-заглушка */}
            <div className="relative z-10 flex gap-1.5 items-end h-16 opacity-80">
              {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="w-2.5 bg-indigo-500/20 rounded-full group-hover:bg-indigo-500/40 transition-all duration-300"
                />
              ))}
            </div>

            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-600/5 rounded-full blur-3xl" />
          </div>

          {/* Виджет быстрой статистики (Малый) */}
          <div className="bg-[#0f172a]/40 border border-white/5 rounded-[2rem] p-6 flex flex-col justify-between relative overflow-hidden group hover:border-white/10 transition-all backdrop-blur-sm">
            <div className="absolute -top-6 -right-6 p-8 opacity-5 group-hover:opacity-10 transition-opacity text-violet-400 bg-violet-500/10 rounded-full border border-violet-500/20">
              <TrendingUp size={32} />
            </div>
            <div className="relative z-10 flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Задач в работе
              </p>
            </div>
            <p className="relative z-10 text-3xl font-black text-white tracking-tighter">
              {tasks.length}
            </p>
          </div>
        </div>

        {/* СЕКЦИИ КОНТЕНТА */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Секция: Ближайшие дедлайны */}
          <div className="bg-[#0f172a]/40 rounded-[2rem] border border-white/5 overflow-hidden backdrop-blur-sm flex flex-col">
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2.5">
                <Clock className="text-indigo-400" size={16} />
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Дедлайны
                </h2>
              </div>
              <Link
                href="/tasks"
                className="p-1.5 bg-white/5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all"
              >
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="p-4 space-y-2.5">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:border-white/10 hover:bg-white/[0.04] transition-all"
                >
                  <div className="space-y-1.5">
                    <p className="text-[13px] font-semibold text-slate-200 line-clamp-1 group-hover:text-white transition-colors">
                      {task.title}
                    </p>
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Calendar size={10} className="opacity-70" />
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString("ru-RU", {
                            day: "2-digit",
                            month: "short",
                          })
                        : "Не установлена"}
                    </p>
                  </div>
                  <div className="w-7 h-7 shrink-0 rounded-full border border-white/5 flex items-center justify-center text-slate-600 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all bg-[#0f172a]/50">
                    <CheckCircle2 size={14} />
                  </div>
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="text-center py-6 text-[11px] font-black uppercase tracking-widest text-slate-600">
                  Нет активных задач
                </div>
              )}
            </div>
          </div>

          {/* Секция: Ожидаемые оплаты */}
          <div className="bg-[#0f172a]/40 rounded-[2rem] border border-white/5 overflow-hidden backdrop-blur-sm flex flex-col">
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2.5">
                <CreditCard className="text-emerald-400" size={16} />
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Ожидаем оплату
                </h2>
              </div>
              <Link
                href="/dashboard"
                className="p-1.5 bg-white/5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all"
              >
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="p-4 space-y-2.5">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:border-white/10 hover:bg-white/[0.04] transition-all"
                >
                  <div className="space-y-1.5 max-w-[180px]">
                    <p className="text-[13px] font-semibold text-slate-200 truncate group-hover:text-white transition-colors">
                      {payment.counterparty || "Транзакция"}
                    </p>
                    <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                      {payment.category}
                    </div>
                  </div>
                  <p className="text-[15px] font-black text-white tracking-tight text-right shrink-0">
                    {payment.type === "expense" ? "− " : "+ "}
                    {payment.amount.toLocaleString("ru-RU")}
                    <span className="text-[10px] text-slate-600 ml-1">₽</span>
                  </p>
                </div>
              ))}
              {payments.length === 0 && (
                <div className="text-center py-6 text-[11px] font-black uppercase tracking-widest text-slate-600">
                  Нет ожидаемых оплат
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
