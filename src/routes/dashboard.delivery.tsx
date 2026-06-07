import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Banknote, Bike, LayoutDashboard, MapPinned, User, Wallet } from "lucide-react";
import { DashboardRoleShell } from "@/components/DashboardRoleShell";
import { RequireDashboardRole } from "@/components/RequireDashboardRole";

export const Route = createFileRoute("/dashboard/delivery")({
  component: DeliveryLayout,
});

const RIDER_NAV = [
  { to: "/dashboard/delivery", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/delivery/deliveries", label: "Deliveries", icon: Bike },
  { to: "/dashboard/delivery/profile", label: "Profile", icon: User },
  { to: "/dashboard/delivery/earnings", label: "Earnings", icon: Wallet },
  { to: "/dashboard/delivery/payouts", label: "Payouts", icon: Banknote },
] as const;

function DeliveryLayout() {
  return (
    <RequireDashboardRole role="delivery">
      <DashboardRoleShell
        workspacePath="/dashboard/delivery"
        workspaceTitle="Courier"
        routeNavItems={[...RIDER_NAV]}
      >
        <Outlet />
      </DashboardRoleShell>
    </RequireDashboardRole>
  );
}
