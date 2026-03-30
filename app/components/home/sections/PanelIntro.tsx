"use client";

type PanelIntroProps = {
  title: string;
  description: string;
};

export function PanelIntro({ title, description }: PanelIntroProps) {
  return (
    <div className="rounded-xl border border-stone-200/80 bg-white px-4 py-3.5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-primary">{title}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{description}</p>
    </div>
  );
}
