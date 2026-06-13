import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/admin/promotions/$promotionId")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/dashboard/admin/promotions",
      search: { promotionId: params.promotionId },
    });
  },
});
