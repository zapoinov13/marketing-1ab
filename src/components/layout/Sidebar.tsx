import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Network,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Sparkles,
  Users,
  Trophy,
  User,
  Settings,
  Shield,
} from "lucide-react";
import logoIcon from "@/assets/markvision-icon.png";
import { useAuth } from "@/contexts/AuthContext";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

const nav: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/mission-control", label: "AI Mission Control", icon: Network },
  { to: "/lessons", label: "Уроки", icon: GraduationCap },
  { to: "/docs", label: "Документация", icon: BookOpen },
  { to: "/homework", label: "Домашние задания", icon: ClipboardList },
  { to: "/assistant", label: "AI Assistant", icon: Sparkles },
  { to: "/community", label: "Сообщество", icon: Users },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/admin", label: "Админ-панель", icon: Shield },
  { to: "/profile", label: "Профиль", icon: User },
  { to: "/settings", label: "Настройки", icon: Settings },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { profile } = useAuth();
  const isAdmin = Boolean(profile?.is_admin);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-5">
        <img
          src={logoIcon}
          alt="MarkVision AI"
          className="h-11 w-11 shrink-0 object-contain"
          width={44}
          height={44}
        />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold tracking-tight">AI Marketing Lab</div>
          <div className="truncate text-[11px] text-muted-foreground">
            {isAdmin ? "Admin · MarkVision AI" : "by MarkVision AI"}
          </div>
        </div>
      </div>

      <div className="mx-4 h-px bg-border" />

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {nav.map((item) => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to as "/"}
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
              {item.to === "/admin" && isAdmin && (
                <span className="ml-auto rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] text-primary">
                  live
                </span>
              )}
              {active && item.to !== "/admin" && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
