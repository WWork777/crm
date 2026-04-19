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
    <div className="min-h-screen bg-[#030712] text-slate-400 p-6 sm:p-10">
      <div className="max-w-8xl mx-auto space-y-12">
        {/* ХЕДЕР С ГРАДИЕНТОМ */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
              Система активна
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">
              Обзор{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                команды
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm font-bold text-slate-500">
            <div className="flex items-center gap-2">
              <Users size={16} /> {membersCount} участников
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-700" />
            <div className="flex items-center gap-2">
              <Calendar size={16} /> {new Date().toLocaleDateString("ru-RU")}
            </div>
          </div>
        </header>

        {/* СЕТКА ГЛАВНЫХ ВИДЖЕТОВ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Финансовый виджет */}
          <div className="md:col-span-2 bg-[#0f172a]/50 border border-white/5 rounded-[2rem] p-8 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden group">
            <div className="relative z-10 space-y-4 text-center md:text-left">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Ожидаемые транзакции
              </p>
              <h3 className="text-5xl font-black text-white tracking-tighter">
                {totalPending.toLocaleString()}{" "}
                <span className="text-xl text-slate-600">₽</span>
              </h3>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-xs font-black text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest pt-2"
              >
                Открыть дашборд <ArrowRight size={14} />
              </Link>
            </div>
            {/* Маленький график-заглушка для красоты */}
            <div className="relative z-10 flex gap-1 items-end h-20">
              {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="w-2 bg-indigo-500/20 rounded-full group-hover:bg-indigo-500/40 transition-all"
                />
              ))}
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl" />
          </div>

          {/* Виджет быстрой статистики */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] p-8 text-white flex flex-col justify-between">
            <TrendingUp size={32} className="opacity-50" />
            <div className="space-y-1">
              <p className="text-4xl font-black tracking-tighter">
                {tasks.length}
              </p>
              <p className="text-xs font-bold opacity-70 uppercase tracking-wider">
                Задач в работе
              </p>
            </div>
          </div>
        </div>

        {/* СЕКЦИИ КОНТЕНТА */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Блок: Ближайшие дедлайны */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Clock size={16} className="text-indigo-500" /> Дедлайны
              </h2>
              <Link
                href="/tasks"
                className="p-2 bg-white/5 rounded-full text-slate-500 hover:text-white transition-colors"
              >
                <LayoutGrid size={16} />
              </Link>
            </div>

            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-[#0f172a]/30 border border-white/5 p-5 rounded-2xl flex items-center justify-between group hover:border-white/10 transition-all"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-200">
                      {task.title}
                    </p>
                    <p className="text-[10px] font-medium text-slate-500 italic">
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : "Дата не установлена"}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center text-slate-600 group-hover:text-indigo-500 group-hover:border-indigo-500/30 transition-all">
                    <CheckCircle2 size={16} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Блок: Ожидаемые оплаты */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <CreditCard size={16} className="text-emerald-500" /> Ожидаем
              </h2>
              <Link
                href="/dashboard"
                className="p-2 bg-white/5 rounded-full text-slate-500 hover:text-white transition-colors"
              >
                <TrendingUp size={16} />
              </Link>
            </div>

            <div className="space-y-4">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="bg-[#0f172a]/30 border border-white/5 p-5 rounded-2xl flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-200">
                      {payment.counterparty || "Транзакция"}
                    </p>
                    <p className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-tighter">
                      {payment.category}
                    </p>
                  </div>
                  <p className="text-sm font-black text-white tracking-tight">
                    {payment.type === "expense" ? "-" : "+"}{" "}
                    {payment.amount.toLocaleString()}{" "}
                    <span className="text-[10px] text-slate-600">₽</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
