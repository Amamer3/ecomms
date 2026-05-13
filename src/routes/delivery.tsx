import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/delivery")({
  component: DeliveryLayout,
});

function DeliveryLayout() {
  return <Outlet />;
}
