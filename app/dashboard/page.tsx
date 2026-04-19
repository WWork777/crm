// app/dashboard/page.tsx
export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getTransactions } from "../actions";

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
  ArrowUpRight,
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
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const teamId = (session.user as any).activeTeamId;
  const userRole = (session.user as any).role;
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

  const transactions = await getTransactions(month, type, category, teamId);

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
    <div className="min-h-screen bg-[#030712] text-slate-400 p-4 sm:p-10 font-sans">
      <div className="max-w-8xl mx-auto space-y-10">
        {/* ХЕДЕР В СТИЛЕ HUB */}
        <header className="flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
              Финансовый модуль
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">
              Управление{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                капиталом
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-[#0f172a]/50 p-1.5 rounded-2xl border border-white/5 shadow-inner shrink-0">
              <ViewLink
                href="table"
                active={view === "table"}
                icon={<LayoutList size={18} />}
                label="Список"
                searchParams={searchParams}
              />
              <ViewLink
                href="charts"
                active={view === "charts"}
                icon={<BarChart3 size={18} />}
                label="Аналитика"
                searchParams={searchParams}
              />
              <ViewLink
                href="calendar"
                active={view === "calendar"}
                icon={<CalendarIcon size={18} />}
                label="Календарь"
                searchParams={searchParams}
              />
            </div>
            <AddTransactionModal />
          </div>
        </header>

        {/* ФИЛЬТРЫ */}
        <div className="bg-[#0f172a]/30 p-4 rounded-[2rem] border border-white/5 flex flex-wrap items-center justify-between gap-4">
          <DashboardFilters />
          <div className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">
            Записей в выборке: {transactions.length}
          </div>
        </div>

        {/* СТАТИСТИКА */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Чистая прибыль"
            value={netProfit}
            color="indigo"
            icon={<Wallet size={24} />}
            trend={true}
          />
          <StatCard
            title="Ожидаемые транзакции"
            value={totalPending}
            color="amber"
            icon={<TrendingUp size={24} />}
          />
          <StatCard
            title="Суммарные расходы"
            value={totalExpense}
            color="rose"
            icon={<TrendingDown size={24} />}
          />
        </div>

        {/* ОСНОВНОЙ КОНТЕНТ */}
        <main className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {view === "calendar" ? (
            <div className="bg-[#0f172a]/30 border border-white/5 rounded-[3rem] p-6 sm:p-10">
              <CalendarView transactions={transactions} currentMonth={month} />
            </div>
          ) : view === "charts" ? (
            <section className="bg-[#0f172a]/30 border border-white/5 p-8 rounded-[3rem]">
              <div className="flex items-center gap-3 mb-10">
                <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                  <BarChart3 size={20} />
                </div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  Аналитический отчет
                </h2>
              </div>
              <FinanceCharts transactions={transactions} />
            </section>
          ) : (
            <div className="bg-[#0f172a]/30 rounded-[3rem] border border-white/5 overflow-hidden">
              <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <CreditCard className="text-slate-500" size={20} />
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    История операций
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-600">
                  <Users size={12} /> Team ID: {teamId?.slice(-6)}
                </div>
              </div>

              {transactions.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-slate-500 text-[10px] uppercase font-black tracking-[0.2em] bg-white/[0.01] border-b border-white/5">
                        <th className="px-10 py-6">Дата</th>
                        <th className="px-10 py-6">Категория</th>
                        <th className="px-10 py-6">Контрагент</th>
                        <th className="px-10 py-6">Описание</th>
                        <th className="px-10 py-6 text-center">Статус</th>
                        <th className="px-10 py-6 text-right">Сумма</th>
                        <th className="px-10 py-6"></th>
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
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${
        active
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
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
    <div className="bg-[#0f172a]/50 p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all">
      <div
        className={`absolute -top-4 -right-4 p-10 opacity-5 group-hover:opacity-10 transition-opacity ${colorMap[color]}`}
      >
        {icon}
      </div>
      <div className="flex items-center gap-2 mb-4">
        <div
          className={`w-2 h-2 rounded-full ${color === "indigo" ? "bg-indigo-500" : color === "amber" ? "bg-amber-500" : "bg-rose-500"}`}
        />
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
          {title}
        </h3>
      </div>
      <p className="text-4xl font-black text-white tracking-tighter">
        {value.toLocaleString("ru-RU")}
        <span className="text-xl font-medium text-slate-600 ml-2">₽</span>
      </p>
      {trend && (
        <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
          <TrendingUp size={12} /> Активный баланс
        </div>
      )}
    </div>
  );
}

function TransactionRow({ tx, userRole }: { tx: any; userRole: string }) {
  const isOwner = userRole === "OWNER";

  return (
    <tr className="hover:bg-white/[0.02] transition-all duration-150 group">
      <td className="px-10 py-7 text-xs text-slate-500 font-bold uppercase tracking-tighter">
        {new Date(tx.date).toLocaleDateString("ru-RU", {
          day: "2-digit",
          month: "short",
        })}
      </td>
      <td className="px-10 py-7">
        <div className="text-[10px] text-indigo-400 font-black uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg inline-block">
          {tx.category || "General"}
        </div>
      </td>
      <td className="px-10 py-7 text-sm text-slate-300 font-bold max-w-[150px] truncate">
        {tx.counterparty || "—"}
      </td>
      <td className="px-10 py-7 text-xs text-slate-500 max-w-[200px] truncate italic">
        {tx.description || "—"}
      </td>
      <td className="px-10 py-7 text-center">
        {isOwner ? (
          <ToggleStatusButton id={tx.id} status={tx.status} />
        ) : (
          <span
            className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
              tx.status === "paid"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-amber-500/10 border-amber-500/20 text-amber-400"
            }`}
          >
            {tx.status === "paid" ? "Оплачено" : "Ожидается"}
          </span>
        )}
      </td>
      <td
        className={`px-10 py-7 text-right font-black tracking-tighter text-xl ${tx.type === "expense" ? "text-rose-500" : "text-emerald-400"}`}
      >
        {tx.type === "expense" ? "− " : "+ "}
        {Math.abs(tx.amount).toLocaleString("ru-RU")}
      </td>
      <td className="px-10 py-7">
        {isOwner && (
          <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <EditTransactionModal transaction={tx} />
            <DeleteTransactionButton id={tx.id} />
          </div>
        )}
      </td>
    </tr>
  );
}

function EmptyState() {
  return (
    <div className="py-24 flex flex-col items-center justify-center text-slate-600">
      <div className="bg-white/5 p-10 rounded-[3rem] mb-6 border border-white/5">
        <Wallet size={48} className="opacity-20 text-indigo-500" />
      </div>
      <p className="text-xl font-black text-slate-400">Пустая область данных</p>
      <p className="text-sm mt-2 font-medium opacity-50">
        Начните учет, добавив первую транзакцию команды
      </p>
    </div>
  );
}
