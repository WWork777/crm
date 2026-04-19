"use client";

import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { addContract } from "@/app/actions/contracts";
import {
  X,
  FilePlus,
  Calendar,
  Type,
  Upload,
  FileText,
  Trash2,
  Save,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AddContractModal({
  counterpartyId,
  counterpartyName,
  onClose,
}: {
  counterpartyId: string;
  counterpartyName: string;
  onClose: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        // Ограничение 10МБ
        toast.error("Файл слишком большой (макс. 10МБ)");
        return;
      }
      setFile(selectedFile);
    }
  };

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    const t = toast.loading("Загрузка документа...");

    try {
      // 1. ЛОГИКА ЗАГРУЗКИ ФАЙЛА (Эмуляция или реальный API)
      // Здесь ты отправляешь файл на Vercel Blob или свой API
      // let uploadedUrl = "";
      // if (file) { uploadedUrl = await uploadToCloud(file); }

      // Пока добавим файл в FormData для Server Action
      if (file) {
        formData.append("file", file);
      }

      await addContract(formData);

      toast.success("Договор успешно заархивирован", { id: t });
      onClose();
    } catch (e) {
      toast.error("Ошибка при сохранении файла", { id: t });
    } finally {
      setIsSubmitting(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in"
        onClick={onClose}
      />

      <div className="relative bg-[#0f172a] border border-white/10 rounded-[2.5rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 z-10 overflow-hidden">
        {/* Декоративный фон */}
        <div className="absolute -right-20 -top-20 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-white flex items-center gap-3">
              <FilePlus size={22} className="text-indigo-400" /> Скан договора
            </h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate max-w-[200px]">
              Партнер: {counterpartyName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-white bg-white/5 rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <form action={handleSubmit} className="p-8 space-y-6">
          <input type="hidden" name="counterpartyId" value={counterpartyId} />

          {/* Загрузка файла */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">
              Файл документа (PDF/JPG)
            </label>

            {!file ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group border-2 border-dashed border-white/5 hover:border-indigo-500/30 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all bg-white/[0.01] hover:bg-indigo-500/5"
              >
                <div className="p-4 bg-white/5 rounded-2xl text-slate-600 group-hover:text-indigo-400 group-hover:scale-110 transition-all">
                  <Upload size={24} />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-400">
                    Нажмите для выбора
                  </p>
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">
                    PDF или изображение до 10MB
                  </p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl animate-in zoom-in-95">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                    <FileText size={20} />
                  </div>
                  <div className="max-w-[180px]">
                    <p className="text-xs font-bold text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-[9px] font-black text-indigo-400/60 uppercase">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="p-2 text-slate-500 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Type size={12} /> Название
              </label>
              <input
                name="title"
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-[10px] font-black text-white focus:border-indigo-500 outline-none uppercase"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Calendar size={12} /> Дата
              </label>
              <input
                type="date"
                name="date"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-[10px] font-black text-white focus:border-indigo-500 outline-none [color-scheme:dark]"
              />
            </div>
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
              disabled={isSubmitting || !file}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95"
            >
              {isSubmitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              {isSubmitting ? "ЗАГРУЗКА..." : "СОХРАНИТЬ ФАЙЛ"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
