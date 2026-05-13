import { useEffect, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/context/auth";
import { dashboardPathForRole, type DashboardRole } from "@/lib/auth-storage";
import { selectPathname } from "@/lib/router-pathname";

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse" aria-busy="true" aria-label="Loading">
      <div className="h-24 rounded-3xl bg-muted/60" />
      <div className="h-48 rounded-3xl bg-muted/40" />
    </div>
  );
}

export function RequireDashboardRole({
  role,
  children,
}: {
  role: DashboardRole;
  children: ReactNode;
}) {
  const { session, ready } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: selectPathname });

  useEffect(() => {
    if (!ready) return;
    if (!session) {
      navigate({ to: "/dashboard/login", search: { redirect: pathname } });
      return;
    }
    if (session.role === "customer") {
      navigate({ to: "/shop" });
      return;
    }
    if (session.role !== role) {
      navigate({ to: dashboardPathForRole(session.role) });
    }
  }, [ready, session, role, navigate, pathname]);

  if (!ready) return <LoadingSkeleton />;
  if (!session || session.role === "customer" || session.role !== role) return <LoadingSkeleton />;
  return <>{children}</>;
}
