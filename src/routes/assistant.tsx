import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  Map,
  RotateCcw,
  Send,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { assistantQuickActions } from "@/data/platform";
import { useAuth } from "@/contexts/AuthContext";
import { useLiveProgress } from "@/hooks/useLiveProgress";

export const Route = createFileRoute("/assistant")({
  component: Assistant,
});

type Msg = { id: string; role: "user" | "assistant"; text: string };

const shortcuts = [
  { label: "Уроки", to: "/lessons" as const, icon: BookOpen },
  { label: "ДЗ", to: "/homework" as const, icon: ClipboardList },
  { label: "Карта", to: "/mission-control" as const, icon: Map },
];

function Assistant() {
  const { user, profile } = useAuth();
  const live = useLiveProgress();
  const name =
    live.displayName ||
    profile?.full_name ||
    user?.email?.split("@")[0] ||
    "друг";

  const [messages, setMessages] = useState<Msg[]>(() => [
    {
      id: "welcome",
      role: "assistant",
      text: `Привет, ${name}.\n\nЯ помогу по курсу: Meta, n8n, сайт, офферы и промпты.\nВыбери быстрый вопрос или напиши свой.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function send(text: string) {
    const value = text.trim();
    if (!value || typing) return;

    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", text: value };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    window.setTimeout(() => {
      const reply: Msg = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: demoReply(value),
      };
      setMessages((prev) => [...prev, reply]);
      setTyping(false);
    }, 550 + Math.random() * 400);
  }

  function resetChat() {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        text: `Привет, ${name}.\n\nЧем помочь по курсу?`,
      },
    ]);
    setTyping(false);
    inputRef.current?.focus();
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-10">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> AI Assistant
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Помощник по курсу
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {shortcuts.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground"
            >
              <s.icon className="h-3.5 w-3.5" />
              {s.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={resetChat}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Новый чат
          </button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        {/* CHAT */}
        <div className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-border bg-card">
          <div className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">MarkVision Assistant</div>
              <div className="text-[11px] text-muted-foreground">
                {typing ? "Печатает…" : "Онлайн · демо-режим"}
              </div>
            </div>
          </div>

          <div className="relative min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
            <div className="pointer-events-none absolute inset-0 grid-bg opacity-15" />
            <div className="relative space-y-4">
              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={[
                      "flex gap-2.5",
                      m.role === "user" ? "justify-end" : "justify-start",
                    ].join(" ")}
                  >
                    {m.role === "assistant" && (
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                        <Sparkles className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <div
                      className={[
                        "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed",
                        m.role === "user"
                          ? "rounded-br-md bg-primary text-primary-foreground"
                          : "rounded-bl-md border border-border bg-background/70 text-foreground",
                      ].join(" ")}
                    >
                      {m.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {typing && (
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <div className="rounded-2xl rounded-bl-md border border-border bg-background/70 px-4 py-3">
                    <div className="flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          <div className="border-t border-border p-3 sm:p-4">
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {assistantQuickActions.map((action) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => send(action)}
                  disabled={typing}
                  className="shrink-0 rounded-full border border-border bg-background/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50"
                >
                  {action}
                </button>
              ))}
            </div>

            <form
              className="flex items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                rows={1}
                placeholder="Спроси по курсу… Enter — отправить"
                className="max-h-32 min-h-12 flex-1 resize-none rounded-2xl border border-border bg-background/50 px-4 py-3 text-sm outline-none focus:border-primary/50"
              />
              <button
                type="submit"
                disabled={!input.trim() || typing}
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground disabled:opacity-50"
                aria-label="Отправить"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Демо-ответы. Позже подключим настоящий AI API.
            </p>
          </div>
        </div>

        {/* SIDE PANEL */}
        <aside className="hidden min-h-0 flex-col gap-3 overflow-y-auto lg:flex">
          <div className="rounded-3xl border border-border bg-card p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Чем могу помочь
            </div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="rounded-xl border border-border bg-background/40 px-3 py-2">
                Подключить Meta / токены
              </li>
              <li className="rounded-xl border border-border bg-background/40 px-3 py-2">
                Разобрать ошибку n8n
              </li>
              <li className="rounded-xl border border-border bg-background/40 px-3 py-2">
                Собрать оффер и промпт
              </li>
              <li className="rounded-xl border border-border bg-background/40 px-3 py-2">
                Подсказать по сайту и деплою
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border border-border bg-card p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Быстрые переходы
            </div>
            <div className="mt-3 space-y-2">
              {shortcuts.map((s) => (
                <Link
                  key={s.to}
                  to={s.to}
                  className="flex items-center justify-between rounded-xl border border-border bg-background/40 px-3 py-2.5 text-sm hover:border-primary/40"
                >
                  <span className="inline-flex items-center gap-2">
                    <s.icon className="h-3.5 w-3.5 text-primary" />
                    {s.label}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
              ))}
              <Link
                to="/docs"
                className="flex items-center justify-between rounded-xl border border-border bg-background/40 px-3 py-2.5 text-sm hover:border-primary/40"
              >
                <span>Документация</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function demoReply(question: string) {
  const q = question.toLowerCase();
  if (q.includes("meta")) {
    return "Чтобы подключить Meta:\n1) Business Manager\n2) Рекламный кабинет\n3) System User + токен\n\nПодробности — в Документации → Meta.";
  }
  if (q.includes("n8n")) {
    return "Частые ошибки n8n:\n• неверный webhook URL\n• истёкший credential\n• кривой JSON в Code node\n\nПроверь credentials и последний execution.";
  }
  if (q.includes("сайт")) {
    return "Пришли ссылку на сайт — в полной версии проверю оффер, CTA и скорость.\nПока открой урок «Первый сайт» и чеклист деплоя.";
  }
  if (q.includes("оффер")) {
    return "Черновик оффера:\n«За 7 дней соберём AI-команду, которая ведёт рекламу, контент и отчёты без найма отдела.»\n\nНужна версия под твою нишу?";
  }
  if (q.includes("промпт")) {
    return "Промпт:\n«Ты AI-таргетолог. Дано: ниша, бюджет, гео. Составь оффер, 3 креатива и структуру кампании Meta.»";
  }
  return `Принял: «${question}».\n\nВ демо отвечаю по шаблонам. Скоро здесь будет полноценный ассистент курса.`;
}
