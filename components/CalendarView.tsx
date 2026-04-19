"use client";

import { Transaction } from "@prisma/client";
import {
  Wallet,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Target,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface CalendarViewProps {
  transactions: Transaction[];
  currentMonth: string;
}

export default function CalendarView({
  transactions,
  currentMonth,
}: CalendarViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const now = new Date();

  const [year, month] = (
    currentMonth ||
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  )
    .split("-")
    .map(Number);

  const monthDate = new Date(year, month - 1);
  const monthName = monthDate.toLocaleString("ru-RU", { month: "long" });

  const changeMonth = (offset: number) => {
    const newDate = new Date(year, month - 1 + offset, 1);
    const newMonthStr = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, "0")}`;
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", newMonthStr);
    router.push(`?${params.toString()}`);
  };

  const firstDayOfMonth = new Date(year, month - 1, 1);
  const lastDayOfMonth = new Date(year, month, 0);
  const startOffset = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = lastDayOfMonth.getDate();

  const transactionsByDay: Record<number, Transaction[]> = {};
  transactions.forEach((tx) => {
    const txDate = new Date(tx.date);
    if (txDate.getFullYear() === year && txDate.getMonth() + 1 === month) {
      const day = txDate.getDate();
      if (!transactionsByDay[day]) transactionsByDay[day] = [];
      transactionsByDay[day].push(tx);
    }
  });

  const totalCellsNeeded = startOffset + daysInMonth;
  const rowsNeeded = Math.ceil(totalCellsNeeded / 7);
  const days = Array.from({ length: rowsNeeded * 7 }, (_, i) => {
    const dayNumber = i - startOffset + 1;
    return dayNumber > 0 && dayNumber <= daysInMonth ? dayNumber : null;
  });

  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  return (
    <div className="bg-[#0f172a]/20 border border-white/5 rounded-[2.5rem] overflow-hidden animate-in fade-in duration-700 backdrop-blur-sm">
      {/* ПАНЕЛЬ НАВИГАЦИИ */}
      <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02] flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="flex bg-[#030712] rounded-2xl border border-white/5 p-1.5 shadow-xl">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-500 hover:text-white"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-500 hover:text-white"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-white capitalize tracking-tighter">
              {monthName}{" "}
              <span className="text-slate-600 font-medium">{year}</span>
            </h2>
          </div>
        </div>

        {/* ЛЕГЕНДА */}
        <div className="flex items-center gap-6">
          <div className="flex gap-4 text-[10px] font-black uppercase tracking-[0.15em]">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <span className="text-slate-500">Доходы</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
              <span className="text-slate-500">Расходы</span>
            </div>
          </div>

          <button
            onClick={() => {
              const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
              const params = new URLSearchParams(searchParams.toString());
              params.set("month", todayStr);
              router.push(`?${params.toString()}`);
            }}
            className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-indigo-500/20 transition-all"
          >
            Сегодня
          </button>
        </div>
      </div>

      {/* ШАПКА НЕДЕЛИ */}
      <div className="grid grid-cols-7 border-b border-white/5 bg-white/[0.01]">
        {weekDays.map((day) => (
          <div
            key={day}
            className="py-4 text-center text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]"
          >
            {day}
          </div>
        ))}
      </div>

      {/* СЕТКА КАЛЕНДАРЯ */}
      <div className="grid grid-cols-7 bg-white/5 gap-[1px]">
        {days.map((day, index) => {
          const dayTransactions = day ? transactionsByDay[day] || [] : [];
          const isToday =
            day === now.getDate() &&
            month === now.getMonth() + 1 &&
            year === now.getFullYear();

          return (
            <div
              key={index}
              className={`min-h-[110px] md:min-h-[140px] p-3 transition-all flex flex-col group relative ${
                day
                  ? "bg-[#030712] hover:bg-white/[0.02]"
                  : "bg-transparent opacity-20"
              }`}
            >
              {day && (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <span
                      className={`text-xs font-black transition-all ${
                        isToday
                          ? "bg-indigo-600 text-white w-7 h-7 flex items-center justify-center rounded-xl shadow-lg shadow-indigo-600/40 ring-2 ring-indigo-400/20"
                          : "text-slate-600 group-hover:text-slate-400"
                      }`}
                    >
                      {day}
                    </span>
                    {dayTransactions.length > 0 && !isToday && (
                      <div className="w-1 h-1 rounded-full bg-slate-800" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar pr-1">
                    {dayTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        className={`text-[9px] md:text-[10px] px-2 py-1.5 rounded-lg truncate font-black uppercase tracking-tighter border transition-all hover:scale-[1.02] ${
                          tx.type === "income"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.05)]"
                            : tx.type === "expense"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.05)]"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.05)]"
                        }`}
                        title={`${tx.counterparty}: ${tx.amount.toLocaleString()} ₽`}
                      >
                        <div className="flex justify-between items-center gap-1">
                          <span className="truncate opacity-80">
                            {tx.counterparty || "Транзакция"}
                          </span>
                          <span className="shrink-0 font-black">
                            {Math.abs(tx.amount).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
