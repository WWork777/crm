"use client";

import { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  updateTaskStatus,
  deleteTask,
  addColumn,
  deleteColumn,
} from "@/app/actions/tasks";
import toast from "react-hot-toast";
import {
  Trash2,
  Plus,
  Edit2,
  Calendar,
  Search,
  LayoutGrid,
  X,
} from "lucide-react";
import AddTaskModal from "./AddTaskModal";
import EditTaskModal from "./EditTaskModal";

const PRIORITY_STYLES = {
  HIGH: {
    label: "High",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    glow: "shadow-[0_0_15px_rgba(244,63,94,0.1)]",
    dot: "bg-rose-500",
  },
  MEDIUM: {
    label: "Medium",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    glow: "shadow-[0_0_15px_rgba(245,158,11,0.1)]",
    dot: "bg-amber-500",
  },
  LOW: {
    label: "Low",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    glow: "shadow-[0_0_15px_rgba(16,185,129,0.1)]",
    dot: "bg-emerald-500",
  },
};

export default function KanbanBoard({
  initialTasks,
  initialColumns,
  userRole,
  teamMembers,
}: {
  initialTasks: any[];
  initialColumns: any[];
  userRole: string;
  teamMembers: any[];
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [tasks, setTasks] = useState(initialTasks);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    setTasks(initialTasks);
  }, [initialTasks, initialColumns]);

  if (!isMounted)
    return (
      <div className="h-96 flex items-center justify-center animate-pulse bg-white/5 rounded-3xl text-slate-500 font-black uppercase tracking-[0.3em] text-xs">
        Инициализация систем...
      </div>
    );

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const newColumnId = destination.droppableId;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === draggableId ? { ...t, status: newColumnId } : t,
      ),
    );

    try {
      await updateTaskStatus(draggableId, newColumnId);
    } catch (error) {
      toast.error("Ошибка синхронизации");
      window.location.reload();
    }
  };

  const handleAddColumn = async (formData: FormData) => {
    const t = toast.loading("Создание секции...");
    try {
      await addColumn(formData);
      toast.success("Колонка добавлена", { id: t });
      setIsAddingColumn(false);
    } catch (e: any) {
      toast.error(e.message, { id: t });
    }
  };

  return (
    <div className="flex flex-col gap-8 min-h-screen bg-[#030712] text-slate-300">
      {/* ПАНЕЛЬ УПРАВЛЕНИЯ */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-[#0f172a]/30 p-6 rounded-[2.5rem] border border-white/5 backdrop-blur-md">
        <div className="relative w-full md:w-96 group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Поиск по задачам..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all"
          />
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/5 hidden lg:block">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
              Всего задач
            </p>
            <p className="text-sm font-bold text-white text-center">
              {tasks.length}
            </p>
          </div>
          <AddTaskModal columns={initialColumns} members={teamMembers} />
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div
          className="flex gap-6 overflow-x-auto pb-12 -mb-6 items-start select-none
          [&::-webkit-scrollbar]:h-1.5
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:bg-white/10
          [&::-webkit-scrollbar-thumb]:rounded-full
          hover:[&::-webkit-scrollbar-thumb]:bg-indigo-500/40
          transition-colors"
        >
          {initialColumns.map((column) => {
            const columnTasks = filteredTasks.filter(
              (t) => t.status === column.id,
            );

            return (
              <div
                key={column.id}
                className="flex flex-col gap-4 min-w-[340px] w-[340px] shrink-0"
              >
                <div className="flex items-center justify-between bg-[#0f172a]/50 px-6 py-4 rounded-[1.5rem] border border-white/5 group backdrop-blur-sm">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex-1">
                    {column.title}
                  </div>
                  <span className="bg-white/5 text-slate-500 text-[10px] font-black px-2.5 py-1 rounded-lg border border-white/5">
                    {columnTasks.length}
                  </span>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[200px] rounded-[2rem] p-3 transition-all duration-300 ${
                        snapshot.isDraggingOver
                          ? "bg-indigo-500/5 ring-1 ring-indigo-500/20"
                          : "bg-transparent"
                      }`}
                    >
                      {columnTasks.map((task, index) => {
                        // РАСЧЕТ СТИЛЯ ТЕПЕРЬ ТУТ, ВНУТРИ ЦИКЛА
                        const taskStyle =
                          PRIORITY_STYLES[
                            task.priority as keyof typeof PRIORITY_STYLES
                          ] || PRIORITY_STYLES.MEDIUM;

                        return (
                          <Draggable
                            key={task.id}
                            draggableId={task.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => setEditingTaskId(task.id)}
                                className={`group relative bg-[#111827] p-5 rounded-[1.8rem] border mb-4 transition-all duration-300 cursor-grab active:cursor-grabbing ${
                                  snapshot.isDragging
                                    ? "shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-indigo-500/50 rotate-2 scale-105 z-50 ring-1 ring-indigo-500/50 bg-[#1e293b]"
                                    : `border-white/5 hover:border-white/10 hover:bg-[#161e2c] ${taskStyle.glow}`
                                }`}
                              >
                                {/* ПРИОРИТЕТ */}
                                <div className="flex items-center gap-2 mb-3">
                                  <div
                                    className={`px-2 py-0.5 rounded-md border ${taskStyle.bg} ${taskStyle.border} flex items-center gap-1.5`}
                                  >
                                    <div
                                      className={`w-1 h-1 rounded-full ${taskStyle.dot} animate-pulse`}
                                    />
                                    <span
                                      className={`text-[8px] font-black uppercase tracking-[0.2em] ${taskStyle.color}`}
                                    >
                                      {taskStyle.label}
                                    </span>
                                  </div>
                                </div>

                                <h4 className="font-bold text-slate-200 pr-10 mb-2 leading-tight group-hover:text-white transition-colors">
                                  {task.title}
                                </h4>

                                {task.dueDate && (
                                  <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20 mb-3 w-fit">
                                    <Calendar size={10} />
                                    {new Date(task.dueDate).toLocaleDateString(
                                      "ru-RU",
                                      { day: "2-digit", month: "short" },
                                    )}
                                  </div>
                                )}

                                {task.description && (
                                  <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed mb-4">
                                    {task.description}
                                  </p>
                                )}

                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[10px] font-black text-white uppercase ring-2 ring-[#111827]">
                                      {task.assignee?.name?.[0] ||
                                        task.assignee?.email?.[0] ||
                                        "?"}
                                    </div>
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest truncate max-w-[120px]">
                                      {task.assignee?.name?.split(" ")[0] ||
                                        "Unassigned"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {editingTaskId && (
        <EditTaskModal
          task={tasks.find((t) => t.id === editingTaskId)}
          columns={initialColumns}
          members={teamMembers}
          onClose={() => setEditingTaskId(null)}
        />
      )}
    </div>
  );
}
