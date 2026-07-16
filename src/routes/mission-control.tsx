import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  Crown,
  Megaphone,
  Code2,
  Palette,
  BarChart3,
  Database,
  FileBarChart,
  Workflow,
  User,
  X,
} from "lucide-react";

export const Route = createFileRoute("/mission-control")({
  component: MissionControl,
});

type Status = "Not Installed" | "Installing" | "Connected" | "Working";

type Agent = {
  id: string;
  name: string;
  role: string;
  icon: typeof Bot;
  status: Status;
  desc: string;
};

const statusStyles: Record<Status, string> = {
  "Not Installed": "bg-muted/60 text-muted-foreground border-border",
  Installing: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  Connected: "bg-primary/10 text-primary border-primary/30",
  Working: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
};

const agents: Agent[] = [
  { id: "ceo", name: "AI CEO", role: "Стратегия", icon: Crown, status: "Working", desc: "Принимает стратегические решения." },
  { id: "mkt", name: "AI Marketing", role: "Продвижение", icon: Megaphone, status: "Connected", desc: "Кампании, воронки, контент-план." },
  { id: "dev", name: "AI Developer", role: "Разработка", icon: Code2, status: "Connected", desc: "Кодит фичи и микросервисы." },
  { id: "design", name: "AI Designer", role: "Визуал", icon: Palette, status: "Installing", desc: "Генерирует бренд-ассеты и UI." },
  { id: "analyst", name: "AI Analyst", role: "Аналитика", icon: BarChart3, status: "Not Installed", desc: "Разбирает метрики и когорты." },
  { id: "crm", name: "CRM", role: "Клиенты", icon: Database, status: "Not Installed", desc: "Синхронизация с amoCRM и HubSpot." },
  { id: "reports", name: "Reports", role: "Отчёты", icon: FileBarChart, status: "Not Installed", desc: "Автоотчёты в Notion и Slack." },
  { id: "auto", name: "Automation", role: "Оркестрация", icon: Workflow, status: "Not Installed", desc: "n8n / Make сценарии." },
];

function MissionControl() {
  const [selected, setSelected] = useState<Agent | null>(null);

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />

      <div className="relative">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">
          AI Mission Control
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Схема твоей AI-компании
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Каждая карточка — отдел. Каждый урок подключает новый отдел. Твоя цель — довести всю
          структуру до статуса <span className="text-emerald-400">Working</span>.
        </p>

        {/* YOU node */}
        <div className="mt-14 flex justify-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative flex h-24 w-24 items-center justify-center rounded-full border border-primary/40 bg-gradient-to-br from-primary/30 to-transparent ring-8 ring-primary/5"
          >
            <div className="absolute inset-0 animate-pulse rounded-full bg-primary/10 blur-xl" />
            <div className="relative flex flex-col items-center">
              <User className="h-6 w-6 text-primary" />
              <div className="mt-1 text-xs font-semibold">YOU</div>
            </div>
          </motion.div>
        </div>

        {/* Connector lines (decorative) */}
        <div className="relative mx-auto mt-6 h-10 w-px bg-gradient-to-b from-primary/50 to-transparent" />

        {/* Agent grid */}
        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {agents.map((a, i) => (
            <motion.button
              key={a.id}
              onClick={() => setSelected(a)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i, duration: 0.35 }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_0_0_1px_var(--color-primary)]/20"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <a.icon className="h-5 w-5" />
                </div>
                <span
                  className={[
                    "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                    statusStyles[a.status],
                  ].join(" ")}
                >
                  {a.status}
                </span>
              </div>
              <div className="mt-4 text-sm font-semibold tracking-tight">{a.name}</div>
              <div className="text-xs text-muted-foreground">{a.role}</div>
              <div className="mt-3 line-clamp-2 text-xs text-muted-foreground">{a.desc}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <div
            className="absolute inset-0 bg-background/70 backdrop-blur-md"
            onClick={() => setSelected(null)}
          />
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6"
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <selected.icon className="h-6 w-6" />
            </div>
            <div className="mt-4 text-xl font-semibold">{selected.name}</div>
            <div className="mt-1 text-sm text-muted-foreground">{selected.role}</div>
            <p className="mt-4 text-sm text-muted-foreground">{selected.desc}</p>
            <div className="mt-4 flex items-center gap-2">
              <span className={["rounded-full border px-2 py-0.5 text-xs", statusStyles[selected.status]].join(" ")}>
                {selected.status}
              </span>
            </div>
            <button className="mt-6 w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Подключить агента
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
