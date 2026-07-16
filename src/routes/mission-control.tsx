import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  FileText,
  Flag,
  Lock,
  PlayCircle,
  X,
} from "lucide-react";
import {
  getStage,
  missionStages,
  statusLabel,
  type MissionStage,
  type StageStatus,
  user as mockUser,
} from "@/data/platform";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/mission-control")({
  component: MissionControl,
});

const statusStyles: Record<StageStatus, string> = {
  done: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  active: "bg-primary/15 text-primary border-primary/30",
  todo: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  locked: "bg-muted/60 text-muted-foreground border-border",
};

type ProgressRow = {
  stage_id: string;
  status: StageStatus;
  progress: number;
};

function MissionControl() {
  const { user, profile } = useAuth();
  const [overrides, setOverrides] = useState<Record<string, ProgressRow>>({});
  const [checklistDone, setChecklistDone] = useState<Record<string, boolean>>({});
  const [loadingDb, setLoadingDb] = useState(false);

  const stages = useMemo(() => {
    return missionStages.map((s) => {
      const o = overrides[s.id];
      if (!o) return s;
      return { ...s, status: o.status, progress: o.progress };
    });
  }, [overrides]);

  const defaultStage =
    stages.find((s) => s.status === "active")?.id ?? stages[0]?.id ?? null;
  const [selectedId, setSelectedId] = useState<string | null>(defaultStage);
  const selected = selectedId
    ? ({ ...getStage(selectedId), ...(overrides[selectedId] || {}) } as MissionStage)
    : null;

  const companyProgress =
    profile?.progress ??
    Math.round(stages.reduce((sum, s) => sum + s.progress, 0) / stages.length) ??
    mockUser.progress;

  const loadProgress = useCallback(async () => {
    if (!supabase || !user) {
      setOverrides({});
      setChecklistDone({});
      return;
    }
    setLoadingDb(true);
    const [{ data: prog }, { data: checks }] = await Promise.all([
      supabase
        .from("stage_progress")
        .select("stage_id,status,progress")
        .eq("user_id", user.id),
      supabase
        .from("checklist_items")
        .select("stage_id,item_key,done")
        .eq("user_id", user.id),
    ]);
    const map: Record<string, ProgressRow> = {};
    for (const row of prog ?? []) {
      map[row.stage_id] = {
        stage_id: row.stage_id,
        status: row.status as StageStatus,
        progress: row.progress,
      };
    }
    setOverrides(map);
    const doneMap: Record<string, boolean> = {};
    for (const c of checks ?? []) {
      doneMap[`${c.stage_id}:${c.item_key}`] = c.done;
    }
    setChecklistDone(doneMap);
    setLoadingDb(false);
  }, [user]);

  useEffect(() => {
    void loadProgress();
  }, [loadProgress]);

  async function toggleChecklist(stageId: string, itemKey: string, next: boolean) {
    const key = `${stageId}:${itemKey}`;
    setChecklistDone((prev) => ({ ...prev, [key]: next }));
    if (!supabase || !user) return;
    await supabase.from("checklist_items").upsert(
      {
        user_id: user.id,
        stage_id: stageId,
        item_key: itemKey,
        done: next,
      } as never,
      { onConflict: "user_id,stage_id,item_key" },
    );
  }

  async function setStageStatus(stageId: string, status: StageStatus) {
    const progress = status === "done" ? 100 : status === "active" ? 45 : 0;
    setOverrides((prev) => ({
      ...prev,
      [stageId]: { stage_id: stageId, status, progress },
    }));
    if (!supabase || !user) return;
    await supabase.from("stage_progress").upsert(
      {
        user_id: user.id,
        stage_id: stageId,
        status,
        progress,
      } as never,
      { onConflict: "user_id,stage_id" },
    );
  }

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />

      <div className="relative">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">
          AI Mission Control
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Карта строительства AI-компании
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Не список уроков — путь от фундамента до собственной AI Company. Компания готова на{" "}
          <span className="font-medium text-foreground">{companyProgress}%</span>.
          {user ? (
            <span className="ml-2 text-emerald-400">
              · синхрон с Supabase{loadingDb ? "…" : ""}
            </span>
          ) : (
            <span className="ml-2">
              ·{" "}
              <Link to="/login" className="text-primary hover:underline">
                войди
              </Link>
              , чтобы сохранять прогресс
            </span>
          )}
        </p>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="relative mx-auto w-full max-w-xl">
            {stages.map((stage, i) => (
              <div key={stage.id} className="relative">
                <StageNode
                  stage={stage}
                  active={selectedId === stage.id}
                  onClick={() => setSelectedId(stage.id)}
                  delay={i * 0.04}
                />
                {i < stages.length - 1 && (
                  <div className="mx-auto flex h-8 w-px items-center justify-center bg-gradient-to-b from-border to-border/40">
                    <span className="text-[10px] text-muted-foreground/40">↓</span>
                  </div>
                )}
              </div>
            ))}

            <div className="mx-auto mt-2 flex h-8 w-px bg-gradient-to-b from-border to-primary/40" />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 }}
              className="relative overflow-hidden rounded-3xl border border-primary/40 bg-gradient-to-br from-primary/20 via-card to-card p-6 text-center"
            >
              <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
              <Flag className="relative mx-auto h-6 w-6 text-primary" />
              <div className="relative mt-2 text-xs uppercase tracking-widest text-muted-foreground">
                Финиш
              </div>
              <div className="relative mt-1 text-2xl font-semibold">AI Company</div>
              <p className="relative mt-2 text-sm text-muted-foreground">
                Все отделы подключены. Ты управляешь своей AI-командой.
              </p>
            </motion.div>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <AnimatePresence mode="wait">
              {selected ? (
                <StagePanel
                  key={selected.id}
                  stage={selected}
                  checklistDone={checklistDone}
                  onClose={() => setSelectedId(null)}
                  onToggleChecklist={toggleChecklist}
                  onSetStatus={setStageStatus}
                  canSave={Boolean(user)}
                />
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-3xl border border-dashed border-border bg-card/50 p-8 text-center"
                >
                  <div className="text-sm text-muted-foreground">
                    Выбери этап на карте, чтобы открыть описание, видео, домашку и чеклист.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function StageNode({
  stage,
  active,
  onClick,
  delay,
}: {
  stage: MissionStage;
  active: boolean;
  onClick: () => void;
  delay: number;
}) {
  const locked = stage.status === "locked";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={locked}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={[
        "group w-full rounded-2xl border p-5 text-left transition-all",
        active
          ? "border-primary/50 bg-primary/10 shadow-[0_0_0_1px_var(--color-primary)]/20"
          : "border-border bg-card hover:border-primary/40",
        locked ? "cursor-not-allowed opacity-60" : "hover:-translate-y-0.5",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Этап {stage.number}
          </div>
          <div className="mt-1 text-xl font-semibold tracking-tight">{stage.title}</div>
          <div className="mt-1 text-sm text-muted-foreground">{stage.subtitle}</div>
        </div>
        <span
          className={[
            "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium",
            statusStyles[stage.status],
          ].join(" ")}
        >
          {locked ? <Lock className="h-3 w-3" /> : null}
          {statusLabel[stage.status]}
        </span>
      </div>

      <div className="mt-4">
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className={[
              "h-full rounded-full",
              stage.progress > 0
                ? "bg-gradient-to-r from-primary to-[color:var(--accent-glow)]"
                : "bg-transparent",
            ].join(" ")}
            style={{ width: `${stage.progress}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{stage.progress}%</span>
          {!locked && (
            <span className="inline-flex items-center gap-1 text-primary opacity-0 transition-opacity group-hover:opacity-100">
              Открыть <ArrowRight className="h-3 w-3" />
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}

function StagePanel({
  stage,
  checklistDone,
  onClose,
  onToggleChecklist,
  onSetStatus,
  canSave,
}: {
  stage: MissionStage;
  checklistDone: Record<string, boolean>;
  onClose: () => void;
  onToggleChecklist: (stageId: string, itemKey: string, next: boolean) => void;
  onSetStatus: (stageId: string, status: StageStatus) => void;
  canSave: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      className="rounded-3xl border border-border bg-card p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-muted-foreground">Этап {stage.number}</div>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">{stage.title}</h2>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Закрыть"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-background/50 p-4">
        <div className="text-xs text-muted-foreground">Статус</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {(["todo", "active", "done"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSetStatus(stage.id, s)}
              className={[
                "rounded-full border px-2.5 py-1 text-[11px]",
                stage.status === s
                  ? statusStyles[s]
                  : "border-border text-muted-foreground opacity-50 hover:opacity-100",
              ].join(" ")}
            >
              {statusLabel[s]}
            </button>
          ))}
        </div>
        {!canSave && (
          <div className="mt-2 text-[11px] text-muted-foreground">
            Войди, чтобы статусы сохранялись в базу.
          </div>
        )}
      </div>

      <section className="mt-5 space-y-5">
        <div>
          <div className="text-sm font-medium">Описание</div>
          <p className="mt-1.5 text-sm text-muted-foreground">{stage.description}</p>
        </div>

        <div>
          <div className="text-sm font-medium">Что нужно сделать</div>
          <ul className="mt-2 space-y-2">
            {stage.whatToDo.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Circle className="mt-1 h-3 w-3 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="text-sm font-medium">Видео</div>
          <div className="mt-2 flex items-center gap-3 rounded-xl border border-border bg-background/50 px-4 py-3">
            <PlayCircle className="h-5 w-5 text-primary" />
            <div className="text-sm">{stage.videoTitle}</div>
          </div>
        </div>

        <div>
          <div className="text-sm font-medium">Документация</div>
          <div className="mt-2 space-y-2">
            {stage.docs.map((doc) => (
              <Link
                key={doc.title}
                to="/docs"
                className="flex items-center gap-2 rounded-xl border border-border bg-background/50 px-4 py-3 text-sm hover:border-primary/40"
              >
                <FileText className="h-4 w-4 text-primary" />
                {doc.title}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm font-medium">Домашнее задание</div>
          <p className="mt-1.5 text-sm text-muted-foreground">{stage.homework}</p>
          <Link
            to="/homework"
            className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Открыть ДЗ <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div>
          <div className="text-sm font-medium">Чеклист</div>
          <ul className="mt-2 space-y-2">
            {stage.checklist.map((item) => {
              const key = `${stage.id}:${item.id}`;
              const done = checklistDone[key] ?? item.done;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onToggleChecklist(stage.id, item.id, !done)}
                    className="flex w-full items-center gap-2 rounded-xl border border-border bg-background/50 px-3 py-2.5 text-left text-sm hover:border-primary/40"
                  >
                    {done ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={done ? "text-muted-foreground line-through" : ""}>
                      {item.text}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <Link
        to="/lessons/$stageId"
        params={{ stageId: stage.id }}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
      >
        Перейти к уроку <ArrowRight className="h-4 w-4" />
      </Link>
    </motion.div>
  );
}
