"use client";

export type HomeNavPanel = "dashboard" | "shiftCheck" | "input" | "operations";

const NAV_ITEMS: { id: HomeNavPanel; label: string; description: string }[] = [
  { id: "dashboard", label: "ダッシュボード", description: "警告・集計・今日" },
  { id: "shiftCheck", label: "シフト確認", description: "月／週の配置" },
  { id: "input", label: "シフト入力", description: "表・カレンダー" },
  { id: "operations", label: "運用", description: "確定・履歴" },
];

function NavIcon({ id, className }: { id: HomeNavPanel; className?: string }) {
  const cn = className ?? "h-6 w-6";
  const sw = 1.65;
  switch (id) {
    case "dashboard":
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <rect x="3" y="3" width="7.5" height="7.5" rx="2" stroke="currentColor" strokeWidth={sw} />
          <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" stroke="currentColor" strokeWidth={sw} />
          <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" stroke="currentColor" strokeWidth={sw} />
          <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" stroke="currentColor" strokeWidth={sw} />
        </svg>
      );
    case "shiftCheck":
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path
            d="M2.25 12s3.75-7 9.75-7 9.75 7 9.75 7-3.75 7-9.75 7-9.75-7-9.75-7z"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="2.75" stroke="currentColor" strokeWidth={sw} />
        </svg>
      );
    case "input":
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path
            d="M8 2v3M16 2v3M4.5 8.5h15M6 4h12a2.5 2.5 0 012.5 2.5V20a2.5 2.5 0 01-2.5 2.5H6A2.5 2.5 0 013.5 20V6.5A2.5 2.5 0 016 4z"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8 14h8M8 17.5h5"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinecap="round"
          />
        </svg>
      );
    case "operations":
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path
            d="M9 5H7.5A1.5 1.5 0 006 6.5v13A1.5 1.5 0 007.5 21h9a1.5 1.5 0 001.5-1.5v-13A1.5 1.5 0 0016.5 5H15"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 5a2.5 2.5 0 015 0v1H9V5z"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9.5 13.5l2 2 3.5-3.5"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return null;
  }
}

type NavProps = {
  panel: HomeNavPanel;
  onPanelChange: (panel: HomeNavPanel) => void;
};

export function HomeNavRail({ panel, onPanelChange }: NavProps) {
  return (
    <aside className="hidden shrink-0 flex-col border-r border-stone-200/90 bg-white shadow-[4px_0_24px_-12px_rgba(28,25,23,0.08)] lg:flex lg:w-56 xl:w-60">
      <div className="border-b border-stone-100 px-4 py-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">メニュー</p>
        <p className="mt-1.5 text-sm leading-snug text-stone-500">表示する画面を切り替え</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1.5 p-3" aria-label="メインナビゲーション">
        {NAV_ITEMS.map((item) => {
          const active = panel === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onPanelChange(item.id)}
              className={`group flex items-start gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-200 ${
                active
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 ring-1 ring-primary/15"
                  : "text-stone-700 hover:bg-stone-100 hover:shadow-sm"
              }`}
            >
              <span
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                  active
                    ? "bg-white/20 text-white"
                    : "bg-stone-100 text-stone-500 group-hover:bg-primary-muted group-hover:text-primary"
                }`}
              >
                <NavIcon id={item.id} className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold leading-tight">{item.label}</span>
                <span
                  className={`mt-1 block text-xs leading-snug ${
                    active ? "text-primary-foreground/85" : "text-stone-500 group-hover:text-stone-600"
                  }`}
                >
                  {item.description}
                </span>
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export function HomeNavBottom({ panel, onPanelChange }: NavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-stone-200/80 bg-white/90 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_32px_-8px_rgba(28,25,23,0.1)] backdrop-blur-xl backdrop-saturate-150 lg:hidden"
      aria-label="モバイルメニュー"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-subtle to-transparent" />
      <div className="mx-auto flex w-full max-w-2xl items-end justify-between gap-0.5 px-1.5 pb-1 pt-2 sm:gap-1 sm:px-3">
        {NAV_ITEMS.map((item) => {
          const active = panel === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onPanelChange(item.id)}
              className={`group relative flex min-h-[3.25rem] min-w-0 flex-1 flex-col items-center justify-end gap-0.5 rounded-xl px-1 pb-2 pt-1 transition-all duration-200 active:scale-[0.98] sm:rounded-2xl sm:px-2 ${
                active
                  ? "text-primary"
                  : "text-stone-500 active:bg-stone-100/90"
              }`}
            >
              {active ? (
                <span
                  className="absolute inset-x-1 top-1 bottom-0 rounded-2xl bg-primary-muted/95 shadow-inner ring-1 ring-primary-subtle/80"
                  aria-hidden
                />
              ) : null}
              <span
                className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                  active
                    ? "bg-white text-primary shadow-md shadow-primary/15 ring-1 ring-primary-subtle"
                    : "text-stone-400 group-hover:bg-stone-100 group-hover:text-primary"
                }`}
              >
                <NavIcon id={item.id} className="h-[22px] w-[22px]" />
              </span>
              <span
                className={`relative z-10 max-w-full truncate px-0.5 text-[9px] font-bold leading-tight tracking-tight sm:text-[10px] ${
                  active ? "text-stone-900" : "text-stone-600"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
