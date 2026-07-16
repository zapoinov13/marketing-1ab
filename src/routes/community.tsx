import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, MessageCircle, Share2 } from "lucide-react";

export const Route = createFileRoute("/community")({
  component: Community,
});

const initial = [
  {
    id: "1",
    name: "Анна Кузнецова",
    role: "Product Marketer",
    text: "Собрала свой первый AI-агент за выходные. Автоматизировал контент-план на месяц. 🔥",
    likes: 42,
    comments: 7,
  },
  {
    id: "2",
    name: "Игорь Смирнов",
    role: "Founder",
    text: "Ребята, кто делал интеграцию Claude + amoCRM? Есть тонкости с webhook?",
    likes: 12,
    comments: 4,
  },
  {
    id: "3",
    name: "Мария Лебедева",
    role: "Designer",
    text: "Midjourney v7 разнёс мою продуктивность. Делюсь пресетами в комментах 👇",
    likes: 88,
    comments: 21,
  },
];

function Community() {
  const [posts, setPosts] = useState(initial);
  const [draft, setDraft] = useState("");
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const publish = () => {
    if (!draft.trim()) return;
    setPosts((p) => [
      { id: crypto.randomUUID(), name: "Юрий", role: "Student", text: draft, likes: 0, comments: 0 },
      ...p,
    ]);
    setDraft("");
  };

  const toggleLike = (id: string) => {
    setLiked((l) => ({ ...l, [id]: !l[id] }));
    setPosts((ps) =>
      ps.map((p) => (p.id === id ? { ...p, likes: p.likes + (liked[id] ? -1 : 1) } : p)),
    );
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">Community</div>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Сообщество</h1>
      <p className="mt-2 text-muted-foreground">Делись победами, задавай вопросы, помогай другим.</p>

      {/* Composer */}
      <div className="mt-8 rounded-2xl border border-border bg-card p-5">
        <textarea
          rows={3}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Поделись прогрессом или задай вопрос..."
          className="w-full resize-none rounded-xl border border-border bg-background/60 p-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50"
        />
        <div className="mt-3 flex justify-end">
          <button
            onClick={publish}
            disabled={!draft.trim()}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-40"
          >
            Опубликовать
          </button>
        </div>
      </div>

      {/* Feed */}
      <div className="mt-6 space-y-4">
        {posts.map((p) => (
          <article
            key={p.id}
            className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[color:var(--accent-glow)] text-sm font-semibold text-primary-foreground">
                {p.name[0]}
              </div>
              <div>
                <div className="text-sm font-medium">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.role}</div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-foreground">{p.text}</p>
            <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
              <button
                onClick={() => toggleLike(p.id)}
                className={[
                  "inline-flex items-center gap-1.5 transition-colors",
                  liked[p.id] ? "text-primary" : "hover:text-foreground",
                ].join(" ")}
              >
                <Heart className={["h-3.5 w-3.5", liked[p.id] ? "fill-primary" : ""].join(" ")} />
                {p.likes}
              </button>
              <button className="inline-flex items-center gap-1.5 hover:text-foreground">
                <MessageCircle className="h-3.5 w-3.5" /> {p.comments}
              </button>
              <button className="ml-auto inline-flex items-center gap-1.5 hover:text-foreground">
                <Share2 className="h-3.5 w-3.5" /> Поделиться
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
