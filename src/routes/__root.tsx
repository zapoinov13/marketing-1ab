import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { wipeLocalDataIfNeeded } from "../lib/wipeLocalData";
import { AppShell } from "../components/layout/AppShell";
import { AuthProvider } from "../contexts/AuthContext";
import { HomeworkProvider } from "../contexts/HomeworkContext";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Такой страницы не существует.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Страница не загрузилась
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Что-то пошло не так. Попробуйте обновить или вернуться на главную.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Повторить
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            На главную
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "AI Marketing Lab — MarkVision AI" },
      {
        name: "description",
        content:
          "AI Marketing Lab by MarkVision — операционная система для построения собственной AI-команды. Уроки, AI-ассистент, комьюнити.",
      },
      { name: "author", content: "MarkVision AI" },
      { property: "og:title", content: "AI Marketing Lab — MarkVision AI" },
      {
        property: "og:description",
        content: "AI Marketing Lab by MarkVision — операционная система для построения собственной AI-команды. Уроки, AI-ассистент, комьюнити.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "AI Marketing Lab — MarkVision AI" },
      { name: "twitter:description", content: "AI Marketing Lab by MarkVision — операционная система для построения собственной AI-команды. Уроки, AI-ассистент, комьюнити." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/KwyujX8PvBRkTPCKNDrYkG6yb7W2/social-images/social-1784201745663-ChatGPT_Image_20_янв._2026_г.,_23_43_55.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/KwyujX8PvBRkTPCKNDrYkG6yb7W2/social-images/social-1784201745663-ChatGPT_Image_20_янв._2026_г.,_23_43_55.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="bg-background text-foreground">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  wipeLocalDataIfNeeded();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HomeworkProvider>
          <AppShell>
            <Outlet />
          </AppShell>
        </HomeworkProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
