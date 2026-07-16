import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  ChevronRight,
  Copy,
  FileText,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
  { q: "Как подключить Meta", hint: "Кабинет и токены" },
  { q: "Как получить API", hint: "Marketing API" },
  { q: "Как сделать Deploy", hint: "Vercel + GitHub" },
  { q: "Как подключить Telegram", hint: "Бот в n8n" },
];

function Docs() {
  const [category, setCategory] = useState<DocCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(docArticles[0]?.id);
  const [copied, setCopied] = useState(false);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: docArticles.length };
    for (const c of docCategories) {
      map[c.id] = docArticles.filter((a) => a.category === c.id).length;
    }
    return map;
  }, []);

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

  const active: DocArticle | null =
    filtered.find((a) => a.id === activeId) ?? filtered[0] ?? null;

  useEffect(() => {
    if (active && active.id !== activeId) setActiveId(active.id);
  }, [active, activeId]);

  const related = useMemo(() => {
    if (!active) return [];
    return docArticles
      .filter((a) => a.category === active.category && a.id !== active.id)
      .slice(0, 3);
  }, [active]);

  const categoryMeta = active
    ? docCategories.find((c) => c.id === active.category)
    : null;

  async function copyTitle() {
    if (!active) return;
    try {
      await navigator.clipboard.writeText(active.title);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  function clearSearch() {
    setQuery("");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      {/* HEADER */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card">
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-25" />
        <div className="pointer-events-none absolute -right-20 -top-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative p-6 sm:p-8">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5 text-primary" /> Wiki
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Документация
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            База знаний по инструментам курса: Meta, Claude, Vercel, n8n и остальное.
          </p>

          <div className="relative mt-5 max-w-2xl">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск: Meta, Deploy, Telegram, Supabase…"
              className="h-12 w-full rounded-2xl border border-border bg-background/60 pl-11 pr-11 text-sm outline-none transition-colors focus:border-primary/50"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Очистить"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {popular.map((p) => (
              <button
                key={p.q}
                type="button"
                onClick={() => {
                  setQuery(p.q);
                  setCategory("all");
                }}
                className="rounded-2xl border border-border bg-background/40 px-3.5 py-3 text-left transition-colors hover:border-primary/40"
              >
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  {p.q}
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">{p.hint}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CATEGORY CHIPS */}
      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        <Chip
          active={category === "all"}
          onClick={() => setCategory("all")}
          label="Все"
          count={counts.all}
        />
        {docCategories.map((c) => (
          <Chip
            key={c.id}
            active={category === c.id}
            onClick={() => setCategory(c.id)}
            label={`${c.emoji} ${c.label}`}
            count={counts[c.id] ?? 0}
          />
        ))}
      </div>

      {/* MAIN */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* LIST */}
        <aside className="rounded-3xl border border-border bg-card p-3 lg:max-h-[70vh] lg:overflow-y-auto">
          <div className="mb-2 flex items-center justify-between px-2 py-1">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Статьи
            </div>
            <div className="text-xs text-muted-foreground">{filtered.length}</div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Ничего не найдено.
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                }}
                className="mt-2 block w-full text-primary hover:underline"
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              {filtered.map((article) => {
                const cat = docCategories.find((c) => c.id === article.category);
                const selected = active?.id === article.id;
                return (
                  <button
                    key={article.id}
                    type="button"
                    onClick={() => setActiveId(article.id)}
                    className={[
                      "group flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition-colors",
                      selected
                        ? "border-primary/40 bg-primary/10"
                        : "border-transparent hover:border-border hover:bg-background/50",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-sm",
                        selected
                          ? "border-primary/30 bg-primary/15"
                          : "border-border bg-background/60",
                      ].join(" ")}
                    >
                      {cat?.emoji ?? <FileText className="h-3.5 w-3.5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{article.title}</div>
                      <div className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                        {article.excerpt}
                      </div>
                    </div>
                    <ChevronRight
                      className={[
                        "mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-opacity",
                        selected ? "opacity-100 text-primary" : "opacity-0 group-hover:opacity-100",
                      ].join(" ")}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        {/* READER */}
        <AnimatePresence mode="wait">
          {active ? (
            <motion.article
              key={active.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
              className="rounded-3xl border border-border bg-card p-6 sm:p-8"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/50 px-2.5 py-1 text-[11px] text-muted-foreground">
                    <span>{categoryMeta?.emoji}</span>
                    {categoryMeta?.label ?? "Документация"}
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                    {active.title}
                  </h2>
                  <p className="mt-2 max-w-2xl text-muted-foreground">{active.excerpt}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void copyTitle()}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copied ? "Скопировано" : "Копировать"}
                </button>
              </div>

              <div className="mt-7 space-y-3">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  Пошагово
                </div>
                {active.body.map((p, i) => (
                  <div
                    key={i}
                    className="flex gap-3 rounded-2xl border border-border bg-background/40 px-4 py-3.5"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                      {i + 1}
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/90">{p}</p>
                  </div>
                ))}
              </div>

              {related.length > 0 && (
                <div className="mt-8 border-t border-border pt-6">
                  <div className="text-sm font-semibold">Похожие статьи</div>
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {related.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setActiveId(r.id)}
                        className="rounded-2xl border border-border bg-background/40 px-3 py-3 text-left transition-colors hover:border-primary/40"
                      >
                        <div className="text-sm font-medium">{r.title}</div>
                        <div className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
                          {r.excerpt}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.article>
          ) : (
            <div className="rounded-3xl border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground">
              Выбери статью слева
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors",
        active
          ? "border-primary/40 bg-primary/10 text-foreground"
          : "border-border bg-card text-muted-foreground hover:text-foreground",
      ].join(" ")}
    >
      {label}
      <span className="text-xs opacity-70">{count}</span>
    </button>
  );
}
