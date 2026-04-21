"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { getUserTeams, switchActiveTeam } from "@/app/actions/team";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Wallet,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  CreditCard,
  Briefcase,
  BarChart3,
  Layers,
  CircleDollarSign,
  Handshake,
  Target,
  Sliders,
  Users,
  LayoutGrid,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status, update } = useSession();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [teams, setTeams] = useState<any[]>([]);
  const [isSwitching, setIsSwitching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeTeamId = (session?.user as any)?.activeTeamId;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      getUserTeams().then(setTeams);
    }
  }, [status, activeTeamId]);

  const handleTeamSelect = async (newTeamId: string) => {
    if (newTeamId === activeTeamId) return;
    setIsSwitching(true);
    setIsDropdownOpen(false);
    await switchActiveTeam(newTeamId);
    await update();
    setIsSwitching(false);
    router.refresh();
  };

  const menuItems = [
    {
      name: "Обзор",
      icon: BarChart3,
      href: "/",
    },
    {
      name: "Задачи",
      icon: Layers,
      href: "/tasks",
    },
    {
      name: "Финансы",
      icon: CircleDollarSign,
      href: "/dashboard",
    },
    {
      name: "Контрагенты",
      icon: Handshake,
      href: "/counterparties",
    },
    {
      name: "Команда",
      icon: Users,
      href: "/settings/team",
    },
    {
      name: "CRM",
      icon: Target,
      href: "/crm",
    },
    {
      name: "Настройки",
      icon: Sliders,
      href: "/settings",
    },
  ];

  const currentTeam = teams.find((t) => t.id === activeTeamId) || teams[0];

  return (
    <aside
      className={`bg-[#030712] border-r border-white/5 h-screen sticky top-0 transition-all duration-300 flex flex-col z-50 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Логотип */}
      <div className="p-6 flex items-center gap-3">
        <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-2 rounded-xl text-white shrink-0 shadow-lg shadow-indigo-500/20">
          <Wallet size={24} />
        </div>
        {!isCollapsed && (
          <span className="font-black text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 animate-in fade-in">
            FOCUS<span className="text-indigo-500">.</span>
          </span>
        )}
      </div>

      {/* Переключатель команд (Dark Glass Style) */}
      {!isCollapsed && (
        <div className="px-6 pb-6">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3">
            Workspace
          </p>

          {status === "loading" || isSwitching ? (
            <div className="h-[46px] bg-white/5 animate-pulse rounded-xl w-full"></div>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                disabled={isSwitching}
                className={`w-full flex items-center justify-between bg-[#0f172a]/50 border transition-all text-sm font-bold rounded-xl px-4 py-3 focus:outline-none ${
                  isDropdownOpen
                    ? "border-indigo-500/50 ring-4 ring-indigo-500/10 text-white"
                    : "border-white/5 text-slate-400 hover:border-white/10"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="opacity-80">
                    {currentTeam?.role === "OWNER" ? "👑" : "👤"}
                  </span>
                  <span className="truncate">
                    {currentTeam?.name || "Загрузка..."}
                  </span>
                </div>
                <ChevronDown
                  size={14}
                  className={`text-slate-600 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0f172a] border border-white/10 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50 backdrop-blur-xl">
                  <div className="py-2">
                    {teams.map((team) => {
                      const isActive = team.id === activeTeamId;
                      return (
                        <button
                          key={team.id}
                          onClick={() => handleTeamSelect(team.id)}
                          className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold transition-colors ${
                            isActive
                              ? "bg-indigo-500/10 text-indigo-400"
                              : "text-slate-400 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span>{team.role === "OWNER" ? "👑" : "👤"}</span>
                            <span className="truncate">{team.name}</span>
                          </div>
                          {isActive && (
                            <Check
                              size={14}
                              className="text-indigo-400 shrink-0"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Навигация */}
      <nav className="flex-1 px-3 space-y-1.5 mt-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl font-bold transition-all relative group ${
                isActive
                  ? "bg-indigo-500/10 text-white shadow-[inset_0_0_20px_rgba(99,102,241,0.05)]"
                  : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.02]"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 w-1 h-5 bg-indigo-500 rounded-r-full" />
              )}
              <item.icon
                size={20}
                className={
                  isActive
                    ? "text-indigo-400"
                    : "group-hover:text-slate-300 transition-colors"
                }
              />
              {!isCollapsed && (
                <span className="text-sm tracking-tight">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Футер */}
      <div className="p-3 border-t border-white/5 space-y-1">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center gap-3 px-3 py-3 text-slate-500 hover:text-slate-200 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          {!isCollapsed && <span className="text-sm font-bold">Свернуть</span>}
        </button>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-3 text-rose-500/70 hover:bg-rose-500/5 hover:text-rose-500 rounded-xl transition-colors"
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="text-sm font-bold">Выйти</span>}
        </button>
      </div>
    </aside>
  );
}
