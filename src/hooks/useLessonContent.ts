import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  getLesson,
  getStage,
  type LessonCard,
  type LessonDoc,
} from "@/data/platform";
import { guessDocType, toEmbedUrl } from "@/lib/videoEmbed";

export type LessonLink = { title: string; href: string };

export type EditableLesson = {
  stageId: string;
  title: string;
  duration: string;
  description: string;
  about: string[];
  videoEmbedUrl: string;
  homework: string;
  documents: LessonDoc[];
  links: LessonLink[];
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is string => typeof x === "string");
}

function asDocs(value: unknown): LessonDoc[] {
  if (!Array.isArray(value)) return [];
  const out: LessonDoc[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const title = typeof row.title === "string" ? row.title : "";
    if (!title) continue;
    const type =
      row.type === "pdf" ||
      row.type === "doc" ||
      row.type === "txt" ||
      row.type === "link"
        ? row.type
        : "link";
    const href = typeof row.href === "string" ? row.href : undefined;
    out.push({ title, type, href });
  }
  return out;
}

function asLinks(value: unknown): LessonLink[] {
  if (!Array.isArray(value)) return [];
  const out: LessonLink[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const title = typeof row.title === "string" ? row.title : "";
    const href = typeof row.href === "string" ? row.href : "";
    if (!title || !href) continue;
    out.push({ title, href });
  }
  return out;
}

function baseFromMock(stageId: string): EditableLesson {
  const lesson = getLesson(stageId);
  const stage = getStage(stageId);
  return {
    stageId: lesson.id,
    title: lesson.title,
    duration: lesson.duration,
    description: stage.description || lesson.description,
    about: [...lesson.about],
    videoEmbedUrl: lesson.videoEmbedUrl || "",
    homework: stage.homework,
    documents: lesson.documents.map((d) => ({ ...d })),
    links: lesson.links.map((l) => ({ ...l })),
  };
}

export function useLessonContent(stageId: string) {
  const { profile, user } = useAuth();
  const isAdmin = Boolean(profile?.is_admin);
  const [remote, setRemote] = useState<EditableLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    if (!supabase) {
      setRemote(null);
      setLoading(false);
      return;
    }
    const { data, error: qErr } = await supabase
      .from("lesson_content")
      .select("*")
      .eq("stage_id", stageId)
      .maybeSingle();

    if (qErr) {
      // table may not exist yet
      setError(qErr.message);
      setRemote(null);
      setLoading(false);
      return;
    }

    if (!data) {
      setRemote(null);
      setLoading(false);
      return;
    }

    const base = baseFromMock(stageId);
    setRemote({
      stageId,
      title: data.title || base.title,
      duration: data.duration || base.duration,
      description: data.description || base.description,
      about: asStringArray(data.about).length
        ? asStringArray(data.about)
        : base.about,
      videoEmbedUrl: data.video_embed_url || "",
      homework: data.homework || base.homework,
      documents: asDocs(data.documents).length
        ? asDocs(data.documents)
        : base.documents,
      links: asLinks(data.links).length ? asLinks(data.links) : base.links,
    });
    setLoading(false);
  }, [stageId]);

  useEffect(() => {
    void load();
  }, [load]);

  const lesson = useMemo((): EditableLesson & {
    number: number;
    status: LessonCard["status"];
  } => {
    const mock = getLesson(stageId);
    const merged = remote ?? baseFromMock(stageId);
    return {
      ...merged,
      number: mock.number,
      status: mock.status,
    };
  }, [stageId, remote]);

  const save = useCallback(
    async (draft: EditableLesson) => {
      if (!supabase || !user || !isAdmin) {
        return { error: "Только админ может сохранять уроки" };
      }
      setSaving(true);
      setMsg("");
      setError("");

      const embed = toEmbedUrl(draft.videoEmbedUrl);
      const payload = {
        stage_id: stageId,
        title: draft.title.trim() || null,
        duration: draft.duration.trim() || null,
        description: draft.description.trim() || null,
        about: draft.about.map((s) => s.trim()).filter(Boolean),
        video_embed_url: embed || null,
        homework: draft.homework.trim() || null,
        documents: draft.documents,
        links: draft.links.filter((l) => l.title.trim() && l.href.trim()),
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      };

      const { error: uErr } = await supabase
        .from("lesson_content")
        .upsert(payload as never, { onConflict: "stage_id" });

      setSaving(false);
      if (uErr) {
        setError(uErr.message);
        return { error: uErr.message };
      }
      setMsg("Урок сохранён");
      await load();
      return {};
    },
    [stageId, user, isAdmin, load],
  );

  const uploadDoc = useCallback(
    async (file: File) => {
      if (!supabase || !user || !isAdmin) {
        return { error: "Только админ может загружать файлы" };
      }
      if (file.size > 20 * 1024 * 1024) {
        return { error: "Файл больше 20 МБ" };
      }
      setUploading(true);
      setError("");

      const safeName = file.name.replace(/[^\w.\-а-яА-ЯёЁ]+/g, "_");
      const path = `${stageId}/${Date.now()}-${safeName}`;
      const { error: upErr } = await supabase.storage
        .from("lesson-docs")
        .upload(path, file, { upsert: true, contentType: file.type });

      setUploading(false);
      if (upErr) {
        setError(upErr.message);
        return { error: upErr.message };
      }

      const { data } = supabase.storage.from("lesson-docs").getPublicUrl(path);
      return {
        url: data.publicUrl,
        title: file.name,
        type: guessDocType(file.name),
      };
    },
    [stageId, user, isAdmin],
  );

  return {
    lesson,
    loading,
    saving,
    uploading,
    error,
    msg,
    isAdmin,
    reload: load,
    save,
    uploadDoc,
    hasRemote: Boolean(remote),
  };
}
