import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/integrations/supabase/types";
import { compressImage } from "@/lib/image";

const DEMO_AVATAR_KEY = "aml-demo-avatar";
const DEMO_PROFILE_KEY = "aml-demo-profile";

type AuthContextValue = {
  ready: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  configured: boolean;
  refreshProfile: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (input: {
    email: string;
    password: string;
    fullName: string;
    company?: string;
  }) => Promise<{ error?: string; needsConfirm?: boolean }>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<Profile>) => Promise<{ error?: string }>;
  uploadAvatar: (file: File) => Promise<{ error?: string; url?: string }>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function loadDemoProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(DEMO_PROFILE_KEY);
    const avatar = localStorage.getItem(DEMO_AVATAR_KEY);
    if (!raw && !avatar) return null;
    const data = raw ? (JSON.parse(raw) as Partial<Profile>) : {};
    return {
      id: "demo",
      full_name: data.full_name || "",
      company: data.company ?? null,
      phone: data.phone ?? null,
      telegram: data.telegram ?? null,
      level: data.level || "Builder",
      xp: data.xp ?? 0,
      progress: data.progress ?? 0,
      avatar_url: avatar || data.avatar_url || null,
      is_admin: Boolean(data.is_admin),
      created_at: data.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const loadProfile = useCallback(async (userId: string) => {
    if (!supabase) {
      setProfile(null);
      return;
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (error) {
      console.warn("[auth] profile load:", error.message);
      setProfile(null);
      return;
    }
    setProfile(data);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user?.id) await loadProfile(session.user.id);
  }, [loadProfile, session?.user?.id]);

  useEffect(() => {
    if (!supabase) {
      setProfile(loadDemoProfile());
      setReady(true);
      return;
    }

    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user) void loadProfile(data.session.user.id);
      else setProfile(loadDemoProfile());
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (next?.user) void loadProfile(next.user.id);
      else setProfile(loadDemoProfile());
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const updateProfile = useCallback(
    async (patch: Partial<Profile>) => {
      if (!supabase || !session?.user) {
        try {
          const prev = JSON.parse(localStorage.getItem(DEMO_PROFILE_KEY) || "{}") as Record<
            string,
            unknown
          >;
          const next = { ...prev, ...patch };
          localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(next));
          if (typeof patch.avatar_url === "string") {
            localStorage.setItem(DEMO_AVATAR_KEY, patch.avatar_url);
          }
          setProfile((p) =>
            ({
              id: "demo",
              full_name: "",
              company: null,
              phone: null,
              telegram: null,
              level: "Builder",
              xp: 0,
              progress: 0,
              avatar_url: localStorage.getItem(DEMO_AVATAR_KEY),
              is_admin: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              ...(p ?? {}),
              ...next,
            }) as Profile,
          );
          return {};
        } catch {
          return { error: "Не удалось сохранить локально" };
        }
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          ...patch,
          updated_at: new Date().toISOString(),
        } as never)
        .eq("id", session.user.id);
      if (error) return { error: error.message };
      await loadProfile(session.user.id);
      return {};
    },
    [session?.user, loadProfile],
  );

  const uploadAvatar = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        return { error: "Выбери файл изображения" };
      }
      if (file.size > 8 * 1024 * 1024) {
        return { error: "Фото больше 8 МБ — сожми или выбери другое" };
      }

      let blob: Blob;
      let dataUrl: string;
      try {
        ({ blob, dataUrl } = await compressImage(file));
      } catch (e) {
        return { error: e instanceof Error ? e.message : "Ошибка обработки фото" };
      }

      if (!supabase || !session?.user) {
        localStorage.setItem(DEMO_AVATAR_KEY, dataUrl);
        const res = await updateProfile({ avatar_url: dataUrl });
        if (res.error) return res;
        return { url: dataUrl };
      }

      const path = `${session.user.id}/avatar.jpg`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, blob, { upsert: true, contentType: "image/jpeg" });

      if (!upErr) {
        const { data } = supabase.storage.from("avatars").getPublicUrl(path);
        const url = `${data.publicUrl}?t=${Date.now()}`;
        const saved = await updateProfile({ avatar_url: url });
        if (saved.error) return saved;
        return { url };
      }

      if (dataUrl.length > 900_000) {
        return {
          error:
            "Storage bucket не настроен. Запусти SQL миграцию avatars или выбери фото поменьше.",
        };
      }

      const saved = await updateProfile({ avatar_url: dataUrl });
      if (saved.error) return { error: upErr.message || saved.error };
      return { url: dataUrl };
    },
    [session?.user, updateProfile],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      session,
      user: session?.user ?? null,
      profile,
      configured: isSupabaseConfigured,
      refreshProfile,
      async signIn(email, password) {
        if (!supabase) return { error: "Supabase не настроен" };
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return error ? { error: error.message } : {};
      },
      async signUp({ email, password, fullName, company }) {
        if (!supabase) return { error: "Supabase не настроен" };
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, company: company ?? null },
          },
        });
        if (error) return { error: error.message };
        return { needsConfirm: !data.session };
      },
      async signOut() {
        if (!supabase) return;
        await supabase.auth.signOut();
        setProfile(loadDemoProfile());
      },
      updateProfile,
      uploadAvatar,
    }),
    [ready, session, profile, refreshProfile, updateProfile, uploadAvatar],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
