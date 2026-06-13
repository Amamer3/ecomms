import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/admin/promotions/new")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard/admin/promotions" });
  },
});
