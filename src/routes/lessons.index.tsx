import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  FolderOpen,
  Lock,
  Play,
} from "lucide-react";
import { useMemo, useState } from "react";
import { lessons, statusLabel, type StageStatus } from "@/data/platform";
import { useLiveProgress } from "@/hooks/useLiveProgress";

export const Route = createFileRoute("/lessons/")({
  component: Lessons,
});

const badge: Record<StageStatus, string> = {
  done: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  active: "bg-primary/15 text-primary border-primary/30",
  todo: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  locked: "bg-muted/60 text-muted-foreground border-border",
};

type FilterId = "all" | StageStatus;

const filters: { id: FilterId; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "active", label: "Сейчас" },
  { id: "done", label: "Пройдены" },
  { id: "todo", label: "Дальше" },
  { id: "locked", label: "Закрыты" },
];

function Lessons() {
  const live = useLiveProgress();
  const [filter, setFilter] = useState<FilterId>("all");

  const items = useMemo(() => {
    return lessons.map((lesson) => {
      const liveStatus =
        (live.rows.find((r) => r.stage_id === lesson.id)?.status as StageStatus | undefined) ??
        lesson.status;
      const progress = live.loggedIn
        ? (live.rows.find((r) => r.stage_id === lesson.id)?.progress ?? 0)
        : lesson.status === "done"
          ? 100
          : lesson.status === "active"
            ? 45
            : 0;
      const status = live.loggedIn ? liveStatus : lesson.status;
      return { lesson, status, progress };
    });
  }, [live.loggedIn, live.rows]);

  const visible = items.filter((x) => filter === "all" || x.status === filter);
  const active = items.find((x) => x.status === "active") ?? items[0];
  const doneCount = items.filter((x) => x.status === "done").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Курс</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Уроки</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Папка каждого урока: видео, описание, документы и ДЗ.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-4 py-3 text-sm">
          <span className="text-muted-foreground">Пройдено </span>
          <span className="font-semibold">{doneCount}/8</span>
        </div>
      </div>

      {/* Continue CTA */}
      {active && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mt-6 overflow-hidden rounded-3xl border border-border bg-card"
        >
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-25" />
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <Play className="h-6 w-6" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Продолжить
                </div>
                <div className="mt-1 text-xl font-semibold tracking-tight">
                  [{active.lesson.number}] {active.lesson.title}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {active.lesson.duration}
                  </span>
                  <span>{active.progress}% этапа</span>
                </div>
                <div className="mt-3 h-1.5 w-48 overflow-hidden rounded-full bg-muted sm:w-64">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-[color:var(--accent-glow)]"
                    style={{ width: `${active.progress}%` }}
                  />
                </div>
              </div>
            </div>
            <Link
              to="/lessons/$stageId"
              params={{ stageId: active.lesson.id }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
            >
              Открыть урок <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-2">
        {filters.map((f) => {
          const count =
            f.id === "all" ? items.length : items.filter((x) => x.status === f.id).length;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={[
                "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                filter === f.id
                  ? "border-primary/40 bg-primary/10 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {f.label}
              <span className="ml-1.5 text-xs opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {visible.map(({ lesson, status, progress }, i) => (
          <motion.div
            key={lesson.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 * i, duration: 0.3 }}
          >
            <Link
              to="/lessons/$stageId"
              params={{ stageId: lesson.id }}
              className={[
                "group relative flex h-full flex-col overflow-hidden rounded-3xl border bg-card p-5 transition-all hover:-translate-y-0.5",
                status === "active"
                  ? "border-primary/40"
                  : "border-border hover:border-primary/35",
                status === "locked" ? "opacity-80" : "",
              ].join(" ")}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

              <div className="relative flex items-start justify-between gap-3">
                <div
                  className={[
                    "flex h-11 w-11 items-center justify-center rounded-2xl border text-sm font-semibold",
                    status === "active"
                      ? "border-primary/40 bg-primary/15 text-primary"
                      : "border-border bg-background/60",
                  ].join(" ")}
                >
                  {status === "locked" ? (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  ) : status === "done" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    `[${lesson.number}]`
                  )}
                </div>
                <span
                  className={[
                    "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px]",
                    badge[status],
                  ].join(" ")}
                >
                  {statusLabel[status]}
                </span>
              </div>

              <div className="relative mt-4 text-lg font-semibold tracking-tight">
                {lesson.title}
              </div>
              <div className="relative mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {lesson.duration}
              </div>
              <p className="relative mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {lesson.description}
              </p>

              <div className="relative mt-4">
                <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {lesson.documents.length} док.
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="relative mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <FolderOpen className="h-3.5 w-3.5 text-primary" />
                  Открыть папку
                </span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {visible.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          В этом фильтре пока пусто.
        </div>
      )}
    </div>
  );
}
