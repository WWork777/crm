"use client";

import { useState } from "react";
import { inviteUserToTeam } from "@/app/actions/team";
import { UserPlus, Loader2, Sparkles, Send } from "lucide-react";

export default function InviteMemberForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await inviteUserToTeam(email);
      setMessage({
        type: "success",
        text: "Доступ предоставлен. Приглашение отправлено!",
      });
      setEmail("");
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Не удалось отправить запрос",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0f172a]/30 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-sm shadow-2xl mb-10">
      {/* Заголовок блока */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 shadow-lg shadow-indigo-500/5">
          <UserPlus size={20} />
        </div>
        <div className="space-y-0.5">
          <h3 className="text-lg font-black text-white tracking-tight">
            Масштабирование <span className="text-slate-500">команды</span>
          </h3>
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles size={10} className="text-indigo-500" /> Добавление нового
            узла доступа
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@company.com"
            required
            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all font-bold"
          />
          {/* Декоративная линия при фокусе */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-indigo-500 group-focus-within:w-1/2 transition-all duration-500 blur-sm opacity-50" />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 group active:scale-95"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <>
              Отправить{" "}
              <Send
                size={14}
                className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
              />
            </>
          )}
        </button>
      </form>

      {/* Обратная связь */}
      {message && (
        <div
          className={`mt-6 flex items-center gap-2 px-4 py-2 rounded-xl border animate-in fade-in slide-in-from-top-2 duration-300 ${
            message.type === "success"
              ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/5 border-rose-500/20 text-rose-400"
          }`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full animate-pulse ${
              message.type === "success" ? "bg-emerald-500" : "bg-rose-500"
            }`}
          />
          <p className="text-[10px] font-black uppercase tracking-widest">
            {message.text}
          </p>
        </div>
      )}
    </div>
  );
}
