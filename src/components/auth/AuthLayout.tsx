import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BookOpen, Bot, ClipboardList, ShieldCheck, Trophy, Users } from "lucide-react";
import type { ReactNode } from "react";
import logoUrl from "@/assets/markvision-logo.png";

const features = [
  {
    icon: Bot,
    title: "AI Mission Control",
    text: "Каждый урок - это AI-сотрудник, каждый этап - отдел вашей компании.",
  },
  {
    icon: BookOpen,
    title: "Уроки и документация",
    text: "Видео, конспекты, промпты и материалы собраны в одном месте.",
  },
  {
    icon: ClipboardList,
    title: "Домашние задания",
    text: "Практика с дедлайнами и проверкой куратора - навык, а не теория.",
  },
  {
    icon: Trophy,
    title: "Прогресс и XP",
    text: "Уровни, достижения и лидерборд показывают, где вы сейчас.",
  },
];

export function AuthLayout({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-16">
      {/* Описание платформы */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="order-2 lg:order-1"
      >
        <Link to="/" className="inline-flex items-center gap-3">
          <img
            src={logoUrl}
            alt="MarkVision AI"
            className="h-12 w-auto object-contain"
            width={80}
            height={65}
          />
          <span className="text-sm font-medium tracking-tight text-foreground">
            MarkVision AI
          </span>
        </Link>

        <p className="mt-8 text-xs uppercase tracking-widest text-muted-foreground">
          AI Marketing Lab
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Операционная система вашего AI-маркетинга
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
          AI Marketing Lab - обучающая платформа, где вы собираете свою
          AI-компанию: проходите этапы, нанимаете AI-сотрудников, выполняете
          практику и видите, как растёт результат. Аккаунт нужен, чтобы
          сохранять прогресс, XP и домашние задания на всех устройствах.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-card/60 p-4"
            >
              <f.icon className="h-5 w-5 text-primary" />
              <div className="mt-3 text-sm font-medium">{f.title}</div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {f.text}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-primary" /> Данные и прогресс
            защищены
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-4 w-4 text-primary" /> Доступ к сообществу
            и куратору
          </span>
        </div>
      </motion.section>

      {/* Форма */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="order-1 lg:order-2"
      >
        <div className="w-full rounded-3xl border border-border bg-card p-6 sm:p-8">
          <div className="text-center text-xs uppercase tracking-widest text-muted-foreground">
            {eyebrow}
          </div>
          <h1 className="mt-2 text-center text-3xl font-semibold tracking-tight">
            {title}
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-center text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
          {children}
          <div className="mt-4 text-center text-sm text-muted-foreground">{footer}</div>
        </div>
      </motion.section>
    </div>
  );
}
