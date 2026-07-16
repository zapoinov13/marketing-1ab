import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Play,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { type HomeworkStatus } from "@/data/platform";
import { useHomework } from "@/contexts/HomeworkContext";

export const Route = createFileRoute("/homework/$taskId")({
  component: HomeworkDetail,
});

const statusUi: Record<HomeworkStatus, { label: string; className: string }> = {
  active: {
    label: "В работе",
    className: "bg-primary/15 text-primary border-primary/30",
  },
  done: {
    label: "Готово",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  overdue: {
    label: "Просрочено",
    className: "bg-destructive/15 text-red-400 border-destructive/30",
  },
};

function HomeworkDetail() {
  const { taskId } = Route.useParams();
  const { getTask, setStatus } = useHomework();
  const navigate = useNavigate();
  const task = getTask(taskId);
  const [report, setReport] = useState("");
  const [sent, setSent] = useState(false);

  if (!task) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-muted-foreground">Задание не найдено.</p>
        <Link to="/homework" className="mt-4 inline-block text-primary hover:underline">
          Ко всем заданиям
        </Link>
      </div>
    );
  }

  function submitWork() {
    if (!report.trim()) return;
    setStatus(task!.id, "done");
    setSent(true);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <Link
        to="/homework"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Все задания
      </Link>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <div className="space-y-5">
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-border bg-card p-6 sm:p-7"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">{task.stage}</span>
              <span
                className={[
                  "rounded-full border px-2.5 py-1 text-[11px] font-medium",
                  statusUi[task.status].className,
                ].join(" ")}
              >
                {statusUi[task.status].label}
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">{task.title}</h1>
            <div className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              Дедлайн: {task.deadline}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {task.description || "Описание пока не добавлено."}
            </p>
          </motion.section>

          <section className="overflow-hidden rounded-3xl border border-border bg-card">
            <div className="relative aspect-video bg-gradient-to-br from-primary/20 via-[#12121a] to-background">
              <div className="absolute inset-0 grid-bg opacity-25" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-background/70 backdrop-blur">
                  <Play className="h-6 w-6 text-primary" />
                </div>
                <div className="text-sm font-medium">Видео к заданию</div>
                <div className="text-xs text-muted-foreground">Сюда вставим embed позже</div>
              </div>
            </div>
            <div className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
              {task.videoTitle}
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold tracking-tight">Отправить работу</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Ссылка на сайт, репозиторий или короткий отчёт.
            </p>
            <textarea
              rows={5}
              value={report}
              onChange={(e) => setReport(e.target.value)}
              placeholder="https://… или опиши, что сделал"
              className="mt-4 w-full resize-none rounded-2xl border border-border bg-background/50 px-4 py-3 text-sm outline-none focus:border-primary/50"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/50 px-4 py-2.5 text-sm hover:border-primary/40"
              >
                <Upload className="h-4 w-4" /> Прикрепить файл
              </button>
              <button
                type="button"
                onClick={submitWork}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
              >
                <CheckCircle2 className="h-4 w-4" /> Отправить
              </button>
            </div>
            {sent && (
              <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
                Работа отправлена. Статус: Готово.
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-3xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">Статус</h2>
            <p className="mt-1 text-xs text-muted-foreground">Можно менять вручную</p>
            <div className="mt-3 flex flex-col gap-2">
              {(Object.keys(statusUi) as HomeworkStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(task.id, s)}
                  className={[
                    "rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
                    task.status === s
                      ? statusUi[s].className
                      : "border-border bg-background/40 text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {statusUi[s].label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setStatus(task.id, "done");
                void navigate({ to: "/homework" });
              }}
              className="mt-3 w-full rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-400"
            >
              Отметить готовым и вернуться
            </button>
          </section>

          <section className="rounded-3xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">Кратко</h2>
            <div className="mt-3 space-y-2 text-sm">
              <Row label="Этап" value={task.stage} />
              <Row label="Дедлайн" value={task.deadline} />
              <Row label="Статус" value={statusUi[task.status].label} />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/40 px-3 py-2.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium">{value}</span>
    </div>
  );
}
