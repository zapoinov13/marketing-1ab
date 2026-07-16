import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Calendar, Plus, X } from "lucide-react";
import { type HomeworkStatus } from "@/data/platform";
import { useHomework } from "@/contexts/HomeworkContext";

export const Route = createFileRoute("/homework/")({
  component: Homework,
});

const tabs: { id: HomeworkStatus | "all"; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "active", label: "Активные" },
  { id: "done", label: "Завершённые" },
  { id: "overdue", label: "Просроченные" },
];

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

function Homework() {
  const { tasks, counts, addTask } = useHomework();
  const navigate = useNavigate();
  const [tab, setTab] = useState<HomeworkStatus | "all">("all");
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stage, setStage] = useState("");
  const [deadline, setDeadline] = useState("");

  const items = useMemo(
    () => (tab === "all" ? tasks : tasks.filter((t) => t.status === tab)),
    [tab, tasks],
  );

  function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const task = addTask({ title, description, stage, deadline });
    setTitle("");
    setDescription("");
    setStage("");
    setDeadline("");
    setOpen(false);
    void navigate({ to: "/homework/$taskId", params: { taskId: task.id } });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Практика</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Домашние задания
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Открывай карточку, меняй статус и добавляй свои задания.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Добавить задание
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={[
              "rounded-full border px-4 py-2 text-sm transition-colors",
              tab === t.id
                ? "border-primary/40 bg-primary/10 text-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {t.label}
            <span className="ml-2 text-xs opacity-70">
              {t.id === "all" ? counts.all : counts[t.id]}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((task) => (
          <Link
            key={task.id}
            to="/homework/$taskId"
            params={{ taskId: task.id }}
            className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40"
          >
            <div className="flex items-center justify-between">
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
            <div className="mt-4 text-xl font-semibold tracking-tight">{task.title}</div>
            <div className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              Дедлайн {task.deadline}
            </div>
            <p className="mt-3 line-clamp-2 flex-1 text-sm text-muted-foreground">
              {task.description}
            </p>
            <div className="mt-5 inline-flex items-center gap-1 text-sm text-primary">
              Открыть{" "}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
        {items.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            В этой вкладке пока пусто.{" "}
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="text-primary hover:underline"
            >
              Добавить задание
            </button>
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">Новое домашнее задание</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={onCreate} className="mt-5 space-y-3">
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Название задания"
                className="h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm outline-none focus:border-primary/50"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Описание — что нужно сделать"
                className="w-full resize-none rounded-xl border border-border bg-background/50 px-4 py-3 text-sm outline-none focus:border-primary/50"
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  placeholder="Этап (напр. Этап 3)"
                  className="h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm outline-none focus:border-primary/50"
                />
                <input
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  placeholder="Дедлайн (напр. 20 июля)"
                  className="h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm outline-none focus:border-primary/50"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-border px-4 py-2.5 text-sm"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
                >
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
