export type StageStatus = "done" | "active" | "locked" | "todo";
export type AgentStatus = "online" | "ready" | "locked";
export type HomeworkStatus = "active" | "done" | "overdue";
export type DocCategory =
  | "github"
  | "claude"
  | "supabase"
  | "lovable"
  | "n8n"
  | "vercel"
  | "hostinger"
  | "meta"
  | "google"
  | "openai";

export const user = {
  name: "Ученик",
  company: "",
  phone: "",
  telegram: "",
  level: "Builder",
  xp: 0,
  progress: 0,
  tasksDone: 0,
  tasksTotal: 8,
  achievementsCount: 0,
  avatarInitial: "У",
};

export const nextClass = {
  title: "Этап 1. Фундамент",
  countdown: "Старт",
  href: "/lessons/1",
};

export type MissionStage = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  status: StageStatus;
  progress: number;
  description: string;
  whatToDo: string[];
  videoTitle: string;
  docs: { title: string; href: string }[];
  homework: string;
  checklist: { id: string; text: string; done: boolean }[];
};

export const missionStages: MissionStage[] = [
  {
    id: "1",
    number: 1,
    title: "Фундамент",
    subtitle: "AI mindset и базовая инфраструктура",
    status: "active",
    progress: 0,
    description:
      "Закладываем фундамент AI-компании: аккаунты, инструменты, мышление и рабочий процесс.",
    whatToDo: [
      "Создать аккаунты Claude, GitHub, Lovable",
      "Настроить рабочее окружение",
      "Пройти урок по prompt engineering",
    ],
    videoTitle: "Фундамент AI-компании",
    docs: [
      { title: "Старт с Claude", href: "/docs" },
      { title: "GitHub для новичков", href: "/docs" },
    ],
    homework: "Оформить профиль и описать свою будущую AI-команду",
    checklist: [
      { id: "1a", text: "Аккаунты созданы", done: false },
      { id: "1b", text: "Первый промпт написан", done: false },
      { id: "1c", text: "Репозиторий создан", done: false },
    ],
  },
  {
    id: "2",
    number: 2,
    title: "AI Brain",
    subtitle: "Claude Code как мозг компании",
    status: "locked",
    progress: 0,
    description: "Подключаем AI Brain — Claude Code, правила, навыки и систему памяти.",
    whatToDo: [
      "Установить Claude Code",
      "Настроить CLAUDE.md и skills",
      "Сделать первый рабочий агентский сценарий",
    ],
    videoTitle: "AI Brain: Claude Code",
    docs: [
      { title: "Claude Code setup", href: "/docs" },
      { title: "Skills и memory", href: "/docs" },
    ],
    homework: "Собрать свой первый skill и проверить на реальной задаче",
    checklist: [
      { id: "2a", text: "Claude Code установлен", done: false },
      { id: "2b", text: "Первый skill готов", done: false },
      { id: "2c", text: "Правила проекта написаны", done: false },
    ],
  },
  {
    id: "3",
    number: 3,
    title: "Developer",
    subtitle: "Первый сайт и деплой",
    status: "locked",
    progress: 0,
    description: "Собираем сайт компании: дизайн, код, деплой на Vercel / Hostinger.",
    whatToDo: [
      "Собрать лендинг в Lovable",
      "Подключить домен",
      "Задеплоить production-версию",
    ],
    videoTitle: "Первый сайт AI-компании",
    docs: [
      { title: "Lovable → Vercel", href: "/docs" },
      { title: "Домены Hostinger", href: "/docs" },
    ],
    homework: "Опубликовать лендинг и прислать ссылку",
    checklist: [
      { id: "3a", text: "Макет готов", done: false },
      { id: "3b", text: "Сайт задеплоен", done: false },
      { id: "3c", text: "Домен подключен", done: false },
    ],
  },
  {
    id: "4",
    number: 4,
    title: "Marketing",
    subtitle: "AI-таргетолог и реклама",
    status: "locked",
    progress: 0,
    description: "Подключаем AI Targetologist: Meta Ads, офферы, креативы, аналитика.",
    whatToDo: [
      "Подключить Meta Business",
      "Собрать первый оффер",
      "Запустить тестовую кампанию",
    ],
    videoTitle: "AI-Таргетолог",
    docs: [
      { title: "Meta API", href: "/docs" },
      { title: "Офферы и креативы", href: "/docs" },
    ],
    homework: "Запустить первую рекламную кампанию",
    checklist: [
      { id: "4a", text: "Meta подключена", done: false },
      { id: "4b", text: "Оффер готов", done: false },
      { id: "4c", text: "Кампания запущена", done: false },
    ],
  },
  {
    id: "5",
    number: 5,
    title: "Content Factory",
    subtitle: "Контент-завод",
    status: "locked",
    progress: 0,
    description: "Строим контент-завод: рилсы, сценарии, генерация и публикация.",
    whatToDo: ["Собрать шаблоны сценариев", "Настроить контент-пайплайн", "Выпустить 5 единиц контента"],
    videoTitle: "Content Factory",
    docs: [{ title: "Шаблоны рилсов", href: "/docs" }],
    homework: "Запустить контент-пайплайн на неделю",
    checklist: [
      { id: "5a", text: "Шаблоны готовы", done: false },
      { id: "5b", text: "Пайплайн собран", done: false },
    ],
  },
  {
    id: "6",
    number: 6,
    title: "Reports",
    subtitle: "Аналитика и отчёты",
    status: "locked",
    progress: 0,
    description: "Автоматические отчёты: бюджет, CPL, заявки, ROI в понятном виде.",
    whatToDo: ["Подключить источники данных", "Собрать дашборд", "Настроить ежедневный отчёт"],
    videoTitle: "Автоотчёты",
    docs: [{ title: "Аналитика Meta + CRM", href: "/docs" }],
    homework: "Получить первый автоотчёт",
    checklist: [
      { id: "6a", text: "Источники подключены", done: false },
      { id: "6b", text: "Отчёт работает", done: false },
    ],
  },
  {
    id: "7",
    number: 7,
    title: "Platform",
    subtitle: "Единая платформа",
    status: "locked",
    progress: 0,
    description: "Собираем всё в одну платформу управления AI-компанией.",
    whatToDo: ["Связать модули", "Добавить роли", "Запустить внутренний кабинет"],
    videoTitle: "Платформа AI-компании",
    docs: [{ title: "Архитектура платформы", href: "/docs" }],
    homework: "Собрать рабочий кабинет",
    checklist: [{ id: "7a", text: "Модули связаны", done: false }],
  },
  {
    id: "8",
    number: 8,
    title: "Sales",
    subtitle: "Продажи и CRM",
    status: "locked",
    progress: 0,
    description: "Закрываем цикл: лиды → CRM → продажи → повторные продажи.",
    whatToDo: ["Подключить CRM", "Настроить SLA", "Автоматизировать follow-up"],
    videoTitle: "Sales Engine",
    docs: [{ title: "CRM + WhatsApp", href: "/docs" }],
    homework: "Провести первого клиента через воронку",
    checklist: [{ id: "8a", text: "CRM подключена", done: false }],
  },
];

