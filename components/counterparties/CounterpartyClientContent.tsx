"use client";

import { useState } from "react";
import { Briefcase, FileText, Settings2 } from "lucide-react";
import AddCounterpartyModal from "./AddCounterpartyModal";
import EditCounterpartyModal from "./EditCounterpartyModal";
import AddContractModal from "./AddContractModal";

export default function CounterpartyClientContent({
  counterparties,
}: {
  counterparties: any[];
}) {
  const [editingCp, setEditingCp] = useState<any | null>(null);
  const [contractTarget, setContractTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  return (
    <div className="min-h-screen bg-[#030712] text-slate-400 p-4 sm:p-10 font-sans">
      <div className="max-w-8xl mx-auto space-y-10">
        <header className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="bg-indigo-500/10 border border-indigo-500/20 p-3.5 rounded-2xl text-indigo-400">
              <Briefcase size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight leading-none">
                Реестр{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                  контрагентов
                </span>
              </h1>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mt-2">
                Управление базой партнеров
              </p>
            </div>
          </div>
          <AddCounterpartyModal />
        </header>

        {counterparties.length === 0 ? (
          <div className="h-64 border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-slate-600 bg-[#0f172a]/10">
            <Briefcase size={40} className="mb-4 opacity-10" />
            <p className="text-[10px] font-black uppercase tracking-widest text-center">
              База контрагентов пуста
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {counterparties.map((cp) => {
              const fields = JSON.parse(cp.fields || "{}");

              return (
                <div
                  key={cp.id}
                  className="bg-[#0f172a]/30 border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-md hover:border-indigo-500/30 transition-all group relative overflow-hidden shadow-2xl"
                >
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20 group-hover:scale-105 transition-transform">
                      <Briefcase size={24} />
                    </div>
                    <button
                      onClick={() => setEditingCp(cp)} // Правильное место для вызова модалки
                      className="p-2 text-slate-700 hover:text-white bg-white/5 rounded-xl transition-all"
                    >
                      <Settings2 size={18} />
                    </button>
                  </div>

                  <h3 className="text-2xl font-black text-white mb-6 tracking-tight leading-none truncate">
                    {cp.name}
                  </h3>

                  <div className="space-y-4 mb-8">
                    {Object.entries(fields).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex flex-col border-b border-white/5 pb-2"
                      >
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">
                          {key}
                        </span>
                        <span className="text-xs font-bold text-slate-300 truncate">
                          {(value as string) || "—"}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() =>
                      setContractTarget({ id: cp.id, name: cp.name })
                    }
                    className="w-full py-4 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 rounded-2xl border border-white/5 flex items-center justify-center gap-3 transition-all relative z-10"
                  >
                    <FileText size={16} /> Договоры ({cp.contracts?.length || 0}
                    )
                  </button>

                  <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-indigo-600/5 rounded-full blur-3xl" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Модалка редактирования рендерится один раз вне цикла */}
      {editingCp && (
        <EditCounterpartyModal
          counterparty={editingCp}
          onClose={() => setEditingCp(null)}
        />
      )}

      {contractTarget && (
        <AddContractModal
          counterpartyId={contractTarget.id}
          counterpartyName={contractTarget.name}
          onClose={() => setContractTarget(null)}
        />
      )}
    </div>
  );
}
