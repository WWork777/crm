"use client";

import { Trash2, AlertTriangle } from "lucide-react";
import { deleteTeam } from "@/app/actions/team";
import toast from "react-hot-toast";

export default function DeleteTeamButton() {
  const handleDelete = async (formData: FormData) => {
    if (
      !window.confirm(
        "Вы абсолютно уверены? Это действие безвозвратно удалит все данные команды.",
      )
    ) {
      return;
    }

    const toastId = toast.loading("Ликвидация данных...", {
      style: {
        background: "#0f172a",
        color: "#fff",
        border: "1px solid rgba(244, 63, 94, 0.2)",
        borderRadius: "1rem",
      },
    });

    try {
      // ИСПРАВЛЕНИЕ: Вызываем без аргументов
      await deleteTeam();

      toast.success("Область удалена", { id: toastId });
    } catch (error: any) {
      toast.error(error.message || "Ошибка при удалении", { id: toastId });
    }
  };

  return (
    <form action={handleDelete} className="w-full sm:w-auto">
      <button
        type="submit"
        className="group relative flex items-center justify-center gap-3 w-full sm:w-auto bg-rose-500/5 border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/40 px-8 py-4 rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(244,63,94,0.02)] hover:shadow-[0_0_30px_rgba(244,63,94,0.1)]"
      >
        <Trash2
          size={18}
          className="group-hover:scale-110 transition-transform"
        />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">
          Удалить рабочую область
        </span>

        {/* Декоративное свечение при наведении */}
        <div className="absolute inset-0 rounded-2xl bg-rose-500/0 group-hover:bg-rose-500/5 blur-xl transition-all -z-10" />
      </button>

      <p className="mt-4 text-[9px] font-bold text-slate-600 uppercase tracking-widest text-center sm:text-left flex items-center justify-center sm:justify-start gap-2">
        <AlertTriangle size={10} className="text-rose-900" />
        Внимание: действие необратимо
      </p>
    </form>
  );
}
