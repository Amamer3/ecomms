import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/admin/disputes/$disputeId")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/dashboard/admin/disputes",
      search: { disputeId: params.disputeId },
    });
  },
});
