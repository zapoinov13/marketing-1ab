import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  CheckCircle2,
  Copy,
  Database,
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  Mail,
  MessageCircle,
  RefreshCw,
  Save,
  Send,
  Settings as SettingsIcon,
  Shield,
  Trash2,
  User,
} from "lucide-react";
import {
  isSupabaseConfigured,
  SUPABASE_URL,
  supabase,
} from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/settings")({
  component: Settings,
});

const NOTIFY_KEY = "aml-notify-prefs";
const DEMO_AVATAR_KEY = "aml-demo-avatar";
const DEMO_PROFILE_KEY = "aml-demo-profile";

type NotifyPrefs = {
  lessons: boolean;
  homework: boolean;
  community: boolean;
  digests: boolean;
};

const defaultNotify: NotifyPrefs = {
  lessons: true,
  homework: true,
  community: false,
  digests: true,
};

const sections = [
  { id: "contacts", label: "Контакты", icon: Send },
  { id: "notify", label: "Уведомления", icon: Bell },
  { id: "security", label: "Безопасность", icon: KeyRound },
  { id: "system", label: "Система", icon: Database },
] as const;

type SectionId = (typeof sections)[number]["id"];

function loadNotify(): NotifyPrefs {
  try {
    const raw = localStorage.getItem(NOTIFY_KEY);
    if (!raw) return defaultNotify;
    return { ...defaultNotify, ...(JSON.parse(raw) as Partial<NotifyPrefs>) };
  } catch {
    return defaultNotify;
  }
}

