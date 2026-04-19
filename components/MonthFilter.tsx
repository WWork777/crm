"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";

const MONTHS = [
  "Янв",
  "Фев",
  "Мар",
  "Апр",
  "Май",
  "Июн",
  "Июл",
  "Авг",
  "Сен",
  "Окт",
  "Ноя",
  "Дек",
];

const FULL_MONTHS = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

export default function MonthFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentMonthStr = searchParams.get("month");

  const [isOpen, setIsOpen] = useState(false);
  const [panelYear, setPanelYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    if (isOpen) {
      const yearToSet = currentMonthStr
        ? parseInt(currentMonthStr.split("-")[0])
        : new Date().getFullYear();
      setPanelYear(yearToSet);
    }
  }, [isOpen, currentMonthStr]);

  const getDisplayValue = () => {
    if (!currentMonthStr) return "За все время";
    const [year, month] = currentMonthStr.split("-");
    const monthIndex = parseInt(month) - 1;
    return `${FULL_MONTHS[monthIndex]} ${year}`;
  };

  const handleSelectMonth = (monthIndex: number) => {
    const monthString = String(monthIndex + 1).padStart(2, "0");
    const val = `${panelYear}-${monthString}`;
    router.push(`?month=${val}`);
    router.refresh();
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push("/dashboard"); // Убедись, что путь ведет на нужную страницу
    router.refresh();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Кнопка-триггер (Glass Style) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl font-bold transition-all border outline-none ${
          isOpen
            ? "bg-indigo-500/20 border-indigo-500/40 text-white ring-4 ring-indigo-500/10"
            : "bg-[#0f172a]/50 border-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Calendar
            size={16}
            className={isOpen ? "text-indigo-400" : "text-slate-500"}
          />
          <span className="text-xs uppercase tracking-widest">
            {getDisplayValue()}
          </span>
        </div>

        {currentMonthStr ? (
          <div
            onClick={handleClear}
            className="ml-2 p-1 rounded-lg hover:bg-white/10 text-slate-500 hover:text-rose-400 transition-colors"
          >
            <X size={14} />
          </div>
        ) : (
          <ChevronDown
            size={14}
            className={`ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {/* Выпадающая панель (Dark Glassmorphism) */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute top-full mt-3 left-0 w-72 bg-[#0f172a] border border-white/10 rounded-[2rem] shadow-2xl z-50 p-6 animate-in fade-in zoom-in-95 duration-200 backdrop-blur-xl">
            {/* Навигация по годам */}
            <div className="flex items-center justify-between mb-6 px-1">
              <button
                onClick={() => setPanelYear((y) => y - 1)}
                className="p-2 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="font-black text-white tracking-tighter text-lg">
                {panelYear}
              </span>
              <button
                onClick={() => setPanelYear((y) => y + 1)}
                className="p-2 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Сетка месяцев */}
            <div className="grid grid-cols-3 gap-2">
              {MONTHS.map((monthName, index) => {
                const isSelected =
                  currentMonthStr ===
                  `${panelYear}-${String(index + 1).padStart(2, "0")}`;

                return (
                  <button
                    key={monthName}
                    onClick={() => handleSelectMonth(index)}
                    className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                      isSelected
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20"
                        : "border-transparent text-slate-500 hover:bg-white/5 hover:text-slate-200"
                    }`}
                  >
                    {monthName}
                  </button>
                );
              })}
            </div>

            {/* Нижняя кнопка сброса */}
            <button
              onClick={handleClear}
              className="w-full mt-6 pt-4 border-t border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 hover:text-indigo-400 transition-colors"
            >
              Сбросить фильтр
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Вспомогательная иконка, если она не импортирована
function ChevronDown({
  size,
  className,
}: {
  size: number;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
