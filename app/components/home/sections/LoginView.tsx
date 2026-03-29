"use client";

import type { LoginViewProps } from "@/app/components/home/sections/types";

export function LoginView({
  handleLogin,
  loginUsername,
  setLoginUsername,
  loginPassword,
  setLoginPassword,
  loginError,
}: LoginViewProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-50 px-4 py-10 text-slate-900 md:px-8">
      <main className="mx-auto w-full max-w-md">
        <section className="rounded-3xl border border-white/70 bg-white/90 p-7 shadow-xl backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">Shift Planner</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">シフト作成・閲覧アプリ</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            管理者または一般スタッフでログインしてください。
          </p>
          <form onSubmit={handleLogin} className="mt-4 flex flex-col gap-3">
            <label className="text-sm">
              メールアドレス
              <input
                type="email"
                autoComplete="email"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none ring-indigo-100 transition focus:ring"
                value={loginUsername}
                onChange={(event) => setLoginUsername(event.target.value)}
              />
            </label>
            <label className="text-sm">
              パスワード
              <input
                type="password"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none ring-indigo-100 transition focus:ring"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
              />
            </label>
            {loginError && <p className="text-sm text-rose-700">{loginError}</p>}
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              ログイン
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