function Settings() {
  const {
    user,
    profile,
    updateProfile,
    updatePassword,
    signOut,
    ready,
  } = useAuth();

  const [tab, setTab] = useState<SectionId>("contacts");
  const [telegram, setTelegram] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [notify, setNotify] = useState<NotifyPrefs>(defaultNotify);
  const [notifySaved, setNotifySaved] = useState(false);

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [passSaving, setPassSaving] = useState(false);
  const [passMsg, setPassMsg] = useState("");
  const [passErr, setPassErr] = useState("");

  const [dbStatus, setDbStatus] = useState<
    "checking" | "ok" | "no-key" | "error" | "no-schema"
  >("checking");
  const [dbDetail, setDbDetail] = useState("");
  const [contactSaving, setContactSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saveErr, setSaveErr] = useState("");
  const [copied, setCopied] = useState(false);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    setTelegram(profile?.telegram || "");
    setWhatsapp(profile?.phone || "");
    setEmail(user?.email || "");
  }, [profile, user]);

  useEffect(() => {
    setNotify(loadNotify());
  }, []);

  const pingDb = useCallback(async () => {
    setDbStatus("checking");
    setDbDetail("");
    if (!isSupabaseConfigured || !supabase) {
      setDbStatus("no-key");
      setDbDetail("Нет VITE_SUPABASE_ANON_KEY в .env.local");
      return;
    }
    try {
      const { error } = await supabase.from("profiles").select("id").limit(1);
      const code = (error as { code?: string } | null)?.code;
      const msg = error?.message ?? "";
      if (!error) {
        setDbStatus("ok");
        setDbDetail("Подключено · таблица profiles доступна");
        return;
      }
      if (
        code === "PGRST205" ||
        msg.toLowerCase().includes("schema cache") ||
        msg.toLowerCase().includes("does not exist")
      ) {
        setDbStatus("no-schema");
        setDbDetail("Ключ ок, но схема ещё не применена — запусти SQL миграцию");
        return;
      }
      setDbStatus("error");
      setDbDetail(msg || "Ошибка подключения");
    } catch (e) {
      setDbStatus("error");
      setDbDetail(e instanceof Error ? e.message : "Ошибка сети");
    }
  }, []);

  useEffect(() => {
    void pingDb();
  }, [pingDb]);

  async function saveContacts() {
    setSaveMsg("");
    setSaveErr("");
    setContactSaving(true);
    const res = await updateProfile({
      telegram: telegram.trim() || null,
      phone: whatsapp.trim() || null,
    });
    setContactSaving(false);
    if (res.error) setSaveErr(res.error);
    else
      setSaveMsg(
        user ? "Контакты сохранены в Supabase" : "Контакты сохранены локально",
      );
  }

  function saveNotify() {
    localStorage.setItem(NOTIFY_KEY, JSON.stringify(notify));
    setNotifySaved(true);
    setTimeout(() => setNotifySaved(false), 2000);
  }

  async function changePassword() {
    setPassMsg("");
    setPassErr("");
    if (password !== password2) {
      setPassErr("Пароли не совпадают");
      return;
    }
    setPassSaving(true);
    const res = await updatePassword(password);
    setPassSaving(false);
    if (res.error) {
      setPassErr(res.error);
      return;
    }
    setPassMsg("Пароль обновлён");
    setPassword("");
    setPassword2("");
  }

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(SUPABASE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  function clearLocalData() {
    localStorage.removeItem(DEMO_AVATAR_KEY);
    localStorage.removeItem(DEMO_PROFILE_KEY);
    localStorage.removeItem(NOTIFY_KEY);
    setNotify(defaultNotify);
    setCleared(true);
    setTimeout(() => setCleared(false), 2500);
  }

  const statusTone =
    dbStatus === "ok"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
      : dbStatus === "checking" || dbStatus === "no-schema"
        ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-200"
        : "border-red-500/30 bg-red-500/10 text-red-300";

  const statusLabel =
    dbStatus === "checking"
      ? "Проверяю…"
      : dbStatus === "ok"
        ? "Подключено"
        : dbStatus === "no-schema"
          ? "Нужна миграция"
          : dbStatus === "no-key"
            ? "Ключ не задан"
            : "Ошибка";

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
              <SettingsIcon className="h-3.5 w-3.5 text-primary" /> Settings
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Настройки
            </h1>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Контакты, уведомления, пароль и статус подключения к базе.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div
              className={[
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs",
                statusTone,
              ].join(" ")}
            >
              <span
                className={[
                  "h-1.5 w-1.5 rounded-full",
                  dbStatus === "ok"
                    ? "bg-emerald-400"
                    : dbStatus === "checking" || dbStatus === "no-schema"
                      ? "bg-yellow-400"
                      : "bg-red-400",
                ].join(" ")}
              />
              {statusLabel}
            </div>
            {ready && user && (
              <button
                type="button"
                onClick={() => void signOut()}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/50 px-4 py-2.5 text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground"
              >
                <LogOut className="h-4 w-4" /> Выйти
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setTab(s.id)}
              className={[
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm transition-colors",
                tab === s.id
                  ? "border-primary/40 bg-primary/10 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              <Icon className="h-3.5 w-3.5" />
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5">
          {/* CONTACTS */}
          {tab === "contacts" && (
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-border bg-card p-5 sm:p-6"
            >
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-semibold tracking-tight">Контакты</h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Используются в профиле и для связи куратора.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Telegram" icon={<Send className="h-3.5 w-3.5" />}>
                  <input
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    placeholder="@username"
                    className="h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm outline-none focus:border-primary/50"
                  />
                </Field>
                <Field
                  label="WhatsApp / телефон"
                  icon={<MessageCircle className="h-3.5 w-3.5" />}
                >
                  <input
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+7 …"
                    className="h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm outline-none focus:border-primary/50"
                  />
                </Field>
                <Field label="Email" icon={<Mail className="h-3.5 w-3.5" />}>
                  <input
                    value={email}
                    disabled
                    placeholder="войди, чтобы увидеть email"
                    className="h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm opacity-70 outline-none"
                  />
                  <div className="mt-1.5 text-[11px] text-muted-foreground">
                    Email меняется только через поддержку / Auth
                  </div>
                </Field>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => void saveContacts()}
                  disabled={contactSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {contactSaving ? "Сохраняю…" : "Сохранить контакты"}
                </button>
                {saveMsg && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {saveMsg}
                  </span>
                )}
                {saveErr && <span className="text-sm text-red-400">{saveErr}</span>}
              </div>
            </motion.section>
          )}

          {/* NOTIFICATIONS */}
          {tab === "notify" && (
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-border bg-card p-5 sm:p-6"
            >
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-semibold tracking-tight">
                  Уведомления
                </h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Настройки сохраняются в этом браузере.
              </p>

              <div className="mt-5 space-y-3">
                <Toggle
                  label="Напоминания об уроках"
                  hint="Перед занятием и когда открывается новый этап"
                  checked={notify.lessons}
                  onChange={(v) => setNotify((n) => ({ ...n, lessons: v }))}
                />
                <Toggle
                  label="Дедлайны домашних заданий"
                  hint="За день и в день сдачи"
                  checked={notify.homework}
                  onChange={(v) => setNotify((n) => ({ ...n, homework: v }))}
                />
                <Toggle
                  label="Активность сообщества"
                  hint="Лайки, ответы и топ недели"
                  checked={notify.community}
                  onChange={(v) => setNotify((n) => ({ ...n, community: v }))}
                />
                <Toggle
                  label="Еженедельный дайджест"
                  hint="Прогресс компании и что сделать дальше"
                  checked={notify.digests}
                  onChange={(v) => setNotify((n) => ({ ...n, digests: v }))}
                />
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={saveNotify}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
                >
                  <Save className="h-4 w-4" /> Сохранить уведомления
                </button>
                {notifySaved && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Сохранено
                  </span>
                )}
              </div>
            </motion.section>
          )}

          {/* SECURITY */}
          {tab === "security" && (
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-border bg-card p-5 sm:p-6"
            >
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-semibold tracking-tight">
                  Безопасность
                </h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Смена пароля аккаунта через Supabase Auth.
              </p>

              {!user ? (
                <div className="mt-5 rounded-2xl border border-border bg-background/40 px-4 py-4 text-sm text-muted-foreground">
                  Чтобы менять пароль,{" "}
                  <Link to="/login" className="text-primary hover:underline">
                    войди в аккаунт
                  </Link>
                  .
                </div>
              ) : (
                <>
                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Новый пароль">
                      <div className="relative">
                        <input
                          type={showPass ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Минимум 6 символов"
                          className="h-11 w-full rounded-xl border border-border bg-background/50 px-4 pr-11 text-sm outline-none focus:border-primary/50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          aria-label={showPass ? "Скрыть" : "Показать"}
                        >
                          {showPass ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </Field>
                    <Field label="Повтори пароль">
                      <input
                        type={showPass ? "text" : "password"}
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        placeholder="Ещё раз"
                        className="h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm outline-none focus:border-primary/50"
                      />
                    </Field>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => void changePassword()}
                      disabled={passSaving || !password}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
                    >
                      <Shield className="h-4 w-4" />
                      {passSaving ? "Обновляю…" : "Сменить пароль"}
                    </button>
                    {passMsg && (
                      <span className="inline-flex items-center gap-1.5 text-sm text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {passMsg}
                      </span>
                    )}
                    {passErr && (
                      <span className="text-sm text-red-400">{passErr}</span>
                    )}
                  </div>
                </>
              )}
            </motion.section>
          )}

          {/* SYSTEM */}
          {tab === "system" && (
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-primary" />
                    <h2 className="text-lg font-semibold tracking-tight">
                      Supabase
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => void pingDb()}
                    className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm hover:border-primary/40"
                  >
                    <RefreshCw
                      className={[
                        "h-3.5 w-3.5",
                        dbStatus === "checking" ? "animate-spin" : "",
                      ].join(" ")}
                    />
                    Проверить
                  </button>
                </div>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="rounded-2xl border border-border bg-background/40 px-4 py-3">
                    <div className="text-[11px] text-muted-foreground">
                      Project URL
                    </div>
                    <div className="mt-1 flex items-start justify-between gap-2">
                      <code className="break-all text-xs text-foreground">
                        {SUPABASE_URL}
                      </code>
                      <button
                        type="button"
                        onClick={() => void copyUrl()}
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-primary hover:bg-primary/10"
                      >
                        <Copy className="h-3 w-3" />
                        {copied ? "Скопировано" : "Копировать"}
                      </button>
                    </div>
                  </div>

                  <div
                    className={[
                      "flex items-start gap-3 rounded-2xl border px-4 py-3",
                      statusTone,
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                        dbStatus === "ok"
                          ? "bg-emerald-400"
                          : dbStatus === "checking" || dbStatus === "no-schema"
                            ? "bg-yellow-400"
                            : "bg-red-400",
                      ].join(" ")}
                    />
                    <div>
                      <div className="font-medium">{statusLabel}</div>
                      {dbDetail && (
                        <div className="mt-0.5 text-xs opacity-80">{dbDetail}</div>
                      )}
                      {user && (
                        <div className="mt-1 text-xs opacity-70">
                          Сессия: {user.email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-primary" />
                  <h2 className="text-lg font-semibold tracking-tight">
                    Локальные данные
                  </h2>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Сбросить демо-профиль, аватар и настройки уведомлений в этом
                  браузере. Аккаунт в Supabase не затрагивается.
                </p>
                <button
                  type="button"
                  onClick={clearLocalData}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm text-muted-foreground hover:border-red-500/40 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                  Очистить локальные данные
                </button>
                {cleared && (
                  <div className="mt-2 text-sm text-emerald-400">
                    Локальные данные очищены
                  </div>
                )}
              </div>
            </motion.section>
          )}
        </div>

        {/* SIDEBAR */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-border bg-card p-5">
            <div className="text-sm font-semibold">Аккаунт</div>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-sm font-semibold text-primary">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (profile?.full_name || user?.email || "У")
                    .trim()
                    .charAt(0)
                    .toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">
                  {profile?.full_name || user?.email?.split("@")[0] || "Гость"}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {user?.email || "Локальный режим"}
                </div>
              </div>
            </div>
            <Link
              to="/profile"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background/40 px-3 py-2.5 text-sm hover:border-primary/35"
            >
              <User className="h-3.5 w-3.5 text-primary" /> Открыть профиль
            </Link>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5">
            <div className="text-sm font-semibold">Разделы</div>
            <ul className="mt-3 space-y-1.5">
              {sections.map((s) => {
                const Icon = s.icon;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => setTab(s.id)}
                      className={[
                        "flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                        tab === s.id
                          ? "bg-primary/10 text-foreground"
                          : "text-muted-foreground hover:bg-background/50 hover:text-foreground",
                      ].join(" ")}
                    >
                      <Icon className="h-3.5 w-3.5 text-primary" />
                      {s.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-3xl border border-primary/25 bg-primary/10 p-5">
            <div className="text-sm font-semibold">Подсказка</div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Контакты и пароль синхронизируются с Supabase. Уведомления пока
              хранятся только в браузере.
            </p>
          </div>
        </aside>
      </div>
    </div>
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
    <label className="block sm:col-span-1">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </span>
      {children}
    </label>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-border bg-background/50 px-4 py-3.5 text-left transition-colors hover:border-primary/30"
    >
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        {hint && (
          <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>
        )}
      </div>
      <span
        className={[
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-primary" : "bg-muted",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
            checked ? "left-5" : "left-0.5",
          ].join(" ")}
        />
      </span>
    </button>
  );
}
