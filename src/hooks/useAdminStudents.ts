import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { missionStages, type StageStatus } from "@/data/platform";

export type StudentStage = {
  stage_id: string;
  status: StageStatus;
  progress: number;
};

export type AdminStudent = {
  id: string;
  full_name: string;
  company: string | null;
  phone: string | null;
  telegram: string | null;
  email: string | null;
  level: string;
  xp: number;
  progress: number;
  avatar_url: string | null;
  updated_at: string;
  is_admin: boolean;
  is_blocked: boolean;
  is_removed: boolean;
  stages: StudentStage[];
  currentStageId: string;
  currentStageTitle: string;
  stagesDone: number;
};

const DEMO_STUDENTS: AdminStudent[] = [];

const ZERO_STAGES = missionStages.map((s, i) => ({
  stage_id: s.id,
  status: (i === 0 ? "active" : "locked") as StageStatus,
  progress: 0,
}));

function enrich(
  profile: {
    id: string;
    full_name: string;
    company: string | null;
    phone: string | null;
    telegram: string | null;
    email: string | null;
    level: string;
    xp: number;
    progress: number;
    avatar_url: string | null;
    updated_at: string;
    is_admin: boolean;
    is_blocked: boolean;
    is_removed: boolean;
  },
  stagesRaw: { stage_id: string; status: string; progress: number }[],
): AdminStudent {
  const stages: StudentStage[] = missionStages.map((s) => {
    const row = stagesRaw.find((r) => r.stage_id === s.id);
    return {
      stage_id: s.id,
      status: (row?.status as StageStatus) || "locked",
      progress: row?.progress ?? 0,
    };
  });

  const active = stages.find((s) => s.status === "active");
  const lastDone = [...stages].reverse().find((s) => s.status === "done");
  const current = active || lastDone || stages[0];
  const title =
    missionStages.find((m) => m.id === current.stage_id)?.title ||
    `Этап ${current.stage_id}`;

  return {
    ...profile,
    stages,
    currentStageId: current.stage_id,
    currentStageTitle: title,
    stagesDone: stages.filter((s) => s.status === "done").length,
  };
}

