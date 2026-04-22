// components/AddTransactionModal.tsx
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
import CustomSelect from "./CustomSelect";

interface CounterpartyOption {
  id: string;
  name: string;
}

export default function AddTransactionModal({
  counterparties = [],
}: {
  counterparties: CounterpartyOption[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Состояния для кастомных селектов
  const [selectedType, setSelectedType] = useState("expense");
  const [selectedStatus, setSelectedStatus] = useState("paid");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCounterparty, setSelectedCounterparty] = useState(""); // Новое

  useEffect(() => {
    setMounted(true);
  }, []);

  // Опции для Типа, Статуса, Категорий
  const typeOptions = [
    { value: "income", label: "ДОХОД" },
    { value: "expense", label: "РАСХОД" },
    { value: "debt", label: "ДОЛГ" },
  ];

  const statusOptions = [
    { value: "paid", label: "ОПЛАЧЕНО" },
    { value: "pending", label: "ОЖИДАЕТСЯ" },
  ];

  const categoryOptions = [
    { value: "", label: "БЕЗ КАТЕГОРИИ" },
    { value: "Выручка", label: "ВЫРУЧКА" },
    { value: "Налоги", label: "НАЛОГИ" },
    { value: "Зарплата", label: "ЗАРПЛАТА" },
    { value: "Аренда", label: "АРЕНДА" },
    { value: "Прочее", label: "ПРОЧЕЕ" },
  ];

  // Динамические опции контрагентов
  const counterpartyOptions = [
    { value: "", label: "НЕ ВЫБРАНО" },
    ...counterparties.map((cp) => ({
      value: cp.name, // Согласно схеме Prisma, Transaction.counterparty — это String
      label: cp.name.toUpperCase(),
    })),
  ];

  async function handleSubmit(formData: FormData) {
    // Вшиваем значения из селектов
    formData.set("type", selectedType);
    formData.set("status", selectedStatus);
    formData.set("category", selectedCategory);
    formData.set("counterparty", selectedCounterparty); // Передаем имя выбранного контрагента

    const promise = addTransaction(formData);

    toast.promise(promise, {
      loading: "Синхронизация данных...",
      success: "Транзакция зафиксирована!",
      error: (err) => `Ошибка: ${err.message}`,
    });

    try {
      await promise;
      setIsOpen(false);
      setSelectedType("expense");
      setSelectedStatus("paid");
      setSelectedCategory("");
      setSelectedCounterparty(""); // Сброс
    } catch (e) {}
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
              className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in"
              onClick={() => setIsOpen(false)}
            />

            <div className="relative bg-[#0f172a] border border-white/10 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 z-10">
              <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Sparkles size={20} className="text-indigo-400" /> Регистрация
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-500 hover:text-white transition-all"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar">
                <form action={handleSubmit} className="space-y-6 text-left">
                  {/* ТИП И СТАТУС */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Filter size={12} className="text-indigo-400" /> Тип
                      </label>
                      <CustomSelect
                        value={selectedType}
                        onChange={setSelectedType}
                        options={typeOptions}
                        // icon={<Wallet size={14} className="text-indigo-400" />}
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
                        // icon={
                        //   <CheckCircle2
                        //     size={14}
                        //     className="text-emerald-400"
                        //   />
                        // }
                      />
                    </div>
                  </div>

                  {/* СУММА И ДАТА */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                        Сумма (₽)
                      </label>
                      <input
                        type="text"
                        name="amount"
                        required
                        step="any"
                        placeholder="0.00"
                        className="w-full bg-[#0f172a]/50 border border-white/5 rounded-2xl px-5 py-3 text-[10px] font-black text-white focus:border-indigo-500/50 transition-all outline-none h-[46px]"
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
                        className="w-full bg-[#0f172a]/50 border border-white/5 rounded-2xl px-5 py-3 text-[12px] font-black text-slate-200 [color-scheme:dark] h-[46px]"
                      />
                    </div>
                  </div>

                  {/* КАТЕГОРИЯ */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Tag size={12} className="text-indigo-400" /> Назначение
                    </label>
                    <CustomSelect
                      value={selectedCategory}
                      onChange={setSelectedCategory}
                      options={categoryOptions}
                      placeholder="ВЫБЕРИТЕ КАТЕГОРИЮ"
                      // icon={<Tag size={14} className="text-indigo-400" />}
                    />
                  </div>

                  {/* КОНТРАГЕНТ - ТЕПЕРЬ CustomSelect */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <User size={12} className="text-indigo-400" /> Контрагент
                    </label>
                    <CustomSelect
                      value={selectedCounterparty}
                      onChange={setSelectedCounterparty}
                      options={counterpartyOptions}
                      placeholder="ВЫБЕРИТЕ ПАРТНЕРА"
                      // icon={<User size={14} className="text-indigo-400" />}
                    />
                    <p className="text-[8px] text-slate-600 ml-1 uppercase">
                      Список из реестра контрагентов
                    </p>
                  </div>

                  <div className="space-y-2">
                    <textarea
                      name="description"
                      placeholder="КРАТКИЙ КОММЕНТАРИЙ..."
                      rows={2}
                      className="w-full bg-[#0f172a]/40 border border-white/5 rounded-2xl px-5 py-4 text-xs font-medium text-slate-400 outline-none resize-none placeholder:text-slate-800 uppercase tracking-widest"
                    />
                  </div>

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
                      className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase rounded-xl flex items-center gap-2 group active:scale-95 transition-all"
                    >
                      <Save size={16} /> Зафиксировать
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
