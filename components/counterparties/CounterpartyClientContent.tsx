"use client";

import { useState } from "react";
import {
  Briefcase,
  FileText,
  Settings2,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import AddCounterpartyModal from "./AddCounterpartyModal";
import EditCounterpartyModal from "./EditCounterpartyModal";
import AddContractModal from "./AddContractModal";
import ViewCounterpartyModal from "./ViewCounterpartyModal"; // Импортируем модалку просмотра

export default function CounterpartyClientContent({
  counterparties,
}: {
  counterparties: any[];
}) {
  const [editingCp, setEditingCp] = useState<any | null>(null);
  const [viewingCp, setViewingCp] = useState<any | null>(null); // Состояние для просмотра
  const [contractTarget, setContractTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-400 p-4 sm:p-10 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="max-w-8xl mx-auto space-y-6">
        {/* Хедер */}
        <header className="flex justify-between items-center bg-[#0f172a]/40 p-5 rounded-[2rem] border border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-500/10 border border-indigo-500/20 p-2.5 rounded-xl text-indigo-400 shadow-inner">
              <Briefcase size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Реестр контрагентов
              </h1>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                Всего записей: {counterparties.length}
              </p>
            </div>
          </div>
          <AddCounterpartyModal />
        </header>

        {/* Список контрагентов */}
        <div className="space-y-3">
          {counterparties.length === 0 ? (
            <div className="h-48 border border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-600 bg-[#0f172a]/10">
              <Briefcase size={32} className="mb-3 opacity-10" />
              <p className="text-[10px] font-black uppercase tracking-widest">
                База данных пуста
              </p>
            </div>
          ) : (
            counterparties.map((cp) => {
              const fields = JSON.parse(cp.fields || "{}");

              return (
                <div
                  key={cp.id}
                  // ГЛАВНОЕ: Клик по всей строке открывает просмотр
                  onClick={() => setViewingCp(cp)}
                  className="group relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-[#0f172a]/40 border border-white/5 p-5 lg:px-8 rounded-[2rem] hover:bg-white/[0.03] hover:border-indigo-500/30 transition-all cursor-pointer overflow-hidden"
                >
                  {/* Декоративная иконка стрелочки при наведении */}
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-indigo-500 hidden lg:block">
                    <ArrowUpRight size={20} />
                  </div>

                  <div className="flex items-center gap-4 min-w-[250px]">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-all border border-white/5">
                      <Briefcase size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">
                        {cp.name}
                      </h3>
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                        ИНН: {fields["ИНН"] || "не указан"}
                      </p>
                    </div>
                  </div>

                  {/* Краткие реквизиты в строке */}
                  <div className="flex flex-wrap gap-4 lg:gap-8 flex-1">
                    {Object.entries(fields)
                      .slice(0, 2)
                      .map(([key, val]) => (
                        <div key={key} className="flex flex-col">
                          <span className="text-[8px] font-black text-slate-600 uppercase tracking-tighter">
                            {key}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium truncate max-w-[150px]">
                            {(val as string) || "—"}
                          </span>
                        </div>
                      ))}
                  </div>

                  {/* Кнопки действий */}
                  <div className="flex items-center gap-3 shrink-0 self-end lg:self-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Остановка всплытия клика
                        setContractTarget({ id: cp.id, name: cp.name });
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/20 text-[10px] font-black uppercase text-slate-400 hover:text-indigo-400 transition-all"
                    >
                      <FileText size={12} />
                      Документы: {cp.contracts?.length || 0}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Остановка всплытия клика
                        setEditingCp(cp);
                      }}
                      className="p-2.5 text-slate-600 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5 rounded-xl transition-all"
                    >
                      <Settings2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* --- МОДАЛЬНЫЕ ОКНА --- */}

      {/* Просмотр (View) */}
      {viewingCp && (
        <ViewCounterpartyModal
          cp={viewingCp}
          onClose={() => setViewingCp(null)}
        />
      )}

      {/* Редактирование (Edit) */}
      {editingCp && (
        <EditCounterpartyModal
          counterparty={editingCp}
          onClose={() => setEditingCp(null)}
        />
      )}

      {/* Добавление контрагента (Add) */}
      {/* (Он вызывается через триггер внутри хедера) */}

      {/* Добавление договора */}
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
