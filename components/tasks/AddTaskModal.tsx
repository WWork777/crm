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
  Info,
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
    label: col.title,
  }));

  const priorityOptions = [
    { value: "HIGH", label: "Высокий" },
    { value: "MEDIUM", label: "Средний" },
    { value: "LOW", label: "Низкий" },
  ];

  const memberOptions = [
    { value: "", label: "Не назначен" },
    ...members.map((m) => ({
      value: m.userId,
      label: m.user.name || m.user.email,
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

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    const t = toast.loading("Создание...");
    try {
      await addTask(formData);
      toast.success("Задача добавлена", { id: t });
      setIsOpen(false);
      setSelectedPriority("MEDIUM");
      setSelectedAssignee("");
    } catch (e: any) {
      toast.error(e.message || "Ошибка", { id: t });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!mounted) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-bold text-xs transition-all shadow-lg shadow-indigo-600/20 group"
      >
        <Plus
          size={16}
          className="group-hover:rotate-90 transition-transform duration-300"
        />
        Добавить задачу
      </button>

      {isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setIsOpen(false)}
            />

            <div className="relative bg-[#0f172a] border border-white/10 rounded-3xl shadow-2xl w-full max-w-lg flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-300 z-10">
              {/* Header */}
              <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.01] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <Sparkles size={18} className="text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">
                      Новая задача
                    </h2>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Заполните детали для постановки в очередь
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar">
                <form action={handleSubmit} className="space-y-6">
                  {/* Группа: ЧТО ДЕЛАЕМ */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                      <Info size={14} /> Суть задачи
                    </div>
                    <input
                      type="hidden"
                      name="columnId"
                      value={selectedColumn}
                    />
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

                    <div className="space-y-1.5">
                      <input
                        type="text"
                        name="title"
                        required
                        autoFocus
                        placeholder="Название задачи..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500/50 transition-all outline-none placeholder:text-slate-600 font-medium"
                      />
                    </div>
                  </div>

                  {/* Группа: КТО И ГДЕ (Сетка) */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                      <User size={14} /> Распределение
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-slate-500 ml-1">
                          Исполнитель
                        </label>
                        <CustomSelect
                          value={selectedAssignee}
                          onChange={setSelectedAssignee}
                          options={memberOptions}
                          placeholder="Выбрать..."
                          icon={<User size={14} className="text-indigo-400" />}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-slate-500 ml-1">
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
                      <div className="col-span-2 space-y-1.5">
                        <label className="text-[10px] font-semibold text-slate-500 ml-1">
                          Секция доски
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
                    </div>
                  </div>

                  {/* Группа: КОГДА И ПОДРОБНОСТИ */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                      <AlignLeft size={14} /> Дедлайн
                    </div>
                    <div className="space-y-3">
                      <div className="relative group">
                        <Calendar
                          size={14}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none"
                        />
                        <input
                          type="date"
                          name="dueDate"
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:border-indigo-500/50 transition-all outline-none [color-scheme:dark]"
                        />
                      </div>
                      <textarea
                        name="description"
                        placeholder="Опишите детали или шаги выполнения..."
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:border-indigo-500/50 transition-all outline-none resize-none placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-white transition-colors"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSubmitting ? "Сохранение..." : "Поставить задачу"}
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
