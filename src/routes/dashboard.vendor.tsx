import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Banknote, LayoutDashboard, Package, Plus, Store, Tag, User, Wallet } from "lucide-react";
import { DashboardRoleShell } from "@/components/DashboardRoleShell";
import { RequireDashboardRole } from "@/components/RequireDashboardRole";

export const Route = createFileRoute("/dashboard/vendor")({
  component: VendorLayout,
});

const VENDOR_NAV = [
  { to: "/dashboard/vendor", label: "Orders", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/vendor/profile", label: "Profile", icon: User },
  { to: "/dashboard/vendor/stores", label: "My stores", icon: Store },
  { to: "/dashboard/vendor/products", label: "My products", icon: Package, exact: true },
  { to: "/dashboard/vendor/products/new", label: "New product", icon: Plus },
  { to: "/dashboard/vendor/earnings", label: "Earnings", icon: Wallet },
  { to: "/dashboard/vendor/payouts", label: "Payouts", icon: Banknote },
  { to: "/dashboard/vendor/promotions", label: "Promotions", icon: Tag },
] as const;

function VendorLayout() {
  return (
    <RequireDashboardRole role="vendor">
      <DashboardRoleShell
        workspacePath="/dashboard/vendor"
        workspaceTitle="Vendor"
        routeNavItems={[...VENDOR_NAV]}
      >
        <Outlet />
      </DashboardRoleShell>
    </RequireDashboardRole>
  );
}
