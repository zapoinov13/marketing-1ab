import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout } from "@/components/auth/AuthLayout";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Вход - AI Marketing Lab by MarkVision" },
      {
        name: "description",
        content:
          "Войдите в AI Marketing Lab, чтобы продолжить обучение, сохранять прогресс, XP и домашние задания.",
      },
      { property: "og:title", content: "Вход - AI Marketing Lab" },
      {
        property: "og:description",
        content:
          "Личный кабинет платформы AI Marketing Lab: уроки, AI Mission Control, практика и прогресс.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { signIn, configured, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    void navigate({ to: "/" });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn(email.trim(), password);
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    void navigate({ to: "/" });
  }

  return (
    <AuthLayout
      eyebrow="Личный кабинет"
      title="Вход"
      description="Введите email и пароль, с которыми регистрировались. После входа откроются уроки, домашние задания и ваш прогресс AI-компании."
      footer={
        <>
          Нет аккаунта?{" "}
          <Link to="/signup" className="text-primary hover:underline">
            Зарегистрироваться
          </Link>
        </>
      }
    >
      {!configured && (
        <div className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-200">
          Ключи бэкенда не загружены - вход временно недоступен.
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <label className="block text-xs font-medium text-muted-foreground" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm outline-none focus:border-primary/50"
        />
        <label
          className="block pt-1 text-xs font-medium text-muted-foreground"
          htmlFor="password"
        >
          Пароль
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Минимум 6 символов"
          className="h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm outline-none focus:border-primary/50"
        />
        {error && <div className="text-sm text-red-400">{error}</div>}
        <button
          type="submit"
          disabled={loading || !configured}
          className="h-11 w-full rounded-xl bg-primary text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {loading ? "Вхожу…" : "Войти"}
        </button>
        <p className="text-center text-xs text-muted-foreground">
          Забыли пароль? Напишите куратору - доступ восстановим.
        </p>
      </form>
    </AuthLayout>
  );
}
