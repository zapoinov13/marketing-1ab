import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Camera, Flame, LogOut, Trophy } from "lucide-react";
import { achievements, user as mockUser } from "@/data/platform";
import { useAuth } from "@/contexts/AuthContext";
import { useLiveProgress } from "@/hooks/useLiveProgress";

export const Route = createFileRoute("/profile")({
  component: Profile,
});

function Profile() {
  const { user, profile, signOut, ready, updateProfile, uploadAvatar } = useAuth();
  const live = useLiveProgress();
  const fileRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [telegram, setTelegram] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    setFullName(profile?.full_name || live.displayName || (user ? "" : mockUser.name));
    setCompany(profile?.company || (user ? "" : mockUser.company));
    setPhone(profile?.phone || (user ? "" : mockUser.phone));
    setTelegram(profile?.telegram || (user ? "" : mockUser.telegram));
    setAvatarUrl(profile?.avatar_url || null);
  }, [profile, live.displayName, user]);

  const level = live.loggedIn ? live.level : mockUser.level;
  const xp = live.loggedIn ? live.xp : mockUser.xp;
  const progress = live.loggedIn ? (live.companyProgress ?? 0) : mockUser.progress;
  const unlocked = live.loggedIn ? 0 : achievements.filter((a) => a.unlocked).length;
  const initial = (fullName || "Ю").trim().charAt(0).toUpperCase();

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setErr("");
    setSaving(true);
    const res = await updateProfile({
      full_name: fullName.trim() || "Ученик",
      company: company.trim() || null,
      phone: phone.trim() || null,
      telegram: telegram.trim() || null,
    });
    setSaving(false);
    if (res.error) setErr(res.error);
    else setMsg(user ? "Данные сохранены в Supabase" : "Данные сохранены локально");
  }

  async function onPickPhoto(file: File | undefined) {
    if (!file) return;
    setMsg("");
    setErr("");
    setUploading(true);
    const res = await uploadAvatar(file);
    setUploading(false);
    if (res.error) {
      setErr(res.error);
      return;
    }
    if (res.url) setAvatarUrl(res.url);
    setMsg("Фото обновлено");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Профиль</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Твой профиль</h1>
        </div>
        {ready &&
          (user ? (
            <button
              onClick={() => void signOut()}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" /> Выйти
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Войти
            </Link>
          ))}
      </div>

      <div
        className={[
          "mt-4 rounded-2xl border px-4 py-3 text-sm",
          live.loggedIn
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
            : "border-border bg-card/60 text-muted-foreground",
        ].join(" ")}
      >
        {live.loggedIn
          ? "Можно менять фото и данные — сохраняется в Supabase"
          : "Можно менять фото и данные локально. Войди — будет синхрон с Supabase."}
      </div>

      <div className="mt-8 overflow-hidden rounded-3xl border border-border bg-card">
        <div className="relative h-28 bg-gradient-to-r from-primary/30 via-primary/10 to-transparent">
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
        </div>
        <div className="relative px-6 pb-8 sm:px-8">
          <div className="-mt-12 flex flex-wrap items-end gap-5">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary to-[color:var(--accent-glow)] text-3xl font-semibold text-primary-foreground shadow-xl">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={fullName} className="h-full w-full object-cover" />
                ) : (
                  initial
                )}
              </div>
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-md hover:border-primary/50 disabled:opacity-60"
                aria-label="Загрузить фото"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => void onPickPhoto(e.target.files?.[0])}
              />
            </div>
            <div className="pb-1">
              <h2 className="text-2xl font-semibold tracking-tight">{fullName || "Ученик"}</h2>
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="mt-2 text-sm text-primary hover:underline disabled:opacity-60"
              >
                {uploading ? "Загружаю…" : "Загрузить своё фото"}
              </button>
              {user?.email && (
                <div className="mt-1 text-xs text-muted-foreground">{user.email}</div>
              )}
            </div>
          </div>

          <form onSubmit={onSave} className="mt-8 space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Имя">
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Как тебя зовут"
                  className="h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm outline-none focus:border-primary/50"
                />
              </Field>
              <Field label="Компания">
                <input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Название бизнеса"
                  className="h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm outline-none focus:border-primary/50"
                />
              </Field>
              <Field label="Телефон / WhatsApp">
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 …"
                  className="h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm outline-none focus:border-primary/50"
                />
              </Field>
              <Field label="Telegram">
                <input
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  placeholder="@username"
                  className="h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm outline-none focus:border-primary/50"
                />
              </Field>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
              >
                {saving ? "Сохраняю…" : "Сохранить данные"}
              </button>
              {msg && <span className="text-sm text-emerald-400">{msg}</span>}
              {err && <span className="text-sm text-red-400">{err}</span>}
            </div>
          </form>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-background/50 p-5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Flame className="h-3.5 w-3.5 text-primary" /> Level
              </div>
              <div className="mt-2 text-xl font-semibold">{level}</div>
            </div>
            <div className="rounded-2xl border border-border bg-background/50 p-5">
              <div className="text-xs text-muted-foreground">Опыт</div>
              <div className="mt-2 text-xl font-semibold">{xp} XP</div>
            </div>
            <div className="rounded-2xl border border-border bg-background/50 p-5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Trophy className="h-3.5 w-3.5 text-primary" /> Достижения
              </div>
              <div className="mt-2 text-xl font-semibold">{unlocked}</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Готовность AI-компании</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-[color:var(--accent-glow)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Получено достижений</h3>
          <Link to="/leaderboard" className="text-sm text-primary hover:underline">
            Leaderboard
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {achievements.map((a) => {
            const open = live.loggedIn ? false : a.unlocked;
            return (
              <div
                key={a.id}
                className={[
                  "rounded-2xl border p-4 text-center",
                  open ? "border-primary/30 bg-primary/10" : "border-border bg-card opacity-45",
                ].join(" ")}
              >
                <div className="text-2xl">{a.emoji}</div>
                <div className="mt-2 text-sm font-medium">{a.title}</div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
