import { createFileRoute } from "@tanstack/react-router";
import { Bell, Lock, Palette, User } from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: Settings,
});

const sections = [
  { icon: User, title: "Аккаунт", desc: "Имя, email, роль в команде" },
  { icon: Bell, title: "Уведомления", desc: "Email, push, digest" },
  { icon: Palette, title: "Внешний вид", desc: "Тема, акцентный цвет" },
  { icon: Lock, title: "Безопасность", desc: "Пароль, 2FA, сессии" },
];

function Settings() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">Настройки</div>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Управление</h1>
      <p className="mt-2 text-muted-foreground">Персонализируй платформу под себя.</p>

      <div className="mt-8 space-y-3">
        {sections.map((s) => (
          <button
            key={s.title}
            className="flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-5 text-left transition-colors hover:border-primary/40"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <s.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">{s.title}</div>
              <div className="text-xs text-muted-foreground">{s.desc}</div>
            </div>
            <div className="text-xs text-muted-foreground">Изменить →</div>
          </button>
        ))}
      </div>
    </div>
  );
}
