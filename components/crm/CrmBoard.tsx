"use client";

import { useState, useEffect, useRef } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { updateLeadStatus, updateStatusesOrder } from "@/app/actions/crm";
import {
  User,
  MoreVertical,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import AddLeadModal from "./AddLeadModal";
import AddLeadStatusButton from "./AddLeadStatusButton";
import EditLeadModal from "./EditLeadModal";

const PAYMENT_LABELS: Record<string, string> = {
  FIXED: "сдельно",
  MONTHLY: "в месяц",
};

export default function CrmBoard({
  initialLeads,
  statuses: initialStatuses,
  userRole,
}: any) {
  const [leads, setLeads] = useState(initialLeads);
  const [statuses, setStatuses] = useState(initialStatuses);
  const [mounted, setMounted] = useState(false);
  const [editingLead, setEditingLead] = useState<any | null>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollDirRef = useRef<"left" | "right" | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 2);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 2);
    }
  };

  useEffect(() => {
    setMounted(true);
    setLeads(initialLeads);
    setStatuses(initialStatuses);
    setTimeout(checkScrollPosition, 100);
    window.addEventListener("resize", checkScrollPosition);
    return () => {
      stopScroll();
      window.removeEventListener("resize", checkScrollPosition);
    };
  }, [initialLeads, initialStatuses]);

  useEffect(() => {
    checkScrollPosition();
  }, [statuses.length, leads.length]);

  const performScroll = () => {
    if (!scrollContainerRef.current || !scrollDirRef.current) {
      animationFrameId.current = null;
      return;
    }
    const speed = 6;
    scrollContainerRef.current.scrollLeft +=
      scrollDirRef.current === "right" ? speed : -speed;
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

  const onDragEnd = async (result: DropResult) => {
    stopScroll();
    const { destination, source, draggableId, type } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    if (type === "COLUMN") {
      const newStatuses = Array.from(statuses);
      const [removed] = newStatuses.splice(source.index, 1);
      newStatuses.splice(destination.index, 0, removed);
      setStatuses(newStatuses);
      setTimeout(checkScrollPosition, 50);
      try {
        await updateStatusesOrder(newStatuses.map((s: any) => s.id));
      } catch {
        toast.error("Ошибка сортировки");
        setStatuses(initialStatuses);
      }
      return;
    }

    const newStatusId = destination.droppableId;
    setLeads((prev: any[]) =>
      prev.map((l) =>
        l.id === draggableId ? { ...l, statusId: newStatusId } : l,
      ),
    );

    try {
      await updateLeadStatus(draggableId, newStatusId);
    } catch {
      toast.error("Ошибка перемещения");
      setLeads(initialLeads);
    }
  };

  if (!mounted) return null;

  return (
    /* h-[calc(100vh-theme(spacing.20))] — подставьте отступ вашего хедера (например, 80px/20 units) */
    <div className="flex flex-col gap-6 w-full max-w-full h-[calc(100vh-120px)] overflow-hidden relative">
      <div className="flex justify-end shrink-0 px-2">
        <AddLeadModal statuses={statuses} />
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        {/* overflow-hidden на этой обертке не дает скроллиться всей странице */}
        <div className="relative group/board w-full flex-grow overflow-hidden flex flex-col">
          {/* Зоны наведения для горизонтального скролла */}
          {canScrollLeft && (
            <div
              onMouseEnter={() => startScroll("left")}
              onMouseLeave={stopScroll}
              className="absolute left-0 top-0 bottom-0 w-16 z-40 cursor-west-resize flex items-center justify-start pl-2 opacity-0 group-hover/board:opacity-100 transition-opacity pointer-events-auto via-slate-900/40 to-transparent"
            >
              <div className="p-2 rounded-full bg-white/5 border border-white/10 text-white/40 backdrop-blur-sm shadow-xl">
                <ChevronLeft size={20} />
              </div>
            </div>
          )}

          {canScrollRight && (
            <div
              onMouseEnter={() => startScroll("right")}
              onMouseLeave={stopScroll}
              className="absolute right-0 top-0 bottom-0 w-16 z-40 cursor-east-resize flex items-center justify-end pr-2 opacity-0 group-hover/board:opacity-100 transition-opacity pointer-events-auto via-slate-900/40 to-transparent"
            >
              <div className="p-2 rounded-full bg-white/5 border border-white/10 text-white/40 backdrop-blur-sm shadow-xl">
                <ChevronRight size={20} />
              </div>
            </div>
          )}

          {/* Контейнер ТОЛЬКО ГОРИЗОНТАЛЬНОГО скролла */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScrollPosition}
            className="w-full h-full overflow-x-auto overflow-y-hidden pb-4 custom-scrollbar"
          >
            <Droppable droppableId="board" type="COLUMN" direction="horizontal">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="flex flex-nowrap gap-5 items-start min-w-max px-4 h-full"
                >
                  {statuses.map((status: any, index: number) => {
                    const statusLeads = leads.filter(
                      (l: any) => l.statusId === status.id,
                    );
                    const total = statusLeads.reduce(
                      (acc: number, l: any) => acc + (l.value || 0),
                      0,
                    );

                    return (
                      <Draggable
                        key={status.id}
                        draggableId={status.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            {...provided.draggableProps}
                            ref={provided.innerRef}
                            /* h-full заставляет колонку растягиваться, но заголовок и список делят пространство */
                            className={`w-[300px] h-full shrink-0 flex flex-col gap-3 transition-opacity ${
                              snapshot.isDragging ? "opacity-50" : "opacity-100"
                            }`}
                          >
                            {/* Заголовок колонки */}
                            <div
                              {...provided.dragHandleProps}
                              className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl shrink-0 cursor-grab active:cursor-grabbing hover:bg-white/[0.05] transition-colors backdrop-blur-sm"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest truncate pr-2">
                                  {status.title}
                                </span>
                                <span className="text-[11px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                                  {total.toLocaleString()} ₽
                                </span>
                              </div>
                              <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
                                <div className="h-full bg-indigo-500/50 w-1/3 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                              </div>
                            </div>

                            {/* Список лидов: теперь он занимает всё оставшееся место и скроллится сам */}
                            <Droppable droppableId={status.id} type="LEAD">
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  className={`flex-grow overflow-y-auto overflow-x-hidden pr-1 custom-scrollbar transition-colors duration-300 rounded-2xl ${
                                    snapshot.isDraggingOver
                                      ? "bg-indigo-500/[0.03]"
                                      : ""
                                  }`}
                                >
                                  <div className="flex flex-col min-h-full pb-20">
                                    {" "}
                                    {/* pb-20 чтобы удобно было бросать в конец */}
                                    {statusLeads.map(
                                      (lead: any, leadIndex: number) => (
                                        <Draggable
                                          key={lead.id}
                                          draggableId={lead.id}
                                          index={leadIndex}
                                        >
                                          {(provided, snapshot) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              {...provided.dragHandleProps}
                                              onClick={() =>
                                                setEditingLead(lead)
                                              }
                                              className={`group bg-[#0f172a]/80 border border-white/5 p-4 rounded-2xl mb-3 cursor-pointer transition-all duration-200 ${
                                                snapshot.isDragging
                                                  ? "rotate-[2deg] scale-105 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 border-indigo-500/50 bg-[#1e293b]"
                                                  : "hover:border-white/10 hover:bg-[#161e31]"
                                              }`}
                                            >
                                              <div className="flex justify-between items-start mb-2">
                                                <h4 className="text-[13px] font-semibold text-slate-200 line-clamp-2 leading-snug group-hover:text-white transition-colors">
                                                  {lead.title}
                                                </h4>
                                                <MoreVertical
                                                  size={14}
                                                  className="text-slate-600 shrink-0 group-hover:text-slate-400 transition-colors"
                                                />
                                              </div>
                                              <div className="flex items-center gap-2 mb-4">
                                                <span className="text-emerald-400 text-[15px] font-black tracking-tight">
                                                  {lead.value.toLocaleString()}{" "}
                                                  ₽
                                                </span>
                                                <span className="text-[10px] text-slate-500 lowercase font-medium">
                                                  •{" "}
                                                  {PAYMENT_LABELS[
                                                    lead.paymentType
                                                  ] || lead.paymentType}
                                                </span>
                                              </div>
                                              <div className="space-y-2 pt-3 border-t border-white/5">
                                                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                                  <User
                                                    size={12}
                                                    className="text-slate-500"
                                                  />
                                                  <span className="truncate">
                                                    {lead.contactName ||
                                                      "Контакт не указан"}
                                                  </span>
                                                </div>
                                                <div className="flex items-center justify-between mt-2">
                                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                                                    <Calendar
                                                      size={11}
                                                      className="opacity-70"
                                                    />
                                                    {new Date(
                                                      lead.createdAt,
                                                    ).toLocaleDateString()}
                                                  </div>
                                                  <div
                                                    className={`w-1.5 h-1.5 rounded-full shadow-sm ${lead.priority === "HIGH" ? "bg-rose-500 shadow-rose-500/50" : "bg-emerald-500 shadow-emerald-500/50"}`}
                                                  />
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </Draggable>
                                      ),
                                    )}
                                    {provided.placeholder}
                                  </div>
                                </div>
                              )}
                            </Droppable>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}

                  <div className="shrink-0 pt-1">
                    <AddLeadStatusButton />
                  </div>
                </div>
              )}
            </Droppable>
          </div>
        </div>
      </DragDropContext>

      {editingLead && (
        <EditLeadModal
          lead={editingLead}
          statuses={statuses}
          userRole={userRole}
          onClose={() => setEditingLead(null)}
        />
      )}
    </div>
  );
}
