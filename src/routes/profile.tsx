import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  Building2,
  Camera,
  CheckCircle2,
  Flame,
  LogOut,
  Medal,
  Phone,
  Save,
  Send,
  Settings,
  Sparkles,
  Trophy,
  User,
} from "lucide-react";
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
    setFullName(
      profile?.full_name || live.displayName || (user ? "" : mockUser.name),
    );
    setCompany(profile?.company || (user ? "" : mockUser.company));
    setPhone(profile?.phone || (user ? "" : mockUser.phone));
    setTelegram(profile?.telegram || (user ? "" : mockUser.telegram));
    setAvatarUrl(profile?.avatar_url || null);
  }, [profile, live.displayName, user]);

  const level = live.loggedIn ? live.level : mockUser.level;
  const xp = live.loggedIn ? live.xp : mockUser.xp;
  const progress = live.loggedIn
    ? (live.companyProgress ?? 0)
    : mockUser.progress;
  const unlockedCount = live.loggedIn
    ? Math.min(live.tasksDone, achievements.length)
    : achievements.filter((a) => a.unlocked).length;
  const initial = (fullName || "Ю").trim().charAt(0).toUpperCase();
  const tasksDone = live.loggedIn ? live.tasksDone : mockUser.tasksDone;
  const tasksTotal = live.loggedIn ? live.tasksTotal : mockUser.tasksTotal;

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
    else
      setMsg(
        user ? "Данные сохранены в Supabase" : "Данные сохранены локально",
      );
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      {/* HEADER */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card">
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" />
        <div className="pointer-events-none absolute -right-16 -top-12 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/4 h-40 w-40 rounded-full bg-[color:var(--accent-glow)]/15 blur-3xl" />
        <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <User className="h-3.5 w-3.5 text-primary" /> Profile
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Твой профиль
            </h1>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Фото, контакты и прогресс AI-компании. Данные сохраняются в аккаунте.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div
              className={[
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs",
                live.loggedIn
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border-border bg-background/50 text-muted-foreground",
              ].join(" ")}
            >
              {live.loggedIn ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" /> Синхрон с Supabase
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" /> Локальный режим
                </>
              )}
            </div>
            {ready &&
              (user ? (
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/50 px-4 py-2.5 text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" /> Выйти
                </button>
              ) : (
                <Link
                  to="/login"
                  className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
                >
                  Войти
                </Link>
              ))}
          </div>
        </div>
      </div>

      {!live.loggedIn && (
        <div className="mt-5 rounded-2xl border border-border bg-card/80 px-4 py-3 text-sm text-muted-foreground">
          Можно менять фото и данные локально.{" "}
          <Link to="/login" className="text-primary hover:underline">
            Войди
          </Link>
          , чтобы синхронизировать с Supabase.
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5">
          {/* IDENTITY */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-3xl border border-border bg-card"
          >
            <div className="relative h-28 bg-gradient-to-r from-primary/35 via-primary/10 to-transparent">
              <div className="pointer-events-none absolute inset-0 grid-bg opacity-35" />
            </div>
            <div className="relative px-5 pb-6 sm:px-6">
              <div className="-mt-12 flex flex-wrap items-end gap-5">
                <div className="relative">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary to-[color:var(--accent-glow)] text-3xl font-semibold text-primary-foreground shadow-xl">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={fullName}
                        className="h-full w-full object-cover"
                      />
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
                <div className="min-w-0 pb-1">
                  <h2 className="truncate text-2xl font-semibold tracking-tight">
                    {fullName || "Ученик"}
                  </h2>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs text-primary">
                      {level}
                    </span>
                    {company && <span>{company}</span>}
                  </div>
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileRef.current?.click()}
                    className="mt-2 text-sm text-primary hover:underline disabled:opacity-60"
                  >
                    {uploading ? "Загружаю…" : "Загрузить своё фото"}
                  </button>
                  {user?.email && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {user.email}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <MiniStat
                  icon={<Flame className="h-3.5 w-3.5 text-primary" />}
                  label="Level"
                  value={String(level)}
                />
                <MiniStat label="Опыт" value={`${xp} XP`} />
                <MiniStat
                  icon={<Trophy className="h-3.5 w-3.5 text-primary" />}
                  label="Достижения"
                  value={`${unlockedCount}/${achievements.length}`}
                />
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Готовность AI-компании
                  </span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-[color:var(--accent-glow)]"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <div className="mt-2 text-[11px] text-muted-foreground">
                  Этапов пройдено: {tasksDone}/{tasksTotal}
                </div>
              </div>
            </div>
          </motion.div>

          {/* FORM */}
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            onSubmit={onSave}
            className="rounded-3xl border border-border bg-card p-5 sm:p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold tracking-tight">Данные</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Имя и контакты для связи и рейтинга
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Имя" icon={<User className="h-3.5 w-3.5" />}>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Как тебя зовут"
                  className="h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm outline-none focus:border-primary/50"
                />
              </Field>
              <Field
                label="Компания"
                icon={<Building2 className="h-3.5 w-3.5" />}
              >
                <input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Название бизнеса"
                  className="h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm outline-none focus:border-primary/50"
                />
              </Field>
              <Field
                label="Телефон / WhatsApp"
                icon={<Phone className="h-3.5 w-3.5" />}
              >
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 …"
                  className="h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm outline-none focus:border-primary/50"
                />
              </Field>
              <Field label="Telegram" icon={<Send className="h-3.5 w-3.5" />}>
                <input
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  placeholder="@username"
                  className="h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm outline-none focus:border-primary/50"
                />
              </Field>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {saving ? "Сохраняю…" : "Сохранить данные"}
              </button>
              {msg && (
                <span className="inline-flex items-center gap-1.5 text-sm text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {msg}
                </span>
              )}
              {err && <span className="text-sm text-red-400">{err}</span>}
            </div>
          </motion.form>

          {/* ACHIEVEMENTS */}
          <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold tracking-tight">
                  Достижения
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Открыто {unlockedCount} из {achievements.length}
                </p>
              </div>
              <Link
                to="/leaderboard"
                className="text-sm text-primary hover:underline"
              >
                Leaderboard →
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {achievements.map((a, i) => {
                const open = live.loggedIn
                  ? i < unlockedCount
                  : a.unlocked;
                return (
                  <div
                    key={a.id}
                    className={[
                      "flex items-center gap-3 rounded-2xl border px-3.5 py-3",
                      open
                        ? "border-primary/25 bg-primary/10"
                        : "border-border bg-background/40 opacity-55",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "flex h-9 w-9 items-center justify-center rounded-xl",
                        open
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground",
                      ].join(" ")}
                    >
                      <Medal className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {a.title}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {open ? "Открыто" : "Закрыто"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-primary/30 bg-primary/10 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Flame className="h-4 w-4 text-primary" /> Твой статус
            </div>
            <div className="mt-4 space-y-3">
              <StatusRow label="Роль" value={String(level)} />
              <StatusRow label="XP" value={String(xp)} />
              <StatusRow label="Готовность" value={`${progress}%`} />
              <StatusRow
                label="Этапы"
                value={`${tasksDone}/${tasksTotal}`}
              />
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-background/50">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <Link
              to="/mission-control"
              className="mt-4 inline-flex text-sm text-primary hover:underline"
            >
              Открыть Mission Control →
            </Link>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5">
            <div className="text-sm font-semibold">Быстрые ссылки</div>
            <div className="mt-3 space-y-2">
              <QuickLink to="/leaderboard" label="Leaderboard" icon={Trophy} />
              <QuickLink to="/settings" label="Настройки" icon={Settings} />
              <QuickLink to="/" label="Dashboard" icon={Sparkles} />
            </div>
          </div>

          {!user && (
            <div className="rounded-3xl border border-border bg-card p-5">
              <div className="text-sm font-semibold">Сохрани прогресс</div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Войди в аккаунт — профиль, этапы и фото будут в облаке.
              </p>
              <Link
                to="/signup"
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
              >
                Создать аккаунт
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background/50 px-3 py-3">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 truncate text-sm font-semibold sm:text-base">
        {value}
      </div>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function QuickLink({
  to,
  label,
  icon: Icon,
}: {
  to: "/leaderboard" | "/settings" | "/";
  label: string;
  icon: typeof Trophy;
}) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded-xl border border-border bg-background/40 px-3 py-2.5 text-sm hover:border-primary/35"
    >
      {label}
      <Icon className="h-3.5 w-3.5 text-primary" />
    </Link>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </span>
      {children}
    </label>
  );
}
