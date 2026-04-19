"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { addTransaction } from "@/app/actions";
import {
  Plus,
  X,
  Save,
  Sparkles,
  Filter,
  CheckCircle2,
  Tag,
  Calendar as CalendarIcon,
  Wallet,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import CustomSelect from "./CustomSelect"; // Проверь путь к компоненту

export default function AddTransactionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Состояния для кастомных селектов
  const [selectedType, setSelectedType] = useState("expense");
  const [selectedStatus, setSelectedStatus] = useState("paid");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Опции для Типа
  const typeOptions = [
    { value: "income", label: "📈 ДОХОД" },
    { value: "expense", label: "📉 РАСХОД" },
    { value: "debt", label: "🤝 ДОЛГ" },
  ];

  // Опции для Статуса
  const statusOptions = [
    { value: "paid", label: "✅ ОПЛАЧЕНО" },
    { value: "pending", label: "⏳ ОЖИДАЕТСЯ" },
  ];

  // Опции для Категорий
  const categoryOptions = [
    { value: "", label: "БЕЗ КАТЕГОРИИ" },
    { value: "Выручка", label: "💰 ВЫРУЧКА" },
    { value: "Прочее (доход)", label: "➕ ПРОЧЕЕ (ДОХОД)" },
    { value: "Налоги", label: "🏛️ НАЛОГИ" },
    { value: "Зарплата", label: "👩‍💻 ЗАРПЛАТА" },
    { value: "Аренда", label: "🏠 АРЕНДА" },
    { value: "Маркетинг", label: "📣 МАРКЕТИНГ" },
    { value: "Сервисы/Софт", label: "☁️ СЕРВИСЫ" },
    { value: "Закупки", label: "📦 ЗАКУПКИ" },
    { value: "Прочее", label: "⚙️ ПРОЧЕЕ" },
  ];

  async function handleSubmit(formData: FormData) {
    // ВАЖНО: Принудительно вшиваем значения из кастомных селектов
    formData.set("type", selectedType);
    formData.set("status", selectedStatus);
    formData.set("category", selectedCategory);

    const promise = addTransaction(formData);

    toast.promise(
      promise,
      {
        loading: "Синхронизация данных...",
        success: "Транзакция зафиксирована!",
        error: (err) => `Ошибка: ${err.message}`,
      },
      {
        style: {
          borderRadius: "1rem",
          background: "#0f172a",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.1)",
        },
      },
    );

    try {
      await promise;
      setIsOpen(false);
      // Сброс состояний
      setSelectedType("expense");
      setSelectedStatus("paid");
      setSelectedCategory("");
    } catch (e) {
      // Ошибка в тосте
    }
  }

  if (!mounted) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 group"
      >
        <Plus
          size={18}
          className="group-hover:rotate-90 transition-transform duration-300"
        />
        <span className="hidden sm:inline">Новая запись</span>
      </button>

      {isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
              onClick={() => setIsOpen(false)}
            />

            <div className="relative bg-[#0f172a] border border-white/10 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 z-10">
              {/* Шапка */}
              <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02] shrink-0">
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <Sparkles size={20} className="text-indigo-400" />
                    Регистрация
                  </h2>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Внесение данных в реестр системы
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Тело формы */}
              <div className="p-8 overflow-y-auto custom-scrollbar">
                <form action={handleSubmit} className="space-y-8 text-left">
                  {/* Ряд 1: Тип и Статус */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Filter size={12} className="text-indigo-400" /> Тип
                        операции
                      </label>
                      <CustomSelect
                        value={selectedType}
                        onChange={setSelectedType}
                        options={typeOptions}
                        icon={<Wallet size={14} className="text-indigo-400" />}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <CheckCircle2 size={12} className="text-emerald-400" />{" "}
                        Статус
                      </label>
                      <CustomSelect
                        value={selectedStatus}
                        onChange={setSelectedStatus}
                        options={statusOptions}
                        icon={
                          <CheckCircle2
                            size={14}
                            className="text-emerald-400"
                          />
                        }
                      />
                    </div>
                  </div>

                  {/* Ряд 2: Сумма и Дата */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                        Сумма (₽)
                      </label>
                      <input
                        type="number"
                        name="amount"
                        required
                        placeholder="0.00"
                        className="w-full bg-[#0f172a]/50 border border-white/5 rounded-2xl px-5 py-3 text-[10px] font-black text-white focus:border-indigo-500/50 transition-all outline-none placeholder:text-slate-800 uppercase tracking-widest h-[46px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <CalendarIcon size={12} className="text-indigo-400" />{" "}
                        Дата
                      </label>
                      <input
                        type="date"
                        name="date"
                        required
                        className="w-full bg-[#0f172a]/50 border border-white/5 rounded-2xl px-5 py-3 text-[10px] font-black text-slate-200 focus:border-indigo-500/50 transition-all outline-none [color-scheme:dark] uppercase tracking-widest h-[46px]"
                      />
                    </div>
                  </div>

                  {/* Категория */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Tag size={12} className="text-indigo-400" /> Назначение
                    </label>
                    <CustomSelect
                      value={selectedCategory}
                      onChange={setSelectedCategory}
                      options={categoryOptions}
                      placeholder="ВЫБЕРИТЕ КАТЕГОРИЮ"
                      icon={<Tag size={14} className="text-indigo-400" />}
                    />
                  </div>

                  {/* Контрагент */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <User size={12} className="text-indigo-400" /> Контрагент
                    </label>
                    <input
                      type="text"
                      name="counterparty"
                      required
                      placeholder="НАЗВАНИЕ КОМПАНИИ ИЛИ ИМЯ"
                      className="w-full bg-[#0f172a]/50 border border-white/5 rounded-2xl px-5 py-3 text-[10px] font-black text-white focus:border-indigo-500/50 transition-all outline-none placeholder:text-slate-800 uppercase tracking-widest"
                    />
                  </div>

                  {/* Описание */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                      Дополнительные детали
                    </label>
                    <textarea
                      name="description"
                      placeholder="КРАТКИЙ КОММЕНТАРИЙ..."
                      rows={2}
                      className="w-full bg-[#0f172a]/40 border border-white/5 rounded-2xl px-5 py-4 text-xs font-medium text-slate-400 focus:border-indigo-500/50 transition-all outline-none resize-none placeholder:text-slate-800 uppercase tracking-widest"
                    />
                  </div>

                  {/* Кнопки действий */}
                  <div className="flex justify-end gap-3 pt-6 border-t border-white/5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 group active:scale-95"
                    >
                      <Save
                        size={16}
                        className="group-hover:scale-110 transition-transform"
                      />
                      Зафиксировать
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
