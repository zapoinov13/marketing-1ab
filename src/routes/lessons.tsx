import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";

export const Route = createFileRoute("/lessons")({
  component: Lessons,
});

const stages = [
  { id: "1", title: "Фундамент", subtitle: "AI mindset, prompt engineering", lessons: 3, progress: 100 },
  { id: "2", title: "AI Marketing", subtitle: "Воронки, контент, реклама", lessons: 6, progress: 60 },
  { id: "3", title: "AI Developer", subtitle: "Vibe-coding, Claude Code, MCP", lessons: 8, progress: 25 },
  { id: "4", title: "AI Designer", subtitle: "Midjourney, DALL-E, brand kit", lessons: 5, progress: 0 },
  { id: "5", title: "AI Analyst", subtitle: "Data, dashboards, insights", lessons: 4, progress: 0 },
  { id: "6", title: "CRM & Automation", subtitle: "amoCRM, n8n, Make", lessons: 7, progress: 0 },
  { id: "7", title: "Deploy & Scale", subtitle: "Vercel, Supabase, продакшн", lessons: 5, progress: 0 },
];

function Lessons() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">Курс</div>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        Программа обучения
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        7 этапов. От первого промта до собственной AI-компании.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stages.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 * i, duration: 0.35 }}
          >
            <Link
              to="/lessons/$stageId"
              params={{ stageId: s.id }}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40"
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 opacity-0 blur-3xl transition-opacity group-hover:opacity-100" />

              <div className="flex items-center justify-between">
                <div className="rounded-lg border border-border bg-background/60 px-2 py-0.5 text-[11px] text-muted-foreground">
                  Этап {s.id}
                </div>
                <div className="text-xs text-muted-foreground">{s.lessons} уроков</div>
              </div>

              <div className="mt-5 text-xl font-semibold tracking-tight">{s.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.subtitle}</div>

              <div className="mt-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Прогресс</span>
                  <span className="font-medium">{s.progress}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-[color:var(--accent-glow)]"
                    style={{ width: `${s.progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <PlayCircle className="h-3.5 w-3.5" /> Открыть модуль
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
