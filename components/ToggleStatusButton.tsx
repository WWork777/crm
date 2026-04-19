"use client";

import { toggleStatus } from "@/app/actions";
import toast from "react-hot-toast";

export default function ToggleStatusButton({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  return (
    <form
      action={async (formData) => {
        try {
          await toggleStatus(formData);
          toast.success(
            status === "paid" ? "Статус: Ожидается" : "Статус: Оплачено",
            {
              style: {
                borderRadius: "1rem",
                background: "#0f172a",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.1)",
              },
            },
          );
        } catch (e: any) {
          toast.error("Не удалось изменить статус");
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="currentStatus" value={status} />
      <button
        type="submit"
        className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${
          status === "paid"
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/40"
            : "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/40"
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full mr-2 animate-pulse ${
            status === "paid" ? "bg-emerald-400" : "bg-amber-400"
          }`}
        />
        {status === "paid" ? "Оплачено" : "Ожидается"}
      </button>
    </form>
  );
}
