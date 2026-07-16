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
  level: string;
  xp: number;
  progress: number;
  avatar_url: string | null;
  updated_at: string;
  stages: StudentStage[];
  currentStageId: string;
  currentStageTitle: string;
  stagesDone: number;
};

const DEMO_STUDENTS: AdminStudent[] = [];

function enrich(
  profile: {
    id: string;
    full_name: string;
    company: string | null;
    phone: string | null;
    telegram: string | null;
    level: string;
    xp: number;
    progress: number;
    avatar_url: string | null;
    updated_at: string;
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
        "id,full_name,company,phone,telegram,level,xp,progress,avatar_url,updated_at,is_admin",
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
            level: p.level,
            xp: p.xp,
            progress: p.progress,
            avatar_url: p.avatar_url,
            updated_at: p.updated_at,
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

  const stats = useMemo(() => {
    const total = students.length;
    const avg =
      total === 0
        ? 0
        : Math.round(students.reduce((s, x) => s + x.progress, 0) / total);
    const onStage1 = students.filter((s) => s.currentStageId === "1").length;
    const finished = students.filter(
      (s) => s.stagesDone >= 8 || s.progress >= 100,
    ).length;
    return { total, avg, onStage1, finished };
  }, [students]);

  return {
    ready,
    isAdmin,
    students,
    stats,
    loading,
    error,
    usingDemo,
    reload: load,
  };
}
