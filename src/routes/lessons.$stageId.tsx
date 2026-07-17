import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  Download,
  ExternalLink,
  FileText,
  FolderOpen,
  Map,
  Play,
} from "lucide-react";
import { lessons, statusLabel, type StageStatus } from "@/data/platform";
import { useLiveProgress } from "@/hooks/useLiveProgress";
import { useLessonContent } from "@/hooks/useLessonContent";
import { LessonAdminEditor } from "@/components/lessons/LessonAdminEditor";

export const Route = createFileRoute("/lessons/$stageId")({
  component: LessonDetail,
});

const badge: Record<StageStatus, string> = {
  done: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  active: "bg-primary/15 text-primary border-primary/30",
  todo: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  locked: "bg-muted/60 text-muted-foreground border-border",
};

function LessonDetail() {
  const { stageId } = Route.useParams();
  const live = useLiveProgress();
  const {
    lesson,
    loading,
    saving,
    uploading,
    error,
    msg,
    isAdmin,
    save,
    uploadDoc,
  } = useLessonContent(stageId);

  const liveStatus =
    (live.rows.find((r) => r.stage_id === lesson.stageId)?.status as
      | StageStatus
      | undefined) ?? lesson.status;
  const status = live.loggedIn ? liveStatus : lesson.status;
  const progress = live.loggedIn
    ? (live.rows.find((r) => r.stage_id === lesson.stageId)?.progress ?? 0)
    : lesson.status === "done"
      ? 100
      : lesson.status === "active"
        ? 0
        : 0;

  const idx = lessons.findIndex((l) => l.id === lesson.stageId);
  const prev = idx > 0 ? lessons[idx - 1] : null;
  const next = idx >= 0 && idx < lessons.length - 1 ? lessons[idx + 1] : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/lessons"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Все уроки
        </Link>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FolderOpen className="h-3.5 w-3.5 text-primary" />
          Уроки / [{lesson.number}] {lesson.title}
        </div>
      </div>

      {isAdmin && (
        <div className="mt-5">
          <LessonAdminEditor
            initial={lesson}
            saving={saving}
            uploading={uploading}
            msg={msg}
            error={error}
            onSave={save}
            onUpload={uploadDoc}
          />
        </div>
      )}

      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-5"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={[
              "inline-flex rounded-full border px-2.5 py-1 text-[11px]",
              badge[status],
            ].join(" ")}
          >
            {statusLabel[status]}
          </span>
          <span className="text-xs text-muted-foreground">{lesson.duration}</span>
          <span className="text-xs text-muted-foreground">· {progress}% этапа</span>
          {loading && (
            <span className="text-xs text-muted-foreground">· загрузка…</span>
          )}
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          [{lesson.number}] {lesson.title}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{lesson.description}</p>
        <div className="mt-3 h-1.5 max-w-md overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-[color:var(--accent-glow)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </motion.header>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
        <div className="space-y-6">
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="overflow-hidden rounded-3xl border border-border bg-card"
          >
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
                  <div className="text-sm font-medium">Видео пока не добавлено</div>
                  <div className="max-w-sm px-6 text-center text-xs text-muted-foreground">
                    {isAdmin
                      ? "Нажми «Редактировать урок» и вставь ссылку YouTube / Loom / Vimeo."
                      : "Админ скоро добавит видеоинструкцию."}
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
              <span>Видеоурок · {lesson.duration}</span>
              <span className="text-primary">
                {lesson.videoEmbedUrl ? "Видео подключено" : "Ожидает видео"}
              </span>
            </div>
          </motion.section>

          <section className="rounded-3xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold tracking-tight">О чём этот урок</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {lesson.description}
            </p>
            <ul className="mt-4 space-y-2">
              {lesson.about.map((point) => (
                <li
                  key={point}
                  className="flex gap-3 rounded-xl border border-border bg-background/40 px-3 py-2.5 text-sm text-muted-foreground"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {point}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border border-primary/30 bg-primary/5 p-6">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold tracking-tight">Домашнее задание</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{lesson.homework}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/homework"
                className="inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
              >
                Открыть ДЗ
              </Link>
              <Link
                to="/mission-control"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-sm"
              >
                <Map className="h-3.5 w-3.5" /> Отметить на карте
              </Link>
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-3xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold tracking-tight">Документы</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Инструкции и файлы к уроку
            </p>
            <div className="mt-3 space-y-2">
              {lesson.documents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
                  Документов пока нет
                </div>
              ) : (
                lesson.documents.map((doc) => (
                  <a
                    key={`${doc.title}-${doc.href || ""}`}
                    href={doc.href || "#"}
                    target={doc.href ? "_blank" : undefined}
                    rel={doc.href ? "noreferrer" : undefined}
                    className="flex items-center justify-between gap-2 rounded-xl border border-border bg-background/50 px-3 py-3 text-sm transition-colors hover:border-primary/40"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FileText className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-medium">{doc.title}</div>
                        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          {doc.type}
                        </div>
                      </div>
                    </div>
                    <Download className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  </a>
                ))
              )}
            </div>
          </section>

          {lesson.links.length > 0 && (
            <section className="rounded-3xl border border-border bg-card p-5">
              <h2 className="text-sm font-semibold tracking-tight">Ссылки</h2>
              <div className="mt-3 space-y-2">
                {lesson.links.map((link) => (
                  <a
                    key={`${link.title}-${link.href}`}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl border border-border bg-background/50 px-3 py-2.5 text-sm hover:border-primary/40"
                  >
                    <span>{link.title}</span>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-3xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold tracking-tight">Навигация</h2>
            <div className="mt-3 space-y-2">
              {prev ? (
                <Link
                  to="/lessons/$stageId"
                  params={{ stageId: prev.id }}
                  className="flex items-center justify-between rounded-xl border border-border bg-background/50 px-3 py-2.5 text-sm hover:border-primary/40"
                >
                  <span className="truncate text-muted-foreground">
                    ← [{prev.number}] {prev.title}
                  </span>
                </Link>
              ) : (
                <div className="rounded-xl border border-dashed border-border px-3 py-2.5 text-xs text-muted-foreground">
                  Это первый урок
                </div>
              )}
              {next ? (
                <Link
                  to="/lessons/$stageId"
                  params={{ stageId: next.id }}
                  className="flex items-center justify-between rounded-xl border border-border bg-background/50 px-3 py-2.5 text-sm hover:border-primary/40"
                >
                  <span className="truncate">
                    [{next.number}] {next.title} →
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-primary" />
                </Link>
              ) : (
                <div className="rounded-xl border border-dashed border-border px-3 py-2.5 text-xs text-muted-foreground">
                  Это последний урок
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
