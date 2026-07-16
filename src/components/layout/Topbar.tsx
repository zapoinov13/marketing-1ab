import { Bell, Search } from "lucide-react";
import type { ReactNode } from "react";

export function Topbar({
  onMenuClick,
  menuIcon,
}: {
  onMenuClick?: () => void;
  menuIcon?: ReactNode;
}) {
  const progress = 42;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/70 px-4 backdrop-blur-xl sm:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
        aria-label="Открыть меню"
      >
        {menuIcon}
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Поиск уроков, документации, агентов..."
          className="h-10 w-full rounded-xl border border-border bg-card/60 pl-10 pr-16 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-flex">
          ⌘K
        </kbd>
      </div>

      {/* Progress */}
      <div className="hidden items-center gap-3 md:flex">
        <div className="text-xs text-muted-foreground">Прогресс</div>
        <div className="relative h-1.5 w-32 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-[color:var(--accent-glow)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs font-medium text-foreground">{progress}%</div>
      </div>

      {/* Bell */}
      <button className="relative rounded-xl border border-border bg-card/60 p-2.5 text-muted-foreground transition-colors hover:text-foreground">
        <Bell className="h-4 w-4" />
        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
      </button>

      {/* Avatar */}
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[color:var(--accent-glow)] text-sm font-semibold text-primary-foreground ring-2 ring-primary/20">
        Ю
      </div>
    </header>
  );
}
