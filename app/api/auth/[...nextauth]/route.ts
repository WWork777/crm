import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// 1. Выносим конфиг в именованную экспортируемую константу
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isPasswordCorrect) return null;

        // Возвращаем объект пользователя (он попадет в JWT)
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        const userId = token.id as string;
        (session.user as any).id = userId;

        // 1. Ищем самого пользователя, чтобы узнать его activeTeamId
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { activeTeamId: true },
        });

        // 2. Ищем ВСЕ команды пользователя
        let userTeams = await prisma.teamMember.findMany({
          where: { userId: userId },
          select: {
            teamId: true,
            role: true,
            team: { select: { name: true } },
          },
        });

        // 3. Если команд вообще нет — создаем Личное пространство
        if (userTeams.length === 0) {
          const newTeam = await prisma.team.create({
            data: {
              name: `Личное (${session.user.name || "Пользователь"})`,
              members: {
                create: { userId: userId, role: "OWNER" },
              },
            },
          });

          // Сохраняем в пользователя
          await prisma.user.update({
            where: { id: userId },
            data: { activeTeamId: newTeam.id },
          });

          (session.user as any).activeTeamId = newTeam.id;
          (session.user as any).role = "OWNER";
          (session.user as any).activeTeamName = newTeam.name;
        } else {
          // 4. Если команды есть, берем выбранную (или первую попавшуюся)
          const targetTeamId = dbUser?.activeTeamId || userTeams[0].teamId;
          const currentTeam =
            userTeams.find((m) => m.teamId === targetTeamId) || userTeams[0];

          (session.user as any).activeTeamId = currentTeam.teamId;
          (session.user as any).role = currentTeam.role;
          (session.user as any).activeTeamName = currentTeam.team.name;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// 2. Передаем эту константу в обработчик
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
