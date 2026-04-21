"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { addLead } from "@/app/actions/crm";
import toast from "react-hot-toast";
import {
  Plus,
  X,
  Target,
  User,
  Phone,
  Banknote,
  LayoutGrid,
  CircleDot,
  AlignLeft,
  Mail,
  Zap,
} from "lucide-react";
import CustomSelect from "../CustomSelect";

export default function AddLeadModal({ statuses }: { statuses: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [paymentType, setPaymentType] = useState("FIXED");
  const [selectedStatus, setSelectedStatus] = useState(statuses[0]?.id || "");
  const [selectedPriority, setSelectedPriority] = useState("MEDIUM");

  useEffect(() => {
    setMounted(true);
  }, []);

  const statusOptions = statuses.map((s) => ({ value: s.id, label: s.title }));
  const priorityOptions = [
    { value: "HIGH", label: "Высокий" },
    { value: "MEDIUM", label: "Средний" },
    { value: "LOW", label: "Низкий" },
  ];

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    formData.set("statusId", selectedStatus);
    formData.set("priority", selectedPriority);
    formData.set("paymentType", paymentType);

    const t = toast.loading("Создание сделки...");
    try {
      await addLead(formData);
      toast.success("Лид успешно добавлен", { id: t });
      setIsOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Ошибка системы", { id: t });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!mounted) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg shadow-emerald-600/20 group"
      >
        <Plus
          size={16}
          className="group-hover:rotate-90 transition-transform duration-300"
        />
        Новая сделка
      </button>

      {isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
              onClick={() => setIsOpen(false)}
            />

            <div className="relative bg-[#0f172a] border border-white/10 rounded-[2rem] shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 z-10 overflow-hidden">
              {/* Header */}
              <div className="px-8 py-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                    <Target size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-tight">
                      Карточка лида
                    </h2>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-[0.1em]">
                      Регистрация новой сделки в воронке
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-500 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar">
                <form action={handleSubmit} className="space-y-8">
                  {/* СЕКЦИЯ 1: СДЕЛКА */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                        <Zap size={14} /> Параметры сделки
                      </label>
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-500 ml-1 font-semibold uppercase">
                          Название
                        </span>
                        <input
                          name="title"
                          required
                          placeholder="Например: Контракт на разработку..."
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/40 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Верхняя линия: Заголовок слева, Переключатель справа */}
                      <div className="flex items-center justify-between mb-5">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                          Бюджет и тип
                        </label>

                        <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 shadow-inner">
                          <button
                            type="button"
                            onClick={() => setPaymentType("FIXED")}
                            className={`px-3 py-1.5 text-[9px] font-black rounded-lg transition-all duration-300 ${
                              paymentType === "FIXED"
                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                : "text-slate-600 hover:text-slate-400"
                            }`}
                          >
                            СДЕЛЬНО
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentType("MONTHLY")}
                            className={`px-3 py-1.5 text-[9px] font-black rounded-lg transition-all duration-300 ${
                              paymentType === "MONTHLY"
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                : "text-slate-600 hover:text-slate-400"
                            }`}
                          >
                            МЕСЯЦ
                          </button>
                        </div>
                      </div>

                      {/* Поле ввода бюджета */}
                      <div className="relative group">
                        <input
                          type="hidden"
                          name="paymentType"
                          value={paymentType}
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                          <Banknote
                            size={16}
                            className={`transition-colors duration-300 ${
                              paymentType === "FIXED"
                                ? "text-emerald-500/50"
                                : "text-indigo-500/50"
                            }`}
                          />
                        </div>
                        <input
                          name="value"
                          type="text"
                          placeholder="0.00"
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-16 py-3 text-sm text-white font-bold outline-none focus:border-white/20 transition-all placeholder:text-slate-800"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-600 uppercase tracking-widest pointer-events-none">
                          {paymentType === "FIXED" ? "RUB" : "RUB / МЕС"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* СЕКЦИЯ 2: КОНТАКТЫ И СТАТУС */}
                  <div className="bg-white/[0.01] border border-white/5 rounded-[1.5rem] p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-4 md:col-span-2">
                        <label className="flex items-center gap-2 text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                          <User size={14} /> Контактные данные
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="relative">
                            <User
                              size={14}
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                            />
                            <input
                              name="contactName"
                              placeholder="Имя клиента"
                              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500/40"
                            />
                          </div>
                          <div className="relative">
                            <Phone
                              size={14}
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                            />
                            <input
                              name="phone"
                              placeholder="Телефон"
                              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500/40"
                            />
                          </div>
                          <div className="relative sm:col-span-2">
                            <Mail
                              size={14}
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                            />
                            <input
                              name="email"
                              type="email"
                              placeholder="Email адрес"
                              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500/40"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="flex items-center gap-2 text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                          <LayoutGrid size={14} /> Место в воронке
                        </label>
                        <div className="space-y-3">
                          <CustomSelect
                            value={selectedStatus}
                            onChange={setSelectedStatus}
                            options={statusOptions}
                            icon={
                              <LayoutGrid
                                size={14}
                                className="text-emerald-500"
                              />
                            }
                          />
                          <CustomSelect
                            value={selectedPriority}
                            onChange={setSelectedPriority}
                            options={priorityOptions}
                            icon={
                              <CircleDot size={14} className="text-rose-400" />
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* СЕКЦИЯ 3: КОММЕНТАРИЙ */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <AlignLeft size={14} /> Дополнительные примечания
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      placeholder="Укажите здесь важные детали переговоров или требования клиента..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-400 outline-none focus:border-indigo-500/40 transition-all resize-none"
                    />
                  </div>

                  {/* Footer */}
                  <div className="flex justify-end items-center gap-4 pt-4 border-t border-white/5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="text-xs font-bold text-slate-500 hover:text-white transition-colors"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold text-xs tracking-wider transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
                    >
                      {isSubmitting ? "Регистрация..." : "Создать лид"}
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
