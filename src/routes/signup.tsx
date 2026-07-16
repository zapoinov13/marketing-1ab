import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import logoUrl from "@/assets/markvision-logo.png";

export const Route = createFileRoute("/signup")({
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
      setInfo("Проверь почту и подтверди email — потом войди.");
      return;
    }
    void navigate({ to: "/" });
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8">
        <img
          src={logoUrl}
          alt="MarkVision AI"
          className="mx-auto h-24 w-auto object-contain"
          width={160}
          height={130}
        />
        <div className="mt-4 text-center text-xs uppercase tracking-widest text-muted-foreground">
          AI Marketing Lab
        </div>
        <h1 className="mt-2 text-center text-3xl font-semibold tracking-tight">Регистрация</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Создай аккаунт и начни строить свою AI-компанию.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Имя"
            className="h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm outline-none focus:border-primary/50"
          />
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Компания (необязательно)"
            className="h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm outline-none focus:border-primary/50"
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="h-11 w-full rounded-xl border border-border bg-background/50 px-4 text-sm outline-none focus:border-primary/50"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль (мин. 6 символов)"
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

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Уже есть аккаунт?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
