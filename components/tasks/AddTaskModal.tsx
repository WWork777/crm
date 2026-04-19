"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { addTask } from "@/app/actions/tasks";
import toast from "react-hot-toast";
import {
  Plus,
  X,
  Calendar,
  Sparkles,
  User,
  LayoutGrid,
  CircleDot,
  AlignLeft,
} from "lucide-react";
import CustomSelect from "../CustomSelect";

export default function AddTaskModal({
  columns,
  members,
}: {
  columns: any[];
  members: any[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [selectedColumn, setSelectedColumn] = useState(columns[0]?.id || "");
  const [selectedPriority, setSelectedPriority] = useState("MEDIUM");
  const [selectedAssignee, setSelectedAssignee] = useState("");

  const columnOptions = columns.map((col) => ({
    value: col.id,
    label: col.title.toUpperCase(),
  }));

  const priorityOptions = [
    { value: "HIGH", label: "🔴 ВЫСОКИЙ" },
    { value: "MEDIUM", label: "🟡 СРЕДНИЙ" },
    { value: "LOW", label: "🟢 НИЗКИЙ" },
  ];

  const memberOptions = [
    { value: "", label: "НЕ НАЗНАЧЕН" },
    ...members.map((m) => ({
      value: m.userId,
      label: (m.user.name || m.user.email).toUpperCase(),
    })),
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.style.overflow = isOpen ? "hidden" : "unset";
    }
  }, [isOpen]);

  // Чистый handleSubmit без ручного formData.set
  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    const t = toast.loading("Синхронизация с базой...");

    try {
      await addTask(formData);
      toast.success("Задача зафиксирована!", { id: t });
      setIsOpen(false);
      setSelectedPriority("MEDIUM");
      setSelectedAssignee("");
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
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 group"
      >
        <Plus
          size={18}
          className="group-hover:rotate-90 transition-transform duration-300"
        />
        Новая задача
      </button>

      {isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
              onClick={() => setIsOpen(false)}
            />

            <div className="relative bg-[#0f172a] border border-white/10 rounded-[2.5rem] shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 z-10">
              {/* Header */}
              <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02] shrink-0">
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <Sparkles size={20} className="text-indigo-400" /> Новая
                    задача
                  </h2>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Канбан-регистрация
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-500 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar">
                <form action={handleSubmit} className="space-y-6 text-left">
                  {/* СКРЫТЫЕ ПОЛЯ ДЛЯ ПЕРЕДАЧИ ДАННЫХ СЕЛЕКТОВ */}
                  <input type="hidden" name="columnId" value={selectedColumn} />
                  <input
                    type="hidden"
                    name="priority"
                    value={selectedPriority}
                  />
                  <input
                    type="hidden"
                    name="assigneeId"
                    value={selectedAssignee}
                  />

                  {/* Название */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                      Название
                    </label>
                    <input
                      type="text"
                      name="title"
                      required
                      autoFocus
                      placeholder="ЧТО НУЖНО СДЕЛАТЬ?"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-sm text-white focus:border-indigo-500 transition-all outline-none font-bold uppercase tracking-widest placeholder:text-slate-800"
                    />
                  </div>

                  {/* Селекты */}
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                        Секция
                      </label>
                      <CustomSelect
                        value={selectedColumn}
                        onChange={setSelectedColumn}
                        options={columnOptions}
                        icon={
                          <LayoutGrid size={14} className="text-indigo-400" />
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                          Приоритет
                        </label>
                        <CustomSelect
                          value={selectedPriority}
                          onChange={setSelectedPriority}
                          options={priorityOptions}
                          icon={
                            <CircleDot size={14} className="text-rose-400" />
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                          Исполнитель
                        </label>
                        <CustomSelect
                          value={selectedAssignee}
                          onChange={setSelectedAssignee}
                          options={memberOptions}
                          placeholder="ВЫБЕРИТЕ"
                          icon={<User size={14} className="text-indigo-400" />}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Дедлайн */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                      Дедлайн
                    </label>
                    <input
                      type="date"
                      name="dueDate"
                      className="w-full bg-[#0f172a]/50 border border-white/5 rounded-2xl px-4 py-3.5 text-[10px] font-black text-white focus:border-indigo-500 transition-all outline-none [color-scheme:dark] uppercase tracking-widest"
                    />
                  </div>

                  {/* Описание (ВЕРНУЛ ЕГО!) */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <AlignLeft size={12} /> Детали
                    </label>
                    <textarea
                      name="description"
                      placeholder="ДОБАВЬТЕ КОНТЕКСТ..."
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-400 focus:border-indigo-500 transition-all outline-none resize-none"
                    />
                  </div>

                  {/* Footer Buttons */}
                  <div className="flex justify-end gap-3 pt-6 border-t border-white/5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="px-6 py-3 text-[10px] font-black uppercase text-slate-500"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? "СИНХРОНИЗАЦИЯ..." : "СОЗДАТЬ ЗАДАЧУ"}
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
