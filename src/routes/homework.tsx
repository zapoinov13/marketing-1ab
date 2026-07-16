import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/homework")({
  component: HomeworkLayout,
});

function HomeworkLayout() {
  return <Outlet />;
}
