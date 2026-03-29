"use client";

type PanelIntroProps = {
  title: string;
  description: string;
};

export function PanelIntro({ title, description }: PanelIntroProps) {
  return (
    <div className="rounded-2xl border border-indigo-100/90 bg-gradient-to-br from-indigo-50/90 via-white to-sky-50/40 px-4 py-3 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">{title}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{description}</p>
    </div>
  );
}
