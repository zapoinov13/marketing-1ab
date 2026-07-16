import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Download, FileText, MessageSquare, PlayCircle } from "lucide-react";

export const Route = createFileRoute("/lessons/$stageId")({
  component: LessonDetail,
});

function LessonDetail() {
  const { stageId } = Route.useParams();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <Link
        to="/lessons"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Все модули
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Video */}
          <div className="group relative overflow-hidden rounded-3xl border border-border bg-card">
            <div className="aspect-video w-full bg-gradient-to-br from-primary/20 via-card to-background" />
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="flex h-16 w-16 items-center justify-center rounded-full bg-background/70 backdrop-blur transition-transform hover:scale-110">
                <PlayCircle className="h-8 w-8 text-primary" />
              </button>
            </div>
          </div>

          <div className="mt-6 text-xs uppercase tracking-widest text-muted-foreground">
            Этап {stageId}
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Урок 4 · AI-воронки в GPT
          </h1>
          <p className="mt-3 text-muted-foreground">
            Учимся собирать многошаговые воронки на GPT-4, подключать их к CRM и запускать через
            Telegram / WhatsApp. Практика на реальном кейсе.
          </p>

          {/* Materials */}
          <div className="mt-8">
            <div className="text-sm font-medium">Материалы</div>
            <div className="mt-3 space-y-2">
              {["Prompt Playbook.pdf", "Шаблон воронки.n8n.json", "Слайды урока.pdf"].map((m) => (
                <a
                  key={m}
                  className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm transition-colors hover:border-primary/40"
                  href="#"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-primary" />
                    {m}
                  </div>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div className="mt-8">
            <div className="text-sm font-medium">Обсуждение</div>
            <div className="mt-3 space-y-3">
              {[
                { name: "Анна", text: "Огонь урок, применила на своём проекте — конверсия +18%." },
                { name: "Игорь", text: "Как связать это с amoCRM без n8n?" },
              ].map((c) => (
                <div key={c.name} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs text-primary">
                      {c.name[0]}
                    </div>
                    {c.name}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Домашка</div>
            <div className="mt-2 text-sm font-medium">Собрать воронку на 3 шага</div>
            <p className="mt-2 text-xs text-muted-foreground">
              Дедлайн: 22 июля · Проверка ментором
            </p>
            <button className="mt-4 w-full rounded-xl bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Открыть задание
            </button>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MessageSquare className="h-4 w-4 text-primary" /> Ментор онлайн
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Задай вопрос по уроку — ответим в течение часа.
            </p>
            <button className="mt-4 w-full rounded-xl border border-border py-2 text-sm hover:bg-muted/50">
              Написать
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
