import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Bike, CreditCard, Landmark, LayoutDashboard, Percent, Scale, ShoppingBag, Store, Tag, Webhook } from "lucide-react";
import { DashboardRoleShell } from "@/components/DashboardRoleShell";
import { RequireDashboardRole } from "@/components/RequireDashboardRole";

export const Route = createFileRoute("/dashboard/admin")({
  component: AdminLayout,
});

const ADMIN_NAV = [
  { to: "/dashboard/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/dashboard/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/dashboard/admin/payments/callback", label: "Pay callback", icon: Webhook },
  { to: "/dashboard/admin/promotions", label: "Promotions", icon: Tag },
  { to: "/dashboard/admin/disputes", label: "Disputes", icon: Scale },
  { to: "/dashboard/admin/settlements", label: "Settlements", icon: Landmark },
  { to: "/dashboard/admin/vendors/approve", label: "Approve vendor", icon: Store },
  { to: "/dashboard/admin/riders/approve", label: "Approve courier", icon: Bike },
  { to: "/dashboard/admin/vendors/tier", label: "Vendor tier", icon: Percent },
] as const;

function AdminLayout() {
  return (
    <RequireDashboardRole role="admin">
      <DashboardRoleShell
        workspacePath="/dashboard/admin"
        workspaceTitle="Admin"
        routeNavItems={[...ADMIN_NAV]}
      >
        <Outlet />
      </DashboardRoleShell>
    </RequireDashboardRole>
  );
}
