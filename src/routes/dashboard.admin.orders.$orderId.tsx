import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/admin/orders/$orderId")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/dashboard/admin/orders",
      search: { orderId: params.orderId },
    });
  },
});
