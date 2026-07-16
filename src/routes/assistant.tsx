import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { assistantQuickActions, user } from "@/data/platform";

export const Route = createFileRoute("/assistant")({
  component: Assistant,
});

type Msg = { id: string; role: "user" | "assistant"; text: string };

const seed: Msg[] = [
  {
    id: "1",
    role: "assistant",
    text: `Привет, ${user.name}.\n\nЧем помочь?`,
  },
];

function Assistant() {
  const [messages, setMessages] = useState<Msg[]>(seed);
  const [input, setInput] = useState("");

  function send(text: string) {
    const value = text.trim();
    if (!value) return;

    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", text: value };
    const reply: Msg = {
      id: crypto.randomUUID(),
      role: "assistant",
      text: demoReply(value),
    };
    setMessages((prev) => [...prev, userMsg, reply]);
    setInput("");
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-3xl flex-col px-4 py-6 sm:px-6 lg:px-10">
      <div className="mb-4">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> AI Assistant
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          Твой AI-помощник по курсу
        </h1>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto rounded-3xl border border-border bg-card p-4 sm:p-6">
        {messages.map((m) => (
          <div
            key={m.id}
            className={[
              "flex",
              m.role === "user" ? "justify-end" : "justify-start",
            ].join(" ")}
          >
            <div
              className={[
                "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed",
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-background/60 text-foreground",
              ].join(" ")}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {assistantQuickActions.map((action) => (
          <button
            key={action}
            onClick={() => send(action)}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            {action}
          </button>
        ))}
      </div>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Спроси что угодно по курсу..."
          className="h-12 flex-1 rounded-2xl border border-border bg-card px-4 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          className="inline-flex h-12 items-center gap-2 rounded-2xl bg-primary px-5 text-sm font-medium text-primary-foreground"
        >
          <Send className="h-4 w-4" />
          Отправить
        </button>
      </form>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        Демо-режим. Позже подключим настоящий AI API.
      </p>
    </div>
  );
}

function demoReply(question: string) {
  const q = question.toLowerCase();
  if (q.includes("meta")) {
    return "Чтобы подключить Meta:\n1) Business Manager\n2) Рекламный кабинет\n3) System User + токен\n\nПодробности — в разделе Документация → Meta.";
  }
  if (q.includes("n8n")) {
    return "Частые ошибки n8n: неверный webhook URL, истёкший credential, неправильный JSON в Code node.\n\nПроверь credentials и последний execution в n8n.";
  }
  if (q.includes("сайт")) {
    return "Пришли ссылку на сайт — в полной версии я проверю оффер, CTA и скорость. Пока открой урок «Первый сайт» и чеклист деплоя.";
  }
  if (q.includes("оффер")) {
    return "Черновик оффера:\n«За 7 дней соберём AI-команду, которая ведёт рекламу, контент и отчёты без найма отдела.»\n\nХочешь версию под стоматологию?";
  }
  if (q.includes("промпт")) {
    return "Промпт:\n«Ты AI-таргетолог. Дано: ниша, бюджет, гео. Составь оффер, 3 креатива и структуру кампании Meta.»";
  }
  return `Принял: «${question}».\n\nВ демо я отвечаю по шаблонам. Скоро здесь будет полноценный ассистент курса.`;
}
