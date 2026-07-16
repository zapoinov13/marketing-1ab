import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Network,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Sparkles,
  Users,
  User,
  Settings,
} from "lucide-react";
import logoAsset from "@/assets/markvision-logo.png.asset.json";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/mission-control", label: "AI Mission Control", icon: Network },
  { to: "/lessons", label: "Уроки", icon: GraduationCap },
  { to: "/docs", label: "Документация", icon: BookOpen },
  { to: "/homework", label: "Домашние задания", icon: ClipboardList },
  { to: "/assistant", label: "AI Assistant", icon: Sparkles },
  { to: "/community", label: "Сообщество", icon: Users },
  { to: "/profile", label: "Профиль", icon: User },
  { to: "/settings", label: "Настройки", icon: Settings },
] as const;

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10">
          <img src={logoAsset.url} alt="MarkVision AI" className="h-8 w-8 object-contain" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold tracking-tight">AI Marketing Lab</div>
          <div className="truncate text-[11px] text-muted-foreground">by MarkVision AI</div>
        </div>
      </div>

      <div className="mx-4 h-px bg-border" />

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {nav.map((item) => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={[
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                active
                  ? "bg-primary/10 text-foreground ring-1 ring-primary/30"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              ].join(" ")}
            >
              <Icon
                className={[
                  "h-[18px] w-[18px] shrink-0 transition-colors",
                  active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                ].join(" ")}
              />
              <span className="truncate">{item.label}</span>
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer promo */}
      <div className="m-3 rounded-2xl border border-border bg-gradient-to-br from-primary/15 to-transparent p-4">
        <div className="text-xs font-medium text-foreground">Prodéжка Pro</div>
        <div className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          Разблокируй продвинутые AI-агенты и приоритетную поддержку.
        </div>
        <button className="mt-3 w-full rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
          Улучшить
        </button>
      </div>
    </div>
  );
}
