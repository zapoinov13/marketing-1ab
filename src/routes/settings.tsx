import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, Database, KeyRound, Mail, MessageCircle, Send } from "lucide-react";
import {
  isSupabaseConfigured,
  SUPABASE_URL,
  supabase,
} from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/settings")({
  component: Settings,
});

function Settings() {
  const { user, profile, updateProfile } = useAuth();
  const [telegram, setTelegram] = useState(profile?.telegram || "@yuriy");
  const [whatsapp, setWhatsapp] = useState(profile?.phone || "+7 777 000 00 00");
  const [email, setEmail] = useState(user?.email || "yuriy@example.com");
  const [notifyLessons, setNotifyLessons] = useState(true);
  const [notifyHomework, setNotifyHomework] = useState(true);
  const [notifyCommunity, setNotifyCommunity] = useState(false);
  const [dbStatus, setDbStatus] = useState<"checking" | "ok" | "no-key" | "error" | "no-schema">(
    "checking",
  );
  const [dbDetail, setDbDetail] = useState("");
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    if (profile?.telegram) setTelegram(profile.telegram);
    if (profile?.phone) setWhatsapp(profile.phone);
    if (user?.email) setEmail(user.email);
  }, [profile, user]);

  useEffect(() => {
    let cancelled = false;
    async function ping() {
      if (!isSupabaseConfigured || !supabase) {
        if (!cancelled) {
          setDbStatus("no-key");
          setDbDetail("Нет VITE_SUPABASE_ANON_KEY в .env.local");
        }
        return;
      }
      try {
        const { error } = await supabase.from("profiles").select("id").limit(1);
        const code = (error as { code?: string } | null)?.code;
        const msg = error?.message ?? "";
        if (!error) {
          if (!cancelled) {
            setDbStatus("ok");
            setDbDetail("Подключено · таблица profiles есть");
          }
          return;
        }
        if (
          code === "PGRST205" ||
          msg.toLowerCase().includes("schema cache") ||
          msg.toLowerCase().includes("does not exist")
        ) {
          if (!cancelled) {
            setDbStatus("no-schema");
            setDbDetail("Ключ ок, но схема ещё не применена — запусти SQL миграцию");
          }
          return;
        }
        if (!cancelled) {
          setDbStatus("error");
          setDbDetail(msg || "Ошибка подключения");
        }
      } catch (e) {
        if (!cancelled) {
          setDbStatus("error");
          setDbDetail(e instanceof Error ? e.message : "Ошибка сети");
        }
      }
    }
    void ping();
    return () => {
      cancelled = true;
    };
  }, []);

  async function saveContacts() {
    setSaveMsg("");
    if (!user) {
      setSaveMsg("Сначала войди в аккаунт");
      return;
    }
    const res = await updateProfile({
      telegram: telegram.trim() || null,
      phone: whatsapp.trim() || null,
    });
    setSaveMsg(res.error ? res.error : "Сохранено в Supabase");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">Settings</div>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Настройки</h1>
      <p className="mt-2 text-muted-foreground">
        Контакты, уведомления, пароль и статус подключения к Supabase.
      </p>

      <section className="mt-8 rounded-3xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Database className="h-4 w-4 text-primary" /> Supabase
        </div>
        <div className="mt-3 space-y-2 text-sm">
          <div className="text-muted-foreground">
            Project:{" "}
            <code className="text-foreground">{SUPABASE_URL}</code>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={[
                "inline-flex h-2 w-2 rounded-full",
                dbStatus === "ok"
                  ? "bg-emerald-400"
                  : dbStatus === "checking" || dbStatus === "no-schema"
                    ? "bg-yellow-400"
                    : "bg-red-400",
              ].join(" ")}
            />
            <span>
              {dbStatus === "checking" && "Проверяю…"}
              {dbStatus === "ok" && "Подключено"}
              {dbStatus === "no-schema" && "Нужна миграция"}
              {dbStatus === "no-key" && "Ключ не задан"}
              {dbStatus === "error" && "Ошибка"}
            </span>
          </div>
          {dbDetail && <div className="text-xs text-muted-foreground">{dbDetail}</div>}
          {user && (
            <div className="text-xs text-muted-foreground">Сессия: {user.email}</div>
          )}
        </div>
      </section>

      <div className="mt-4 space-y-4">
        <section className="rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Send className="h-4 w-4 text-primary" /> Telegram
          </div>
          <input
            value={telegram}
            onChange={(e) => setTelegram(e.target.value)}
            className="mt-3 h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm outline-none focus:border-primary/50"
          />
        </section>

        <section className="rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-sm font-medium">
            <MessageCircle className="h-4 w-4 text-primary" /> WhatsApp
          </div>
          <input
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="mt-3 h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm outline-none focus:border-primary/50"
          />
        </section>

        <section className="rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Mail className="h-4 w-4 text-primary" /> Email
          </div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled
            className="mt-3 h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm outline-none opacity-70"
          />
          <button
            type="button"
            onClick={() => void saveContacts()}
            className="mt-4 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Сохранить контакты
          </button>
          {saveMsg && <div className="mt-2 text-xs text-muted-foreground">{saveMsg}</div>}
        </section>

        <section className="rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Bell className="h-4 w-4 text-primary" /> Уведомления
          </div>
          <div className="mt-4 space-y-3">
            <Toggle
              label="Напоминания об уроках"
              checked={notifyLessons}
              onChange={setNotifyLessons}
            />
            <Toggle
              label="Дедлайны домашних заданий"
              checked={notifyHomework}
              onChange={setNotifyHomework}
            />
            <Toggle
              label="Активность сообщества"
              checked={notifyCommunity}
              onChange={setNotifyCommunity}
            />
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-sm font-medium">
            <KeyRound className="h-4 w-4 text-primary" /> Пароль
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              type="password"
              placeholder="Новый пароль"
              className="h-11 rounded-xl border border-border bg-background/50 px-4 text-sm outline-none focus:border-primary/50"
            />
            <input
              type="password"
              placeholder="Повтори пароль"
              className="h-11 rounded-xl border border-border bg-background/50 px-4 text-sm outline-none focus:border-primary/50"
            />
          </div>
          <button
            type="button"
            className="mt-4 rounded-xl border border-border px-4 py-2.5 text-sm text-muted-foreground"
            disabled
          >
            Смена пароля — скоро
          </button>
        </section>
      </div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-xl border border-border bg-background/50 px-4 py-3 text-left text-sm"
    >
      <span>{label}</span>
      <span
        className={[
          "relative h-6 w-11 rounded-full transition-colors",
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
