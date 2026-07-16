import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Crown,
  RefreshCw,
  Search,
  Shield,
  Users,
} from "lucide-react";
import { missionStages, type StageStatus } from "@/data/platform";
import { useAdminStudents, type AdminStudent } from "@/hooks/useAdminStudents";

export const Route = createFileRoute("/admin")({
  component: AdminPanel,
});

const stageDot: Record<StageStatus, string> = {
  done: "bg-emerald-400",
  active: "bg-primary ring-2 ring-primary/40",
  todo: "bg-yellow-400/80",
  locked: "bg-muted-foreground/30",
};

const stageLabel: Record<StageStatus, string> = {
  done: "Готово",
  active: "Сейчас",
  todo: "В очереди",
  locked: "Закрыто",
};

function AdminPanel() {
  const { ready, isAdmin, students, stats, loading, error, usingDemo, reload } =
    useAdminStudents();
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students.filter((s) => {
      const byStage = stageFilter === "all" || s.currentStageId === stageFilter;
      const byQuery =
        !q ||
        s.full_name.toLowerCase().includes(q) ||
        (s.company || "").toLowerCase().includes(q) ||
        (s.telegram || "").toLowerCase().includes(q);
      return byStage && byQuery;
    });
  }, [students, query, stageFilter]);

  if (!ready) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-muted-foreground">
        Загрузка…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-primary" /> Admin
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Админ-панель
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Рейтинг всех учеников: кто на каком этапе, прогресс компании и детали.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void reload()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm hover:border-primary/40 disabled:opacity-60"
        >
          <RefreshCw className={["h-4 w-4", loading ? "animate-spin" : ""].join(" ")} />
          Обновить
        </button>
      </div>

      {!isAdmin && (
        <div className="mt-4 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-100">
          <div className="font-medium">Нужны права админа</div>
          <p className="mt-1 text-yellow-100/80">
            1) Выполни SQL:{" "}
            <code className="text-xs">supabase/migrations/20260716_admin_panel.sql</code>
            <br />
            2) Назначь себя админом (подставь свой email):
          </p>
          <pre className="mt-2 overflow-x-auto rounded-xl bg-background/50 p-3 text-[11px] text-muted-foreground">
{`update public.profiles
set is_admin = true
where id = (
  select id from auth.users where email = 'твой@email.com'
);`}
          </pre>
          <p className="mt-2 text-xs text-yellow-100/70">
            Пока показываем демо-рейтинг — после назначения админом увидишь реальных учеников.
          </p>
        </div>
      )}

      {isAdmin && usingDemo && (
        <div className="mt-4 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-100">
          Не удалось загрузить живые данные{error ? `: ${error}` : ""}. Показано демо.
        </div>
      )}

      {isAdmin && !usingDemo && (
        <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          Live из Supabase · {stats.total} учеников
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Учеников" value={String(stats.total)} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Средний прогресс" value={`${stats.avg}%`} icon={<Crown className="h-4 w-4" />} />
        <StatCard label="На этапе 1" value={String(stats.onStage1)} />
        <StatCard label="Финиш / 100%" value={String(stats.finished)} />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по имени, компании, Telegram…"
            className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm outline-none focus:border-primary/50"
          />
        </div>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="h-11 rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary/50"
        >
          <option value="all">Все этапы</option>
          {missionStages.map((s) => (
            <option key={s.id} value={s.id}>
              [{s.number}] {s.title}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card">
        <div className="hidden grid-cols-[56px_minmax(0,1.4fr)_minmax(0,1fr)_140px_100px] gap-3 border-b border-border px-5 py-3 text-[11px] uppercase tracking-wide text-muted-foreground lg:grid">
          <div>#</div>
          <div>Ученик</div>
          <div>Текущий этап</div>
          <div>Этапы 1–8</div>
          <div className="text-right">Прогресс</div>
        </div>

        <div className="divide-y divide-border">
          {filtered.map((student, i) => (
            <StudentRow
              key={student.id}
              rank={i + 1}
              student={student}
              open={expanded === student.id}
              onToggle={() => setExpanded(expanded === student.id ? null : student.id)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="px-5 py-12 text-center text-sm text-muted-foreground">
              Никого не найдено.{" "}
              {!isAdmin && (
                <Link to="/signup" className="text-primary hover:underline">
                  Зарегистрируй учеников
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}

function StudentRow({
  rank,
  student,
  open,
  onToggle,
}: {
  rank: number;
  student: AdminStudent;
  open: boolean;
  onToggle: () => void;
}) {
  const initial = student.full_name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="grid w-full grid-cols-1 gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/30 lg:grid-cols-[56px_minmax(0,1.4fr)_minmax(0,1fr)_140px_100px] lg:items-center"
      >
        <div className="flex items-center justify-between lg:block">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background/60 text-sm font-semibold">
            {rank <= 3 ? ["🥇", "🥈", "🥉"][rank - 1] : `#${rank}`}
          </div>
          <span className="text-xs text-muted-foreground lg:hidden">
            {open ? "Свернуть" : "Подробнее"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary to-[color:var(--accent-glow)] text-sm font-semibold text-primary-foreground">
            {student.avatar_url ? (
              <img src={student.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              initial
            )}
          </div>
          <div className="min-w-0">
            <div className="truncate font-medium">{student.full_name || "Без имени"}</div>
            <div className="truncate text-xs text-muted-foreground">
              {student.company || "—"} · {student.level} · {student.xp} XP
            </div>
          </div>
        </div>

        <div>
          <div className="text-sm font-medium">
            [{student.currentStageId}] {student.currentStageTitle}
          </div>
          <div className="text-xs text-muted-foreground">
            Пройдено этапов: {student.stagesDone}/8
          </div>
        </div>

        <div className="flex items-center gap-1">
          {student.stages.map((st) => (
            <span
              key={st.stage_id}
              title={`Этап ${st.stage_id}: ${stageLabel[st.status]} (${st.progress}%)`}
              className={["h-2.5 w-2.5 rounded-full", stageDot[st.status]].join(" ")}
            />
          ))}
        </div>

        <div className="flex items-center justify-between lg:block lg:text-right">
          <div className="text-xl font-semibold">{student.progress}%</div>
          <div className="mt-0.5 hidden text-[11px] text-muted-foreground lg:block">
            {open ? <ChevronUp className="ml-auto h-4 w-4" /> : <ChevronDown className="ml-auto h-4 w-4" />}
          </div>
        </div>
      </button>

      {open && (
        <div className="border-t border-border bg-background/40 px-5 py-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Info label="Telegram" value={student.telegram || "—"} />
            <Info label="Телефон" value={student.phone || "—"} />
            <Info label="Компания" value={student.company || "—"} />
            <Info
              label="Обновлён"
              value={new Date(student.updated_at).toLocaleString("ru-RU")}
            />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {student.stages.map((st) => {
              const meta = missionStages.find((m) => m.id === st.stage_id);
              return (
                <div
                  key={st.stage_id}
                  className="rounded-xl border border-border bg-card px-3 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-medium">
                      [{st.stage_id}] {meta?.title}
                    </div>
                    <span
                      className={[
                        "rounded-full px-2 py-0.5 text-[10px]",
                        st.status === "done" && "bg-emerald-500/15 text-emerald-400",
                        st.status === "active" && "bg-primary/15 text-primary",
                        st.status === "todo" && "bg-yellow-500/10 text-yellow-400",
                        st.status === "locked" && "bg-muted text-muted-foreground",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {stageLabel[st.status]}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${st.progress}%` }}
                    />
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">{st.progress}%</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2.5">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm">{value}</div>
    </div>
  );
}
