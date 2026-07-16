import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, PlayCircle, Upload } from "lucide-react";
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
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <Link
        to="/homework"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Все задания
      </Link>

      <div className="mt-6 rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">{task.stage}</div>
          <span
            className={[
              "rounded-full border px-2.5 py-1 text-[11px] font-medium",
              statusUi[task.status].className,
            ].join(" ")}
          >
            {statusUi[task.status].label}
          </span>
        </div>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{task.title}</h1>
        <div className="mt-2 text-sm text-muted-foreground">Дедлайн: {task.deadline}</div>

        <section className="mt-6">
          <h2 className="text-sm font-medium">Статус</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {(Object.keys(statusUi) as HomeworkStatus[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(task.id, s)}
                className={[
                  "rounded-full border px-3 py-1.5 text-xs transition-colors",
                  task.status === s
                    ? statusUi[s].className
                    : "border-border bg-background/50 text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {statusUi[s].label}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-medium">Описание</h2>
          <p className="mt-2 text-muted-foreground">{task.description || "Описание пока не добавлено."}</p>
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-medium">Видео</h2>
          <div className="mt-3 overflow-hidden rounded-2xl border border-border">
            <div className="relative aspect-video bg-gradient-to-br from-primary/20 via-card to-background">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-background/70 backdrop-blur">
                  <PlayCircle className="h-7 w-7 text-primary" />
                </div>
                <div className="text-xs text-muted-foreground">Окно для видео — вставим позже</div>
              </div>
            </div>
            <div className="border-t border-border px-4 py-3 text-sm">{task.videoTitle}</div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-medium">Отправить работу</h2>
          <textarea
            rows={4}
            value={report}
            onChange={(e) => setReport(e.target.value)}
            placeholder="Ссылка на сайт, репозиторий или краткий отчёт..."
            className="mt-3 w-full resize-none rounded-2xl border border-border bg-background/50 px-4 py-3 text-sm outline-none focus:border-primary/50"
          />
          <div className="mt-3 flex flex-wrap gap-3">
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
            <button
              type="button"
              onClick={() => {
                setStatus(task.id, "done");
                void navigate({ to: "/homework" });
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm"
            >
              Отметить готовым
            </button>
          </div>
          {sent && (
            <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
              Работа отправлена. Статус: Готово.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
