// app/dashboard/page.tsx
export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getTransactions } from "../actions";
import { prisma } from "@/lib/prisma";

import EditTransactionModal from "@/components/EditTransactionModal";
import AddTransactionModal from "@/components/AddTransactionModal";
import DashboardFilters from "@/components/DashboardFilters";
import CalendarView from "@/components/CalendarView";
import FinanceCharts from "@/components/FinanceCharts";
import DeleteTransactionButton from "@/components/DeleteTransactionButton";
import ToggleStatusButton from "@/components/ToggleStatusButton";

import {
  Wallet,
  TrendingUp,
  TrendingDown,
  CreditCard,
  LayoutList,
  Calendar as CalendarIcon,
  Users,
  BarChart3,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default async function Dashboard(props: {
  searchParams: Promise<{
    month?: string;
    type?: string;
    category?: string;
    view?: string;
  }>;
}) {
  // 1. ПРОВЕРКА СЕССИИ
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const teamId = (session.user as any).activeTeamId;
  const userRole = (session.user as any).role || "MEMBER";

  if (!teamId) redirect("/");

  // 2. ОБРАБОТКА ПАРАМЕТРОВ (Next.js 15+)
  const searchParams = await props.searchParams;
  const month = (
    typeof searchParams.month === "string"
      ? searchParams.month
      : new Date().toISOString().slice(0, 7)
  ) as string;
  const type =
    typeof searchParams.type === "string" ? searchParams.type : undefined;
  const category =
    typeof searchParams.category === "string"
      ? searchParams.category
      : undefined;
  const view =
    typeof searchParams.view === "string" ? searchParams.view : "table";

  // 3. ЗАГРУЗКА ДАННЫХ (Транзакции + Контрагенты)
  const [transactions, counterparties] = await Promise.all([
    getTransactions(month, type, category, teamId),
    prisma.counterparty.findMany({
      where: { teamId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  // 4. РАСЧЕТ ПОКАЗАТЕЛЕЙ
  const totalIncome = transactions
    .filter((t) => t.type === "income" && t.status === "paid")
    .reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense" && t.status === "paid")
    .reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

  const totalPending = transactions
    .filter((t) => t.status === "pending")
    .reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

  const netProfit = totalIncome - totalExpense;

  return (
    <div className="min-h-screen bg-[#030712] text-slate-400 p-4 sm:p-10 font-sans relative overflow-hidden">
      {/* Световые эффекты */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="max-w-[1600px] mx-auto space-y-6 relative z-10">
        {/* ХЕДЕР */}
        <header className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-[#0f172a]/40 p-6 rounded-[2rem] border border-white/5 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-2xl text-indigo-400">
              <Wallet size={24} />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-[0.2em]">
                <Sparkles size={10} /> Финансовый модуль
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight leading-none">
                Управление{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                  капиталом
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* ТАБЫ ПЕРЕКЛЮЧЕНИЯ ВИДА */}
            <div className="flex bg-[#0f172a]/50 p-1 rounded-xl border border-white/5 shadow-inner shrink-0">
              <ViewLink
                href="table"
                active={view === "table"}
                icon={<LayoutList size={14} />}
                label="Список"
                searchParams={searchParams}
              />
              <ViewLink
                href="charts"
                active={view === "charts"}
                icon={<BarChart3 size={14} />}
                label="Аналитика"
                searchParams={searchParams}
              />
              <ViewLink
                href="calendar"
                active={view === "calendar"}
                icon={<CalendarIcon size={14} />}
                label="Календарь"
                searchParams={searchParams}
              />
            </div>

            {/* МОДАЛКА С ПЕРЕДАЧЕЙ КОНТРАГЕНТОВ */}
            <AddTransactionModal counterparties={counterparties} />
          </div>
        </header>

        {/* ФИЛЬТРЫ */}
        <div className="relative z-50 bg-[#0f172a]/40 p-3 rounded-2xl border border-white/5 flex flex-wrap items-center justify-between gap-4 backdrop-blur-sm">
          <DashboardFilters />
          <div className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Записей в периоде: {transactions.length}
          </div>
        </div>

        {/* КАРТОЧКИ СТАТИСТИКИ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard
            title="Чистая прибыль"
            value={netProfit}
            color="indigo"
            icon={<Wallet size={20} />}
            trend={true}
          />
          <StatCard
            title="Ожидается к оплате"
            value={totalPending}
            color="amber"
            icon={<TrendingUp size={20} />}
          />
          <StatCard
            title="Суммарные расходы"
            value={totalExpense}
            color="rose"
            icon={<TrendingDown size={20} />}
          />
        </div>

        {/* ОСНОВНОЙ КОНТЕНТ */}
        <main className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {view === "calendar" ? (
            <div className="bg-[#0f172a]/40 border border-white/5 rounded-[2rem] p-6 backdrop-blur-sm">
              <CalendarView transactions={transactions} currentMonth={month} />
            </div>
          ) : view === "charts" ? (
            <section className="bg-[#0f172a]/40 border border-white/5 p-6 rounded-[2rem] backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                  <BarChart3 size={16} />
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Аналитический отчет
                </h2>
              </div>
              <FinanceCharts transactions={transactions} />
            </section>
          ) : (
            <div className="bg-[#0f172a]/40 rounded-[2rem] border border-white/5 overflow-hidden backdrop-blur-sm">
              <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <CreditCard className="text-slate-500" size={16} />
                  <h2 className="text-sm font-bold text-white tracking-tight">
                    История операций
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <Users size={12} /> ID команды: {teamId?.slice(-6)}
                </div>
              </div>

              {transactions.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse min-w-max">
                    <thead>
                      <tr className="text-slate-500 text-[9px] uppercase font-black tracking-[0.2em] bg-white/[0.01] border-b border-white/5">
                        <th className="px-6 py-4">Дата</th>
                        <th className="px-6 py-4">Категория</th>
                        <th className="px-6 py-4">Контрагент</th>
                        <th className="px-6 py-4">Описание</th>
                        <th className="px-6 py-4 text-center">Статус</th>
                        <th className="px-6 py-4 text-right">Сумма</th>
                        <th className="px-6 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {transactions.map((tx) => (
                        <TransactionRow
                          key={tx.id}
                          tx={tx}
                          userRole={userRole}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// --- ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ ---

function ViewLink({ href, active, icon, label, searchParams }: any) {
  return (
    <Link
      href={`?${new URLSearchParams({ ...searchParams, view: href }).toString()}`}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black transition-all uppercase tracking-widest ${
        active
          ? "bg-indigo-600/90 text-white shadow-lg shadow-indigo-500/20"
          : "text-slate-500 hover:text-slate-300"
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}

function StatCard({ title, value, color, icon, trend }: any) {
  const colorMap: any = {
    indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    rose: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  };

  return (
    <div className="bg-[#0f172a]/50 p-5 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all backdrop-blur-sm">
      <div
        className={`absolute -top-6 -right-6 p-8 opacity-5 group-hover:opacity-10 transition-opacity ${colorMap[color]} rounded-full`}
      >
        {icon}
      </div>
      <div className="flex items-center gap-2 mb-3">
        <div
          className={`w-1.5 h-1.5 rounded-full ${color === "indigo" ? "bg-indigo-500" : color === "amber" ? "bg-amber-500" : "bg-rose-500"}`}
        />
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          {title}
        </h3>
      </div>
      <p className="text-2xl font-black text-white tracking-tight">
        {value.toLocaleString("ru-RU")}
        <span className="text-sm font-medium text-slate-600 ml-1.5">₽</span>
      </p>
      {trend && (
        <div className="mt-2.5 flex items-center gap-1.5 text-[9px] font-bold text-emerald-400 uppercase tracking-widest">
          <TrendingUp size={10} /> Положительный баланс
        </div>
      )}
    </div>
  );
}

function TransactionRow({ tx, userRole }: { tx: any; userRole: string }) {
  const isOwner = userRole === "OWNER";

  return (
    <tr className="hover:bg-white/[0.02] transition-colors duration-150 group">
      <td className="px-6 py-4 text-[11px] text-slate-400 font-bold uppercase tracking-tighter">
        {new Date(tx.date).toLocaleDateString("ru-RU", {
          day: "2-digit",
          month: "short",
        })}
      </td>
      <td className="px-6 py-4">
        <div className="text-[9px] text-indigo-400 font-black uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md inline-block">
          {tx.category || "Прочее"}
        </div>
      </td>
      <td className="px-6 py-4 text-xs text-slate-300 font-bold max-w-[150px] truncate">
        {tx.counterparty || "—"}
      </td>
      <td className="px-6 py-4 text-[11px] text-slate-500 max-w-[200px] truncate italic">
        {tx.description || "—"}
      </td>
      <td className="px-6 py-4 text-center">
        {isOwner ? (
          <ToggleStatusButton id={tx.id} status={tx.status} />
        ) : (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${tx.status === "paid" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"}`}
          >
            {tx.status === "paid" ? "Оплачено" : "Ожидается"}
          </span>
        )}
      </td>
      <td
        className={`px-6 py-4 text-right font-black tracking-tight text-[15px] ${tx.type === "expense" ? "text-rose-400" : "text-emerald-400"}`}
      >
        {tx.type === "expense" ? "− " : "+ "}
        {Math.abs(tx.amount).toLocaleString("ru-RU")}
      </td>
      <td className="px-6 py-4 w-10 text-right">
        <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <EditTransactionModal transaction={tx} />
          {isOwner && <DeleteTransactionButton id={tx.id} />}
        </div>
      </td>
    </tr>
  );
}

function EmptyState() {
  return (
    <div className="py-20 flex flex-col items-center justify-center text-slate-600">
      <div className="bg-white/5 p-6 rounded-3xl mb-4 border border-white/5">
        <Wallet size={32} className="opacity-20 text-indigo-500" />
      </div>
      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
        Записей не найдено
      </p>
      <p className="text-[11px] mt-2 font-medium opacity-50 uppercase">
        Попробуйте изменить фильтры или добавьте новую запись
      </p>
    </div>
  );
}
