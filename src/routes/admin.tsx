import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Copy,
  Crown,
  Flame,
  Medal,
  Phone,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { missionStages, type StageStatus } from "@/data/platform";
import { useAdminStudents, type AdminStudent } from "@/hooks/useAdminStudents";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/admin")({
  component: AdminPanel,
});

const stageDot: Record<StageStatus, string> = {
  done: "bg-emerald-400",
  active: "bg-primary ring-2 ring-primary/35",
  todo: "bg-yellow-400/80",
  locked: "bg-muted-foreground/25",
};

const stageLabel: Record<StageStatus, string> = {
  done: "Готово",
  active: "Сейчас",
  todo: "В очереди",
  locked: "Закрыто",
};

type SortKey = "progress" | "xp" | "name" | "stage";

function AdminPanel() {
  const { user } = useAuth();
  const { ready, isAdmin, students, stats, loading, error, usingDemo, reload } =
    useAdminStudents();
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("progress");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const email = user?.email || "твой@email.com";
  const grantSql = `update public.profiles
set is_admin = true
where id = (
  select id from auth.users where email = '${email}'
);`;

  const stageDistribution = useMemo(() => {
    return missionStages.map((s) => ({
      id: s.id,
      number: s.number,
      title: s.title,
      count: students.filter((st) => st.currentStageId === s.id).length,
    }));
  }, [students]);

  const maxStageCount = Math.max(1, ...stageDistribution.map((s) => s.count));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = students.filter((s) => {
      const byStage = stageFilter === "all" || s.currentStageId === stageFilter;
      const byQuery =
        !q ||
        s.full_name.toLowerCase().includes(q) ||
        (s.company || "").toLowerCase().includes(q) ||
        (s.telegram || "").toLowerCase().includes(q) ||
        (s.phone || "").toLowerCase().includes(q);
      return byStage && byQuery;
    });

    return [...list].sort((a, b) => {
      if (sortKey === "name") return a.full_name.localeCompare(b.full_name, "ru");
      if (sortKey === "xp") return b.xp - a.xp || b.progress - a.progress;
      if (sortKey === "stage")
        return Number(b.currentStageId) - Number(a.currentStageId) || b.progress - a.progress;
      return b.progress - a.progress || b.xp - a.xp;
    });
  }, [students, query, stageFilter, sortKey]);

  const topStudents = filtered.slice(0, 3);

  async function copySql() {
    try {
      await navigator.clipboard.writeText(grantSql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-muted-foreground">
        Загрузка…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      {/* HEADER */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card">
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" />
        <div className="pointer-events-none absolute -right-16 -top-12 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/4 h-40 w-40 rounded-full bg-[color:var(--accent-glow)]/15 blur-3xl" />
        <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-primary" /> Admin Control
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Админ-панель
            </h1>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Все ученики курса: этапы, прогресс компании и контакты в одном месте.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div
              className={[
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs",
                isAdmin && !usingDemo
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border-yellow-500/30 bg-yellow-500/10 text-yellow-200",
              ].join(" ")}
            >
              {isAdmin && !usingDemo ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" /> Живые данные
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3.5 w-3.5" /> Демо
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => void reload()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/50 px-4 py-2.5 text-sm hover:border-primary/40 disabled:opacity-60"
            >
              <RefreshCw
                className={["h-4 w-4", loading ? "animate-spin" : ""].join(" ")}
              />
              Обновить
            </button>
          </div>
        </div>
      </div>

      {/* ACCESS BANNER */}
      {!isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 overflow-hidden rounded-3xl border border-yellow-500/30 bg-yellow-500/10"
        >
          <div className="border-b border-yellow-500/20 px-5 py-4 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-yellow-500/25 bg-yellow-500/15 text-yellow-200">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <div className="text-base font-semibold text-yellow-50">
                  Сейчас это демо-пример
                </div>
                <p className="mt-1 text-sm leading-relaxed text-yellow-50/80">
                  Список ниже — не настоящие ученики. Чтобы увидеть реальных людей
                  из базы, один раз открой доступ админа для своего аккаунта.
                </p>
              </div>
            </div>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-[1.2fr_1fr] sm:p-6">
            <ol className="list-decimal space-y-2.5 pl-5 text-sm text-yellow-50/90">
              <li>
                Открой{" "}
                <a
                  href="https://supabase.com/dashboard/project/codefxnhkhorpwutnxdp/sql/new"
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-white"
                >
                  Supabase → SQL Editor
                </a>
              </li>
              <li>
                Выполни миграцию{" "}
                <code className="rounded bg-background/40 px-1.5 py-0.5 text-[11px]">
                  20260716_admin_panel.sql
                </code>
              </li>
              <li>Вставь команду справа и нажми Run</li>
            </ol>
            <div className="overflow-hidden rounded-2xl border border-yellow-500/20 bg-background/50">
              <div className="flex items-center justify-between border-b border-yellow-500/20 px-3 py-2">
                <span className="text-[11px] text-muted-foreground">
                  Сделать меня админом
                </span>
                <button
                  type="button"
                  onClick={() => void copySql()}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] text-primary hover:bg-primary/10"
                >
                  <Copy className="h-3 w-3" />
                  {copied ? "Скопировано" : "Копировать"}
                </button>
              </div>
              <pre className="overflow-x-auto p-3 text-[11px] leading-relaxed text-muted-foreground">
                {grantSql}
              </pre>
            </div>
          </div>
          {!user ? (
            <div className="border-t border-yellow-500/20 px-5 py-3 text-sm text-yellow-50/80 sm:px-6">
              Сначала{" "}
              <Link to="/login" className="underline hover:text-white">
                войди в аккаунт
              </Link>{" "}
              — подставим твой email автоматически.
            </div>
          ) : (
            <div className="border-t border-yellow-500/20 px-5 py-3 text-xs text-yellow-50/70 sm:px-6">
              После Run обнови страницу — жёлтый блок исчезнет, появятся живые ученики.
            </div>
          )}
        </motion.div>
      )}

      {isAdmin && usingDemo && (
        <div className="mt-5 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-100">
          Не удалось загрузить живые данные{error ? `: ${error}` : ""}. Показано демо.
        </div>
      )}

      {isAdmin && !usingDemo && (
        <div className="mt-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          Живые данные · {stats.total} учеников в базе
        </div>
      )}

      {/* STATS */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Учеников"
          value={String(stats.total)}
          hint={usingDemo ? "демо" : "в базе"}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label="Средний прогресс"
          value={`${stats.avg}%`}
          hint="готовность компании"
          icon={<Crown className="h-4 w-4" />}
        />
        <StatCard
          label="На этапе 1"
          value={String(stats.onStage1)}
          hint="только стартуют"
          icon={<Flame className="h-4 w-4" />}
        />
        <StatCard
          label="Финиш"
          value={String(stats.finished)}
          hint="100% / 8 этапов"
          icon={<Trophy className="h-4 w-4" />}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          {/* FILTERS */}
          <div className="rounded-3xl border border-border bg-card p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[200px] flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Имя, компания, Telegram, телефон…"
                  className="h-11 w-full rounded-xl border border-border bg-background/50 pl-10 pr-4 text-sm outline-none focus:border-primary/50"
                />
              </div>
              <div className="flex gap-1.5 overflow-x-auto">
                {(
                  [
                    ["progress", "По %"],
                    ["xp", "По XP"],
                    ["stage", "По этапу"],
                    ["name", "По имени"],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSortKey(key)}
                    className={[
                      "shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors",
                      sortKey === key
                        ? "border-primary/40 bg-primary/10 text-foreground"
                        : "border-border bg-background/40 text-muted-foreground hover:text-foreground",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setStageFilter("all")}
                className={[
                  "shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                  stageFilter === "all"
                    ? "border-primary/40 bg-primary/10 text-foreground"
                    : "border-border bg-background/40 text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                Все этапы
              </button>
              {missionStages.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStageFilter(s.id)}
                  className={[
                    "shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                    stageFilter === s.id
                      ? "border-primary/40 bg-primary/10 text-foreground"
                      : "border-border bg-background/40 text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {s.number}. {s.title}
                </button>
              ))}
            </div>
          </div>

          {/* TOP 3 */}
          {topStudents.length > 0 && stageFilter === "all" && !query && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {topStudents.map((student, i) => (
                <motion.button
                  key={student.id}
                  type="button"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i }}
                  onClick={() =>
                    setExpanded(expanded === student.id ? null : student.id)
                  }
                  className={[
                    "rounded-3xl border p-4 text-left transition-colors hover:border-primary/35",
                    i === 0
                      ? "border-amber-400/35 bg-amber-400/10"
                      : "border-border bg-card",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className={[
                        "flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-background/40",
                        i === 0 ? "text-amber-300" : "text-muted-foreground",
                      ].join(" ")}
                    >
                      {i === 0 ? (
                        <Crown className="h-4 w-4" />
                      ) : (
                        <Medal className="h-4 w-4" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">#{i + 1}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2.5">
                    <Avatar student={student} />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">
                        {student.full_name || "Без имени"}
                      </div>
                      <div className="truncate text-[11px] text-muted-foreground">
                        {student.level}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-end justify-between">
                    <span className="text-xl font-semibold">{student.progress}%</span>
                    <span className="text-[11px] text-muted-foreground">
                      этап {student.currentStageId}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {/* LIST */}
          <div className="overflow-hidden rounded-3xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="text-sm font-semibold">
                Ученики
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {filtered.length}
                </span>
              </div>
              <div className="hidden text-[11px] uppercase tracking-wide text-muted-foreground lg:block">
                клик — детали и этапы
              </div>
            </div>

            <div className="divide-y divide-border">
              {filtered.map((student, i) => (
                <StudentRow
                  key={student.id}
                  rank={i + 1}
                  student={student}
                  open={expanded === student.id}
                  onToggle={() =>
                    setExpanded(expanded === student.id ? null : student.id)
                  }
                />
              ))}
              {filtered.length === 0 && (
                <div className="px-5 py-14 text-center">
                  <Sparkles className="mx-auto h-7 w-7 text-muted-foreground" />
                  <div className="mt-3 text-sm text-muted-foreground">
                    Никого не найдено по текущему фильтру.
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setStageFilter("all");
                    }}
                    className="mt-2 text-sm text-primary hover:underline"
                  >
                    Сбросить фильтры
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-border bg-card p-5">
            <div className="text-sm font-semibold">Воронка этапов</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Где сейчас находятся ученики
            </p>
            <ul className="mt-4 space-y-2.5">
              {stageDistribution.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() =>
                      setStageFilter(stageFilter === s.id ? "all" : s.id)
                    }
                    className="w-full text-left"
                  >
                    <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                      <span
                        className={
                          stageFilter === s.id
                            ? "font-medium text-primary"
                            : "text-muted-foreground"
                        }
                      >
                        {s.number}. {s.title}
                      </span>
                      <span className="font-medium">{s.count}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-background/60">
                      <div
                        className={[
                          "h-full rounded-full transition-all",
                          stageFilter === s.id ? "bg-primary" : "bg-foreground/30",
                        ].join(" ")}
                        style={{
                          width: `${Math.round((s.count / maxStageCount) * 100)}%`,
                        }}
                      />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5">
            <div className="text-sm font-semibold">Легенда этапов</div>
            <ul className="mt-4 space-y-2">
              {(Object.keys(stageLabel) as StageStatus[]).map((key) => (
                <li
                  key={key}
                  className="flex items-center gap-2.5 text-sm text-muted-foreground"
                >
                  <span
                    className={["h-2.5 w-2.5 rounded-full", stageDot[key]].join(
                      " ",
                    )}
                  />
                  {stageLabel[key]}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5">
            <div className="text-sm font-semibold">Быстрые ссылки</div>
            <div className="mt-3 space-y-2">
              <Link
                to="/leaderboard"
                className="flex items-center justify-between rounded-xl border border-border bg-background/40 px-3 py-2.5 text-sm hover:border-primary/35"
              >
                Leaderboard <Trophy className="h-3.5 w-3.5 text-primary" />
              </Link>
              <Link
                to="/community"
                className="flex items-center justify-between rounded-xl border border-border bg-background/40 px-3 py-2.5 text-sm hover:border-primary/35"
              >
                Сообщество <Users className="h-3.5 w-3.5 text-primary" />
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
      {hint && (
        <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>
      )}
    </div>
  );
}

function Avatar({ student, size = "md" }: { student: AdminStudent; size?: "sm" | "md" }) {
  const initial = student.full_name.trim().charAt(0).toUpperCase() || "?";
  const cls =
    size === "sm"
      ? "h-9 w-9 text-xs"
      : "h-10 w-10 text-sm";
  return (
    <div
      className={[
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-[color:var(--accent-glow)] font-semibold text-primary-foreground",
        cls,
      ].join(" ")}
    >
      {student.avatar_url ? (
        <img src={student.avatar_url} alt="" className="h-full w-full object-cover" />
      ) : (
        initial
      )}
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
  return (
    <div className={open ? "bg-primary/5" : undefined}>
      <button
        type="button"
        onClick={onToggle}
        className="grid w-full grid-cols-1 gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/25 lg:grid-cols-[48px_minmax(0,1.5fr)_minmax(0,1.1fr)_120px_110px] lg:items-center"
      >
        <div className="flex items-center justify-between lg:block">
          <div
            className={[
              "flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-semibold",
              rank <= 3
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border bg-background/50 text-muted-foreground",
            ].join(" ")}
          >
            {rank}
          </div>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground lg:hidden">
            {open ? "Свернуть" : "Подробнее"}
            <ChevronDown
              className={[
                "h-3.5 w-3.5 transition-transform",
                open ? "rotate-180" : "",
              ].join(" ")}
            />
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Avatar student={student} />
          <div className="min-w-0">
            <div className="truncate font-medium">
              {student.full_name || "Без имени"}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {student.company || "Без компании"} · {student.level} · {student.xp} XP
            </div>
          </div>
        </div>

        <div>
          <div className="text-sm font-medium">
            [{student.currentStageId}] {student.currentStageTitle}
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            Пройдено: {student.stagesDone}/8
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {student.stages.map((st) => (
            <span
              key={st.stage_id}
              title={`Этап ${st.stage_id}: ${stageLabel[st.status]} (${st.progress}%)`}
              className={["h-2.5 w-2.5 rounded-full", stageDot[st.status]].join(" ")}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-2 lg:block lg:text-right">
          <div>
            <div className="text-xl font-semibold tracking-tight">
              {student.progress}%
            </div>
            <div className="mt-1.5 hidden h-1 overflow-hidden rounded-full bg-background/60 lg:block">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.min(student.progress, 100)}%` }}
              />
            </div>
          </div>
          <ChevronDown
            className={[
              "hidden h-4 w-4 text-muted-foreground transition-transform lg:ml-auto lg:mt-1 lg:block",
              open ? "rotate-180" : "",
            ].join(" ")}
          />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border bg-background/35 px-5 py-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Info
                  label="Telegram"
                  value={student.telegram || "—"}
                  icon={<Users className="h-3.5 w-3.5" />}
                />
                <Info
                  label="Телефон"
                  value={student.phone || "—"}
                  icon={<Phone className="h-3.5 w-3.5" />}
                />
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
                      className="rounded-2xl border border-border bg-card px-3.5 py-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 truncate text-sm font-medium">
                          [{st.stage_id}] {meta?.title}
                        </div>
                        <span
                          className={[
                            "shrink-0 rounded-full px-2 py-0.5 text-[10px]",
                            st.status === "done" &&
                              "bg-emerald-500/15 text-emerald-400",
                            st.status === "active" && "bg-primary/15 text-primary",
                            st.status === "todo" &&
                              "bg-yellow-500/10 text-yellow-400",
                            st.status === "locked" &&
                              "bg-muted text-muted-foreground",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          {stageLabel[st.status]}
                        </span>
                      </div>
                      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${st.progress}%` }}
                        />
                      </div>
                      <div className="mt-1 text-[11px] text-muted-foreground">
                        {st.progress}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Info({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card px-3.5 py-3">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 truncate text-sm">{value}</div>
    </div>
  );
}
