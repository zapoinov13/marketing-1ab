import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  docArticles,
  docCategories,
  type DocArticle,
  type DocCategory,
} from "@/data/platform";

export const Route = createFileRoute("/docs")({
  component: Docs,
});

const popular = [
  "Как подключить Meta",
  "Как получить API",
  "Как сделать Deploy",
  "Как подключить Telegram",
];

function Docs() {
  const [category, setCategory] = useState<DocCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(docArticles[0]?.id);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return docArticles.filter((a) => {
      const byCat = category === "all" || a.category === category;
      const byQuery =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.body.some((p) => p.toLowerCase().includes(q));
      return byCat && byQuery;
    });
  }, [category, query]);

  const active: DocArticle =
    filtered.find((a) => a.id === activeId) ?? filtered[0] ?? docArticles[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">Wiki</div>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Документация</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Мини-wiki по всем инструментам курса. Поиск и категории — как в настоящей базе знаний.
      </p>

      <div className="relative mt-6 max-w-2xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Как подключить Meta, Deploy, Telegram..."
          className="h-12 w-full rounded-2xl border border-border bg-card pl-10 pr-4 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {popular.map((p) => (
          <button
            key={p}
            onClick={() => {
              setQuery(p);
              setCategory("all");
            }}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            {p}
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* Categories */}
        <aside className="space-y-1 rounded-3xl border border-border bg-card p-3">
          <button
            onClick={() => setCategory("all")}
            className={[
              "flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
              category === "all"
                ? "bg-primary/10 text-foreground ring-1 ring-primary/30"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            ].join(" ")}
          >
            Все категории
          </button>
          {docCategories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={[
                "flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                category === c.id
                  ? "bg-primary/10 text-foreground ring-1 ring-primary/30"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              ].join(" ")}
            >
              <span>{c.emoji}</span>
              {c.label}
            </button>
          ))}
        </aside>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
          <div className="space-y-2">
            {filtered.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                Ничего не найдено. Попробуй другой запрос.
              </div>
            )}
            {filtered.map((article) => (
              <button
                key={article.id}
                onClick={() => setActiveId(article.id)}
                className={[
                  "w-full rounded-2xl border p-4 text-left transition-colors",
                  active?.id === article.id
                    ? "border-primary/40 bg-primary/10"
                    : "border-border bg-card hover:border-primary/30",
                ].join(" ")}
              >
                <div className="text-sm font-medium">{article.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{article.excerpt}</div>
              </button>
            ))}
          </div>

          {active && (
            <article className="rounded-3xl border border-border bg-card p-6 sm:p-8">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                {docCategories.find((c) => c.id === active.category)?.label}
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">{active.title}</h2>
              <p className="mt-2 text-muted-foreground">{active.excerpt}</p>
              <div className="mt-6 space-y-4">
                {active.body.map((p, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-medium text-primary">
                      {i + 1}
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">{p}</p>
                  </div>
                ))}
              </div>
            </article>
          )}
        </div>
      </div>
    </div>
  );
}
