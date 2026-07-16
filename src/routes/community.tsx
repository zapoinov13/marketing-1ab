import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Send,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { communityPosts, topBuilders } from "@/data/platform";
import { useAuth } from "@/contexts/AuthContext";
import { useLiveProgress } from "@/hooks/useLiveProgress";

export const Route = createFileRoute("/community")({
  component: Community,
});

type Post = (typeof communityPosts)[number] & { liked?: boolean };

const sections = [
  { id: "Лента", label: "Лента" },
  { id: "Общий чат", label: "Чат" },
  { id: "Работы учеников", label: "Работы" },
  { id: "Лучшие проекты недели", label: "Проекты" },
  { id: "Топ Builder", label: "Топ" },
] as const;

function Community() {
  const { user, profile } = useAuth();
  const live = useLiveProgress();
  const displayName =
    live.displayName ||
    profile?.full_name ||
    user?.email?.split("@")[0] ||
    "Юрий";
  const avatarUrl = profile?.avatar_url || null;
  const initial = displayName.trim().charAt(0).toUpperCase() || "Ю";

  const [tab, setTab] = useState<(typeof sections)[number]["id"]>("Лента");
  const [posts, setPosts] = useState<Post[]>(
    communityPosts.map((p) => ({ ...p, liked: false })),
  );
  const [draft, setDraft] = useState("");

  const visible = useMemo(() => {
    if (tab === "Лента") return posts;
    if (tab === "Топ Builder") return [];
    return posts.filter((p) => p.tag === tab);
  }, [posts, tab]);

  const weekProjects = posts
    .filter((p) => p.tag === "Лучшие проекты недели")
    .concat(posts)
    .filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i)
    .slice(0, 3);

  function publish() {
    const text = draft.trim();
    if (!text) return;
    setPosts((prev) => [
      {
        id: crypto.randomUUID(),
        author: displayName,
        role: live.loggedIn ? live.level : "Builder",
        text,
        likes: 0,
        tag: tab === "Лента" ? "Общий чат" : tab === "Топ Builder" ? "Общий чат" : tab,
        liked: false,
      },
      ...prev,
    ]);
    setDraft("");
    if (tab === "Топ Builder") setTab("Общий чат");
  }

  function toggleLike(id: string) {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const liked = !p.liked;
        return {
          ...p,
          liked,
          likes: Math.max(0, p.likes + (liked ? 1 : -1)),
        };
      }),
    );
  }

  const showComposer = tab !== "Топ Builder";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      {/* HEADER */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card">
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" />
        <div className="pointer-events-none absolute -right-16 -top-12 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <Users className="h-3.5 w-3.5 text-primary" /> Community
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Сообщество
            </h1>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Делись прогрессом, смотри работы учеников и топ Builder.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/leaderboard"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background/50 px-4 py-2.5 text-sm hover:border-primary/40"
            >
              <Trophy className="h-3.5 w-3.5 text-primary" /> Leaderboard
            </Link>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setTab(s.id)}
            className={[
              "shrink-0 rounded-full border px-4 py-1.5 text-sm transition-colors",
              tab === s.id
                ? "border-primary/40 bg-primary/10 text-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          {/* COMPOSER */}
          {showComposer && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-border bg-card p-4 sm:p-5"
            >
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-[color:var(--accent-glow)] text-sm font-semibold text-primary-foreground">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    initial
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={3}
                    placeholder="Поделись прогрессом, работой или задай вопрос…"
                    className="w-full resize-none rounded-2xl border border-border bg-background/50 px-4 py-3 text-sm outline-none focus:border-primary/50"
                  />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-[11px] text-muted-foreground">
                      Публикуется как {displayName}
                    </div>
                    <button
                      type="button"
                      onClick={publish}
                      disabled={!draft.trim()}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                    >
                      <Send className="h-3.5 w-3.5" /> Опубликовать
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TOP BUILDERS TAB */}
          {tab === "Топ Builder" ? (
            <div className="space-y-3">
              {topBuilders.map((b, i) => (
                <motion.div
                  key={b.name}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i }}
                  className="flex items-center justify-between rounded-3xl border border-border bg-card p-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-background/60 text-lg">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                    </div>
                    <div>
                      <div className="font-semibold">{b.name}</div>
                      <div className="text-xs text-muted-foreground">{b.badge}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-semibold text-primary">{b.score}</div>
                    <div className="text-[11px] text-muted-foreground">готовность</div>
                  </div>
                </motion.div>
              ))}
              <Link
                to="/leaderboard"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Полный рейтинг →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {visible.map((post, i) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(0.03 * i, 0.2) }}
                    className="rounded-3xl border border-border bg-card p-5 transition-colors hover:border-primary/25"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                          {post.author[0]}
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{post.author}</div>
                          <div className="text-xs text-muted-foreground">{post.role}</div>
                        </div>
                      </div>
                      <span className="rounded-full border border-border bg-background/40 px-2.5 py-1 text-[11px] text-muted-foreground">
                        {post.tag}
                      </span>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-foreground">{post.text}</p>
                    <div className="mt-4 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleLike(post.id)}
                        className={[
                          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors",
                          post.liked
                            ? "border-red-500/30 bg-red-500/10 text-red-400"
                            : "border-border text-muted-foreground hover:text-foreground",
                        ].join(" ")}
                      >
                        <Heart
                          className={["h-3.5 w-3.5", post.liked ? "fill-current" : ""].join(" ")}
                        />
                        {post.likes}
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <MessageCircle className="h-3.5 w-3.5" /> Ответить
                      </button>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>

              {visible.length === 0 && (
                <div className="rounded-3xl border border-dashed border-border p-12 text-center">
                  <Sparkles className="mx-auto h-7 w-7 text-muted-foreground" />
                  <div className="mt-3 text-sm text-muted-foreground">
                    Пока нет постов в этой вкладке.
                  </div>
                  <button
                    type="button"
                    onClick={() => setTab("Общий чат")}
                    className="mt-2 text-sm text-primary hover:underline"
                  >
                    Написать в чат
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Trophy className="h-4 w-4 text-primary" /> Топ Builder
            </div>
            <ul className="mt-4 space-y-2">
              {topBuilders.map((b, i) => (
                <li
                  key={b.name}
                  className="flex items-center justify-between rounded-xl border border-border bg-background/40 px-3 py-2.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{i + 1}.</span>
                    <div>
                      <div className="text-sm font-medium">{b.name}</div>
                      <div className="text-[11px] text-muted-foreground">{b.badge}</div>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-primary">{b.score}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setTab("Топ Builder")}
              className="mt-3 text-sm text-primary hover:underline"
            >
              Смотреть топ →
            </button>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5">
            <div className="text-sm font-semibold">Проекты недели</div>
            <ul className="mt-4 space-y-3">
              {weekProjects.map((p) => (
                <li key={p.id} className="rounded-xl border border-border bg-background/40 px-3 py-3">
                  <div className="text-sm font-medium">{p.author}</div>
                  <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.text}</div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
