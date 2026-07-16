import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Circle,
  ClipboardList,
  FileText,
  Flag,
  Lock,
  PlayCircle,
  Target,
} from "lucide-react";
import {
  getStage,
  missionStages,
  statusLabel,
  type MissionStage,
  type StageStatus,
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
  locked: "bg-muted/50 text-muted-foreground border-border",
};

type ProgressRow = {
  stage_id: string;
  status: StageStatus;
  progress: number;
};

type PanelTab = "overview" | "checklist" | "materials";

function MissionControl() {
  const { user, profile } = useAuth();
  const [overrides, setOverrides] = useState<Record<string, ProgressRow>>({});
  const [checklistDone, setChecklistDone] = useState<Record<string, boolean>>({});
  const [loadingDb, setLoadingDb] = useState(false);
  const [tab, setTab] = useState<PanelTab>("overview");

  const stages = useMemo(() => {
    return missionStages.map((s) => {
      const o = overrides[s.id];
      if (!o) return s;
      return { ...s, status: o.status, progress: o.progress };
    });
  }, [overrides]);

  const activeId = stages.find((s) => s.status === "active")?.id ?? stages[0]?.id ?? "1";
  const [selectedId, setSelectedId] = useState<string>(activeId);
  const [userPicked, setUserPicked] = useState(false);

  useEffect(() => {
    if (!userPicked && activeId) setSelectedId(activeId);
  }, [activeId, userPicked]);

  const selected = useMemo(() => {
    const base = getStage(selectedId);
    const o = overrides[selectedId];
    return { ...base, ...(o ? { status: o.status, progress: o.progress } : {}) } as MissionStage;
  }, [selectedId, overrides]);

  const stagesDone = stages.filter((s) => s.status === "done").length;
  const companyProgress =
    typeof profile?.progress === "number"
      ? profile.progress
      : Math.round(stages.reduce((sum, s) => sum + s.progress, 0) / Math.max(stages.length, 1));

  const checklistStats = useMemo(() => {
    const items = selected.checklist;
    const done = items.filter((item) => {
      const key = `${selected.id}:${item.id}`;
      return checklistDone[key] ?? item.done;
    }).length;
    return { done, total: items.length };
  }, [selected, checklistDone]);

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
    const progress = status === "done" ? 100 : status === "active" ? Math.max(45, overrides[stageId]?.progress ?? 45) : 0;
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

  function selectStage(id: string) {
    setUserPicked(true);
    setSelectedId(id);
    setTab("overview");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      {/* HEADER */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            AI Mission Control
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Карта AI-компании
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Выбери этап слева — справа откроются задачи, чеклист и материалы.
            {user ? (
              <span className="ml-2 text-emerald-400">
                · сохраняется{loadingDb ? "…" : ""}
              </span>
            ) : (
              <span className="ml-2">
                ·{" "}
                <Link to="/login" className="text-primary hover:underline">
                  войди
                </Link>
                , чтобы сохранять
              </span>
            )}
          </p>
        </div>
      </div>

      {/* STATS */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Готовность" value={`${companyProgress}%`} />
        <Stat label="Пройдено этапов" value={`${stagesDone}/8`} />
        <Stat
          label="Сейчас"
          value={stages.find((s) => s.status === "active")?.title ?? "—"}
        />
        <Stat
          label="Чеклист этапа"
          value={`${checklistStats.done}/${checklistStats.total}`}
        />
      </div>

      {/* QUICK JUMP */}
      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {stages.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => selectStage(s.id)}
            className={[
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors",
              selectedId === s.id
                ? "border-primary/50 bg-primary/15 text-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            <span
              className={[
                "h-1.5 w-1.5 rounded-full",
                s.status === "done" && "bg-emerald-400",
                s.status === "active" && "bg-primary",
                s.status === "todo" && "bg-yellow-400",
                s.status === "locked" && "bg-muted-foreground/40",
              ]
                .filter(Boolean)
                .join(" ")}
            />
            [{s.number}] {s.title}
          </button>
        ))}
      </div>

      {/* MAIN */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        {/* PATH */}
        <div className="rounded-3xl border border-border bg-card p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <Target className="h-3.5 w-3.5 text-primary" /> Путь
          </div>
          <div className="space-y-2">
            {stages.map((stage, i) => (
              <div key={stage.id}>
                <StageRow
                  stage={stage}
                  active={selectedId === stage.id}
                  onClick={() => selectStage(stage.id)}
                  delay={i * 0.03}
                />
                {i < stages.length - 1 && (
                  <div className="mx-5 h-2 w-px bg-border/70" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 via-transparent to-transparent p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Flag className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold">Финиш · AI Company</div>
                <div className="text-xs text-muted-foreground">
                  Все отделы подключены · {companyProgress}%
                </div>
              </div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${companyProgress}%` }}
                transition={{ duration: 0.7 }}
                className="h-full rounded-full bg-gradient-to-r from-primary to-[color:var(--accent-glow)]"
              />
            </div>
          </div>
        </div>

        {/* DETAIL PANEL */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="rounded-3xl border border-border bg-card p-5 sm:p-6 lg:sticky lg:top-24 lg:self-start"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs text-muted-foreground">Этап {selected.number}</div>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">{selected.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{selected.subtitle}</p>
              </div>
              <span
                className={[
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium",
                  statusStyles[selected.status],
                ].join(" ")}
              >
                {selected.status === "locked" && <Lock className="h-3 w-3" />}
                {statusLabel[selected.status]}
              </span>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Прогресс этапа</span>
                <span>{selected.progress}%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-[color:var(--accent-glow)]"
                  style={{ width: `${selected.progress}%` }}
                />
              </div>
            </div>

            {/* Status controls */}
            {selected.status !== "locked" && (
              <div className="mt-4 rounded-2xl border border-border bg-background/40 p-3">
                <div className="text-[11px] text-muted-foreground">Сменить статус</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(["todo", "active", "done"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => void setStageStatus(selected.id, s)}
                      className={[
                        "rounded-full border px-3 py-1.5 text-[11px] transition-colors",
                        selected.status === s
                          ? statusStyles[s]
                          : "border-border text-muted-foreground hover:text-foreground",
                      ].join(" ")}
                    >
                      {statusLabel[s]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="mt-5 flex gap-1 rounded-xl border border-border bg-background/40 p-1">
              {(
                [
                  { id: "overview", label: "Обзор" },
                  { id: "checklist", label: `Чеклист ${checklistStats.done}/${checklistStats.total}` },
                  { id: "materials", label: "Материалы" },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={[
                    "flex-1 rounded-lg px-2 py-2 text-xs transition-colors sm:text-sm",
                    tab === t.id
                      ? "bg-primary/15 text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="mt-4 min-h-[260px]">
              {tab === "overview" && (
                <div className="space-y-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {selected.description}
                  </p>
                  <div>
                    <div className="text-sm font-medium">Что сделать</div>
                    <ul className="mt-2 space-y-2">
                      {selected.whatToDo.map((item) => (
                        <li
                          key={item}
                          className="flex gap-2 rounded-xl border border-border bg-background/40 px-3 py-2.5 text-sm text-muted-foreground"
                        >
                          <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-border bg-background/40 px-3 py-3">
                    <div className="text-xs text-muted-foreground">Домашнее задание</div>
                    <p className="mt-1 text-sm">{selected.homework}</p>
                    <Link
                      to="/homework"
                      className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <ClipboardList className="h-3.5 w-3.5" /> Открыть ДЗ
                    </Link>
                  </div>
                </div>
              )}

              {tab === "checklist" && (
                <div className="space-y-2">
                  {selected.status === "locked" ? (
                    <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                      Этап ещё закрыт. Сначала пройди предыдущие.
                    </div>
                  ) : (
                    selected.checklist.map((item) => {
                      const key = `${selected.id}:${item.id}`;
                      const done = checklistDone[key] ?? item.done;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => void toggleChecklist(selected.id, item.id, !done)}
                          className="flex w-full items-center gap-3 rounded-xl border border-border bg-background/40 px-3 py-3 text-left text-sm transition-colors hover:border-primary/40"
                        >
                          {done ? (
                            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                          ) : (
                            <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
                          )}
                          <span className={done ? "text-muted-foreground line-through" : ""}>
                            {item.text}
                          </span>
                        </button>
                      );
                    })
                  )}
                  {checklistStats.total > 0 &&
                    checklistStats.done === checklistStats.total &&
                    selected.status !== "done" &&
                    selected.status !== "locked" && (
                      <button
                        type="button"
                        onClick={() => void setStageStatus(selected.id, "done")}
                        className="mt-2 w-full rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-400"
                      >
                        Чеклист заполнен — отметить этап готовым
                      </button>
                    )}
                </div>
              )}

              {tab === "materials" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-background/40 px-4 py-3">
                    <PlayCircle className="h-5 w-5 text-primary" />
                    <div>
                      <div className="text-sm font-medium">{selected.videoTitle}</div>
                      <div className="text-[11px] text-muted-foreground">Видео к этапу</div>
                    </div>
                  </div>
                  {selected.docs.map((doc) => (
                    <Link
                      key={doc.title}
                      to="/docs"
                      className="flex items-center gap-3 rounded-xl border border-border bg-background/40 px-4 py-3 text-sm hover:border-primary/40"
                    >
                      <FileText className="h-4 w-4 text-primary" />
                      {doc.title}
                    </Link>
                  ))}
                  <Link
                    to="/lessons/$stageId"
                    params={{ stageId: selected.id }}
                    className="flex items-center gap-3 rounded-xl border border-border bg-background/40 px-4 py-3 text-sm hover:border-primary/40"
                  >
                    <BookOpen className="h-4 w-4 text-primary" />
                    Открыть папку урока
                  </Link>
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                to="/lessons/$stageId"
                params={{ stageId: selected.id }}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
              >
                Перейти к уроку <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/homework"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm"
              >
                ДЗ
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="mt-1 truncate text-lg font-semibold tracking-tight">{value}</div>
    </div>
  );
}

function StageRow({
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
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.25 }}
      className={[
        "group flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all",
        active
          ? "border-primary/50 bg-primary/10"
          : "border-border bg-background/40 hover:border-primary/35",
        locked ? "opacity-75" : "",
      ].join(" ")}
    >
      <div
        className={[
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-semibold",
          active ? "border-primary/40 bg-primary/15 text-primary" : "border-border bg-card",
        ].join(" ")}
      >
        {locked ? <Lock className="h-3.5 w-3.5" /> : stage.number}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="truncate text-sm font-semibold">{stage.title}</div>
          <span
            className={[
              "shrink-0 rounded-full border px-2 py-0.5 text-[10px]",
              statusStyles[stage.status],
            ].join(" ")}
          >
            {statusLabel[stage.status]}
          </span>
        </div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${stage.progress}%` }}
          />
        </div>
      </div>
      <ArrowRight
        className={[
          "h-4 w-4 shrink-0 text-muted-foreground transition-all",
          active ? "text-primary" : "opacity-0 group-hover:opacity-100",
        ].join(" ")}
      />
    </motion.button>
  );
}
