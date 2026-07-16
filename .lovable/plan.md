# AI Marketing Lab Platform — Frontend UI

Современная SaaS-платформа обучения в стиле Linear/Vercel/Framer. Только интерфейс, без backend, БД, авторизации и AI-логики. Все данные — моковые.

## Дизайн-система

**Цвета** (в `src/styles.css`, OKLCH-эквиваленты):
- Фон: `#09090B`
- Карточки: `#111111`
- Бордеры: `rgba(255,255,255,0.08)`
- Текст: белый / серый (muted)
- Акцент: **Electric Blue** (`#3B82F6` → `#60A5FA` градиент), созвучно логотипу MarkVision AI

**Шрифт:** Inter (подключить через `<link>` в `__root.tsx`).

**Приёмы:** glassmorphism, rounded-2xl, большие отступы, subtle shadows, smooth hover/transition, framer-motion для входных анимаций.

**Иконки:** lucide-react.

## Структура роутов

```
src/routes/
  __root.tsx              → shell: sidebar + topbar + <Outlet/>
  index.tsx               → Dashboard
  mission-control.tsx     → AI Mission Control (схема команды)
  lessons.tsx             → Список этапов/уроков
  lessons.$stageId.tsx    → Детали урока (видео/материалы/домашка/комменты)
  docs.tsx                → Help Center (layout с боковыми категориями)
  docs.$slug.tsx          → Статья документации
  homework.tsx            → Таблица домашних заданий
  assistant.tsx           → Чат с AI (только UI)
  community.tsx           → Лента постов
  profile.tsx             → Профиль + достижения
  settings.tsx            → Настройки
```

Логотип из `user-uploads://12.png` подключить через lovable-assets в `src/assets/`.

## Компоненты layout

- **Sidebar** (`src/components/layout/Sidebar.tsx`): лого + пункты (Dashboard, AI Mission Control, Уроки, Документация, Домашние задания, AI Assistant, Сообщество, Профиль, Настройки). Активный пункт через `activeProps` TanStack Link. Collapsible на mobile.
- **Topbar** (`src/components/layout/Topbar.tsx`): поиск, колокольчик (badge), полоска прогресса обучения, аватар.
- Обёртка в `__root.tsx`: sidebar слева фиксированно, topbar сверху, контент в `<Outlet/>`.

## Страницы (моковые данные)

1. **Dashboard**
   - Hero: «Добро пожаловать обратно, Юрий 👋 Ты строишь собственную AI-команду»
   - Grid карточек: Прогресс обучения (кольцо %), Текущий этап, Следующее занятие, Домашнее задание, Последняя активность
   - Preview-блок AI Mission Control (декоративный, ссылка на страницу)

2. **AI Mission Control** — визуальная схема:
   - В центре карточка **YOU**
   - Древовидные связи (SVG-линии) к отделам: AI CEO → AI Marketing → AI Developer → AI Designer → AI Analyst → CRM → Reports → Automation
   - Каждая карточка: иконка, название, badge статуса (Not Installed / Installing / Connected / Working) с цветовой индикацией
   - Hover-эффекты, кликабельны (открывают модалку-заглушку)

3. **Уроки** — grid карточек-модулей («Этап 1 · Фундамент · 3 урока · 20%» с прогресс-баром). Клик → детальная страница с плейсхолдером видео, описанием, списком материалов, блоком домашки, комментариями.

4. **Документация** — split-layout: слева категории (GitHub, Supabase, Claude, n8n, Lovable, Vercel, Meta, OpenAI, Telegram, WhatsApp), справа контент статьи (markdown-плейсхолдер).

5. **Домашние задания** — таблица (shadcn Table): Название / Статус (badge) / Дедлайн / кнопка «Открыть».

6. **AI Assistant** — чат-интерфейс через AI Elements (Conversation, Message, PromptInput) с моковыми сообщениями. Отправка добавляет сообщение локально, без реального AI.

7. **Сообщество** — лента постов: аватар, имя, текст, кнопки лайк/коммент (локальный state).

8. **Профиль** — фото, имя, кольцо прогресса, сетка достижений (badges).

9. **Настройки** — заглушка с секциями (аккаунт, уведомления, внешний вид).

## Технические детали

- Tailwind v4 токены в `src/styles.css` под `@theme inline` (background, card, border, accent, accent-glow).
- Установить `framer-motion` через `bun add`.
- Установить AI Elements для страницы Assistant: `bun x ai-elements@latest add conversation message prompt-input shimmer`.
- Обновить `head()` в `__root.tsx`: title «AI Marketing Lab — MarkVision AI», description.
- Заменить placeholder `src/routes/index.tsx` на Dashboard.
- Все страницы адаптивные (grid → stack, sidebar → drawer на mobile).

## Вне scope (по ТЗ)

Без Lovable Cloud, без БД, без auth, без реальных API/AI, без сохранения данных.
