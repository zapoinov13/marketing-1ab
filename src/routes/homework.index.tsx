import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { type HomeworkStatus } from "@/data/platform";
import { useHomework } from "@/contexts/HomeworkContext";

export const Route = createFileRoute("/homework/")({
  component: Homework,
});

const tabs: { id: HomeworkStatus | "all"; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "active", label: "В работе" },
  { id: "done", label: "Готово" },
  { id: "overdue", label: "Просрочено" },
];

const statusUi: Record<HomeworkStatus, { label: string; className: string; icon: typeof CheckCircle2 }> =
  {
    active: {
      label: "В работе",
      className: "bg-primary/15 text-primary border-primary/30",
      icon: ClipboardList,
    },
    done: {
      label: "Готово",
      className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      icon: CheckCircle2,
    },
    overdue: {
      label: "Просрочено",
      className: "bg-destructive/15 text-red-400 border-destructive/30",
      icon: AlertTriangle,
    },
  };

function Homework() {
  const { tasks, counts, addTask } = useHomework();
  const navigate = useNavigate();
  const [tab, setTab] = useState<HomeworkStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stage, setStage] = useState("");
  const [deadline, setDeadline] = useState("");

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((t) => {
      const byTab = tab === "all" || t.status === tab;
      const byQuery =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.stage.toLowerCase().includes(q);
      return byTab && byQuery;
    });
  }, [tab, tasks, query]);

  const focus = tasks.find((t) => t.status === "active") ?? tasks.find((t) => t.status === "overdue");

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
            Сдавай работы, меняй статусы и добавляй свои задания.
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

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Всего" value={String(counts.all)} />
        <Stat label="В работе" value={String(counts.active)} accent="text-primary" />
        <Stat label="Готово" value={String(counts.done)} accent="text-emerald-400" />
        <Stat label="Просрочено" value={String(counts.overdue)} accent="text-red-400" />
      </div>

      {/* Focus CTA */}
      {focus && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mt-6 overflow-hidden rounded-3xl border border-border bg-card"
        >
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" />
          <div className="pointer-events-none absolute -right-16 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                {focus.status === "overdue" ? "Срочно" : "Сфокусируйся"}
              </div>
              <div className="mt-1 text-xl font-semibold tracking-tight">{focus.title}</div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span>{focus.stage}</span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {focus.deadline}
                </span>
              </div>
            </div>
            <Link
              to="/homework/$taskId"
              params={{ taskId: focus.id }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
            >
              Открыть задание <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      )}

      {/* Filters + search */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={[
                "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                tab === t.id
                  ? "border-primary/40 bg-primary/10 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {t.label}
              <span className="ml-1.5 text-xs opacity-70">
                {t.id === "all" ? counts.all : counts[t.id]}
              </span>
            </button>
          ))}
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск заданий…"
            className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-primary/50"
          />
        </div>
      </div>

      {/* Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((task, i) => {
          const Icon = statusUi[task.status].icon;
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * i, duration: 0.3 }}
            >
              <Link
                to="/homework/$taskId"
                params={{ taskId: task.id }}
                className={[
                  "group relative flex h-full flex-col overflow-hidden rounded-3xl border bg-card p-5 transition-all hover:-translate-y-0.5",
                  task.status === "active"
                    ? "border-primary/35"
                    : task.status === "overdue"
                      ? "border-red-500/25"
                      : "border-border hover:border-primary/35",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={[
                      "flex h-10 w-10 items-center justify-center rounded-xl border",
                      statusUi[task.status].className,
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span
                    className={[
                      "rounded-full border px-2.5 py-1 text-[11px] font-medium",
                      statusUi[task.status].className,
                    ].join(" ")}
                  >
                    {statusUi[task.status].label}
                  </span>
                </div>

                <div className="mt-4 text-lg font-semibold tracking-tight">{task.title}</div>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <span>{task.stage}</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {task.deadline}
                  </span>
                </div>
                <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {task.description || "Без описания"}
                </p>

                <div className="mt-5 flex items-center justify-between text-sm text-primary">
                  <span>Открыть</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            </motion.div>
          );
        })}

        {items.length === 0 && (
          <div className="col-span-full rounded-3xl border border-dashed border-border p-12 text-center">
            <ClipboardList className="mx-auto h-8 w-8 text-muted-foreground" />
            <div className="mt-3 text-sm text-muted-foreground">
              {query ? "Ничего не найдено по запросу." : "В этой вкладке пока пусто."}
            </div>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="mt-3 text-sm text-primary hover:underline"
            >
              Добавить задание
            </button>
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">Новое задание</h2>
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
          </motion.div>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={["mt-1 text-2xl font-semibold tracking-tight", accent].filter(Boolean).join(" ")}>
        {value}
      </div>
    </div>
  );
}
