import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Medal, Trophy } from "lucide-react";
import { achievements, leaderboard } from "@/data/platform";

export const Route = createFileRoute("/leaderboard")({
  component: Leaderboard,
});

const medals = ["🥇", "🥈", "🥉"];

function Leaderboard() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">
        AI Mission Ranking
      </div>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Leaderboard</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Рейтинг строителей AI-компаний. Роли, уровни и достижения.
      </p>

      <div className="mt-8 space-y-3">
        {leaderboard.map((row, i) => (
          <motion.div
            key={row.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 * i }}
            className={[
              "flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5",
              row.isYou
                ? "border-primary/40 bg-primary/10"
                : "border-border bg-card",
            ].join(" ")}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-background/50 text-xl">
                {row.rank <= 3 ? medals[row.rank - 1] : `#${row.rank}`}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">{row.name}</span>
                  {row.isYou && (
                    <span className="rounded-full border border-primary/30 bg-primary/15 px-2 py-0.5 text-[10px] text-primary">
                      ты
                    </span>
                  )}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Level {row.level} · {row.role}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold tracking-tight">{row.progress}%</div>
              <div className="text-xs text-muted-foreground">готовность компании</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Roles */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight">Роли</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {["Builder", "AI Architect", "Automation Master", "Content Engineer", "AI CEO"].map(
            (role) => (
              <span
                key={role}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground"
              >
                {role}
              </span>
            ),
          )}
        </div>
      </div>

      {/* Achievements */}
      <div className="mt-10">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold tracking-tight">Достижения</h2>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {achievements.map((a) => (
            <div
              key={a.id}
              className={[
                "rounded-2xl border p-4 text-center",
                a.unlocked
                  ? "border-primary/30 bg-primary/10"
                  : "border-border bg-card opacity-50",
              ].join(" ")}
            >
              <div className="text-2xl">{a.emoji}</div>
              <div className="mt-2 text-sm font-medium">{a.title}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                {a.unlocked ? "Открыто" : "Закрыто"}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Medal className="h-4 w-4 text-primary" />
        Смотри свой прогресс в{" "}
        <Link to="/profile" className="text-primary hover:underline">
          профиле
        </Link>
      </div>
    </div>
  );
}
