import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/admin/users")({
  component: AdminUsersLayout,
});

function AdminUsersLayout() {
  return <Outlet />;
}
