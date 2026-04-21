"use client";

import { useState } from "react";
import { addColumn } from "@/app/actions/tasks";
import { Plus, X, Check } from "lucide-react";
import toast from "react-hot-toast";

export default function AddColumnButton() {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    const title = formData.get("title") as string;
    if (!title.trim()) return setIsEditing(false);

    setIsPending(true);
    const t = toast.loading("Создание секции...");

    try {
      await addColumn(formData);
      toast.success("Секция добавлена", { id: t });
      setIsEditing(false);
    } catch (e: any) {
      toast.error(e.message || "Ошибка", { id: t });
    } finally {
      setIsPending(false);
    }
  }

  if (isEditing) {
    return (
      <form
        action={handleSubmit}
        className="flex flex-col gap-2 min-w-[280px] w-[280px] animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="bg-[#0f172a]/60 p-3 rounded-2xl border border-indigo-500/30 shadow-lg shadow-indigo-500/5">
          <input
            autoFocus
            name="title"
            placeholder="Название секции..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
          />
          <div className="flex items-center justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-1.5 text-slate-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded-lg transition-all disabled:opacity-50"
            >
              <Check size={16} />
            </button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="flex items-center justify-center gap-2 min-w-[280px] w-[280px] h-[46px] border border-dashed border-white/10 rounded-2xl text-slate-500 hover:text-indigo-400 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all group shrink-0"
    >
      <Plus size={16} className="group-hover:rotate-90 transition-transform" />
      <span className="text-[10px] font-black uppercase tracking-widest">
        Добавить секцию
      </span>
    </button>
  );
}
