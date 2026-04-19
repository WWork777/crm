"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Filter,
  Tag,
  ChevronDown,
} from "lucide-react";
import CustomSelect from "./CustomSelect";

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

export default function DashboardFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const typeOptions = [
    { value: "", label: "Все операции" },
    { value: "income", label: "Доходы" },
    { value: "expense", label: "Расходы" },
    { value: "debt", label: "Долги" },
  ];

  const categoryOptions = [
    { value: "", label: "Все категории" },
    { value: "Выручка", label: "Выручка" },
    { value: "Прочее (Доход)", label: "Прочее (Доход)" },
    { value: "Налоги", label: "Налоги" },
    { value: "Зарплата", label: "Зарплата" },
    { value: "Аренда", label: "Аренда" },
    { value: "Маркетинг", label: "Маркетинг" },
    { value: "Сервисы/Софт", label: "Сервисы/Софт" },
    { value: "Закупки", label: "Закупки" },
    { value: "Прочее", label: "Прочее" },
  ];

  const currentMonthStr = searchParams.get("month");
  const currentType = searchParams.get("type") || "";
  const currentCategory = searchParams.get("category") || "";

  const [isOpen, setIsOpen] = useState(false);
  const [panelYear, setPanelYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    if (isOpen) {
      setPanelYear(
        currentMonthStr
          ? parseInt(currentMonthStr.split("-")[0])
          : new Date().getFullYear(),
      );
    }
  }, [isOpen, currentMonthStr]);

  const getDisplayValue = () => {
    if (!currentMonthStr) return "За все время";
    const [year, month] = currentMonthStr.split("-");
    return `${FULL_MONTHS[parseInt(month) - 1]} ${year}`;
  };

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/dashboard/?${params.toString()}`);
    router.refresh();
  };

  const handleSelectMonth = (monthIndex: number) => {
    const monthString = String(monthIndex + 1).padStart(2, "0");
    setFilter("month", `${panelYear}-${monthString}`);
    setIsOpen(false);
  };

  const handleClearMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFilter("month", "");
    setIsOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
      {/* 1. ФИЛЬТР ПО ТИПУ */}
      <CustomSelect
        value={currentType}
        onChange={(val) => setFilter("type", val)}
        options={typeOptions}
        icon={<Filter size={14} className="text-indigo-400" />}
      />

      {/* 2. ФИЛЬТР ПО КАТЕГОРИИ */}
      <CustomSelect
        value={currentCategory}
        onChange={(val) => setFilter("category", val)}
        options={categoryOptions}
        icon={<Tag size={14} className="text-emerald-400" />}
      />

      {/* 3. ФИЛЬТР ПО МЕСЯЦУ */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`group flex items-center justify-between gap-3 px-5 py-2.5 rounded-2xl border transition-all duration-300 outline-none min-w-[180px] ${
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
            <span className="text-[10px] font-black uppercase tracking-widest">
              {getDisplayValue()}
            </span>
          </div>

          {currentMonthStr ? (
            <div
              onClick={handleClearMonth}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-500 hover:text-rose-400 transition-colors"
            >
              <X size={14} />
            </div>
          ) : (
            <ChevronDown
              size={14}
              className={`text-slate-600 transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          )}
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full mt-3 left-0 sm:left-auto sm:right-0 w-72 bg-[#0f172a] border border-white/10 rounded-[2.5rem] shadow-2xl z-50 p-6 animate-in fade-in zoom-in-95 duration-200 backdrop-blur-xl">
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

              <button
                onClick={handleClearMonth}
                className="w-full mt-6 pt-4 border-t border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 hover:text-indigo-400 transition-colors"
              >
                Показать за всё время
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
