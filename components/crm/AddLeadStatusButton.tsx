"use client";

import { useState } from "react";
import { addLeadStatus } from "@/app/actions/crm";
import { Plus, X, Check } from "lucide-react";
import toast from "react-hot-toast";

export default function AddLeadStatusButton() {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    try {
      await addLeadStatus(formData);
      toast.success("Этап создан");
      setIsEditing(false);
    } catch {
      toast.error("Ошибка");
    } finally {
      setIsPending(false);
    }
  }

  if (isEditing)
    return (
      <form
        action={handleSubmit}
        className="w-[280px] shrink-0 animate-in zoom-in-95"
      >
        <div className="bg-[#0f172a]/60 p-3 rounded-2xl border border-indigo-500/30">
          <input
            autoFocus
            name="title"
            placeholder="Название этапа..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none font-bold"
          />
          <div className="flex justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-slate-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="bg-emerald-600 text-white p-1.5 rounded-lg"
            >
              <Check size={16} />
            </button>
          </div>
        </div>
      </form>
    );

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="flex items-center justify-center gap-2 w-[280px] h-[46px] border border-dashed border-white/10 rounded-2xl text-slate-600 hover:text-emerald-400 hover:border-emerald-500/30 transition-all shrink-0"
    >
      <Plus size={16} />{" "}
      <span className="text-[10px] font-black uppercase tracking-widest">
        Добавить этап
      </span>
    </button>
  );
}
