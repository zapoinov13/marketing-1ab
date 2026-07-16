import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, MessageCircle, Trophy } from "lucide-react";
import { communityPosts, topBuilders } from "@/data/platform";

export const Route = createFileRoute("/community")({
  component: Community,
});

const sections = ["Общий чат", "Лента", "Работы учеников", "Лучшие проекты недели", "Топ Builder"];

function Community() {
  const [tab, setTab] = useState("Лента");
  const [posts, setPosts] = useState(communityPosts);
  const [draft, setDraft] = useState("");

  function publish() {
    const text = draft.trim();
    if (!text) return;
    setPosts((prev) => [
      {
        id: crypto.randomUUID(),
        author: "Юрий",
        role: "Builder",
        text,
        likes: 0,
        tag: "Общий чат",
      },
      ...prev,
    ]);
    setDraft("");
    setTab("Общий чат");
  }

  const visible =
    tab === "Лента" || tab === "Общий чат"
      ? posts
      : posts.filter((p) => p.tag === tab || (tab === "Топ Builder" ? false : p.tag === tab));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">Community</div>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Сообщество</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Общий чат, лента, работы учеников и лучшие проекты недели.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {sections.map((s) => (
          <button
            key={s}
            onClick={() => setTab(s)}
            className={[
              "rounded-full border px-4 py-2 text-sm transition-colors",
              tab === s
                ? "border-primary/40 bg-primary/10 text-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          {(tab === "Общий чат" || tab === "Лента") && (
            <div className="rounded-3xl border border-border bg-card p-4">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                placeholder="Поделись прогрессом или задай вопрос..."
                className="w-full resize-none rounded-2xl border border-border bg-background/50 px-4 py-3 text-sm outline-none focus:border-primary/50"
              />
              <div className="mt-3 flex justify-end">
                <button
                  onClick={publish}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                >
                  Опубликовать
                </button>
              </div>
            </div>
          )}

          {tab === "Топ Builder" ? (
            <div className="space-y-3">
              {topBuilders.map((b, i) => (
                <div
                  key={b.name}
                  className="flex items-center justify-between rounded-2xl border border-border bg-card p-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-sm font-semibold text-primary">
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-medium">{b.name}</div>
                      <div className="text-xs text-muted-foreground">{b.badge}</div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-primary">{b.score}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {(tab === "Лента" || tab === "Общий чат" ? posts : visible).map((post) => (
                <article
                  key={post.id}
                  className="rounded-3xl border border-border bg-card p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                        {post.author[0]}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{post.author}</div>
                        <div className="text-xs text-muted-foreground">{post.role}</div>
                      </div>
                    </div>
                    <span className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground">
                      {post.tag}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-foreground">{post.text}</p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <button
                      onClick={() =>
                        setPosts((prev) =>
                          prev.map((p) =>
                            p.id === post.id ? { ...p, likes: p.likes + 1 } : p,
                          ),
                        )
                      }
                      className="inline-flex items-center gap-1.5 hover:text-foreground"
                    >
                      <Heart className="h-3.5 w-3.5" /> {post.likes}
                    </button>
                    <span className="inline-flex items-center gap-1.5">
                      <MessageCircle className="h-3.5 w-3.5" /> Ответить
                    </span>
                  </div>
                </article>
              ))}
              {tab !== "Лента" && tab !== "Общий чат" && visible.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                  Пока нет постов в этой вкладке.
                </div>
              )}
            </div>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Trophy className="h-4 w-4 text-primary" /> Лучшие проекты недели
            </div>
            <ul className="mt-4 space-y-3">
              {communityPosts
                .filter((p) => p.tag === "Лучшие проекты недели")
                .concat(communityPosts.slice(0, 2))
                .slice(0, 3)
                .map((p) => (
                  <li key={p.id} className="text-sm">
                    <div className="font-medium">{p.author}</div>
                    <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {p.text}
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
