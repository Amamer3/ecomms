import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/account/orders/$orderId")({
  component: AccountOrderLayout,
});

function AccountOrderLayout() {
  return <Outlet />;
}
