import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Calendar,
  ClipboardList,
  Flame,
  Network,
  Target,
  Trophy,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

const stats = [
  { label: "Прогресс обучения", value: "42%", icon: Target, hint: "3 из 7 этапов" },
  { label: "Текущий этап", value: "AI Marketing", icon: Flame, hint: "Урок 4 из 6" },
  { label: "Следующее занятие", value: "Завтра, 19:00", icon: Calendar, hint: "Автоворонки в GPT" },
  { label: "Домашка", value: "2 задачи", icon: ClipboardList, hint: "Дедлайн через 3 дня" },
];

const activity = [
  { title: "Завершён урок «Prompt Engineering 101»", time: "2 часа назад", type: "lesson" },
  { title: "Ты получил бейдж «Первый агент»", time: "вчера", type: "achievement" },
  { title: "Новый комментарий в сообществе", time: "вчера", type: "community" },
  { title: "AI CEO переведён в статус Connected", time: "3 дня назад", type: "agent" },
];

function Dashboard() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-background p-8 sm:p-10"
      >
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Онлайн · 5-дневный стрик
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Добро пожаловать обратно, Юрий <span className="text-primary">👋</span>
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Ты строишь собственную AI-команду. Продолжим с того места, где остановились.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/lessons"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02]"
            >
              Продолжить обучение <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/mission-control"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/60 px-5 py-2.5 text-sm text-foreground backdrop-blur transition-colors hover:bg-muted/50"
            >
              Открыть Mission Control <Network className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.4 }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-4 w-4" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <div className="mt-4 text-xs text-muted-foreground">{s.label}</div>
            <div className="mt-1 text-xl font-semibold tracking-tight">{s.value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{s.hint}</div>
          </motion.div>
        ))}
      </div>

      {/* Mission Control preview + Activity */}
      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Link
          to="/mission-control"
          className="group relative col-span-1 overflow-hidden rounded-3xl border border-border bg-card p-6 transition-colors hover:border-primary/40 lg:col-span-2"
        >
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
          <div className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Network className="h-3.5 w-3.5 text-primary" /> AI Mission Control
            </div>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">Твоя AI-команда</h3>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              8 отделов. Каждый агент это модуль курса. Подключай, обучай, автоматизируй.
            </p>

            {/* Mini diagram */}
            <div className="mt-6 grid grid-cols-4 gap-3 sm:grid-cols-8">
              {["YOU", "CEO", "Marketing", "Dev", "Design", "Analyst", "CRM", "Auto"].map(
                (n, i) => (
                  <div
                    key={n}
                    className={[
                      "flex h-14 items-center justify-center rounded-xl border text-[10px] font-medium sm:text-xs",
                      i === 0
                        ? "border-primary/50 bg-primary/15 text-foreground"
                        : "border-border bg-background/60 text-muted-foreground",
                    ].join(" ")}
                  >
                    {n}
                  </div>
                ),
              )}
            </div>

            <div className="mt-6 inline-flex items-center gap-1 text-sm text-primary">
              Открыть <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </Link>

        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Trophy className="h-3.5 w-3.5 text-primary" /> Последняя активность
          </div>
          <ul className="mt-4 space-y-4">
            {activity.map((a) => (
              <li key={a.title} className="flex items-start gap-3">
                <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0">
                  <div className="truncate text-sm text-foreground">{a.title}</div>
                  <div className="text-xs text-muted-foreground">{a.time}</div>
                </div>
              </li>
            ))}
          </ul>
          <Link
            to="/lessons"
            className="mt-6 inline-flex w-full items-center justify-center gap-1 rounded-xl border border-border bg-background/60 px-3 py-2 text-xs text-foreground hover:bg-muted/50"
          >
            <BookOpen className="h-3.5 w-3.5" /> Все уроки
          </Link>
        </div>
      </div>
    </div>
  );
}
