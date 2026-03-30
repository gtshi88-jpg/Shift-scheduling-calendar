"use client";

export function LoadingView() {
  return (
    <div className="min-h-screen bg-stone-100 px-4 py-10 text-stone-900 md:px-8">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-xl border border-stone-200/80 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-stone-600">認証情報を確認中です...</p>
        </section>
      </main>
    </div>
  );
}
