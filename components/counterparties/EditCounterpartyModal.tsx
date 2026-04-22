"use client";

import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  updateCounterparty,
  deleteCounterparty,
} from "@/app/actions/counterparties";
import {
  X,
  Save,
  Trash2,
  Plus,
  Landmark,
  Check,
  AlignLeft,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function EditCounterpartyModal({
  counterparty: cp,
  onClose,
}: {
  counterparty: any;
  onClose: () => void;
}) {
  const initialFields = JSON.parse(cp.fields || "{}");

  // Банковские поля всегда под рукой
  const bankKeys = ["ИНН", "БИК", "Р/С", "Банк"];
  const [bankData, setBankData] = useState(
    bankKeys.reduce(
      (acc, key) => ({ ...acc, [key]: initialFields[key] || "" }),
      {},
    ),
  );

  // Кастомные поля (динамические)
  const [customFields, setCustomFields] = useState(
    Object.entries(initialFields)
      .filter(([key]) => !bankKeys.includes(key))
      .map(([key, val]) => ({ id: Math.random().toString(), key, val })),
  );

  const [isAddingField, setIsAddingField] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleDelete() {
    if (
      !confirm(
        "Вы уверены? Это удалит контрагента и все его договоры навсегда.",
      )
    )
      return;
    try {
      await deleteCounterparty(cp.id);
      toast.success("Контрагент удален");
      onClose();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function handleAction(formData: FormData) {
    setIsSubmitting(true);
    try {
      await updateCounterparty(cp.id, formData);
      toast.success("Данные обновлены");
      onClose();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative bg-[#0f172a] border border-white/10 rounded-[2.5rem] w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <h2 className="text-xl font-black text-white uppercase">
            Редактирование
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDelete}
              className="p-2.5 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
            >
              <Trash2 size={18} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 text-slate-500 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form
          action={handleAction}
          className="p-8 overflow-y-auto custom-scrollbar space-y-8"
        >
          {/* База */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 tracking-widest ml-1">
              Название организации
            </label>
            <input
              name="name"
              defaultValue={cp.name}
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          {/* Банк */}
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-5">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
              <Landmark size={14} /> Реквизиты
            </p>
            <div className="grid grid-cols-2 gap-4">
              {bankKeys.map((key) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-600 uppercase ml-1">
                    {key}
                  </label>
                  <input
                    name={`bank_${key}`}
                    defaultValue={(bankData as any)[key]}
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:border-indigo-500 outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Кастомные */}
          <div className="space-y-4">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <AlignLeft size={14} /> Дополнительные поля
            </p>
            <div className="space-y-3">
              {customFields.map((f) => (
                <div key={f.id} className="group flex gap-2 items-end">
                  <div className="flex-1 space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-600 uppercase ml-1">
                      {f.key}
                    </label>
                    <input
                      name={`custom_${f.key}`}
                      defaultValue={f.val as string}
                      className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setCustomFields(customFields.filter((x) => x.id !== f.id))
                    }
                    className="mb-1 p-2 text-slate-700 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {isAddingField ? (
              <div className="flex gap-2 p-2 bg-white/5 rounded-xl border border-indigo-500/30 animate-in zoom-in-95">
                <input
                  autoFocus
                  placeholder="Имя поля (напр. Telegram)"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="flex-1 bg-transparent px-2 text-xs text-white outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newKey.trim()) {
                      setCustomFields([
                        ...customFields,
                        {
                          id: Date.now().toString(),
                          key: newKey.trim(),
                          val: "",
                        },
                      ]);
                      setNewKey("");
                      setIsAddingField(false);
                    }
                  }}
                  className="p-1.5 bg-indigo-500 rounded-lg text-white"
                >
                  <Check size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingField(true)}
                className="w-full py-3 border border-dashed border-white/10 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:text-indigo-400 hover:border-indigo-500/30 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={14} /> Добавить характеристику
              </button>
            )}
          </div>

          <div className="pt-6 border-t border-white/5 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-[10px] font-black uppercase text-slate-500"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 disabled:opacity-50"
            >
              {isSubmitting ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
