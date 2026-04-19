"use client";

import { Trash2 } from "lucide-react";
import { deleteTransaction } from "@/app/actions";
import toast from "react-hot-toast";

export default function DeleteTransactionButton({ id }: { id: string }) {
  return (
    <form
      action={async (formData) => {
        // Кастомный стиль для лоадера в темной теме
        const t = toast.loading("Удаление...", {
          style: {
            background: "#0f172a",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: "1rem",
          },
        });

        try {
          if (!confirm("Вы уверены, что хотите удалить эту операцию?")) {
            toast.dismiss(t);
            return;
          }
          await deleteTransaction(formData);
          toast.success("Запись удалена", { id: t });
        } catch (e: any) {
          toast.error(e.message || "Ошибка при удалении", { id: t });
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        title="Удалить"
        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl border border-transparent hover:border-rose-500/20 transition-all duration-300"
      >
        <Trash2 size={16} />
      </button>
    </form>
  );
}
