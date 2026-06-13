import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/admin/users/$userId")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/dashboard/admin/users",
      search: { userId: params.userId },
    });
  },
});
