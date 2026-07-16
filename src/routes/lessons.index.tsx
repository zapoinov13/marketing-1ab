import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Clock, FolderOpen, PlayCircle } from "lucide-react";
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

function Lessons() {
  const live = useLiveProgress();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">Курс</div>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Уроки</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Нажми на урок — откроется папка: видео, описание и важные документы.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {lessons.map((lesson, i) => {
          const liveStatus =
            (live.rows.find((r) => r.stage_id === lesson.id)?.status as StageStatus | undefined) ??
            lesson.status;
          const status = live.loggedIn ? liveStatus : lesson.status;

          return (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * i, duration: 0.35 }}
            >
              <Link
                to="/lessons/$stageId"
                params={{ stageId: lesson.id }}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40"
              >
                <LessonCardBody lesson={lesson} status={status} />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function LessonCardBody({
  lesson,
  status,
}: {
  lesson: (typeof lessons)[number];
  status: StageStatus;
}) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background/60 text-sm font-semibold">
          [{lesson.number}]
        </div>
        <span
          className={[
            "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px]",
            badge[status],
          ].join(" ")}
        >
          <FolderOpen className="h-3 w-3" />
          {statusLabel[status]}
        </span>
      </div>

      <div className="mt-5 text-xl font-semibold tracking-tight">{lesson.title}</div>
      <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        {lesson.duration}
      </div>
      <p className="mt-3 flex-1 text-sm text-muted-foreground">{lesson.description}</p>
      <div className="mt-2 text-[11px] text-muted-foreground">
        {lesson.documents.length} документов · видео
      </div>

      <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <PlayCircle className="h-3.5 w-3.5" />
          Открыть папку урока
        </span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
    </>
  );
}
