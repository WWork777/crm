"use client";

import { useState, useEffect, useRef } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { updateTaskStatus, updateColumnsOrder } from "@/app/actions/tasks";
import toast from "react-hot-toast";
import {
  Search,
  LayoutGrid,
  User,
  Clock,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from "lucide-react";
import AddTaskModal from "./AddTaskModal";
import EditTaskModal from "./EditTaskModal";
import AddColumnButton from "./AddColumnButton";

// --- ИНТЕРФЕЙСЫ ---
interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: string | Date | null;
  assignee?: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
}

interface Column {
  id: string;
  title: string;
  order: number;
}

interface KanbanBoardProps {
  initialTasks: Task[];
  initialColumns: Column[];
  userRole: string;
  teamMembers: any[];
}

// --- СТИЛИ ПРИОРИТЕТОВ ---
const PRIORITY_STYLES = {
  HIGH: {
    label: "Высокий",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    dot: "bg-rose-500",
  },
  MEDIUM: {
    label: "Средний",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    dot: "bg-amber-500",
  },
  LOW: {
    label: "Низкий",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    dot: "bg-emerald-500",
  },
};

export default function KanbanBoard({
  initialTasks,
  initialColumns,
  userRole,
  teamMembers,
}: KanbanBoardProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // --- СОСТОЯНИЯ ДЛЯ КРАЕВ СКРОЛЛА ---
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Рефы для плавного скролла
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollDirRef = useRef<"left" | "right" | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // --- ПРОВЕРКА ПОЗИЦИИ СКРОЛЛА ---
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      // Если отступили от левого края больше чем на 2px — показываем левую зону
      setCanScrollLeft(scrollLeft > 2);
      // Если до правого края осталось больше 2px — показываем правую зону
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 2);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    setTasks(initialTasks);
    setColumns(initialColumns);

    // Проверяем скролл при первой загрузке (с небольшой задержкой для рендера)
    setTimeout(checkScrollPosition, 100);
    window.addEventListener("resize", checkScrollPosition);

    return () => {
      stopScroll();
      window.removeEventListener("resize", checkScrollPosition);
    };
  }, [initialTasks, initialColumns]);

  // Перепроверяем скролл, если добавили/удалили колонку или задачу
  useEffect(() => {
    checkScrollPosition();
  }, [columns.length, tasks.length]);

  // --- ЛОГИКА ПЛАВНОГО СКРОЛЛА ---
  const performScroll = () => {
    if (!scrollContainerRef.current || !scrollDirRef.current) {
      animationFrameId.current = null;
      return;
    }

    const speed = 4; // Оптимальная скорость скролла
    scrollContainerRef.current.scrollLeft +=
      scrollDirRef.current === "right" ? speed : -speed;

    // После каждого шага скролла проверяем, не уперлись ли мы в край
    checkScrollPosition();

    animationFrameId.current = requestAnimationFrame(performScroll);
  };

  const startScroll = (dir: "left" | "right") => {
    scrollDirRef.current = dir;
    if (!animationFrameId.current) {
      animationFrameId.current = requestAnimationFrame(performScroll);
    }
  };

  const stopScroll = () => {
    scrollDirRef.current = null;
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
  };

  if (!isMounted)
    return (
      <div className="h-96 flex items-center justify-center bg-white/5 rounded-[2rem] animate-pulse" />
    );

  const filteredTasks = tasks.filter((t: Task) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // --- ОБРАБОТКА DRAG & DROP ---
  const onDragEnd = async (result: DropResult) => {
    stopScroll(); // Останавливаем скролл при отпускании элемента
    const { destination, source, draggableId, type } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    // ПЕРЕМЕЩЕНИЕ КОЛОНОК
    if (type === "COLUMN") {
      const newCols = Array.from(columns);
      const [removed] = newCols.splice(source.index, 1);
      newCols.splice(destination.index, 0, removed);

      setColumns(newCols);
      // Даем браузеру отрендерить новые колонки и перепроверяем ширину скролла
      setTimeout(checkScrollPosition, 50);

      try {
        await updateColumnsOrder(newCols.map((c) => c.id));
      } catch {
        toast.error("Ошибка сохранения порядка колонок");
        setColumns(initialColumns);
      }
      return;
    }

    // ПЕРЕМЕЩЕНИЕ ЗАДАЧ
    const newColumnId = destination.droppableId;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === draggableId ? { ...t, status: newColumnId } : t,
      ),
    );

    try {
      await updateTaskStatus(draggableId, newColumnId);
    } catch (error) {
      toast.error("Ошибка перемещения задачи");
      setTasks(initialTasks);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full h-full min-w-0 max-w-full relative">
      {/* ПАНЕЛЬ УПРАВЛЕНИЯ */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0f172a]/40 p-4 rounded-[2rem] border border-white/5 backdrop-blur-md shrink-0 mx-2">
        <div className="relative w-full sm:w-72 group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors"
            size={14}
          />
          <input
            type="text"
            placeholder="Поиск по задачам..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="hidden md:flex flex-col items-end px-4 border-r border-white/5">
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
              Задач в работе
            </span>
            <span className="text-xs font-bold text-white">{tasks.length}</span>
          </div>
          <AddTaskModal columns={columns} members={teamMembers} />
        </div>
      </div>

      {/* DRAG & DROP КОНТЕЙНЕР */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="relative group/board w-full min-w-0 flex-1 overflow-hidden">
          {/* ЗОНА НАВЕДЕНИЯ: ЛЕВО (Показываем только если есть куда крутить влево) */}
          {canScrollLeft && (
            <div
              onMouseEnter={() => startScroll("left")}
              onMouseLeave={stopScroll}
              className="absolute left-0 top-0 bottom-0 w-24 z-40 cursor-west-resize flex items-center justify-start pl-2 opacity-0 group-hover/board:opacity-100 transition-all via-[#030712]/60 to-transparent pointer-events-auto"
            >
              <div className="p-2 rounded-full bg-white/5 border border-white/10 text-white/40 pointer-events-none backdrop-blur-sm shadow-xl">
                <ChevronLeft size={16} />
              </div>
            </div>
          )}

          {/* ЗОНА НАВЕДЕНИЯ: ПРАВО (Показываем только если есть куда крутить вправо) */}
          {canScrollRight && (
            <div
              onMouseEnter={() => startScroll("right")}
              onMouseLeave={stopScroll}
              className="absolute right-0 top-0 bottom-0 w-24 z-40 cursor-east-resize flex items-center justify-end pr-2 opacity-0 group-hover/board:opacity-100 transition-all via-[#030712]/60 to-transparent pointer-events-auto"
            >
              <div className="p-2 rounded-full bg-white/5 border border-white/10 text-white/40 pointer-events-none backdrop-blur-sm shadow-xl">
                <ChevronRight size={16} />
              </div>
            </div>
          )}

          {/* КОНТЕЙНЕР СКРОЛЛА */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScrollPosition} // Отслеживаем скролл пользователя колесиком/трекпадом
            className="w-full h-full overflow-x-auto pb-6 custom-scrollbar relative"
          >
            <Droppable
              droppableId="tasks-columns"
              type="COLUMN"
              direction="horizontal"
            >
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  // Обычные аккуратные отступы px-4
                  className="flex gap-5 items-start min-w-max pr-10 px-4"
                >
                  {columns.map((column, index) => {
                    const columnTasks = filteredTasks.filter(
                      (t) => t.status === column.id,
                    );

                    return (
                      <Draggable
                        key={column.id}
                        draggableId={column.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex flex-col gap-3 min-w-[300px] w-[300px] shrink-0 transition-opacity ${
                              snapshot.isDragging ? "opacity-50" : ""
                            }`}
                          >
                            {/* ХЕДЕР КОЛОНКИ (Drag Handle здесь) */}
                            <div
                              {...provided.dragHandleProps}
                              className="flex items-center justify-between bg-white/[0.03] px-4 py-3 rounded-2xl border border-white/5 cursor-grab active:cursor-grabbing hover:bg-white/[0.05] transition-colors group/header backdrop-blur-sm"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
                                <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest group-hover/header:text-white transition-colors">
                                  {column.title}
                                </span>
                              </div>
                              <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                                {columnTasks.length}
                              </span>
                            </div>

                            {/* ЗОНА ЗАДАЧ (TASK LEVEL) */}
                            <Droppable droppableId={column.id} type="TASK">
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  className={`min-h-[60vh] rounded-[2rem] transition-all duration-300 p-1 ${
                                    snapshot.isDraggingOver
                                      ? "bg-indigo-500/5 ring-1 ring-indigo-500/20"
                                      : ""
                                  }`}
                                >
                                  {columnTasks.map((task, taskIndex) => {
                                    const style =
                                      PRIORITY_STYLES[task.priority] ||
                                      PRIORITY_STYLES.MEDIUM;

                                    return (
                                      <Draggable
                                        key={task.id}
                                        draggableId={task.id}
                                        index={taskIndex}
                                      >
                                        {(provided, snapshot) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            onClick={() =>
                                              setEditingTaskId(task.id)
                                            }
                                            className={`group relative bg-[#0f172a]/80 p-4 rounded-2xl border mb-3 transition-all cursor-pointer ${
                                              snapshot.isDragging
                                                ? "border-indigo-500/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rotate-[2deg] scale-105 z-50 bg-[#1e293b]"
                                                : "border-white/5 hover:border-white/10 hover:bg-[#161e31]"
                                            }`}
                                          >
                                            {/* Приоритет */}
                                            <div
                                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border mb-2.5 ${style.bg} ${style.border}`}
                                            >
                                              <div
                                                className={`w-1 h-1 rounded-full ${style.dot} ${
                                                  task.priority === "HIGH"
                                                    ? "animate-pulse"
                                                    : ""
                                                }`}
                                              />
                                              <span
                                                className={`text-[8px] font-black uppercase tracking-widest ${style.color}`}
                                              >
                                                {style.label}
                                              </span>
                                            </div>

                                            <h4 className="text-[13px] font-semibold text-slate-200 mb-1.5 leading-snug line-clamp-2 group-hover:text-white transition-colors">
                                              {task.title}
                                            </h4>

                                            {task.description && (
                                              <p className="text-[11px] text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                                                {task.description}
                                              </p>
                                            )}

                                            {/* Футер карточки */}
                                            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                              <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[9px] font-black text-white ring-1 ring-white/10 shadow-sm">
                                                  {task.assignee?.name?.[0] ||
                                                    task.assignee?.email?.[0] ||
                                                    "?"}
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-500 truncate max-w-[80px]">
                                                  {task.assignee?.name?.split(
                                                    " ",
                                                  )[0] || "No one"}
                                                </span>
                                              </div>

                                              {task.dueDate && (
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-400/80">
                                                  <Clock
                                                    size={11}
                                                    className="opacity-70"
                                                  />
                                                  {new Date(
                                                    task.dueDate,
                                                  ).toLocaleDateString(
                                                    "ru-RU",
                                                    {
                                                      day: "numeric",
                                                      month: "short",
                                                    },
                                                  )}
                                                </div>
                                              )}
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
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}

                  {/* Кнопка добавления колонки */}
                  <div className="shrink-0 pt-1">
                    <AddColumnButton />
                  </div>
                </div>
              )}
            </Droppable>
          </div>
        </div>
      </DragDropContext>

      {/* МОДАЛКА РЕДАКТИРОВАНИЯ */}
      {editingTaskId && (
        <EditTaskModal
          task={tasks.find((t) => t.id === editingTaskId)}
          columns={columns}
          members={teamMembers}
          userRole={userRole}
          onClose={() => setEditingTaskId(null)}
        />
      )}
    </div>
  );
}
