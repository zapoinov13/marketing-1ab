import { createFileRoute } from "@tanstack/react-router";
import { Award, Flame, Rocket, Target, Trophy, Zap } from "lucide-react";

export const Route = createFileRoute("/profile")({
  component: Profile,
});

const achievements = [
  { icon: Rocket, title: "Первый агент", desc: "Подключён первый AI-агент" },
  { icon: Flame, title: "5 дней стрик", desc: "Занимайся 5 дней подряд" },
  { icon: Trophy, title: "Топ-10 недели", desc: "Ты в лидерборде" },
  { icon: Award, title: "Ментор помог", desc: "Задал вопрос в чате" },
  { icon: Zap, title: "Быстрый старт", desc: "3 урока за день" },
  { icon: Target, title: "Автоматизатор", desc: "Первая n8n автоматизация" },
];

function Profile() {
  const progress = 42;
  const circumference = 2 * Math.PI * 42;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <div className="rounded-3xl border border-border bg-card p-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[color:var(--accent-glow)] text-4xl font-semibold text-primary-foreground ring-4 ring-primary/20">
            Ю
          </div>
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Профиль</div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Юрий Иванов</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Founder · Строю AI-команду с MarkVision AI
            </p>

            <div className="mt-5 flex flex-wrap gap-2 sm:justify-start">
              {["🎯 42% курса", "🔥 5-дневный стрик", "🏆 Топ-10"].map((b) => (
                <div
                  key={b}
                  className="rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground"
                >
                  {b}
                </div>
              ))}
            </div>
          </div>

          {/* Progress ring */}
          <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
            <svg className="h-full w-full -rotate-90">
              <circle cx="56" cy="56" r="42" strokeWidth="8" className="fill-none stroke-muted" />
              <circle
                cx="56"
                cy="56"
                r="42"
                strokeWidth="8"
                strokeLinecap="round"
                className="fill-none stroke-primary transition-all"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (progress / 100) * circumference}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-2xl font-semibold">{progress}%</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Курс</div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold tracking-tight">Достижения</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {achievements.map((a) => (
            <div
              key={a.title}
              className="group rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <a.icon className="h-5 w-5" />
              </div>
              <div className="mt-4 text-sm font-medium">{a.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">{a.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
