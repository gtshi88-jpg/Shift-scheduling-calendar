"use client";

export function LoadingView() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-50 px-4 py-10 text-slate-900 md:px-8">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-3xl border border-white/70 bg-white/85 p-8 shadow-lg backdrop-blur">
          <p className="text-sm font-medium text-slate-600">認証情報を確認中です...</p>
        </section>
      </main>
    </div>
  );
}
