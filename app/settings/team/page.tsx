import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import DeleteTeamButton from "@/components/team/DeleteTeamButton";
import InviteMemberForm from "@/components/team/InviteMemberForm";
import { renameTeam, removeMember, leaveTeam } from "@/app/actions/team";
import {
  Shield,
  Crown,
  User as UserIcon,
  LogOut,
  UserMinus,
  Edit2,
  Users,
  Sparkles,
  Zap,
  ShieldAlert,
} from "lucide-react";
import PendingInvites from "@/components/team/PendingInvites";
import ChangeRoleSelect from "@/components/team/ChangeRoleSelect";

export default async function TeamPage() {
  const session = await getServerSession(authOptions);
  const teamId = (session?.user as any)?.activeTeamId;
  const userEmail = session?.user?.email;

  const currentTeam = await prisma.team.findUnique({
    where: { id: teamId },
  });

  const members = await prisma.teamMember.findMany({
    where: { teamId },
    include: {
      user: { select: { name: true, email: true } },
    },
    orderBy: { role: "asc" },
  });

  const pendingInvites = await prisma.teamInvitation.findMany({
    where: { email: userEmail as string },
    include: { team: { select: { name: true } } },
  });

  const currentUserRole = (session?.user as any)?.role;

  return (
    <div className="min-h-screen bg-[#030712] text-slate-400 p-4 sm:p-10 font-sans">
      <div className="max-w-8xl mx-auto space-y-12">
        {/* ХЕДЕР СТРАНИЦЫ */}
        <header className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-[0.2em]">
              <Shield size={10} /> Access Control
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight leading-none">
              Управление{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                командой
              </span>
            </h1>
            <p className="text-sm font-medium text-slate-500 max-w-md">
              Настройка уровней доступа, ролей и расширение рабочей области
              вашей организации.
            </p>
          </div>
        </header>

        {/* БЛОК НАЗВАНИЯ КОМАНДЫ (Glass Card) */}
        <div className="bg-[#0f172a]/30 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-md flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2">
              Активная область
            </p>
            <h2 className="text-3xl font-black text-white tracking-tighter">
              {currentTeam?.name || "Загрузка..."}
            </h2>
          </div>

          <form
            action={renameTeam}
            className="relative z-10 flex items-center gap-3 w-full md:w-auto"
          >
            <input
              type="text"
              name="name"
              defaultValue={currentTeam?.name}
              required
              className="w-full md:w-64 px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 text-sm font-bold text-white transition-all"
            />
            <button
              type="submit"
              className="p-3.5 bg-white/5 hover:bg-indigo-600 text-slate-400 hover:text-white rounded-2xl border border-white/10 transition-all group"
              title="Переименовать"
            >
              <Edit2
                size={20}
                className="group-active:scale-90 transition-transform"
              />
            </button>
          </form>

          {/* Декоративное пятно */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-600/5 rounded-full blur-[80px]" />
        </div>

        {/* ВХОДЯЩИЕ И ИНВАЙТ-ФОРМА */}
        <div className="grid grid-cols-1 gap-8">
          <PendingInvites invites={pendingInvites} />
          <InviteMemberForm />
        </div>

        {/* СПИСОК УЧАСТНИКОВ */}
        <div className="bg-[#0f172a]/30 rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="px-10 py-8 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="text-indigo-500" size={22} />
              <h2 className="text-xl font-black text-white tracking-tight">
                Состав команды{" "}
                <span className="text-slate-600 ml-2">({members.length})</span>
              </h2>
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {members.map((member) => {
              const isMe = member.user.email === session?.user?.email;
              const isOwner = member.role === "OWNER";

              return (
                <div
                  key={member.id}
                  className="px-10 py-6 flex flex-col md:flex-row items-center justify-between hover:bg-white/[0.01] transition-all group gap-6"
                >
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    {/* Аватар-заглушка */}
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-105 duration-300 ${
                        isOwner
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.1)]"
                          : "bg-indigo-500/10 border-indigo-500/20 text-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                      }`}
                    >
                      {isOwner ? <Crown size={24} /> : <UserIcon size={24} />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <p className="font-black text-white tracking-tight text-lg leading-none">
                          {member.user.name || "Anonymous User"}
                        </p>
                        {isMe && (
                          <span className="text-[9px] font-black bg-indigo-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg shadow-indigo-500/20">
                            YOU
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-slate-500">
                        {member.user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                    {/* Выбор роли / Плашка */}
                    <div className="shrink-0">
                      {currentUserRole === "OWNER" && !isMe ? (
                        <ChangeRoleSelect
                          userId={member.userId}
                          currentRole={member.role}
                        />
                      ) : (
                        <div
                          className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-[0.2em] ${
                            isOwner
                              ? "bg-amber-500/5 border-amber-500/20 text-amber-500"
                              : "bg-white/5 border-white/10 text-slate-500"
                          }`}
                        >
                          {isOwner ? "Владелец" : "Участник"}
                        </div>
                      )}
                    </div>

                    {/* Действия */}
                    <div className="flex items-center gap-2">
                      {currentUserRole === "OWNER" && !isMe && (
                        <form action={removeMember}>
                          <input
                            type="hidden"
                            name="userId"
                            value={member.userId}
                          />
                          <button
                            type="submit"
                            className="p-3 text-slate-600 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10 rounded-xl border border-white/5 hover:border-rose-500/20 transition-all opacity-0 group-hover:opacity-100"
                            title="Исключить"
                          >
                            <UserMinus size={18} />
                          </button>
                        </form>
                      )}

                      {isMe && currentUserRole !== "OWNER" && (
                        <form action={leaveTeam}>
                          <button
                            type="submit"
                            className="flex items-center gap-2 px-5 py-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                          >
                            <LogOut size={16} /> Покинуть
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DANGER ZONE (Только OWNER) */}
        {currentUserRole === "OWNER" && (
          <div className="bg-rose-500/[0.02] border border-rose-500/10 rounded-[3rem] p-10 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="space-y-3 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 text-rose-500">
                  <ShieldAlert size={22} />
                  <h3 className="text-xl font-black uppercase tracking-tight">
                    Терминальная зона
                  </h3>
                </div>
                <p className="text-slate-500 text-sm font-medium max-w-md">
                  Удаление команды сотрет всю историю транзакций, канбан-задачи
                  и настройки доступа без возможности восстановления.
                </p>
              </div>
              <DeleteTeamButton />
            </div>

            {/* Фоновый декор для Danger Zone */}
            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-rose-500/[0.03] rounded-full blur-[100px]" />
          </div>
        )}
      </div>

      {/* Фоновые градиенты для всей страницы */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-50 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-600/5 rounded-full blur-[100px]" />
      </div>
    </div>
  );
}
