import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Download,
  ExternalLink,
  FileText,
  FolderOpen,
  Play,
} from "lucide-react";
import { getLesson, getStage } from "@/data/platform";

export const Route = createFileRoute("/lessons/$stageId")({
  component: LessonDetail,
});

function LessonDetail() {
  const { stageId } = Route.useParams();
  const lesson = getLesson(stageId);
  const stage = getStage(stageId);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <Link
        to="/lessons"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Все уроки
      </Link>

      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <FolderOpen className="h-3.5 w-3.5 text-primary" />
        Уроки / [{lesson.number}] {lesson.title}
      </div>

      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        [{lesson.number}] {lesson.title}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {lesson.duration} · {lesson.description}
      </p>

      {/* 1. VIDEO WINDOW */}
      <section className="mt-8">
        <div className="overflow-hidden rounded-3xl border border-border bg-card">
          {lesson.videoEmbedUrl ? (
            <div className="aspect-video w-full">
              <iframe
                src={lesson.videoEmbedUrl}
                title={lesson.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="relative aspect-video w-full bg-gradient-to-br from-primary/25 via-[#12121a] to-background">
              <div className="absolute inset-0 grid-bg opacity-30" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-background/70 backdrop-blur">
                  <Play className="h-7 w-7 text-primary" />
                </div>
                <div className="text-sm font-medium">Окно для видео</div>
                <div className="max-w-sm px-6 text-center text-xs text-muted-foreground">
                  Сюда вставим YouTube / Loom / Vimeo. Пока плейсхолдер.
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
            <span>Видеоурок · {lesson.duration}</span>
            <span className="text-primary">Готово к вставке embed</span>
          </div>
        </div>
      </section>

      {/* 2. ABOUT */}
      <section className="mt-8 rounded-3xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold tracking-tight">О чём это видео</h2>
        <p className="mt-2 text-sm text-muted-foreground">{stage.description}</p>
        <ul className="mt-4 space-y-2">
          {lesson.about.map((point) => (
            <li key={point} className="flex gap-3 text-sm text-muted-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {point}
            </li>
          ))}
        </ul>
      </section>

      {/* 3. IMPORTANT DOCS */}
      <section className="mt-6 rounded-3xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold tracking-tight">Важные документы по видео</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Скачай и держи рядом, пока смотришь урок.
        </p>
        <div className="mt-4 space-y-2">
          {lesson.documents.map((doc) => (
            <a
              key={doc.title}
              href={doc.href || "#"}
              className="flex items-center justify-between rounded-2xl border border-border bg-background/50 px-4 py-3.5 text-sm transition-colors hover:border-primary/40"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium text-foreground">{doc.title}</div>
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    {doc.type}
                  </div>
                </div>
              </div>
              <Download className="h-4 w-4 text-muted-foreground" />
            </a>
          ))}
        </div>
      </section>

      {/* 4. LINKS */}
      {lesson.links.length > 0 && (
        <section className="mt-6 rounded-3xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold tracking-tight">Полезные ссылки</h2>
          <div className="mt-4 space-y-2">
            {lesson.links.map((link) => (
              <a
                key={link.title}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-2xl border border-border bg-background/50 px-4 py-3 text-sm hover:border-primary/40"
              >
                <span>{link.title}</span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* 5. HOMEWORK */}
      <section className="mt-6 rounded-3xl border border-primary/30 bg-primary/5 p-6">
        <h2 className="text-lg font-semibold tracking-tight">Домашнее задание</h2>
        <p className="mt-2 text-sm text-muted-foreground">{stage.homework}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/homework"
            className="inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Открыть ДЗ
          </Link>
          <Link
            to="/mission-control"
            className="inline-flex rounded-xl border border-border bg-card px-4 py-2.5 text-sm"
          >
            Отметить на карте
          </Link>
        </div>
      </section>
    </div>
  );
}
