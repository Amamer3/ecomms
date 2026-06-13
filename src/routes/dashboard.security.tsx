import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/context/auth";
import { dashboardProfilePathForRole } from "@/lib/auth-storage";
import { RequireBusinessUser } from "@/components/RequireBusinessUser";

export const Route = createFileRoute("/dashboard/security")({
  component: DashboardSecurityPage,
  head: () => ({ meta: [{ title: "Profile — GoMarket" }] }),
});

/** Legacy URL — send staff users to their in-workspace profile page. */
function DashboardSecurityPage() {
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (!session || session.role === "customer") return;
    navigate({ to: dashboardProfilePathForRole(session.role), replace: true });
  }, [session, navigate]);

  return (
    <RequireBusinessUser>
      <p className="p-8 text-sm text-muted-foreground">Opening your profile…</p>
    </RequireBusinessUser>
  );
}
