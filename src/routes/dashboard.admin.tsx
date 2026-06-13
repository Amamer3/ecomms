import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Bike, CreditCard, Landmark, LayoutDashboard, Package, Percent, Scale, ShoppingBag, Store, Tag, Users } from "lucide-react";
import { DashboardRoleShell } from "@/components/DashboardRoleShell";
import { RequireDashboardRole } from "@/components/RequireDashboardRole";

export const Route = createFileRoute("/dashboard/admin")({
  component: AdminLayout,
});

const ADMIN_NAV = [
  { to: "/dashboard/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/admin/orders", label: "Orders", icon: ShoppingBag, section: "Operations" },
  { to: "/dashboard/admin/payments", label: "Payments", icon: CreditCard, section: "Operations" },
  { to: "/dashboard/admin/promotions", label: "Promotions", icon: Tag, section: "Operations" },
  { to: "/dashboard/admin/disputes", label: "Disputes", icon: Scale, section: "Operations" },
  { to: "/dashboard/admin/vendors/products", label: "Vendor products", icon: Package, section: "Operations" },
  { to: "/dashboard/admin/users", label: "Users", icon: Users, section: "Accounts" },
  { to: "/dashboard/admin/settlements", label: "Settlements", icon: Landmark, section: "Finance" },
  { to: "/dashboard/admin/vendors/approve", label: "Approve vendor", icon: Store, section: "Approvals" },
  { to: "/dashboard/admin/riders/approve", label: "Approve courier", icon: Bike, section: "Approvals" },
  { to: "/dashboard/admin/vendors/tier", label: "Vendor tier", icon: Percent, section: "Approvals" },
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
