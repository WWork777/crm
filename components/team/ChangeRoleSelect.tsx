"use client";

import { changeMemberRole } from "@/app/actions/team";
import toast from "react-hot-toast";
import { ChevronDown, ShieldCheck, User } from "lucide-react";

export default function ChangeRoleSelect({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: string;
}) {
  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    const toastId = toast.loading("Смена прав доступа...", {
      style: {
        background: "#0f172a",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "1rem",
      },
    });

    try {
      await changeMemberRole(userId, newRole);
      toast.success("Приоритеты обновлены", { id: toastId });
    } catch (error: any) {
      toast.error(error.message || "Ошибка доступа", { id: toastId });
    }
  };

  const isOwner = currentRole === "OWNER";

  return (
    <div className="relative group min-w-[140px]">
      {/* Иконка роли внутри селекта для визуала */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
        {isOwner ? (
          <ShieldCheck size={14} className="text-amber-400" />
        ) : (
          <User size={14} className="text-indigo-400" />
        )}
      </div>

      <select
        defaultValue={currentRole}
        onChange={handleChange}
        className={`w-full appearance-none text-[10px] font-black uppercase tracking-[0.2em] pl-9 pr-10 py-2.5 rounded-xl cursor-pointer outline-none border transition-all duration-300 ${
          isOwner
            ? "bg-amber-500/5 border-amber-500/20 text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.05)]"
            : "bg-indigo-500/5 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.05)]"
        }`}
      >
        <option value="MEMBER" className="bg-[#0f172a] text-slate-300">
          Участник
        </option>
        <option value="OWNER" className="bg-[#0f172a] text-slate-300">
          Владелец
        </option>
      </select>

      {/* Кастомная стрелочка */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
        <ChevronDown
          size={14}
          className={`transition-transform duration-300 group-hover:translate-y-0.5 ${
            isOwner ? "text-amber-600/50" : "text-indigo-500/50"
          }`}
        />
      </div>

      {/* Легкое свечение при наведении */}
      <div
        className={`absolute inset-0 rounded-xl -z-10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
          isOwner ? "bg-amber-500/20" : "bg-indigo-500/20"
        }`}
      />
    </div>
  );
}