export const companyBuild = [
  { key: "foundation", label: "Фундамент", icon: "🏗", status: "active" as const },
  { key: "brain", label: "AI Brain", icon: "🧠", status: "locked" as const },
  { key: "dev", label: "Developer", icon: "🌐", status: "locked" as const },
  { key: "marketing", label: "Marketing", icon: "📢", status: "locked" as const },
  { key: "content", label: "Content", icon: "🎨", status: "locked" as const },
  { key: "analytics", label: "Analytics", icon: "📊", status: "locked" as const },
  { key: "ceo", label: "CEO", icon: "👨‍💼", status: "locked" as const },
];

export type AiAgent = {
  id: string;
  name: string;
  emoji: string;
  status: AgentStatus;
  statusLabel: string;
  role: string;
};

export const aiTeam: AiAgent[] = [
  {
    id: "targetologist",
    name: "AI Targetologist",
    emoji: "🤖",
    status: "locked",
    statusLabel: "Locked",
    role: "Реклама и офферы",
  },
  {
    id: "content",
    name: "Content Factory",
    emoji: "🎨",
    status: "locked",
    statusLabel: "Locked",
    role: "Контент и креативы",
  },
  {
    id: "website",
    name: "Website Builder",
    emoji: "🌐",
    status: "locked",
    statusLabel: "Locked",
    role: "Сайты и лендинги",
  },
  {
    id: "analytics",
    name: "Analytics",
    emoji: "📊",
    status: "locked",
    statusLabel: "Locked",
    role: "Метрики и отчёты",
  },
  {
    id: "assistant",
    name: "Assistant",
    emoji: "📨",
    status: "locked",
    statusLabel: "Locked",
    role: "Помощник и напоминания",
  },
];

