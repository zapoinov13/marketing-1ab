import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Flame,
  Lock,
  Map,
  Play,
  Sparkles,
  Trophy,
} from "lucide-react";
import {
  achievements,
  agentStatusStyles,
  aiTeam,
  lessons,
  missionStages,
  type StageStatus,
} from "@/data/platform";
import { useAuth } from "@/contexts/AuthContext";
import { useHomework } from "@/contexts/HomeworkContext";
import { useLiveProgress } from "@/hooks/useLiveProgress";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

const stageTone: Record<StageStatus, string> = {
  done: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  active: "border-primary/40 bg-primary/10 text-primary",
  todo: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  locked: "border-border bg-muted/40 text-muted-foreground",
};

function greetingForHour(h: number) {
  if (h < 5) return "Доброй ночи";
  if (h < 12) return "Доброе утро";
  if (h < 18) return "Добрый день";
  return "Добрый вечер";
}

function Dashboard() {
  const { profile, user } = useAuth();
  const live = useLiveProgress();
  const { tasks: homeworkList } = useHomework();

  const name =
    live.displayName ||
    profile?.full_name ||
    user?.email?.split("@")[0] ||
    "Ученик";
  const progress = live.loggedIn ? (live.companyProgress ?? 0) : 0;
  const level = live.loggedIn ? live.level : "Builder";
  const xp = live.loggedIn ? live.xp : 0;
  const avatarUrl = profile?.avatar_url || null;

  const stageRows = live.loggedIn
    ? missionStages.map((s) => {
        const row = live.rows.find((r) => r.stage_id === s.id);
        return {
          id: s.id,
          number: s.number,
          title: s.title,
          status: (row?.status as StageStatus) || (s.id === "1" ? "active" : "locked"),
          progress: row?.progress ?? 0,
        };
      })
    : missionStages.map((s) => ({
        id: s.id,
        number: s.number,
        title: s.title,
        status: s.status,
        progress: s.progress,
      }));

  const activeStage =
    stageRows.find((s) => s.status === "active") ||
    stageRows.find((s) => s.status === "todo") ||
    stageRows[0];
  const nextLesson =
    lessons.find((l) => l.id === activeStage?.id) || lessons[0];
  const stagesDone = stageRows.filter((s) => s.status === "done").length;
  const activeHw = homeworkList.filter((t) => t.status === "active").slice(0, 3);
  const overdueHw = homeworkList.filter((t) => t.status === "overdue").length;
  const doneHw = homeworkList.filter((t) => t.status === "done").length;
  const unlockedAchievements = live.loggedIn
    ? Math.min(stagesDone, achievements.length)
    : achievements.filter((a) => a.unlocked).length;

  const hour = new Date().getHours();
  const greeting = greetingForHour(hour);
  const initial = name.trim().charAt(0).toUpperCase() || "У";

  const focusHint = live.loggedIn
    ? stagesDone === 0 && activeStage?.progress === 0
      ? "Стартуй с первого урока — так начнётся твоя AI-компания."
      : `Сейчас в работе: этап ${activeStage.id}. ${activeStage.title}.`
    : "Демо-режим. Войди, чтобы прогресс сохранялся.";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      {/* HERO */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-[1.75rem] border border-border bg-card"
      >
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
        <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-[color:var(--accent-glow)]/15 blur-3xl" />

        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.4fr_1fr] lg:p-10">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={[
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px]",
                  live.loggedIn
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-border bg-background/50 text-muted-foreground",
                ].join(" ")}
              >
                {live.loggedIn ? "Аккаунт подключён" : "Демо"}
                {live.loading ? " · загрузка…" : ""}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/40 px-3 py-1 text-[11px] text-muted-foreground">
                <Flame className="h-3 w-3 text-primary" />
                {level} · {xp} XP
              </span>
            </div>

            <div className="mt-5 flex items-start gap-4">
              <div className="hidden h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary to-[color:var(--accent-glow)] text-xl font-semibold text-primary-foreground sm:flex sm:items-center sm:justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  initial
                )}
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  {greeting}, {name}
                </h1>
                <p className="mt-2 max-w-xl text-muted-foreground">{focusHint}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/lessons/$stageId"
                params={{ stageId: nextLesson.id }}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02]"
              >
                <Play className="h-4 w-4" />
                Продолжить урок
              </Link>
              <Link
                to="/mission-control"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/50 px-5 py-2.5 text-sm hover:border-primary/40"
              >
                <Map className="h-4 w-4 text-primary" />
                Карта этапов
              </Link>
              {!live.loggedIn && (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  Войти
                </Link>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background/50 p-5 backdrop-blur">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Готовность AI-компании</span>
              <span className="text-2xl font-semibold tracking-tight">{progress}%</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-primary to-[color:var(--accent-glow)]"
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <MiniStat label="Этапы" value={`${stagesDone}/8`} />
              <MiniStat label="ДЗ" value={`${doneHw}`} />
              <MiniStat label="Награды" value={`${unlockedAchievements}`} />
            </div>
            <div className="mt-4 rounded-xl border border-border bg-card/70 px-3 py-3">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Текущий фокус
              </div>
              <div className="mt-1 font-medium">
                [{activeStage.id}] {activeStage.title}
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${activeStage.progress}%` }}
                />
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                Прогресс этапа · {activeStage.progress}%
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* TODAY ACTIONS */}
      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-3xl border border-border bg-card p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Сегодня</div>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">Что сделать дальше</h2>
            </div>
            <Sparkles className="h-5 w-5 text-primary" />
          </div>

          <div className="mt-5 space-y-3">
            <ActionRow
              icon={BookOpen}
              title={`Урок: ${nextLesson.title}`}
              meta={`${nextLesson.duration} · этап ${nextLesson.id}`}
              cta="Открыть"
              to="/lessons/$stageId"
              params={{ stageId: nextLesson.id }}
            />
            {activeHw[0] ? (
              <ActionRow
                icon={ClipboardList}
                title={`ДЗ: ${activeHw[0].title}`}
                meta={`Дедлайн ${activeHw[0].deadline}`}
                cta="Сдать"
                to="/homework/$taskId"
                params={{ taskId: activeHw[0].id }}
              />
            ) : (
              <ActionRow
                icon={CheckCircle2}
                title="Активных ДЗ нет"
                meta="Можно взять новое задание"
                cta="К ДЗ"
                to="/homework"
              />
            )}
            <ActionRow
              icon={Trophy}
              title="Рейтинг строителей"
              meta={`${unlockedAchievements} достижений · level ${level}`}
              cta="Смотреть"
              to="/leaderboard"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border border-border bg-card p-6"
        >
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Домашка</div>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">Задания</h2>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl border border-border bg-background/50 px-2 py-3">
              <div className="text-lg font-semibold text-primary">{activeHw.length}</div>
              <div className="text-[10px] text-muted-foreground">в работе</div>
            </div>
            <div className="rounded-xl border border-border bg-background/50 px-2 py-3">
              <div className="text-lg font-semibold text-emerald-400">{doneHw}</div>
              <div className="text-[10px] text-muted-foreground">готово</div>
            </div>
            <div className="rounded-xl border border-border bg-background/50 px-2 py-3">
              <div className="text-lg font-semibold text-red-400">{overdueHw}</div>
              <div className="text-[10px] text-muted-foreground">просрочено</div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {(activeHw.length ? activeHw : homeworkList.slice(0, 3)).map((t) => (
              <Link
                key={t.id}
                to="/homework/$taskId"
                params={{ taskId: t.id }}
                className="block rounded-xl border border-border bg-background/40 px-3 py-2.5 transition-colors hover:border-primary/40"
              >
                <div className="truncate text-sm font-medium">{t.title}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  {t.stage} · {t.deadline}
                </div>
              </Link>
            ))}
          </div>
          <Link
            to="/homework"
            className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Все задания <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>
      </section>

      {/* STAGES ROADMAP */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="mt-6 rounded-3xl border border-border bg-card p-6"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Дорожная карта
            </div>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">8 этапов AI-компании</h2>
          </div>
          <Link
            to="/mission-control"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Mission Control <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
          {stageRows.map((stage, i) => (
            <Link
              key={stage.id}
              to="/lessons/$stageId"
              params={{ stageId: stage.id }}
              className={[
                "group relative rounded-2xl border p-3 transition-all hover:-translate-y-0.5",
                stage.status === "locked"
                  ? "border-border bg-background/30 opacity-70"
                  : "border-border bg-background/50 hover:border-primary/40",
              ].join(" ")}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">[{stage.number}]</span>
                {stage.status === "locked" ? (
                  <Lock className="h-3 w-3 text-muted-foreground" />
                ) : stage.status === "done" ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </div>
              <div className="mt-2 line-clamp-2 text-sm font-medium leading-snug">{stage.title}</div>
              <div
                className={[
                  "mt-2 inline-flex rounded-full border px-2 py-0.5 text-[10px]",
                  stageTone[stage.status],
                ].join(" ")}
              >
                {stage.status === "done" && "Готово"}
                {stage.status === "active" && "Сейчас"}
                {stage.status === "todo" && "Дальше"}
                {stage.status === "locked" && "Закрыто"}
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary/80"
                  style={{ width: `${stage.progress}%` }}
                />
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.03 * i }}
              />
            </Link>
          ))}
        </div>
      </motion.section>

      {/* AI TEAM */}
      <section className="mt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Команда</div>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">Твоя AI-команда</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Отделы открываются по мере прохождения этапов.
            </p>
          </div>
          <Link to="/assistant" className="text-sm text-primary hover:underline">
            AI Assistant →
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {aiTeam.map((agent, i) => {
            const open = !live.loggedIn || stagesDone > i || Number(activeStage.id) > i;
            const status = open
              ? i === 0 || stagesDone > i
                ? ("online" as const)
                : ("ready" as const)
              : ("locked" as const);
            const statusLabel =
              status === "online" ? "Online" : status === "ready" ? "Ready" : "Locked";

            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i, duration: 0.35 }}
                className={[
                  "rounded-2xl border p-5 transition-colors",
                  open
                    ? "border-border bg-card hover:border-primary/35"
                    : "border-border bg-card/60 opacity-55",
                ].join(" ")}
              >
                <div className="flex items-start justify-between">
                  <div className="text-3xl">{agent.emoji}</div>
                  {!open && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>
                <div className="mt-3 text-base font-semibold">{agent.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">{agent.role}</div>
                <div
                  className={[
                    "mt-4 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
                    agentStatusStyles[status],
                  ].join(" ")}
                >
                  <span
                    className={[
                      "h-1.5 w-1.5 rounded-full",
                      status === "online"
                        ? "bg-emerald-400"
                        : status === "ready"
                          ? "bg-primary"
                          : "bg-muted-foreground",
                    ].join(" ")}
                  />
                  {statusLabel}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/60 px-2.5 py-2.5 text-center">
      <div className="text-sm font-semibold">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}

function ActionRow({
  icon: Icon,
  title,
  meta,
  cta,
  to,
  params,
}: {
  icon: typeof BookOpen;
  title: string;
  meta: string;
  cta: string;
  to: "/lessons/$stageId" | "/homework/$taskId" | "/homework" | "/leaderboard";
  params?: { stageId: string } | { taskId: string };
}) {
  return (
    <Link
      to={to}
      params={params as never}
      className="group flex items-center gap-3 rounded-2xl border border-border bg-background/40 px-4 py-3.5 transition-colors hover:border-primary/40"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{title}</div>
        <div className="truncate text-[11px] text-muted-foreground">{meta}</div>
      </div>
      <span className="inline-flex items-center gap-1 text-xs text-primary">
        {cta}
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
