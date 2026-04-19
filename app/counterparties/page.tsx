import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import CounterpartyClientContent from "@/components/counterparties/CounterpartyClientContent";

export default async function CounterpartiesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const teamId = (session?.user as any)?.activeTeamId;

  const counterparties = await prisma.counterparty.findMany({
    where: { teamId },
    include: { contracts: true },
    orderBy: { name: "asc" },
  });

  // Передаем данные в клиентский компонент
  return <CounterpartyClientContent counterparties={counterparties} />;
}
