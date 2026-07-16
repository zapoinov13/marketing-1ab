import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Calendar } from "lucide-react";

export const Route = createFileRoute("/homework")({
  component: Homework,
});

type Status = "В работе" | "На проверке" | "Принято" | "Не начато";

const tasks: { id: string; title: string; status: Status; deadline: string }[] = [
  { id: "1", title: "Собрать первый AI-промт для копирайтинга", status: "Принято", deadline: "12 июля" },
  { id: "2", title: "Настроить автоворонку в n8n", status: "В работе", deadline: "22 июля" },
  { id: "3", title: "Подключить Claude к своему проекту", status: "На проверке", deadline: "19 июля" },
  { id: "4", title: "Собрать бренд-кит в Midjourney", status: "Не начато", deadline: "1 августа" },
  { id: "5", title: "Дашборд метрик в Supabase", status: "Не начато", deadline: "8 августа" },
];

const badge: Record<Status, string> = {
  "Принято": "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  "В работе": "bg-primary/10 text-primary border-primary/30",
  "На проверке": "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  "Не начато": "bg-muted/60 text-muted-foreground border-border",
};

function Homework() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">Практика</div>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Домашние задания</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Практикуй знания на реальных задачах. Каждое задание проверяет ментор.
      </p>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
        {/* Header — desktop */}
        <div className="hidden grid-cols-[1fr_140px_160px_120px] gap-4 border-b border-border px-6 py-3 text-xs uppercase tracking-wider text-muted-foreground md:grid">
          <div>Название</div>
          <div>Статус</div>
          <div>Дедлайн</div>
          <div className="text-right">Действие</div>
        </div>

        <ul className="divide-y divide-border">
          {tasks.map((t) => (
            <li
              key={t.id}
              className="grid grid-cols-1 gap-3 px-6 py-4 transition-colors hover:bg-muted/30 md:grid-cols-[1fr_140px_160px_120px] md:items-center md:gap-4"
            >
              <div className="text-sm font-medium text-foreground">{t.title}</div>
              <div>
                <span className={["inline-flex rounded-full border px-2.5 py-0.5 text-xs", badge[t.status]].join(" ")}>
                  {t.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" /> {t.deadline}
              </div>
              <div className="md:text-right">
                <button className="inline-flex items-center gap-1 rounded-lg border border-border bg-background/60 px-3 py-1.5 text-xs text-foreground hover:bg-muted/50">
                  Открыть <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
