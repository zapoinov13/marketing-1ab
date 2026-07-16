import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  Clock,
  Flame,
  Trophy,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  activityFeed,
  achievements,
  agentStatusStyles,
  aiTeam,
  lessons,
  nextClass,
  user as mockUser,
} from "@/data/platform";
import { useHomework } from "@/contexts/HomeworkContext";
import { useLiveProgress } from "@/hooks/useLiveProgress";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const live = useLiveProgress();
  const { tasks: homeworkList } = useHomework();
  const name = live.displayName || mockUser.name;
  const progress = live.loggedIn ? (live.companyProgress ?? 0) : mockUser.progress;
  const level = live.loggedIn ? live.level : mockUser.level;
  const tasksDone = live.loggedIn ? live.tasksDone : mockUser.tasksDone;
  const tasksTotal = live.loggedIn ? live.tasksTotal : mockUser.tasksTotal;
  const company = live.liveCompanyBuild;

  const nextLesson =
    lessons.find((l) => l.id === (live.rows.find((r) => r.status === "active")?.stage_id)) ||
    lessons.find((l) => l.status === "active") ||
    lessons[0];
  const activeHw = homeworkList.find((t) => t.status === "active");
  const unlocked = achievements.filter((a) => a.unlocked);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-background p-8 sm:p-10"
      >
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative">
          {live.loggedIn ? (
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-400">
              Данные из Supabase
              {live.loading ? " · загрузка…" : ""}
            </div>
          ) : (
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-background/50 px-3 py-1 text-[11px] text-muted-foreground">
              Демо-режим ·{" "}
              <Link to="/login" className="text-primary hover:underline">
                войди
              </Link>
            </div>
          )}

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Добро пожаловать, {name} <span className="text-primary">👋</span>
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Сегодня ты строишь собственную AI-команду.
          </p>

          <div className="mt-6 max-w-lg rounded-2xl border border-border bg-background/50 p-4 backdrop-blur">
            <div className="text-xs text-muted-foreground">Следующее занятие</div>
            <div className="mt-1 text-lg font-semibold">
              {live.loggedIn
                ? `Этап ${nextLesson.id}. ${nextLesson.title}`
                : nextClass.title}
            </div>
            <div className="mt-2 inline-flex items-center gap-2 text-sm text-primary">
              <Clock className="h-4 w-4" />
              {live.loggedIn ? `Прогресс этапа ${nextLesson.id}: 0%` : `До занятия: ${nextClass.countdown}`}
            </div>
          </div>

          <div className="mt-6">
            <Link
              to="/lessons/$stageId"
              params={{ stageId: nextLesson.id }}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02]"
            >
              Продолжить обучение <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.4 }}
        className="mt-6 grid grid-cols-1 gap-4 rounded-3xl border border-border bg-card p-6 lg:grid-cols-3"
      >
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Общий прогресс</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-[color:var(--accent-glow)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-3 text-sm text-muted-foreground">
            Выполнено{" "}
            <span className="font-medium text-foreground">
              {tasksDone} / {tasksTotal}
            </span>{" "}
            этапов
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-background/50 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Текущий уровень</div>
            <div className="text-lg font-semibold">{level}</div>
          </div>
        </div>
      </motion.div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <QuickCard
          label="Следующий урок"
          title={nextLesson.title}
          hint={nextLesson.duration}
          delay={0}
          icon={BookOpen}
          href={
            <Link
              to="/lessons/$stageId"
              params={{ stageId: nextLesson.id }}
              className="absolute inset-0"
              aria-label={nextLesson.title}
            />
          }
        />
        <QuickCard
          label="Домашнее задание"
          title={activeHw?.title ?? "Нет активных"}
          hint={activeHw ? `Дедлайн ${activeHw.deadline}` : "Все сдано"}
          delay={1}
          icon={ClipboardList}
          href={
            activeHw ? (
              <Link
                to="/homework/$taskId"
                params={{ taskId: activeHw.id }}
                className="absolute inset-0"
                aria-label={activeHw.title}
              />
            ) : (
              <Link to="/homework" className="absolute inset-0" aria-label="Домашние задания" />
            )
          }
        />
        <QuickCard
          label="Последняя активность"
          title={live.loggedIn ? "Аккаунт подключён к Supabase" : activityFeed[0].title}
          hint={live.loggedIn ? "Прогресс сохраняется" : activityFeed[0].time}
          delay={2}
          icon={Clock}
          href={<Link to="/mission-control" className="absolute inset-0" aria-label="Mission Control" />}
        />
        <QuickCard
          label="Твои достижения"
          title={live.loggedIn ? "0 открыто" : `${unlocked.length} открыто`}
          hint={live.loggedIn ? "Пока с нуля — открывай по мере роста" : `${achievements.length - unlocked.length} ещё впереди`}
          delay={3}
          icon={Trophy}
          href={<Link to="/leaderboard" className="absolute inset-0" aria-label="Leaderboard" />}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="mt-6 rounded-3xl border border-border bg-card p-6"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Твоя AI-компания
            </div>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Компания готова на {progress}%
            </h2>
          </div>
          <Link
            to="/mission-control"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Открыть карту <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {company.map((block, i) => (
            <Link
              key={block.key}
              to="/lessons/$stageId"
              params={{ stageId: String(i + 1) }}
              className="rounded-2xl border border-border bg-background/50 px-3 py-4 text-center transition-colors hover:border-primary/40"
            >
              <div className="text-xl">{block.icon}</div>
              <div className="mt-2 text-xs font-medium">{block.label}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                {block.status === "done" && "✅"}
                {block.status === "active" && "🔄"}
                {block.status === "locked" && "🔒"}
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      <div className="mt-6">
        <h2 className="text-2xl font-semibold tracking-tight">Твоя AI-команда</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {live.loggedIn
            ? "Агенты пока UI-демо. Разблокируются по мере прохождения этапов."
            : "Карточки отделов. Войди, чтобы прогресс был настоящим."}
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {aiTeam.map((agent, i) => {
            const unlockedAgent = live.loggedIn
              ? i === 0 && progress > 0
                ? agent
                : { ...agent, status: "locked" as const, statusLabel: "Locked" }
              : agent;
            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i, duration: 0.35 }}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="text-3xl">{unlockedAgent.emoji}</div>
                <div className="mt-3 text-base font-semibold">{unlockedAgent.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">{unlockedAgent.role}</div>
                <div
                  className={[
                    "mt-4 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
                    agentStatusStyles[unlockedAgent.status],
                  ].join(" ")}
                >
                  <span
                    className={[
                      "h-1.5 w-1.5 rounded-full",
                      unlockedAgent.status === "online"
                        ? "bg-emerald-400"
                        : unlockedAgent.status === "ready"
                          ? "bg-primary"
                          : "bg-muted-foreground",
                    ].join(" ")}
                  />
                  {unlockedAgent.statusLabel}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function QuickCard({
  label,
  title,
  hint,
  delay,
  icon: Icon,
  href,
}: {
  label: string;
  title: string;
  hint: string;
  delay: number;
  icon: LucideIcon;
  href: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 * delay, duration: 0.35 }}
      className="relative"
    >
      <div className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40">
        {href}
        <div className="pointer-events-none flex items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
        </div>
        <div className="pointer-events-none mt-4 text-xs text-muted-foreground">{label}</div>
        <div className="pointer-events-none mt-1 line-clamp-2 text-base font-semibold tracking-tight">
          {title}
        </div>
        <div className="pointer-events-none mt-1 text-xs text-muted-foreground">{hint}</div>
      </div>
    </motion.div>
  );
}
