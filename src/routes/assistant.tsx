import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowUp, Sparkles } from "lucide-react";

export const Route = createFileRoute("/assistant")({
  component: Assistant,
});

type Msg = { id: string; role: "user" | "assistant"; text: string };

const seed: Msg[] = [
  { id: "1", role: "assistant", text: "Привет! Я твой AI-ментор. Что изучаем сегодня?" },
  { id: "2", role: "user", text: "Помоги собрать воронку для B2B SaaS." },
  {
    id: "3",
    role: "assistant",
    text:
      "Отлично. Начнём с ICP: опиши идеального клиента — индустрия, размер компании, боль. Я предложу 3 варианта воронки под каждый сегмент.",
  },
];

function Assistant() {
  const [messages, setMessages] = useState<Msg[]>(seed);
  const [text, setText] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    setMessages((m) => [
      ...m,
      { id: crypto.randomUUID(), role: "user", text: value },
      {
        id: crypto.randomUUID(),
        role: "assistant",
        text: "Отличный вопрос — сейчас разберём по шагам. (демо-ответ)",
      },
    ]);
    setText("");
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-4xl flex-col px-4 sm:px-6 lg:px-10">
      <div className="border-b border-border py-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> AI Assistant
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Персональный ментор</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-6 overflow-y-auto py-8">
        {messages.map((m) =>
          m.role === "assistant" ? (
            <div key={m.id} className="flex gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="max-w-[80%] text-sm leading-relaxed text-foreground">{m.text}</div>
            </div>
          ) : (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                {m.text}
              </div>
            </div>
          ),
        )}
      </div>

      {/* Composer */}
      <form onSubmit={submit} className="sticky bottom-0 pb-6 pt-2">
        <div className="glass flex items-end gap-2 rounded-2xl p-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={1}
            placeholder="Спроси что-нибудь у AI-ментора..."
            className="flex-1 resize-none bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(e as unknown as FormEvent);
              }
            }}
          />
          <button
            type="submit"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-transform hover:scale-105 disabled:opacity-40"
            disabled={!text.trim()}
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2 text-center text-[11px] text-muted-foreground">
          Демо-интерфейс. Ответы AI подключаются на следующем этапе.
        </div>
      </form>
    </div>
  );
}
