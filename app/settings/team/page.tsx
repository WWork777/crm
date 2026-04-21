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
  ShieldAlert,
  MailPlus,
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
    <div className="min-h-screen bg-[#030712] text-slate-400 p-4 sm:p-10 font-sans relative overflow-hidden">
      {/* Атмосферные свечения на фоне */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-cyan-600/5 rounded-full blur-[100px] pointer-events-none z-0" />

      <div className="max-w-[1600px] mx-auto space-y-6 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* ХЕДЕР СТРАНИЦЫ */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#0f172a]/40 p-6 rounded-[2rem] border border-white/5 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-2xl text-indigo-400">
              <Shield size={24} />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-[0.2em]">
                <Sparkles size={10} /> Access Control
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight leading-none">
                Управление{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                  командой
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-[#0f172a]/50 px-5 py-2.5 rounded-2xl border border-white/5 shadow-inner shrink-0">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <Users size={14} className="text-slate-500" /> {members.length}{" "}
              участников
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400">
              {currentUserRole} ACCESS
            </div>
          </div>
        </header>

        {/* ОСНОВНАЯ СЕТКА */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ЛЕВАЯ КОЛОНКА (Настройки и Инвайты) - ТЕПЕРЬ 5 КОЛОНОК */}
          <div className="lg:col-span-5 space-y-6">
            {/* Карточка переименования команды */}
            <div className="bg-[#0f172a]/40 p-6 rounded-[2rem] border border-white/5 backdrop-blur-sm relative overflow-hidden group">
              <div className="relative z-10 mb-4">
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">
                  Активная область
                </p>
                <h2 className="text-xl font-black text-white tracking-tight">
                  {currentTeam?.name || "Загрузка..."}
                </h2>
              </div>

              <form
                action={renameTeam}
                className="relative z-10 flex items-center gap-2"
              >
                <input
                  type="text"
                  name="name"
                  defaultValue={currentTeam?.name}
                  required
                  placeholder="Новое название..."
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 text-xs font-bold text-white transition-all placeholder:text-slate-600"
                />
                <button
                  type="submit"
                  className="p-2.5 bg-white/5 hover:bg-indigo-600 text-slate-400 hover:text-white rounded-xl border border-white/10 transition-all group/btn shrink-0"
                  title="Переименовать"
                >
                  <Edit2
                    size={16}
                    className="group-active/btn:scale-90 transition-transform"
                  />
                </button>
              </form>
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-600/10 rounded-full blur-[40px]" />
            </div>

            {/* Карточка отправки инвайта */}
            <div className="bg-[#0f172a]/40 p-6 rounded-[2rem] border border-white/5 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <MailPlus size={16} className="text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  Пригласить участника
                </h3>
              </div>
              <InviteMemberForm />
            </div>

            {/* Входящие инвайты (показываем только если они есть) */}
            {pendingInvites.length > 0 && (
              <div className="bg-[#0f172a]/40 p-6 rounded-[2rem] border border-white/5 backdrop-blur-sm">
                <PendingInvites invites={pendingInvites} />
              </div>
            )}

            {/* DANGER ZONE (Только для OWNER) */}
            {currentUserRole === "OWNER" && (
              <div className="bg-rose-500/[0.02] border border-rose-500/10 rounded-[2rem] p-6 relative overflow-hidden">
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2 text-rose-500">
                    <ShieldAlert size={16} />
                    <h3 className="text-sm font-black uppercase tracking-widest">
                      Danger Zone
                    </h3>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                    Удаление команды сотрет историю транзакций, задачи и
                    настройки доступа безвозвратно.
                  </p>
                  <DeleteTeamButton />
                </div>
                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-rose-500/5 rounded-full blur-[50px]" />
              </div>
            )}
          </div>

          {/* ПРАВАЯ КОЛОНКА (Список участников) - ТЕПЕРЬ 7 КОЛОНОК */}
          <div className="lg:col-span-7">
            <div className="bg-[#0f172a]/40 rounded-[2rem] border border-white/5 overflow-hidden backdrop-blur-sm h-full flex flex-col">
              {/* Шапка таблицы */}
              <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Users className="text-indigo-400" size={16} />
                  <h2 className="text-sm font-bold text-white tracking-tight">
                    Состав команды
                  </h2>
                </div>
              </div>

              {/* Список */}
              <div className="divide-y divide-white/5 flex-1">
                {members.map((member) => {
                  const isMe = member.user.email === session?.user?.email;
                  const isOwner = member.role === "OWNER";

                  return (
                    <div
                      key={member.id}
                      className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-white/[0.02] transition-colors group gap-4"
                    >
                      <div className="flex items-center gap-4">
                        {/* Компактный аватар */}
                        <div
                          className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-105 duration-300 ${
                            isOwner
                              ? "bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                              : "bg-indigo-500/10 border-indigo-500/20 text-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                          }`}
                        >
                          {isOwner ? (
                            <Crown size={18} />
                          ) : (
                            <UserIcon size={18} />
                          )}
                        </div>

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-200 text-[13px] group-hover:text-white transition-colors">
                              {member.user.name || "Anonymous User"}
                            </p>
                            {isMe && (
                              <span className="text-[8px] font-black bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded-md uppercase tracking-widest">
                                YOU
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-medium text-slate-500">
                            {member.user.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                        {/* Выбор роли / Бейдж роли */}
                        <div className="shrink-0">
                          {currentUserRole === "OWNER" && !isMe ? (
                            <ChangeRoleSelect
                              userId={member.userId}
                              currentRole={member.role}
                            />
                          ) : (
                            <div
                              className={`px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest ${
                                isOwner
                                  ? "bg-amber-500/5 border-amber-500/20 text-amber-500"
                                  : "bg-white/5 border-white/10 text-slate-500"
                              }`}
                            >
                              {isOwner ? "Владелец" : "Участник"}
                            </div>
                          )}
                        </div>

                        {/* Действия (Кикнуть / Выйти) */}
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
                                className="p-2 text-slate-600 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10 rounded-lg border border-white/5 hover:border-rose-500/20 transition-all opacity-0 sm:group-hover:opacity-100"
                                title="Исключить"
                              >
                                <UserMinus size={14} />
                              </button>
                            </form>
                          )}

                          {isMe && currentUserRole !== "OWNER" && (
                            <form action={leaveTeam}>
                              <button
                                type="submit"
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                              >
                                <LogOut size={12} /> Покинуть
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
          </div>
        </div>
      </div>
    </div>
  );
}
