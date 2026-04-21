"use client";

import { useState } from "react";
import { addColumn } from "@/app/actions/tasks";
import { Plus, X, Check } from "lucide-react";
import toast from "react-hot-toast";

export default function AddColumnButton({ boardId }: { boardId: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    const title = formData.get("title") as string;

    if (!title?.trim()) {
      setIsEditing(false);
      return;
    }

    setIsPending(true);
    const t = toast.loading("Создание секции...");

    try {
      await addColumn(formData);
      toast.success("Секция добавлена", { id: t });
      setIsEditing(false);
    } catch (e: any) {
      toast.error(e.message || "Ошибка", { id: t });
    } finally {
      setIsPending(false);
    }
  }

  if (isEditing) {
    return (
      <form action={handleSubmit} className="min-w-[280px]">
        <input type="hidden" name="boardId" value={boardId} />

        <div className="bg-[#0f172a] p-3 rounded-xl border">
          <input
            autoFocus
            name="title"
            placeholder="Название секции..."
            className="w-full bg-transparent text-white outline-none"
          />

          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={() => setIsEditing(false)}>
              <X size={16} />
            </button>
            <button type="submit" disabled={isPending}>
              <Check size={16} />
            </button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="min-w-[280px] h-[46px] border border-dashed rounded-xl flex items-center justify-center gap-2"
    >
      <Plus size={16} />
      Добавить секцию
    </button>
  );
}
