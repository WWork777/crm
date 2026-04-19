"use client";

import { updateTaskDetails } from "@/app/actions/tasks";
import toast from "react-hot-toast";
import {
  X,
  Save,
  Layout,
  User,
  Calendar,
  AlignLeft,
  Sparkles,
  CircleDot,
} from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import CustomSelect from "../CustomSelect";

export default function EditTaskModal({
  task,
  columns,
  members,
  onClose,
}: {
  task: any;
  columns: any[];
  members: any[];
  onClose: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Состояния для кастомных селектов (инициализируем данными из задачи)
  const [selectedColumn, setSelectedColumn] = useState(task.status);
  const [selectedPriority, setSelectedPriority] = useState(
    task.priority || "MEDIUM",
  );
  const [selectedAssignee, setSelectedAssignee] = useState(
    task.assigneeId || "",
  );

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Опции для селектов
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

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);

    // Вшиваем значения из стейтов CustomSelect в FormData
    formData.set("columnId", selectedColumn);
    formData.set("priority", selectedPriority);
    formData.set("assigneeId", selectedAssignee);

    const t = toast.loading("Синхронизация данных...", {
      style: {
        background: "#0f172a",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "1rem",
      },
    });

    try {
      await updateTaskDetails(task.id, formData);
      toast.success("Изменения зафиксированы", { id: t });
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Ошибка записи", { id: t });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Модальное окно */}
      <div className="relative bg-[#0f172a] border border-white/10 rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 z-10">
        {/* Шапка */}
        <div className="flex items-center justify-between p-8 border-b border-white/5 bg-white/[0.02] shrink-0">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Sparkles size={20} className="text-indigo-400" />
              Конфигурация
            </h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              ID Системы: {task.id.slice(-8)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Тело формы со стилизованным скроллбаром */}
        <form
          action={handleSubmit}
          className="p-8 flex flex-col gap-8 overflow-y-auto 
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:bg-white/10
            [&::-webkit-scrollbar-thumb]:rounded-full
            hover:[&::-webkit-scrollbar-thumb]:bg-indigo-500/40"
        >
          {/* Название */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">
              Название задачи
            </label>
            <input
              type="text"
              name="title"
              defaultValue={task.title}
              required
              className="w-full px-5 py-4 bg-[#0f172a]/40 border border-white/5 rounded-2xl focus:border-indigo-500/50 transition-all font-bold text-white outline-none uppercase tracking-widest"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Статус */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                {/* <Layout size={12} className="text-indigo-500" />  */}
                Секция
              </label>
              <CustomSelect
                value={selectedColumn}
                onChange={setSelectedColumn}
                options={columnOptions}
                icon={<Layout size={14} className="text-indigo-400" />}
              />
            </div>

            {/* Приоритет */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                {/* <CircleDot size={12} className="text-rose-500" />  */}
                Приоритет
              </label>
              <CustomSelect
                value={selectedPriority}
                onChange={setSelectedPriority}
                options={priorityOptions}
                icon={<CircleDot size={14} className="text-rose-400" />}
              />
            </div>

            {/* Исполнитель */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                {/* <User size={12} className="text-indigo-500" />  */}
                Ответственный
              </label>
              <CustomSelect
                value={selectedAssignee}
                onChange={setSelectedAssignee}
                options={memberOptions}
                placeholder="ВЫБЕРИТЕ"
                icon={<User size={14} className="text-indigo-400" />}
              />
            </div>

            {/* Дедлайн */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                {/* <Calendar size={12} className="text-indigo-500" />  */}
                Крайний срок
              </label>
              <input
                type="date"
                name="dueDate"
                defaultValue={
                  task.dueDate
                    ? new Date(task.dueDate).toISOString().split("T")[0]
                    : ""
                }
                className="w-full px-5 py-3 bg-[#0f172a]/50 border border-white/5 rounded-2xl focus:border-indigo-500/50 font-black text-[10px] text-slate-200 transition-all outline-none [color-scheme:dark] uppercase tracking-widest h-[48px]"
              />
            </div>
          </div>

          {/* Описание */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
              {/* <AlignLeft size={12} className="text-indigo-500" /> */}
              Описание
            </label>
            <textarea
              name="description"
              defaultValue={task.description}
              rows={4}
              placeholder="Добавьте контекст..."
              className="w-full px-5 py-4 bg-[#0f172a]/40 border border-white/5 rounded-2xl focus:border-indigo-500/50 text-sm font-medium text-slate-400 resize-none transition-all outline-none uppercase tracking-tight"
            />
          </div>

          {/* Футер */}
          <div className="flex justify-end pt-6 border-t border-white/5 shrink-0">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-3 group active:scale-95"
            >
              <Save
                size={16}
                className="group-hover:scale-110 transition-transform"
              />
              {isSubmitting ? "СИНХРОНИЗАЦИЯ..." : "ОБНОВИТЬ ДАННЫЕ"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