export type LessonDoc = {
  title: string;
  type: "pdf" | "doc" | "txt" | "link";
  href?: string;
};

export type LessonCard = {
  id: string;
  number: number;
  title: string;
  duration: string;
  description: string;
  about: string[];
  status: StageStatus;
  /** YouTube / Vimeo / Loom embed URL — пока пусто, вставим позже */
  videoEmbedUrl?: string;
  documents: LessonDoc[];
  links: { title: string; href: string }[];
};

export const lessons: LessonCard[] = [
  {
    id: "1",
    number: 1,
    title: "Фундамент",
    duration: "2ч 13мин",
    description: "AI mindset, аккаунты, первый промпт и рабочий процесс.",
    about: [
      "Зачем нужна AI-команда и как устроен курс.",
      "Какие аккаунты создать в первый день.",
      "Как писать первый рабочий промпт под свой бизнес.",
    ],
    status: "active",
    documents: [
      { title: "Чеклист старта.pdf", type: "pdf" },
      { title: "Список аккаунтов.md", type: "doc" },
      { title: "Шаблон первого промпта.txt", type: "txt" },
    ],
    links: [
      { title: "Claude", href: "https://claude.ai" },
      { title: "GitHub", href: "https://github.com" },
    ],
  },
  {
    id: "2",
    number: 2,
    title: "Claude Code",
    duration: "2ч 05мин",
    description: "Установка, skills, правила проекта и первый агентский сценарий.",
    about: [
      "Установка Claude Code и вход в проект.",
      "CLAUDE.md — правила и контекст бизнеса.",
      "Первый skill под повторяющуюся задачу.",
    ],
    status: "locked",
    documents: [
      { title: "Установка Claude Code.pdf", type: "pdf" },
      { title: "Пример CLAUDE.md", type: "doc" },
      { title: "Шаблон skill.md", type: "txt" },
    ],
    links: [
      { title: "Документация Claude Code", href: "https://docs.anthropic.com" },
    ],
  },
  {
    id: "3",
    number: 3,
    title: "Первый сайт",
    duration: "1ч 56мин",
    description: "Lovable, деплой, домен и публикация лендинга.",
    about: [
      "Сборка лендинга в Lovable.",
      "Деплой на Vercel и привязка домена.",
      "Что должно быть на первом экране сайта.",
    ],
    status: "locked",
    documents: [
      { title: "Бриф лендинга.pdf", type: "pdf" },
      { title: "Чеклист деплоя.md", type: "doc" },
      { title: "Структура блоков.txt", type: "txt" },
    ],
    links: [
      { title: "Lovable", href: "https://lovable.dev" },
      { title: "Vercel", href: "https://vercel.com" },
    ],
  },
  {
    id: "4",
    number: 4,
    title: "n8n",
    duration: "3ч",
    description: "Автоматизации, вебхуки и первые сценарии для бизнеса.",
    about: [
      "Что такое n8n и зачем он в AI-компании.",
      "Первый workflow: webhook → действие.",
      "Типичные ошибки и как их читать.",
    ],
    status: "todo",
    documents: [
      { title: "Карта автоматизаций.pdf", type: "pdf" },
      { title: "Шаблон workflow.json", type: "doc" },
    ],
    links: [{ title: "n8n docs", href: "https://docs.n8n.io" }],
  },
  {
    id: "5",
    number: 5,
    title: "Meta Ads",
    duration: "2ч 40мин",
    description: "Кабинеты, креативы, кампании и чтение метрик.",
    about: [
      "Подключение Business Manager и кабинета.",
      "Оффер, креатив и структура кампании.",
      "Как читать CPL и заявки без паники.",
    ],
    status: "locked",
    documents: [
      { title: "Чеклист Meta.pdf", type: "pdf" },
      { title: "Шаблон оффера.txt", type: "txt" },
    ],
    links: [{ title: "Meta Business", href: "https://business.facebook.com" }],
  },
  {
    id: "6",
    number: 6,
    title: "Content Factory",
    duration: "2ч 20мин",
    description: "Сценарии рилсов, генерация и контент-пайплайн.",
    about: [
      "Шаблоны сценариев под рилсы.",
      "Пайплайн: идея → ролик → публикация.",
      "Как держать ритм контента без выгорания.",
    ],
    status: "locked",
    documents: [
      { title: "24 шаблона рилсов.pdf", type: "pdf" },
      { title: "Контент-план на неделю.md", type: "doc" },
    ],
    links: [],
  },
  {
    id: "7",
    number: 7,
    title: "Аналитика",
    duration: "1ч 45мин",
    description: "Дашборды, CPL, ROI и ежедневные отчёты.",
    about: [
      "Какие метрики смотреть каждый день.",
      "Сбор отчёта для владельца бизнеса.",
      "Связка реклама → заявки → деньги.",
    ],
    status: "locked",
    documents: [
      { title: "Шаблон ежедневного отчёта.pdf", type: "pdf" },
    ],
    links: [],
  },
  {
    id: "8",
    number: 8,
    title: "AI Company",
    duration: "2ч 10мин",
    description: "Сборка всех модулей в единую AI-компанию.",
    about: [
      "Как связать сайт, рекламу, контент и CRM.",
      "Роли AI-команды и зоны ответственности.",
      "Финишный чеклист готовности компании.",
    ],
    status: "locked",
    documents: [
      { title: "Архитектура AI-компании.pdf", type: "pdf" },
      { title: "Финишный чеклист.md", type: "doc" },
    ],
    links: [],
  },
];

