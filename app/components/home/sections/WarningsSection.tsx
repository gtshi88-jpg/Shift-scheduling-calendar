"use client";

export function WarningsSection({ warnings }: { warnings: string[] }) {
  if (warnings.length === 0) {
    return null;
  }
  return (
    <section className="rounded-2xl border border-amber-300 bg-amber-50/90 p-4 text-sm text-amber-900 shadow-sm">
      <h2 className="font-semibold">データ警告</h2>
      <ul className="mt-2 list-disc pl-5">
        {warnings.map((warning) => (
          <li key={warning}>{warning}</li>
        ))}
      </ul>
    </section>
  );
}
