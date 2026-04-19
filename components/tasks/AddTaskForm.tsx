"use client";

import { useState } from "react";
import { addTask } from "@/app/actions/tasks";
import toast from "react-hot-toast";
import {
  Plus,
  X,
  Sparkles,
  Calendar,
  LayoutGrid,
  User,
  CircleDot,
  PlusCircle,
} from "lucide-react";
import CustomSelect from "../CustomSelect";

export default function AddTaskForm({
  columns,
  members,
}: {
  columns: any[];
  members: any[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedColumn, setSelectedColumn] = useState(columns[0]?.id || "");
  const [selectedPriority, setSelectedPriority] = useState("MEDIUM");
  const [selectedAssignee, setSelectedAssignee] = useState("");

  const columnOptions = columns.map((col) => ({
    value: col.id,
    label: col.title,
  }));
  const memberOptions = [
    { value: "", label: "НЕ НАЗНАЧЕН" },
    ...members.map((m) => ({
      value: m.userId,
      label: (m.user.name || m.user.email).toUpperCase(),
    })),
  ];
  const priorityOptions = [
    { value: "HIGH", label: "HIGH (ВЫСОКИЙ)" },
    { value: "MEDIUM", label: "MEDIUM (СРЕДНИЙ)" },
    { value: "LOW", label: "LOW (НИЗКИЙ)" },
  ];

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);

    // Принудительно передаем данные из состояний кастомных селектов
    formData.set("columnId", selectedColumn);
    formData.set("priority", selectedPriority);
    formData.set("assigneeId", selectedAssignee);

    const t = toast.loading("Синхронизация данных...");
    try {
      await addTask(formData);
      toast.success("Задача добавлена в реестр", { id: t });
      setIsOpen(false);
      setSelectedPriority("MEDIUM");
      setSelectedAssignee("");
    } catch (e: any) {
      toast.error(e.message || "Ошибка записи", { id: t });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0f172a]/50 border border-white/5 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30 px-6 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 backdrop-blur-md group"
      >
        <div className="bg-indigo-500/10 p-1.5 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
          <Plus size={16} className="text-indigo-400" />
        </div>
        Создать новое событие
      </button>
    );
  }

  return (
    <div className="bg-[#0f172a]/30 p-8 rounded-[2.5rem] border border-white/5 animate-in fade-in slide-in-from-top-4 duration-500 backdrop-blur-sm shadow-2xl relative overflow-hidden">
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-600/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="flex items-center gap-3 mb-8 relative z-10">
        <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 shadow-lg shadow-indigo-500/5">
          <Sparkles size={20} />
        </div>
        <div className="space-y-0.5">
          <h2 className="text-xl font-black text-white tracking-tight leading-none">
            Новое <span className="text-indigo-500">событие</span>
          </h2>
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">
            Регистрация в системе
          </p>
        </div>
      </div>

      <form action={handleSubmit} className="flex flex-col gap-8 relative z-10">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">
            Название задачи
          </label>
          <input
            type="text"
            name="title"
            placeholder="ЧТО НУЖНО СДЕЛАТЬ?"
            required
            autoFocus
            className="w-full px-5 py-4 bg-[#0f172a]/40 border border-white/5 rounded-2xl focus:outline-none focus:border-indigo-500/50 transition-all font-bold text-xs text-white placeholder:text-slate-800 uppercase tracking-widest"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
              <LayoutGrid size={12} className="text-indigo-500" /> Секция
            </label>
            <CustomSelect
              value={selectedColumn}
              onChange={setSelectedColumn}
              options={columnOptions}
              icon={<LayoutGrid size={14} className="text-indigo-400" />}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
              <CircleDot size={12} className="text-rose-500" /> Приоритет
            </label>
            <CustomSelect
              value={selectedPriority}
              onChange={setSelectedPriority}
              options={priorityOptions}
              icon={<CircleDot size={14} className="text-rose-400" />}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
              <User size={12} className="text-indigo-500" /> Исполнитель
            </label>
            <CustomSelect
              value={selectedAssignee}
              onChange={setSelectedAssignee}
              options={memberOptions}
              placeholder="ВЫБЕРИТЕ ИСПОЛНИТЕЛЯ"
              icon={<User size={14} className="text-indigo-400" />}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
              <Calendar size={12} className="text-indigo-500" /> Дедлайн
            </label>
            <div className="relative">
              <input
                type="date"
                name="dueDate"
                className="w-full px-5 py-3.5 bg-[#0f172a]/50 border border-white/5 rounded-2xl focus:border-indigo-500/50 font-black text-[10px] text-slate-200 transition-all outline-none [color-scheme:dark] uppercase tracking-widest h-[48px]"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">
            Описание
          </label>
          <textarea
            name="description"
            placeholder="ДОБАВЬТЕ КОНТЕКСТ..."
            rows={2}
            className="w-full px-5 py-4 bg-[#0f172a]/40 border border-white/5 rounded-2xl focus:outline-none focus:border-indigo-500/50 font-bold text-xs text-slate-400 resize-none transition-all placeholder:text-slate-800 uppercase tracking-widest"
          />
        </div>

        <div className="flex gap-4 justify-end pt-6 border-t border-white/5">
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
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-3 group active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? "СИНХРОНИЗАЦИЯ..." : "ЗАФИКСИРОВАТЬ"}
            {!isSubmitting && (
              <PlusCircle
                size={16}
                className="group-hover:rotate-90 transition-transform duration-300"
              />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