export function getLesson(id: string) {
  return lessons.find((l) => l.id === id) ?? lessons[0];
}

export function getStage(id: string) {
  return missionStages.find((s) => s.id === id) ?? missionStages[0];
}

export type DocArticle = {
  id: string;
  category: DocCategory;
  title: string;
  excerpt: string;
  body: string[];
};

export const docCategories: { id: DocCategory; label: string; emoji: string }[] = [
  { id: "github", label: "GitHub", emoji: "🐙" },
  { id: "claude", label: "Claude", emoji: "🧠" },
  { id: "supabase", label: "Supabase", emoji: "⚡" },
  { id: "lovable", label: "Lovable", emoji: "💜" },
  { id: "n8n", label: "n8n", emoji: "🔗" },
  { id: "vercel", label: "Vercel", emoji: "▲" },
  { id: "hostinger", label: "Hostinger", emoji: "🌐" },
  { id: "meta", label: "Meta", emoji: "📘" },
  { id: "google", label: "Google", emoji: "🔎" },
  { id: "openai", label: "OpenAI", emoji: "✨" },
];

export const docArticles: DocArticle[] = [
  {
    id: "meta-connect",
    category: "meta",
    title: "Как подключить Meta",
    excerpt: "Business Manager, токены и доступ к рекламному кабинету.",
    body: [
      "Зайди в Meta Business Suite и создай Business Manager, если его ещё нет.",
      "Добавь рекламный кабинет и страницу компании.",
      "Создай System User и сгенерируй токен с правами ads_management.",
      "Сохрани токен в безопасном месте — позже подключим его к автоматизациям.",
    ],
  },
  {
    id: "meta-api",
    category: "meta",
    title: "Как получить API",
    excerpt: "App, permissions и долгоживущий токен.",
    body: [
      "Создай приложение в developers.facebook.com.",
      "Добавь продукт Marketing API.",
      "Запроси нужные permissions и пройди App Review при необходимости.",
    ],
  },
  {
    id: "deploy-vercel",
    category: "vercel",
    title: "Как сделать Deploy",
    excerpt: "Публикация проекта с GitHub на Vercel за 5 минут.",
    body: [
      "Подключи репозиторий GitHub к Vercel.",
      "Выбери framework preset и нажми Deploy.",
      "Привяжи домен в Project Settings → Domains.",
    ],
  },
  {
    id: "telegram-connect",
    category: "n8n",
    title: "Как подключить Telegram",
    excerpt: "Бот, webhook и первый сценарий в n8n.",
    body: [
      "Создай бота через @BotFather и скопируй токен.",
      "В n8n добавь Telegram Trigger / Telegram node.",
      "Сохрани credentials и протестируй входящее сообщение.",
    ],
  },
  {
    id: "supabase-start",
    category: "supabase",
    title: "Как создать проект Supabase",
    excerpt: "База, таблицы и ключи для фронтенда.",
    body: [
      "Создай проект в Supabase Dashboard.",
      "Открой SQL Editor и создай таблицы профиля и прогресса.",
      "Скопируй Project URL и anon key для клиента.",
    ],
  },
  {
    id: "claude-setup",
    category: "claude",
    title: "Как настроить Claude Code",
    excerpt: "Установка, логин и первый CLAUDE.md.",
    body: [
      "Установи Claude Code CLI.",
      "Авторизуйся и открой папку проекта.",
      "Добавь CLAUDE.md с правилами и контекстом бизнеса.",
    ],
  },
  {
    id: "github-start",
    category: "github",
    title: "Как создать репозиторий",
    excerpt: "Первый push и структура ветки main.",
    body: [
      "Создай репозиторий на GitHub.",
      "Свяжи локальный проект через git remote add origin.",
      "Сделай первый commit и push в main.",
    ],
  },
  {
    id: "lovable-flow",
    category: "lovable",
    title: "Как работать в Lovable",
    excerpt: "Промпт → UI → синхронизация с GitHub.",
    body: [
      "Опиши экран простым языком.",
      "Итерируй дизайн через короткие правки.",
      "Синхронизируй проект с GitHub для деплоя.",
    ],
  },
  {
    id: "hostinger-domain",
    category: "hostinger",
    title: "Как подключить домен",
    excerpt: "DNS-записи и связь с Vercel / Hostinger.",
    body: [
      "Купи или выбери домен в Hostinger.",
      "Пропиши DNS-записи, которые даёт Vercel.",
      "Дождись обновления DNS и проверь HTTPS.",
    ],
  },
  {
    id: "google-ads",
    category: "google",
    title: "Как подключить Google Ads",
    excerpt: "Кабинет, конверсии и базовый трекинг.",
    body: [
      "Создай Google Ads аккаунт.",
      "Настрой конверсии и Google tag.",
      "Свяжи с сайтом и проверь события.",
    ],
  },
  {
    id: "openai-key",
    category: "openai",
    title: "Как получить OpenAI API Key",
    excerpt: "Ключ, лимиты и безопасное хранение.",
    body: [
      "Зайди в platform.openai.com → API keys.",
      "Создай ключ и сразу сохрани его.",
      "Не коммить ключ в Git — только env / secrets.",
    ],
  },
];