export function useAdminStudents() {
  const { profile, user, ready } = useAuth();
  const isAdmin = Boolean(profile?.is_admin);
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [usingDemo, setUsingDemo] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  const load = useCallback(async () => {
    if (!ready) return;

    if (!user || !isAdmin || !supabase) {
      setStudents(DEMO_STUDENTS);
      setUsingDemo(true);
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    setUsingDemo(false);

    const { data: profiles, error: pErr } = await supabase
      .from("profiles")
      .select(
        "id,full_name,company,phone,telegram,email,level,xp,progress,avatar_url,updated_at,is_admin,is_blocked,is_removed",
      )
      .order("progress", { ascending: false });

    if (pErr) {
      setError(pErr.message);
      setStudents(DEMO_STUDENTS);
      setUsingDemo(true);
      setLoading(false);
      return;
    }

    const { data: stages, error: sErr } = await supabase
      .from("stage_progress")
      .select("user_id,stage_id,status,progress");

    if (sErr) {
      setError(sErr.message);
    }

    const byUser = new Map<
      string,
      { stage_id: string; status: string; progress: number }[]
    >();
    for (const row of stages ?? []) {
      const list = byUser.get(row.user_id) ?? [];
      list.push({
        stage_id: row.stage_id,
        status: row.status,
        progress: row.progress,
      });
      byUser.set(row.user_id, list);
    }

    const list = (profiles ?? [])
      .map((p) =>
        enrich(
          {
            id: p.id,
            full_name: p.full_name,
            company: p.company,
            phone: p.phone,
            telegram: p.telegram,
            email: p.email ?? null,
            level: p.level,
            xp: p.xp,
            progress: p.progress,
            avatar_url: p.avatar_url,
            updated_at: p.updated_at,
            is_admin: Boolean(p.is_admin),
            is_blocked: Boolean(p.is_blocked),
            is_removed: Boolean(p.is_removed),
          },
          byUser.get(p.id) ?? [],
        ),
      )
      .sort((a, b) => b.progress - a.progress || b.xp - a.xp);

    setStudents(list);
    setLoading(false);
  }, [ready, user, isAdmin]);

  useEffect(() => {
    void load();
  }, [load]);

  const setAccess = useCallback(
    async (
      studentId: string,
      patch: { is_blocked?: boolean; is_removed?: boolean },
    ) => {
      if (!supabase || !user) return { error: "Нет доступа" };
      if (studentId === user.id) return { error: "Нельзя менять доступ себе" };

      setActionMsg("");
      const { error: uErr } = await supabase
        .from("profiles")
        .update({
          ...patch,
          updated_at: new Date().toISOString(),
        } as never)
        .eq("id", studentId);

      if (uErr) return { error: uErr.message };
      await load();
      return {};
    },
    [user, load],
  );

  const blockStudent = useCallback(
    (id: string) => setAccess(id, { is_blocked: true }),
    [setAccess],
  );

  const unblockStudent = useCallback(
    (id: string) => setAccess(id, { is_blocked: false }),
    [setAccess],
  );

  const removeStudent = useCallback(
    async (id: string) => {
      const res = await setAccess(id, { is_removed: true, is_blocked: true });
      if (!res.error) setActionMsg("Ученик удалён из курса (доступ закрыт)");
      return res;
    },
    [setAccess],
  );

  const restoreStudent = useCallback(
    async (id: string) => {
      const res = await setAccess(id, { is_removed: false, is_blocked: false });
      if (!res.error) setActionMsg("Доступ восстановлен");
      return res;
    },
    [setAccess],
  );

  const resetProgress = useCallback(
    async (studentId: string) => {
      if (!supabase || !user) return { error: "Нет доступа" };
      setActionMsg("");

      const { error: pErr } = await supabase
        .from("profiles")
        .update({
          progress: 0,
          xp: 0,
          level: "Builder",
          updated_at: new Date().toISOString(),
        } as never)
        .eq("id", studentId);
      if (pErr) return { error: pErr.message };

      const seed = ZERO_STAGES.map((r) => ({
        user_id: studentId,
        stage_id: r.stage_id,
        status: r.status,
        progress: 0,
        updated_at: new Date().toISOString(),
      }));
      const { error: sErr } = await supabase
        .from("stage_progress")
        .upsert(seed as never, { onConflict: "user_id,stage_id" });
      if (sErr) return { error: sErr.message };

      await supabase.from("checklist_items").delete().eq("user_id", studentId);
      await supabase
        .from("homework_submissions")
        .delete()
        .eq("user_id", studentId);

      await load();
      setActionMsg("Прогресс обнулён");
      return {};
    },
    [user, load],
  );

  const stats = useMemo(() => {
    const active = students.filter((s) => !s.is_removed && !s.is_blocked);
    const blocked = students.filter((s) => s.is_blocked && !s.is_removed);
    const removed = students.filter((s) => s.is_removed);
    const avg =
      active.length === 0
        ? 0
        : Math.round(active.reduce((s, x) => s + x.progress, 0) / active.length);
    const onStage1 = active.filter((s) => s.currentStageId === "1").length;
    const finished = active.filter(
      (s) => s.stagesDone >= 8 || s.progress >= 100,
    ).length;
    return {
      total: students.length,
      active: active.length,
      blocked: blocked.length,
      removed: removed.length,
      avg,
      onStage1,
      finished,
    };
  }, [students]);

  return {
    ready,
    isAdmin,
    students,
    stats,
    loading,
    error,
    usingDemo,
    actionMsg,
    reload: load,
    blockStudent,
    unblockStudent,
    removeStudent,
    restoreStudent,
    resetProgress,
    currentUserId: user?.id ?? null,
  };
}
