"use client";

import { useState } from "react";
import { Briefcase, FileText, Settings2, Plus, Info } from "lucide-react";
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
      <div className="max-w-8xl mx-auto space-y-6">
        {/* Компактный хедер */}
        <header className="flex justify-between items-center bg-[#0f172a]/40 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-500/10 border border-indigo-500/20 p-2.5 rounded-xl text-indigo-400">
              <Briefcase size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Реестр контрагентов
              </h1>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
                База партнеров: {counterparties.length}
              </p>
            </div>
          </div>
          <AddCounterpartyModal />
        </header>

        {counterparties.length === 0 ? (
          <div className="h-48 border border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-slate-600 bg-[#0f172a]/10">
            <Briefcase size={32} className="mb-3 opacity-10" />
            <p className="text-[10px] font-bold uppercase tracking-widest">
              Список пуст
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Заголовки "таблицы" (скрыты на мобилках) */}
            <div className="hidden lg:grid grid-cols-12 px-8 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
              <div className="col-span-3">Контрагент</div>
              <div className="col-span-6">Дополнительные реквизиты</div>
              <div className="col-span-2 text-center">Документы</div>
              <div className="col-span-1 text-right">Опции</div>
            </div>

            {/* Список строк */}
            {counterparties.map((cp) => {
              const fields = JSON.parse(cp.fields || "{}");

              return (
                <div
                  key={cp.id}
                  className="group grid grid-cols-1 lg:grid-cols-12 items-center gap-4 bg-[#0f172a]/30 border border-white/5 p-3 lg:px-8 lg:py-3 rounded-2xl hover:bg-white/[0.03] hover:border-indigo-500/30 transition-all"
                >
                  {/* Имя и иконка */}
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-colors">
                      <Briefcase size={16} />
                    </div>
                    <span className="text-sm font-bold text-slate-200 truncate">
                      {cp.name}
                    </span>
                  </div>

                  {/* Динамические поля (выстроены в ряд) */}
                  <div className="col-span-6 flex flex-wrap gap-x-6 gap-y-1">
                    {Object.entries(fields)
                      .slice(0, 3)
                      .map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tight">
                            {key}:
                          </span>
                          <span className="text-[11px] text-slate-400 truncate max-w-[120px]">
                            {(value as string) || "—"}
                          </span>
                        </div>
                      ))}
                    {Object.keys(fields).length > 3 && (
                      <span className="text-[9px] text-indigo-500 font-bold">
                        + еще {Object.keys(fields).length - 3}
                      </span>
                    )}
                  </div>

                  {/* Кнопка договоров */}
                  <div className="col-span-2 flex justify-center">
                    <button
                      onClick={() =>
                        setContractTarget({ id: cp.id, name: cp.name })
                      }
                      className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-white/5 hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/20 text-[10px] font-bold text-slate-400 hover:text-indigo-400 transition-all"
                    >
                      <FileText size={12} />
                      Договоры: {cp.contracts?.length || 0}
                    </button>
                  </div>

                  {/* Кнопка настроек */}
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => setEditingCp(cp)}
                      className="p-2 text-slate-600 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                    >
                      <Settings2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Модалки */}
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