export type HomeworkTask = {
  id: string;
  stage: string;
  title: string;
  deadline: string;
  status: HomeworkStatus;
  description: string;
  videoTitle: string;
};

export const homeworkTasks: HomeworkTask[] = [
  {
    id: "hw-1",
    stage: "Этап 1",
    title: "Описать AI-команду",
    deadline: "Без срока",
    status: "active",
    description: "Опиши 5 ролей своей будущей AI-команды и задачи каждой.",
    videoTitle: "Архитектура AI-команды",
  },
  {
    id: "hw-2",
    stage: "Этап 1",
    title: "Создать GitHub репозиторий",
    deadline: "Без срока",
    status: "active",
    description: "Создай репозиторий курса и сделай первый push.",
    videoTitle: "GitHub за 15 минут",
  },
  {
    id: "hw-3",
    stage: "Этап 2",
    title: "Написать первый skill",
    deadline: "Без срока",
    status: "active",
    description: "Создай skill для Claude Code под одну повторяющуюся задачу бизнеса.",
    videoTitle: "Skills в Claude Code",
  },
  {
    id: "hw-4",
    stage: "Этап 2",
    title: "Настроить CLAUDE.md",
    deadline: "Без срока",
    status: "active",
    description: "Добавь правила проекта, контекст бизнеса и запреты.",
    videoTitle: "Правила проекта",
  },
  {
    id: "hw-5",
    stage: "Этап 3",
    title: "Создать Landing",
    deadline: "Без срока",
    status: "active",
    description:
      "Собери лендинг для своего бизнеса: оффер, преимущества, CTA и форма заявки. Опубликуй и пришли ссылку.",
    videoTitle: "Как собрать лендинг за вечер",
  },
];

