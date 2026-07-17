import { useEffect, useRef, useState } from "react";
import {
  FileUp,
  Link2,
  Plus,
  Save,
  Shield,
  Trash2,
  Video,
  X,
} from "lucide-react";
import type { EditableLesson, LessonLink } from "@/hooks/useLessonContent";
import type { LessonDoc } from "@/data/platform";
import { toEmbedUrl } from "@/lib/videoEmbed";

const inputCls =
  "h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm outline-none focus:border-primary/50";
const areaCls =
  "w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm outline-none focus:border-primary/50";

type Props = {
  initial: EditableLesson;
  saving: boolean;
  uploading: boolean;
  msg: string;
  error: string;
  onSave: (draft: EditableLesson) => Promise<{ error?: string }>;
  onUpload: (
    file: File,
  ) => Promise<{
    error?: string;
    url?: string;
    title?: string;
    type?: LessonDoc["type"];
  }>;
};

export function LessonAdminEditor({
  initial,
  saving,
  uploading,
  msg,
  error,
  onSave,
  onUpload,
}: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<EditableLesson>(initial);
  const [videoInput, setVideoInput] = useState(initial.videoEmbedUrl);
  const [aboutText, setAboutText] = useState(initial.about.join("\n"));
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocHref, setNewDocHref] = useState("");
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkHref, setNewLinkHref] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(initial);
    setVideoInput(initial.videoEmbedUrl);
    setAboutText(initial.about.join("\n"));
  }, [initial]);

  function patch<K extends keyof EditableLesson>(
    key: K,
    value: EditableLesson[K],
  ) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function addDocManual() {
    const title = newDocTitle.trim();
    const href = newDocHref.trim();
    if (!title || !href) return;
    patch("documents", [...draft.documents, { title, type: "link", href }]);
    setNewDocTitle("");
    setNewDocHref("");
  }

  function removeDoc(idx: number) {
    patch(
      "documents",
      draft.documents.filter((_, i) => i !== idx),
    );
  }

  function addLink() {
    const title = newLinkTitle.trim();
    const href = newLinkHref.trim();
    if (!title || !href) return;
    const link: LessonLink = { title, href };
    patch("links", [...draft.links, link]);
    setNewLinkTitle("");
    setNewLinkHref("");
  }

  function removeLink(idx: number) {
    patch(
      "links",
      draft.links.filter((_, i) => i !== idx),
    );
  }

  async function handleUpload(file: File | undefined) {
    if (!file) return;
    const res = await onUpload(file);
    if (res.error || !res.url) return;
    const doc: LessonDoc = {
      title: res.title || file.name,
      type: res.type || "link",
      href: res.url,
    };
    setDraft((d) => ({ ...d, documents: [...d.documents, doc] }));
  }

  async function handleSave() {
    const about = aboutText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    await onSave({
      ...draft,
      about,
      videoEmbedUrl: toEmbedUrl(videoInput),
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2.5 text-sm text-primary hover:bg-primary/15"
      >
        <Shield className="h-4 w-4" /> Редактировать урок
      </button>
    );
  }

  return (
    <section className="rounded-3xl border border-primary/35 bg-primary/5 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Shield className="h-4 w-4 text-primary" /> Админ · контент урока
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Видео, документы, ссылки и текст. После сохранения видят все ученики.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-border p-2 text-muted-foreground hover:text-foreground"
          aria-label="Закрыть"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Название">
          <input
            value={draft.title}
            onChange={(e) => patch("title", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Длительность">
          <input
            value={draft.duration}
            onChange={(e) => patch("duration", e.target.value)}
            placeholder="2ч 10мин"
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Описание" className="mt-4">
        <textarea
          value={draft.description}
          onChange={(e) => patch("description", e.target.value)}
          rows={3}
          className={areaCls}
        />
      </Field>

      <Field label="О чём урок (каждая строка — пункт)" className="mt-4">
        <textarea
          value={aboutText}
          onChange={(e) => setAboutText(e.target.value)}
          rows={4}
          className={areaCls}
        />
      </Field>

      <Field label="Домашнее задание" className="mt-4">
        <textarea
          value={draft.homework}
          onChange={(e) => patch("homework", e.target.value)}
          rows={2}
          className={areaCls}
        />
      </Field>

      <div className="mt-5 rounded-2xl border border-border bg-background/40 p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Video className="h-4 w-4 text-primary" /> Видео (YouTube / Loom / Vimeo)
        </div>
        <input
          value={videoInput}
          onChange={(e) => setVideoInput(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=… или embed URL"
          className={`${inputCls} mt-3`}
        />
        {videoInput.trim() && (
          <div className="mt-3 overflow-hidden rounded-xl border border-border">
            <div className="aspect-video w-full bg-black/40">
              <iframe
                src={toEmbedUrl(videoInput)}
                title="preview"
                className="h-full w-full"
                allowFullScreen
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-background/40 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <FileUp className="h-4 w-4 text-primary" /> Документы и инструкции
          </div>
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs hover:border-primary/40 disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            {uploading ? "Загрузка…" : "Загрузить файл"}
          </button>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept=".pdf,.txt,.md,.doc,.docx,.png,.jpg,.jpeg,.webp,.json"
            onChange={(e) => {
              void handleUpload(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>

        <ul className="mt-3 space-y-2">
          {draft.documents.map((doc, i) => (
            <li
              key={`${doc.title}-${i}`}
              className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <div className="truncate font-medium">{doc.title}</div>
                <div className="truncate text-[11px] text-muted-foreground">
                  {doc.type}
                  {doc.href ? ` · ${doc.href}` : ""}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeDoc(i)}
                className="rounded-lg p-1.5 text-muted-foreground hover:text-red-300"
                aria-label="Удалить документ"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
          {draft.documents.length === 0 && (
            <li className="text-xs text-muted-foreground">Пока нет документов</li>
          )}
        </ul>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <input
            value={newDocTitle}
            onChange={(e) => setNewDocTitle(e.target.value)}
            placeholder="Название файла / инструкции"
            className={inputCls}
          />
          <input
            value={newDocHref}
            onChange={(e) => setNewDocHref(e.target.value)}
            placeholder="Ссылка (Google Drive, Notion…)"
            className={inputCls}
          />
          <button
            type="button"
            onClick={addDocManual}
            className="inline-flex items-center justify-center gap-1 rounded-xl border border-border px-3 py-2 text-xs hover:border-primary/40"
          >
            <Plus className="h-3.5 w-3.5" /> Добавить ссылку
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-background/40 p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Link2 className="h-4 w-4 text-primary" /> Полезные ссылки
        </div>
        <ul className="mt-3 space-y-2">
          {draft.links.map((link, i) => (
            <li
              key={`${link.title}-${i}`}
              className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm"
            >
              <div className="min-w-0 truncate">
                <span className="font-medium">{link.title}</span>
                <span className="text-muted-foreground"> · {link.href}</span>
              </div>
              <button
                type="button"
                onClick={() => removeLink(i)}
                className="rounded-lg p-1.5 text-muted-foreground hover:text-red-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <input
            value={newLinkTitle}
            onChange={(e) => setNewLinkTitle(e.target.value)}
            placeholder="Название"
            className={inputCls}
          />
          <input
            value={newLinkHref}
            onChange={(e) => setNewLinkHref(e.target.value)}
            placeholder="https://…"
            className={inputCls}
          />
          <button
            type="button"
            onClick={addLink}
            className="inline-flex items-center justify-center gap-1 rounded-xl border border-border px-3 py-2 text-xs hover:border-primary/40"
          >
            <Plus className="h-3.5 w-3.5" /> Добавить
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={saving}
          onClick={() => void handleSave()}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving ? "Сохраняю…" : "Сохранить урок"}
        </button>
        {msg && <span className="text-sm text-emerald-400">{msg}</span>}
        {error && <span className="text-sm text-red-400">{error}</span>}
      </div>
    </section>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
