// app/register/page.tsx
"use client";

import { useState } from "react";
import { registerUser } from "@/app/actions/auth";
import Link from "next/link";
import { Wallet, User, Mail, Lock, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      await registerUser(formData);
    } catch (err: any) {
      setError(err.message || "Произошла ошибка при регистрации");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full">
        {/* Логотип */}
        <div className="flex justify-center mb-8">
          <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-xl shadow-blue-600/20">
            <Wallet size={32} />
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h1 className="text-2xl font-black text-slate-900 text-center mb-2">
            Создать аккаунт
          </h1>
          <p className="text-slate-500 text-center text-sm font-medium mb-8">
            Присоединяйтесь к управлению финансами
          </p>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 text-rose-600 text-sm font-bold rounded-2xl text-center">
              {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-4">
            <div className="relative">
              <User
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                name="name"
                placeholder="Ваше имя"
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
              />
            </div>

            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
              />
            </div>

            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="password"
                name="password"
                placeholder="Пароль"
                required
                minLength={6}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Зарегистрироваться"
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-slate-500">
            Уже есть аккаунт?{" "}
            <Link
              href="/login"
              className="text-blue-600 font-bold hover:underline"
            >
              Войти
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