export function getHomework(id: string) {
  return homeworkTasks.find((t) => t.id === id) ?? homeworkTasks[0];
}

export const activityFeed: {
  title: string;
  time: string;
  type: string;
}[] = [];

export const achievements = [
  { id: "site", title: "Первый сайт", emoji: "🏆", unlocked: false },
  { id: "agent", title: "Первый агент", emoji: "🏆", unlocked: false },
  { id: "client", title: "Первый клиент", emoji: "🏆", unlocked: false },
  { id: "report", title: "Первый отчёт", emoji: "🏆", unlocked: false },
  { id: "content", title: "Контент завод", emoji: "🏆", unlocked: false },
  { id: "crm", title: "CRM", emoji: "🏆", unlocked: false },
  { id: "company", title: "AI Company", emoji: "🏆", unlocked: false },
];

export type RankRole =
  | "Builder"
  | "AI Architect"
  | "Automation Master"
  | "Content Engineer"
  | "AI CEO";

export const leaderboard: Array<{
  rank: number;
  name: string;
  progress: number;
  level: number;
  role: RankRole;
  isYou?: boolean;
}> = [];

export const communityPosts: {
  id: string;
  author: string;
  role: string;
  text: string;
  likes: number;
  tag: string;
}[] = [];

export const topBuilders: Array<{
  name: string;
  score: string;
  badge: string;
}> = [];

export const assistantQuickActions = [
  "Помоги подключить Meta",
  "Почему ошибка n8n",
  "Проверь мой сайт",
  "Создай оффер",
  "Создай промпт",
];

export const statusLabel: Record<StageStatus, string> = {
  done: "Готово",
  active: "В процессе",
  todo: "Не начато",
  locked: "Закрыто",
};

export const agentStatusStyles: Record<AgentStatus, string> = {
  online: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  ready: "bg-primary/15 text-primary border-primary/30",
  locked: "bg-muted/60 text-muted-foreground border-border",
};
