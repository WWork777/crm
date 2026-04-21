"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
// Добавили deleteTask в импорт
import { updateTaskDetails, deleteTask } from "@/app/actions/tasks";
import toast from "react-hot-toast";
import {
  X,
  Save,
  LayoutGrid,
  User,
  Calendar,
  AlignLeft,
  Sparkles,
  CircleDot,
  Info,
  Trash2,
} from "lucide-react";
import CustomSelect from "../CustomSelect";

export default function EditTaskModal({
  task,
  columns,
  members,
  onClose,
  userRole,
}: {
  task: any;
  columns: any[];
  userRole: string;
  members: any[];
  onClose: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ОПРЕДЕЛЯЕМ isOwner (теперь проверка внизу заработает)
  const isOwner = userRole === "OWNER";

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
    ...members.map((m: any) => ({
      value: m.userId,
      label: m.user.name || m.user.email,
    })),
  ];

  const handleDelete = async () => {
    if (!window.confirm("Удалить эту задачу навсегда?")) return;

    setIsDeleting(true);
    const t = toast.loading("Ликвидация задачи...");

    try {
      await deleteTask(task.id);
      toast.success("Задача удалена", { id: t });
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Ошибка удаления", { id: t });
    } finally {
      setIsDeleting(false);
    }
  };

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    formData.set("columnId", selectedColumn);
    formData.set("priority", selectedPriority);
    formData.set("assigneeId", selectedAssignee);

    const t = toast.loading("Сохранение изменений...");
    try {
      await updateTaskDetails(task.id, formData);
      toast.success("Данные обновлены", { id: t });
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
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="relative bg-[#0f172a] border border-white/10 rounded-3xl shadow-2xl w-full max-w-md flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-300 z-10">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.01] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <Sparkles size={18} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Редактирование
              </h2>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                ID: {task.id.slice(-8)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form action={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                <Info size={14} /> Суть задачи
              </div>
              <input
                type="text"
                name="title"
                required
                defaultValue={task.title}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500/50 outline-none font-medium"
              />
            </div>

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
                    icon={<CircleDot size={14} className="text-rose-400" />}
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
                    icon={<LayoutGrid size={14} className="text-indigo-400" />}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                <AlignLeft size={14} /> Дедлайн
              </div>
              <div className="space-y-3">
                <div className="relative group">
                  <Calendar
                    size={14}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                  />
                  <input
                    type="date"
                    name="dueDate"
                    defaultValue={
                      task.dueDate
                        ? new Date(task.dueDate).toISOString().split("T")[0]
                        : ""
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:border-indigo-500/50 outline-none [color-scheme:dark]"
                  />
                </div>
                <textarea
                  name="description"
                  defaultValue={task.description}
                  placeholder="Опишите детали..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:border-indigo-500/50 outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/5 items-center">
              <div className="flex-1">
                {isOwner && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting || isSubmitting}
                    className="flex items-center gap-2 text-rose-500 hover:text-rose-400 text-xs font-bold transition-colors disabled:opacity-30 group"
                  >
                    <Trash2
                      size={14}
                      className="group-hover:rotate-12 transition-transform"
                    />
                    Удалить
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-white transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isDeleting}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={14} />
                {isSubmitting ? "Сохранение..." : "Обновить задачу"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}
