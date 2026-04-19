import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Явно экспортируем функцию middleware
export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  },
);

export const config = {
  // Твой проверенный матчер остается без изменений
  matcher: ["/((?!register|login|api|_next/static|_next/image|favicon.ico).*)"],
};
