"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { updateCounterparty } from "@/app/actions/counterparties";
import {
  X,
  Briefcase,
  Trash2,
  Check,
  Sparkles,
  Save,
  Plus,
} from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  counterparty: any;
  onClose: () => void;
}

export default function EditCounterpartyModal({
  counterparty,
  onClose,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Парсим существующие поля из JSON
  const initialFields = JSON.parse(counterparty.fields || "{}");
  const [fields, setFields] = useState(
    Object.keys(initialFields).map((key) => ({
      id: Math.random().toString(),
      name: key,
      value: initialFields[key],
    })),
  );

  const [isAddingField, setIsAddingField] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const fieldInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isAddingField && fieldInputRef.current) fieldInputRef.current.focus();
  }, [isAddingField]);

  const confirmAddField = () => {
    if (newFieldName.trim()) {
      setFields([
        ...fields,
        { id: Date.now().toString(), name: newFieldName.trim(), value: "" },
      ]);
      setNewFieldName("");
      setIsAddingField(false);
    }
  };

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    const t = toast.loading("Обновление данных...");
    try {
      await updateCounterparty(counterparty.id, formData);
      toast.success("Данные сохранены", { id: t });
      onClose();
    } catch (e) {
      toast.error("Ошибка обновления", { id: t });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="relative bg-[#0f172a] border border-white/10 rounded-[2.5rem] w-full max-w-xl flex flex-col max-h-[90vh] shadow-2xl animate-in zoom-in-95 duration-300 z-10">
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-white flex items-center gap-3">
              <Save size={20} className="text-indigo-400" /> Редактирование
            </h2>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
              ID: {counterparty.id.slice(-8)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-white bg-white/5 rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <form
          action={handleSubmit}
          className="p-8 overflow-y-auto 
  /* Стили для Webkit (Chrome, Safari, Edge) */
  [&::-webkit-scrollbar]:w-1.5
  [&::-webkit-scrollbar-track]:bg-transparent
  [&::-webkit-scrollbar-thumb]:bg-white/10
  [&::-webkit-scrollbar-thumb]:rounded-full
  hover:[&::-webkit-scrollbar-thumb]:bg-indigo-500/40
  
  /* Стили для Firefox */
  [scrollbar-width:thin]
  [scrollbar-color:rgba(99,102,241,0.2)_transparent]
  
  flex-1 transition-colors"
        >
          {/* Название */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
              Название организации
            </label>
            <input
              name="name"
              defaultValue={counterparty.name}
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 outline-none transition-all font-bold"
            />
          </div>

          {/* Поля */}
          <div className="space-y-6">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-1">
              Атрибуты контрагента
            </p>

            <div className="grid grid-cols-1 gap-5">
              {fields.map((field) => (
                <div key={field.id} className="group flex gap-3 items-end">
                  <div className="flex-1 space-y-2">
                    <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest ml-1">
                      {field.name}
                    </label>
                    <input
                      name={`custom_${field.name}`}
                      defaultValue={field.value}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFields(fields.filter((f) => f.id !== field.id))
                    }
                    className="p-3.5 bg-white/5 hover:bg-rose-500/10 text-slate-700 hover:text-rose-500 rounded-xl border border-white/5 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Добавление поля */}
            <div className="pt-2">
              {isAddingField ? (
                <div className="flex items-center gap-2 bg-white/5 p-2 rounded-2xl border border-indigo-500/30">
                  <input
                    ref={fieldInputRef}
                    type="text"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    placeholder="Имя поля..."
                    className="flex-1 bg-transparent px-3 py-2 text-sm text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={confirmAddField}
                    className="p-2 bg-indigo-600 text-white rounded-xl"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingField(false)}
                    className="p-2 text-slate-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingField(true)}
                  className="w-full py-4 border-2 border-dashed border-white/5 hover:border-indigo-500/30 text-slate-600 hover:text-indigo-400 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                >
                  <Plus size={14} /> Добавить характеристику
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-white/5 flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Сохранение..." : "Обновить данные"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
