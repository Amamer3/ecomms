import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/admin/promotions")({
  component: AdminPromotionsLayout,
});

function AdminPromotionsLayout() {
  return <Outlet />;
}
