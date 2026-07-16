import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  companyBuild as mockCompanyBuild,
  missionStages,
  type StageStatus,
} from "@/data/platform";
import { DATA_RESET_VERSION } from "@/lib/wipeLocalData";

export type StageProgressRow = {
  stage_id: string;
  status: StageStatus;
  progress: number;
};

const ZERO_SEED: StageProgressRow[] = missionStages.map((s, i) => ({
  stage_id: s.id,
  status: (i === 0 ? "active" : "locked") as StageStatus,
  progress: 0,
}));

async function forceZeroOwnProgress(userId: string) {
  if (!supabase) return;
  const flagKey = `aml-cloud-zeroed:${DATA_RESET_VERSION}:${userId}`;
  try {
    if (localStorage.getItem(flagKey) === "1") return;
  } catch {
    /* continue reset */
  }

  await supabase
    .from("profiles")
    .update({
      progress: 0,
      xp: 0,
      level: "Builder",
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", userId);

  const seed = ZERO_SEED.map((r) => ({
    user_id: userId,
    stage_id: r.stage_id,
    status: r.status,
    progress: 0,
    updated_at: new Date().toISOString(),
  }));

  await supabase.from("stage_progress").upsert(seed as never, {
    onConflict: "user_id,stage_id",
  });

  await supabase.from("checklist_items").delete().eq("user_id", userId);
  await supabase.from("homework_submissions").delete().eq("user_id", userId);

  try {
    localStorage.setItem(flagKey, "1");
  } catch {
    /* ignore */
  }
}

export function useLiveProgress() {
  const { user, profile, ready, refreshProfile } = useAuth();
  const [rows, setRows] = useState<StageProgressRow[]>([]);
  const [loading, setLoading] = useState(false);

  const ensureAndLoad = useCallback(async () => {
    if (!supabase || !user) {
      setRows([]);
      return;
    }
    setLoading(true);

    // profile may be missing if trigger didn't run
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!existingProfile) {
      const fullName =
        (user.user_metadata?.full_name as string | undefined) ||
        user.email?.split("@")[0] ||
        "Ученик";
      await supabase.from("profiles").upsert(
        {
          id: user.id,
          full_name: fullName,
          company: (user.user_metadata?.company as string | undefined) ?? null,
          progress: 0,
          xp: 0,
          level: "Builder",
        } as never,
        { onConflict: "id" },
      );
    }

    // One-time hard reset after DATA_RESET_VERSION bump
    await forceZeroOwnProgress(user.id);

    let { data: prog } = await supabase
      .from("stage_progress")
      .select("stage_id,status,progress")
      .eq("user_id", user.id);

    if (!prog || prog.length === 0) {
      const seed = ZERO_SEED.map((r) => ({
        user_id: user.id,
        stage_id: r.stage_id,
        status: r.status,
        progress: r.progress,
      }));
      await supabase.from("stage_progress").upsert(seed as never, {
        onConflict: "user_id,stage_id",
      });
      prog = ZERO_SEED;
    }

    setRows(
      (prog ?? []).map((r) => ({
        stage_id: r.stage_id,
        status: r.status as StageStatus,
        progress: r.progress,
      })),
    );
    await refreshProfile();
    setLoading(false);
  }, [user, refreshProfile]);

  useEffect(() => {
    void ensureAndLoad();
  }, [ensureAndLoad]);

  const companyProgress = useMemo(() => {
    if (!user) return null;
    if (typeof profile?.progress === "number") return profile.progress;
    if (rows.length === 0) return 0;
    return Math.round(rows.reduce((s, r) => s + r.progress, 0) / rows.length);
  }, [user, profile?.progress, rows]);

  const tasksDone = useMemo(
    () => rows.filter((r) => r.status === "done").length,
    [rows],
  );

  const liveCompanyBuild = useMemo(() => {
    if (!user || rows.length === 0) return mockCompanyBuild;
    return mockCompanyBuild.map((block, i) => {
      const stageId = String(i + 1);
      const row = rows.find((r) => r.stage_id === stageId);
      if (!row) return { ...block, status: "locked" as const };
      if (row.status === "done") return { ...block, status: "done" as const };
      if (row.status === "active") return { ...block, status: "active" as const };
      return { ...block, status: "locked" as const };
    });
  }, [user, rows]);

  const displayName =
    profile?.full_name ||
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email?.split("@")[0] ||
    null;

  return {
    ready,
    loggedIn: Boolean(user),
    loading,
    profile,
    rows,
    companyProgress,
    tasksDone,
    tasksTotal: missionStages.length,
    level: profile?.level || "Builder",
    xp: profile?.xp ?? 0,
    displayName,
    liveCompanyBuild,
    reload: ensureAndLoad,
  };
}
