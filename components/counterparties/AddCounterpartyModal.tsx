"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { addCounterparty } from "@/app/actions/counterparties";
import {
  Plus,
  X,
  Briefcase,
  Trash2,
  Check,
  PlusCircle,
  Sparkles,
  Landmark,
  AlignLeft,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AddCounterpartyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Стандартные банковские поля
  const bankKeys = ["ИНН", "БИК", "Р/С", "Банк"];

  // 2. Стейт для динамических полей (контакты и прочее)
  const [customFields, setCustomFields] = useState([
    { id: "1", key: "Телефон", val: "" },
    { id: "2", key: "Почта", val: "" },
  ]);

  const [isAddingField, setIsAddingField] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const fieldInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isAddingField && fieldInputRef.current) {
      fieldInputRef.current.focus();
    }
  }, [isAddingField]);

  const confirmAddField = () => {
    if (newFieldName.trim()) {
      setCustomFields([
        ...customFields,
        { id: Date.now().toString(), key: newFieldName.trim(), val: "" },
      ]);
      setNewFieldName("");
      setIsAddingField(false);
    }
  };

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    const t = toast.loading("Регистрация контрагента...");
    try {
      await addCounterparty(formData);
      toast.success("Контрагент добавлен в реестр", { id: t });
      setIsOpen(false);
      // Сброс полей после успешного добавления
      setCustomFields([
        { id: "1", key: "Телефон", val: "" },
        { id: "2", key: "Почта", val: "" },
      ]);
    } catch (e: any) {
      toast.error(e.message || "Ошибка при сохранении", { id: t });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!mounted) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
      >
        <PlusCircle
          size={16}
          className="group-hover:rotate-90 transition-transform duration-300"
        />
        Создать карточку
      </button>

      {isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
              onClick={() => setIsOpen(false)}
            />

            <div className="relative bg-[#0f172a] border border-white/10 rounded-[2.5rem] w-full max-w-xl flex flex-col max-h-[90vh] shadow-2xl animate-in zoom-in-95 duration-300 z-10 overflow-hidden">
              {/* Header */}
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-white flex items-center gap-3">
                    <Briefcase size={22} className="text-indigo-400" /> Новый
                    партнер
                  </h2>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles size={10} className="text-indigo-500" />{" "}
                    Заполнение карточки данных
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-500 hover:text-white bg-white/5 rounded-full transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                action={handleSubmit}
                className="flex-1 flex flex-col overflow-hidden"
              >
                <div className="p-8 overflow-y-auto custom-scrollbar space-y-8 flex-1">
                  {/* 1. Основное название */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                      Название организации
                    </label>
                    <input
                      name="name"
                      required
                      autoFocus
                      placeholder="Введите наименование..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold placeholder:text-slate-600"
                    />
                  </div>

                  {/* 2. Банковские реквизиты (Сетка) */}
                  <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-5">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                      <Landmark size={14} /> Банковские реквизиты
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {bankKeys.map((key) => (
                        <div key={key} className="space-y-1.5">
                          <label className="text-[9px] font-bold text-slate-600 uppercase ml-1">
                            {key}
                          </label>
                          <input
                            name={`bank_${key}`}
                            placeholder="—"
                            className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:border-indigo-500 outline-none transition-all"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Динамические поля */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <AlignLeft size={14} /> Дополнительные характеристики
                    </p>

                    <div className="space-y-3">
                      {customFields.map((field) => (
                        <div
                          key={field.id}
                          className="group flex gap-3 items-end animate-in slide-in-from-left-2 duration-300"
                        >
                          <div className="flex-1 space-y-1.5">
                            <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest ml-1">
                              {field.key}
                            </label>
                            <input
                              name={`custom_${field.key}`}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700"
                              placeholder={`Введите значение...`}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setCustomFields(
                                customFields.filter((f) => f.id !== field.id),
                              )
                            }
                            className="p-3 text-slate-700 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Добавление нового поля */}
                    <div className="pt-2">
                      {isAddingField ? (
                        <div className="flex items-center gap-2 bg-white/5 p-2 rounded-2xl border border-indigo-500/30 animate-in zoom-in-95 duration-200">
                          <input
                            ref={fieldInputRef}
                            type="text"
                            value={newFieldName}
                            onChange={(e) => setNewFieldName(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" &&
                              (e.preventDefault(), confirmAddField())
                            }
                            placeholder="Имя поля (напр. Генеральный директор)"
                            className="flex-1 bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600"
                          />
                          <button
                            type="button"
                            onClick={confirmAddField}
                            className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingField(false);
                              setNewFieldName("");
                            }}
                            className="p-2 text-slate-500 hover:text-white transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsAddingField(true)}
                          className="w-full py-4 border-2 border-dashed border-white/5 hover:border-indigo-500/30 text-slate-600 hover:text-indigo-400 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all group"
                        >
                          <Plus
                            size={14}
                            className="group-hover:rotate-90 transition-transform duration-300"
                          />
                          Добавить характеристику
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-white/5 flex justify-end gap-3 bg-white/[0.01]">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 active:scale-95"
                  >
                    {isSubmitting ? "Сохранение..." : "Зафиксировать партнера"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
