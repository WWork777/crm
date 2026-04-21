"use client";

import { useRouter } from "next/navigation";
import { Plus, Layout } from "lucide-react";
import { createBoard } from "@/app/actions/tasks";
import toast from "react-hot-toast";

export default function BoardTabs({
  boards,
  activeBoardId,
}: {
  boards: any[];
  activeBoardId: string;
}) {
  const router = useRouter();

  async function handleAddBoard() {
    const name = prompt("Введите название нового направления (напр. Дизайн):");
    if (!name || !name.trim()) return;

    try {
      const newBoard = await createBoard(name.trim());
      toast.success(`Доска "${name}" создана`);
      router.push(`/tasks?boardId=${newBoard.id}`);
    } catch (e: any) {
      toast.error("Ошибка при создании доски");
    }
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
      {boards.map((board) => (
        <button
          key={board.id}
          onClick={() => router.push(`/tasks?boardId=${board.id}`)}
          className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all shrink-0 flex items-center gap-2 border ${
            activeBoardId === board.id
              ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20"
              : "bg-white/5 text-slate-500 border-white/5 hover:bg-white/10 hover:text-slate-300"
          }`}
        >
          <Layout
            size={12}
            className={
              activeBoardId === board.id ? "text-indigo-200" : "text-slate-600"
            }
          />
          {board.name}
        </button>
      ))}

      <button
        onClick={handleAddBoard}
        className="flex items-center gap-2 px-3 py-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500/20 transition-all border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest"
      >
        <Plus size={14} />
        Новая доска
      </button>
    </div>
  );
}
