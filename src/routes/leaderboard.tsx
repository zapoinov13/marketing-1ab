import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Crown,
  Flame,
  Medal,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  achievements,
  leaderboard,
  type RankRole,
} from "@/data/platform";
import { useAuth } from "@/contexts/AuthContext";
import { useLiveProgress } from "@/hooks/useLiveProgress";

export const Route = createFileRoute("/leaderboard")({
  component: Leaderboard,
});

const roles: Array<RankRole | "Все"> = [
  "Все",
  "Builder",
  "AI Architect",
  "Automation Master",
  "Content Engineer",
  "AI CEO",
];

const podiumTone = [
  "border-amber-400/40 bg-amber-400/10",
  "border-slate-300/30 bg-slate-300/10",
  "border-orange-400/35 bg-orange-400/10",
] as const;

const podiumIcon = [
  "text-amber-300",
  "text-slate-200",
  "text-orange-300",
] as const;

function Leaderboard() {
  const { user, profile } = useAuth();
  const live = useLiveProgress();
  const [roleFilter, setRoleFilter] = useState<(typeof roles)[number]>("Все");

  const displayName =
    live.displayName ||
    profile?.full_name ||
    user?.email?.split("@")[0] ||
    "Юрий";
  const avatarUrl = profile?.avatar_url || null;
  const initial = displayName.trim().charAt(0).toUpperCase() || "Ю";
  const myProgress = live.loggedIn ? (live.companyProgress ?? 0) : 0;
  const myLevelNum = 1;
  const myRoleResolved: RankRole = (
    [
      "Builder",
      "AI Architect",
      "Automation Master",
      "Content Engineer",
      "AI CEO",
    ] as RankRole[]
  ).includes((live.loggedIn ? live.level : "Builder") as RankRole)
    ? ((live.loggedIn ? live.level : "Builder") as RankRole)
    : "Builder";

  const rows = useMemo(() => {
    const base =
      leaderboard.length > 0
        ? leaderboard
        : [
            {
              rank: 1,
              name: displayName,
              progress: myProgress,
              level: myLevelNum,
              role: myRoleResolved,
              isYou: true as const,
            },
          ];

    return base.map((row) => {
      if (!row.isYou) return row;
      return {
        ...row,
        name: displayName,
        progress: myProgress,
        level: myLevelNum,
        role: myRoleResolved,
      };
    });
  }, [displayName, myProgress, myLevelNum, myRoleResolved]);

  const sorted = useMemo(() => {
    const filtered =
      roleFilter === "Все"
        ? rows
        : rows.filter((r) => r.role === roleFilter);
    return [...filtered]
      .sort((a, b) => b.progress - a.progress)
      .map((r, i) => ({ ...r, rank: i + 1 }));
  }, [rows, roleFilter]);

  const podium = sorted.slice(0, 3);
  const rest = sorted.slice(3);
  const you = sorted.find((r) => r.isYou);
  const unlockedCount = live.loggedIn
    ? Math.min(live.tasksDone, achievements.length)
    : achievements.filter((a) => a.unlocked).length;
  const avgProgress = Math.round(
    sorted.reduce((s, r) => s + r.progress, 0) / Math.max(sorted.length, 1),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      {/* HEADER */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card">
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" />
        <div className="pointer-events-none absolute -right-16 -top-12 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/4 h-40 w-40 rounded-full bg-[color:var(--accent-glow)]/15 blur-3xl" />
        <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <Trophy className="h-3.5 w-3.5 text-primary" /> AI Mission Ranking
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Leaderboard
            </h1>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Рейтинг строителей AI-компаний. Сравни прогресс, роли и
              достижения.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="rounded-2xl border border-border bg-background/50 px-4 py-3">
              <div className="text-[11px] text-muted-foreground">В рейтинге</div>
              <div className="mt-0.5 text-lg font-semibold">{sorted.length}</div>
            </div>
            <div className="rounded-2xl border border-border bg-background/50 px-4 py-3">
              <div className="text-[11px] text-muted-foreground">Средний %</div>
              <div className="mt-0.5 text-lg font-semibold">{avgProgress}%</div>
            </div>
            <Link
              to="/community"
              className="inline-flex items-center gap-1.5 rounded-2xl border border-border bg-background/50 px-4 py-3 text-sm hover:border-primary/40"
            >
              <Users className="h-3.5 w-3.5 text-primary" /> Сообщество
            </Link>
          </div>
        </div>
      </div>

      {/* ROLE FILTER */}
      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {roles.map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => setRoleFilter(role)}
            className={[
              "shrink-0 rounded-full border px-4 py-1.5 text-sm transition-colors",
              roleFilter === role
                ? "border-primary/40 bg-primary/10 text-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {role}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5">
          {/* PODIUM */}
          {podium.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {podium.map((row, i) => {
                const order = i === 0 ? "sm:order-2" : i === 1 ? "sm:order-1" : "sm:order-3";
                const tall = i === 0 ? "sm:mt-0" : "sm:mt-6";
                return (
                  <motion.div
                    key={row.name + row.rank}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className={[
                      "relative overflow-hidden rounded-3xl border p-5",
                      order,
                      tall,
                      row.isYou
                        ? "border-primary/45 bg-primary/10"
                        : podiumTone[i],
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className={[
                          "flex h-11 w-11 items-center justify-center rounded-2xl border border-border/60 bg-background/40",
                          podiumIcon[i],
                        ].join(" ")}
                      >
                        {i === 0 ? (
                          <Crown className="h-5 w-5" />
                        ) : (
                          <Medal className="h-5 w-5" />
                        )}
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">
                        #{row.rank}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-background/50 text-sm font-semibold">
                        {row.isYou && avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          row.name.trim().charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-semibold">
                          {row.name}
                          {row.isYou && (
                            <span className="ml-2 rounded-full border border-primary/30 bg-primary/15 px-2 py-0.5 text-[10px] text-primary">
                              ты
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {row.role}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-end justify-between gap-2">
                        <span className="text-2xl font-semibold tracking-tight">
                          {row.progress}%
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          Lv {row.level}
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background/50">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${Math.min(row.progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* FULL LIST */}
          <div className="overflow-hidden rounded-3xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="text-sm font-semibold">Полный рейтинг</div>
              <div className="text-xs text-muted-foreground">
                по готовности компании
              </div>
            </div>

            {sorted.length === 0 ? (
              <div className="p-12 text-center">
                <Sparkles className="mx-auto h-7 w-7 text-muted-foreground" />
                <div className="mt-3 text-sm text-muted-foreground">
                  Нет участников с этой ролью.
                </div>
                <button
                  type="button"
                  onClick={() => setRoleFilter("Все")}
                  className="mt-2 text-sm text-primary hover:underline"
                >
                  Сбросить фильтр
                </button>
              </div>
            ) : rest.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                Все участники фильтра уже в подиуме сверху.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {rest.map((row, i) => (
                  <motion.li
                    key={row.name + row.rank}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(0.03 * i, 0.2) }}
                    className={[
                      "flex flex-wrap items-center gap-4 px-5 py-4 transition-colors",
                      row.isYou ? "bg-primary/8" : "hover:bg-background/40",
                    ].join(" ")}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background/50 text-sm font-semibold text-muted-foreground">
                        {row.rank}
                      </div>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-sm font-semibold text-primary">
                        {row.isYou && avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          row.name.trim().charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate font-medium">{row.name}</span>
                          {row.isYou && (
                            <span className="rounded-full border border-primary/30 bg-primary/15 px-2 py-0.5 text-[10px] text-primary">
                              ты
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {row.role} · Lv {row.level}
                        </div>
                      </div>
                    </div>
                    <div className="ml-auto w-full max-w-[180px] sm:w-40">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-lg font-semibold tracking-tight">
                          {row.progress}%
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          готовность
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-background/60">
                        <div
                          className={[
                            "h-full rounded-full",
                            row.isYou ? "bg-primary" : "bg-foreground/35",
                          ].join(" ")}
                          style={{ width: `${Math.min(row.progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* SIDEBAR */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-primary/35 bg-primary/10 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Flame className="h-4 w-4 text-primary" /> Твоя позиция
            </div>
            {you ? (
              <>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-primary text-base font-semibold text-primary-foreground">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initial
                    )}
                  </div>
                  <div>
                    <div className="font-semibold">{you.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {you.role}
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-2xl border border-border bg-background/40 px-3 py-3">
                    <div className="text-[11px] text-muted-foreground">Место</div>
                    <div className="mt-0.5 text-xl font-semibold">#{you.rank}</div>
                  </div>
                  <div className="rounded-2xl border border-border bg-background/40 px-3 py-3">
                    <div className="text-[11px] text-muted-foreground">
                      Готовность
                    </div>
                    <div className="mt-0.5 text-xl font-semibold">
                      {you.progress}%
                    </div>
                  </div>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background/50">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.min(you.progress, 100)}%` }}
                  />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {you.rank === 1
                    ? "Ты на вершине рейтинга."
                    : `До топа осталось ${Math.max(0, (podium[0]?.progress ?? 100) - you.progress)}%.`}
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                Смени фильтр роли, чтобы увидеть себя в рейтинге.
              </p>
            )}
            <Link
              to="/profile"
              className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Открыть профиль <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Trophy className="h-4 w-4 text-primary" /> Достижения
              </div>
              <span className="text-xs text-muted-foreground">
                {unlockedCount}/{achievements.length}
              </span>
            </div>
            <ul className="mt-4 space-y-2">
              {achievements.map((a, i) => {
                const unlocked = live.loggedIn
                  ? i < unlockedCount
                  : a.unlocked;
                return (
                  <li
                    key={a.id}
                    className={[
                      "flex items-center gap-3 rounded-xl border px-3 py-2.5",
                      unlocked
                        ? "border-primary/25 bg-primary/10"
                        : "border-border bg-background/40 opacity-55",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "flex h-8 w-8 items-center justify-center rounded-lg",
                        unlocked
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground",
                      ].join(" ")}
                    >
                      <Medal className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {a.title}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {unlocked ? "Открыто" : "Закрыто"}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5">
            <div className="text-sm font-semibold">Роли</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Растут вместе с прогрессом компании.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {roles.slice(1).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setRoleFilter(role)}
                  className={[
                    "rounded-full border px-3 py-1.5 text-xs transition-colors",
                    roleFilter === role
                      ? "border-primary/40 bg-primary/10 text-foreground"
                      : "border-border bg-background/40 text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
