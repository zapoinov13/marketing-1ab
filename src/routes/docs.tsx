import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Github,
  Database,
  Bot,
  Workflow,
  Sparkles,
  Cloud,
  Facebook,
  BrainCircuit,
  Send,
  MessageCircle,
} from "lucide-react";

export const Route = createFileRoute("/docs")({
  component: Docs,
});

const categories = [
  { id: "github", label: "GitHub", icon: Github },
  { id: "supabase", label: "Supabase", icon: Database },
  { id: "claude", label: "Claude", icon: Bot },
  { id: "n8n", label: "n8n", icon: Workflow },
  { id: "lovable", label: "Lovable", icon: Sparkles },
  { id: "vercel", label: "Vercel", icon: Cloud },
  { id: "meta", label: "Meta", icon: Facebook },
  { id: "openai", label: "OpenAI", icon: BrainCircuit },
  { id: "telegram", label: "Telegram", icon: Send },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
];

function Docs() {
  const [active, setActive] = useState(categories[0]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">Help Center</div>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Документация</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Настройка инструментов, интеграции, best practices.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        {/* Categories */}
        <aside className="rounded-2xl border border-border bg-card p-3">
          <div className="space-y-1">
            {categories.map((c) => {
              const isActive = active.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setActive(c)}
                  className={[
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 text-foreground ring-1 ring-primary/30"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  ].join(" ")}
                >
                  <c.icon className={["h-4 w-4", isActive ? "text-primary" : ""].join(" ")} />
                  {c.label}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Article */}
        <article className="rounded-2xl border border-border bg-card p-8">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            {active.label}
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Быстрый старт с {active.label}
          </h2>
          <p className="mt-3 text-muted-foreground">
            Установи, подключи, автоматизируй. Ниже — пошаговое руководство от нуля до
            production.
          </p>

          <div className="mt-8 space-y-6 text-sm">
            {["1. Установка", "2. Первая интеграция", "3. Автоматизация"].map((h) => (
              <section key={h}>
                <h3 className="text-base font-medium text-foreground">{h}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  Здесь будет содержимое статьи. Ты можешь добавлять код-блоки, скриншоты,
                  видео-туториалы и ссылки на релевантные уроки.
                </p>
                <pre className="mt-3 overflow-x-auto rounded-xl border border-border bg-background/60 p-4 text-xs text-muted-foreground">
{`# пример команды
npm install ${active.id === "supabase" ? "@supabase/supabase-js" : active.id}`}
                </pre>
              </section>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
