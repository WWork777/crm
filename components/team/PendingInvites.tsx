"use client";

import { Check, X, Bell, Zap, Shield } from "lucide-react";
import { acceptInvitation, rejectInvitation } from "@/app/actions/team";
import { useState } from "react";

export default function PendingInvites({ invites }: { invites: any[] }) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  if (!invites || invites.length === 0) return null;

  return (
    <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
      {/* Заголовок секции */}
      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
        <div className="relative">
          <Bell size={14} className="text-indigo-400" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#030712] animate-pulse" />
        </div>
        Входящие запросы ({invites.length})
      </h3>

      <div className="space-y-4">
        {invites.map((invite) => (
          <div
            key={invite.id}
            className="group relative bg-[#0f172a]/40 border border-white/5 p-6 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-6 backdrop-blur-md hover:border-indigo-500/20 transition-all duration-500 shadow-2xl"
          >
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                <Zap size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-tight">
                  Вас приглашают в проект
                </p>
                <h4 className="text-xl font-black text-white tracking-tight">
                  «{invite.team.name}»
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <Shield size={12} className="text-indigo-500/50" />
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    Права: Участник
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Кнопка принять */}
              <button
                disabled={processingId === invite.id}
                onClick={async () => {
                  setProcessingId(invite.id);
                  await acceptInvitation(invite.id);
                }}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50"
              >
                <Check size={16} /> Принять
              </button>

              {/* Кнопка отклонить */}
              <button
                disabled={processingId === invite.id}
                onClick={async () => {
                  setProcessingId(invite.id);
                  await rejectInvitation(invite.id);
                }}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/5 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 border border-white/5 hover:border-rose-500/20 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-50"
              >
                <X size={16} /> Отклонить
              </button>
            </div>

            {/* Фоновое декоративное свечение у каждой карточки */}
            <div className="absolute -inset-px rounded-[2.5rem] bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
        ))}
      </div>
    </div>
  );
}
