"use client";

import { createPortal } from "react-dom";
import {
  X,
  Briefcase,
  Landmark,
  AlignLeft,
  FileText,
  Calendar,
  Link as LinkIcon,
} from "lucide-react";

export default function ViewCounterpartyModal({
  cp,
  onClose,
}: {
  cp: any;
  onClose: () => void;
}) {
  const fields = JSON.parse(cp.fields || "{}");

  // Список стандартных банковских ключей для фильтрации
  const bankKeys = ["ИНН", "БИК", "Р/С", "К/С", "Банк", "КПП"];
  const bankFields = Object.entries(fields).filter(([key]) =>
    bankKeys.includes(key),
  );
  const otherFields = Object.entries(fields).filter(
    ([key]) => !bankKeys.includes(key),
  );

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative bg-[#0f172a] border border-white/10 rounded-[2.5rem] w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95">
        <div className="p-8 border-b border-white/5 flex justify-between items-start bg-white/[0.02]">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <Briefcase size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">{cp.name}</h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                Информация о партнере
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-white bg-white/5 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
          {/* Реквизиты */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Landmark size={14} /> Банковские реквизиты
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {bankFields.length > 0 ? (
                bankFields.map(([key, val]) => (
                  <div
                    key={key}
                    className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl"
                  >
                    <p className="text-[9px] font-black text-slate-600 uppercase mb-1">
                      {key}
                    </p>
                    <p className="text-xs font-bold text-slate-200">
                      {val as string}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-600 italic px-2">
                  Данные не указаны
                </p>
              )}
            </div>
          </section>

          {/* Другие поля */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <AlignLeft size={14} /> Контакты и прочее
            </h3>
            <div className="space-y-2">
              {otherFields.map(([key, val]) => (
                <div
                  key={key}
                  className="flex justify-between items-center p-4 bg-white/[0.01] border border-white/5 rounded-2xl"
                >
                  <span className="text-[10px] font-black text-slate-500 uppercase">
                    {key}
                  </span>
                  <span className="text-sm font-bold text-slate-200">
                    {val as string}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>,
    document.body,
  );
}
