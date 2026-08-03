import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout } from "@/components/auth/AuthLayout";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Регистрация - AI Marketing Lab by MarkVision" },
      {
        name: "description",
        content:
          "Создайте аккаунт AI Marketing Lab: уроки, AI-сотрудники, практика и прогресс вашей AI-компании.",
      },
      { property: "og:title", content: "Регистрация - AI Marketing Lab" },
      {
        property: "og:description",
        content:
          "Заведите аккаунт и начните собирать свою AI-компанию шаг за шагом.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { signUp, configured, user } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    void navigate({ to: "/" });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    const res = await signUp({
      email: email.trim(),
      password,
      fullName: fullName.trim() || "Ученик",
      company: company.trim() || undefined,
    });
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    if (res.needsConfirm) {
      setInfo("Проверь почту и подтверди email - потом войди.");
      return;
    }
    void navigate({ to: "/" });
  }

  return (
    <AuthLayout
      eyebrow="Новый аккаунт"
      title="Регистрация"
      description="Заполните форму - и платформа начнёт вести ваш прогресс: этапы, XP, домашние задания и AI-сотрудников вашей компании."
      footer={
        <>
          Уже есть аккаунт?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Войти
          </Link>
        </>
      }
    >
      {!configured && (
        <div className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-200">
          Ключи бэкенда не загружены - регистрация временно недоступна.
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <input
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Имя"
          autoComplete="name"
          className="h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm outline-none focus:border-primary/50"
        />
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Компания (необязательно)"
          autoComplete="organization"
          className="h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm outline-none focus:border-primary/50"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoComplete="email"
          className="h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm outline-none focus:border-primary/50"
        />
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль (мин. 6 символов)"
          autoComplete="new-password"
          className="h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm outline-none focus:border-primary/50"
        />
        {error && <div className="text-sm text-red-400">{error}</div>}
        {info && <div className="text-sm text-emerald-400">{info}</div>}
        <button
          type="submit"
          disabled={loading || !configured}
          className="h-11 w-full rounded-xl bg-primary text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {loading ? "Создаю…" : "Создать аккаунт"}
        </button>
      </form>
    </AuthLayout>
  );
}
