import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/lessons")({
  component: LessonsLayout,
});

function LessonsLayout() {
  return <Outlet />;
}
