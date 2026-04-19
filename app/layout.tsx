// app/layout.tsx
"use client"; // Делаем лейаут клиентским, чтобы использовать usePathname

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { Providers } from "@/components/Providers";
import "./globals.css";
import ToastProvider from "@/components/ToastProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Список страниц, на которых НЕ НУЖНО показывать сайдбар
  const noSidebarPages = ["/login", "/register"];
  const showSidebar = !noSidebarPages.includes(pathname);

  return (
    <html lang="ru">
      <body className="bg-[#f8fafc]">
        <Providers>
          <div className="flex min-h-screen">
            {/* Рендерим сайдбар только если это не страница логина */}
            {showSidebar && <Sidebar />}

            <main className={`flex-1 ${showSidebar ? "" : "w-full"}`}>
              {children}
            </main>
          </div>
          <ToastProvider />
        </Providers>
      </body>
    </html>
  );
}
