"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { updateTransaction } from "@/app/actions";
import { Transaction } from "@prisma/client";
import {
  Edit2,
  X,
  Save,
  AlertCircle,
  Wallet,
  CheckCircle2,
  Tag,
  Calendar as CalendarIcon,
  User,
  AlignLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import CustomSelect from "./CustomSelect";

interface EditTransactionModalProps {
  transaction: Transaction;
}

export default function EditTransactionModal({
  transaction,
}: EditTransactionModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Состояния для кастомных селектов (инициализируем данными из транзакции)
  const [selectedType, setSelectedType] = useState(transaction.type);
  const [selectedStatus, setSelectedStatus] = useState(transaction.status);
  const [selectedCategory, setSelectedCategory] = useState(
    transaction.category || "",
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Опции для Типа
  const typeOptions = [
    { value: "income", label: "ДОХОД" },
    { value: "expense", label: "РАСХОД" },
    { value: "debt", label: "ДОЛГ" },
  ];

  // Опции для Статуса
  const statusOptions = [
    { value: "paid", label: "ОПЛАЧЕНО" },
    { value: "pending", label: "ОЖИДАЕТСЯ" },
  ];

  // Опции для Категорий
  const categoryOptions = [
    { value: "", label: "БЕЗ КАТЕГОРИИ" },
    { value: "Выручка", label: "ВЫРУЧКА" },
    { value: "Прочее (доход)", label: "ПРОЧЕЕ (ДОХОД)" },
    { value: "Налоги", label: "НАЛОГИ" },
    { value: "Зарплата", label: "ЗАРПЛАТА" },
    { value: "Аренда", label: "АРЕНДА" },
    { value: "Маркетинг", label: "МАРКЕТИНГ" },
    { value: "Сервисы/Софт", label: "СЕРВИСЫ" },
    { value: "Закупки", label: "ЗАКУПКИ" },
    { value: "Прочее", label: "ПРОЧЕЕ" },
  ];

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);

    // ВАЖНО: Принудительно вшиваем значения из стейтов
    formData.set("type", selectedType);
    formData.set("status", selectedStatus);
    formData.set("category", selectedCategory);

    const t = toast.loading("Обновление записи...", {
      style: {
        borderRadius: "1rem",
        background: "#0f172a",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.1)",
      },
    });

    try {
      await updateTransaction(formData);
      toast.success("Данные обновлены!", { id: t });
      setIsOpen(false);
    } catch (err: any) {
      toast.error(`Ошибка: ${err.message}`, { id: t });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        title="Редактировать"
        className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all duration-300"
      >
        <Edit2 size={16} />
      </button>

      {isOpen &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
              onClick={() => setIsOpen(false)}
            />

            {/* Контейнер модалки */}
            <div className="relative bg-[#0f172a] border border-white/10 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-300 z-10">
              {/* Шапка */}
              <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02] shrink-0">
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <Edit2 size={20} className="text-indigo-400" />
                    Корректировка
                  </h2>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <AlertCircle size={12} className="text-indigo-500" />
                    ID: {transaction.id.slice(-8).toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-500 hover:text-white bg-white/5 rounded-full transition-all"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Тело формы */}
              <div className="p-8 overflow-y-auto custom-scrollbar">
                <form action={handleSubmit} className="space-y-8 text-left">
                  <input type="hidden" name="id" value={transaction.id} />

                  {/* Ряд 1: Тип и Статус */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Wallet size={12} className="text-indigo-400" /> Тип
                        операции
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

                  {/* Ряд 2: Сумма и Дата */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                        Сумма (₽)
                      </label>
                      <input
                        type="text"
                        name="amount"
                        defaultValue={transaction.amount}
                        required
                        className="w-full bg-[#0f172a]/50 border border-white/5 rounded-2xl px-5 py-3 text-[10px] font-black text-white focus:border-indigo-500/50 transition-all outline-none uppercase tracking-widest h-[46px]"
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
                        defaultValue={
                          transaction.date
                            ? new Date(transaction.date)
                                .toISOString()
                                .split("T")[0]
                            : ""
                        }
                        required
                        className="w-full bg-[#0f172a]/50 border border-white/5 rounded-2xl px-5 py-3 text-[10px] font-black text-slate-200 focus:border-indigo-500/50 transition-all outline-none [color-scheme:dark] uppercase tracking-widest h-[46px]"
                      />
                    </div>
                  </div>

                  {/* Назначение */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Tag size={12} className="text-indigo-400" /> Категория
                    </label>
                    <CustomSelect
                      value={selectedCategory}
                      onChange={setSelectedCategory}
                      options={categoryOptions}
                      placeholder="БЕЗ КАТЕГОРИИ"
                      // icon={<Tag size={14} className="text-indigo-400" />}
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
                      defaultValue={transaction.counterparty || ""}
                      required
                      className="w-full bg-[#0f172a]/50 border border-white/5 rounded-2xl px-5 py-3 text-[10px] font-black text-white focus:border-indigo-500/50 transition-all outline-none uppercase tracking-widest placeholder:text-slate-800"
                    />
                  </div>

                  {/* Описание */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <AlignLeft size={12} className="text-indigo-400" /> Детали
                    </label>
                    <textarea
                      name="description"
                      defaultValue={transaction.description || ""}
                      rows={2}
                      className="w-full bg-[#0f172a]/40 border border-white/5 rounded-2xl px-5 py-4 text-xs font-medium text-slate-400 focus:border-indigo-500/50 transition-all outline-none resize-none uppercase tracking-widest"
                    />
                  </div>

                  {/* Кнопки */}
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
                      disabled={isSubmitting}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 group disabled:opacity-50 active:scale-95"
                    >
                      <Save
                        size={16}
                        className="group-hover:scale-110 transition-transform"
                      />
                      {isSubmitting ? "СОХРАНЕНИЕ..." : "ОБНОВИТЬ"}
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
