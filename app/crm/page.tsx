import { getLeads, getLeadStatuses } from "@/app/actions/crm";
import CrmBoard from "@/components/crm/CrmBoard";
import { Target, TrendingUp } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function CrmPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [leads, statuses] = await Promise.all([getLeads(), getLeadStatuses()]);
  const totalValue = leads.reduce((acc, lead) => acc + lead.value, 0);

  return (
    /* h-screen и overflow-hidden блокируют прокрутку всего окна */
    <div className="h-screen bg-[#030712] text-slate-400 flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 w-full max-w-[1600px] mx-auto p-4 sm:p-10 space-y-8 overflow-hidden">
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 bg-[#0f172a]/40 p-6 rounded-[2rem] border border-white/5 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl text-emerald-400">
              <Target size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                CRM Воронка
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Лидов: {leads.length}
                </span>
                <div className="w-1 h-1 rounded-full bg-slate-700" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                  <TrendingUp size={10} /> {totalValue.toLocaleString()} ₽
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Рабочая область доски */}
        <main className="flex-1 min-w-0 w-full overflow-hidden">
          <CrmBoard
            initialLeads={leads}
            statuses={statuses}
            userRole={(session.user as any).role}
          />
        </main>
      </div>
    </div>
  );
}
