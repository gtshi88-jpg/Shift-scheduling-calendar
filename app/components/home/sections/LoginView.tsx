"use client";

import type { LoginViewProps } from "@/app/components/home/sections/types";

export function LoginView({
  handleLogin,
  loginUsername,
  setLoginUsername,
  loginPassword,
  setLoginPassword,
  loginError,
  loginBusy,
}: LoginViewProps) {
  return (
    <div className="min-h-screen bg-stone-100 px-4 py-10 text-stone-900 md:px-8">
      <main className="mx-auto w-full max-w-md">
        <section className="relative rounded-xl border border-stone-200/80 bg-white p-7 shadow-md">
          {loginBusy ? (
            <div
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-white/90 backdrop-blur-sm"
              aria-live="polite"
              aria-busy="true"
            >
              <span
                className="h-9 w-9 animate-spin rounded-full border-2 border-primary-subtle border-t-primary"
                aria-hidden
              />
              <p className="text-sm font-semibold text-slate-800">ログイン中…</p>
              <p className="max-w-[14rem] text-center text-xs text-slate-500">シフト情報を読み込んでいます</p>
            </div>
          ) : null}
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Shift Planner</p>
          <h1 className="mt-2 text-2xl font-bold text-stone-900">シフト作成・閲覧アプリ</h1>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            管理者または一般スタッフでログインしてください。
          </p>
          <form onSubmit={handleLogin} className="mt-4 flex flex-col gap-3">
            <label className="text-sm">
              メールアドレス
              <input
                type="email"
                autoComplete="email"
                disabled={loginBusy}
                className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 outline-none transition focus:ring-2 focus:ring-primary-ring/45 disabled:opacity-60"
                value={loginUsername}
                onChange={(event) => setLoginUsername(event.target.value)}
              />
            </label>
            <label className="text-sm">
              パスワード
              <input
                type="password"
                disabled={loginBusy}
                className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 outline-none transition focus:ring-2 focus:ring-primary-ring/45 disabled:opacity-60"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
              />
            </label>
            {loginError && <p className="text-sm text-rose-700">{loginError}</p>}
            <button
              type="submit"
              disabled={loginBusy}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover disabled:opacity-60"
            >
              ログイン
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
