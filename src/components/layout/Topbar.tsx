import { Bell, LogIn, Search } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { useLiveProgress } from "@/hooks/useLiveProgress";
import { user as mockUser } from "@/data/platform";

export function Topbar({
  onMenuClick,
  menuIcon,
}: {
  onMenuClick?: () => void;
  menuIcon?: ReactNode;
}) {
  const { user, profile, ready } = useAuth();
  const live = useLiveProgress();
  const progress = live.loggedIn ? (live.companyProgress ?? 0) : 0;
  const initial =
    (live.displayName || user?.email || mockUser.name || "У")
      .trim()
      .charAt(0)
      .toUpperCase() || "У";
  const avatarUrl = profile?.avatar_url || null;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/70 px-4 backdrop-blur-xl sm:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
        aria-label="Открыть меню"
      >
        {menuIcon}
      </button>

      <div className="relative flex-1 max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Поиск уроков, документации, этапов..."
          className="h-10 w-full rounded-xl border border-border bg-card/60 pl-10 pr-16 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-flex">
          ⌘K
        </kbd>
      </div>

      <Link
        to="/mission-control"
        className="hidden items-center gap-3 rounded-xl border border-border bg-card/60 px-3 py-2 md:flex"
      >
        <div className="text-[11px] text-muted-foreground">
          {live.loggedIn ? "Live" : "Демо"}
        </div>
        <div className="relative h-1.5 w-28 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-[color:var(--accent-glow)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs font-medium text-foreground">{progress}%</div>
      </Link>

      <button className="relative rounded-xl border border-border bg-card/60 p-2.5 text-muted-foreground transition-colors hover:text-foreground">
        <Bell className="h-4 w-4" />
        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
      </button>

      {ready && !user ? (
        <Link
          to="/login"
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-card/60 px-3 text-xs font-medium text-foreground hover:border-primary/40"
        >
          <LogIn className="h-3.5 w-3.5" /> Войти
        </Link>
      ) : (
        <Link
          to="/profile"
          className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary to-[color:var(--accent-glow)] text-sm font-semibold text-primary-foreground ring-2 ring-primary/20"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            initial
          )}
        </Link>
      )}
    </header>
  );
}
