import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AuthCard,
  AuthFooterLink,
  BusinessAuthLayout,
} from "@/components/auth/AuthShell";
import { SessionPanel } from "@/components/auth/SessionPanel";
import { RequireBusinessUser } from "@/components/RequireBusinessUser";

export const Route = createFileRoute("/dashboard/security")({
  component: DashboardSecurityPage,
  head: () => ({ meta: [{ title: "Security — GoMarket" }] }),
});

function DashboardSecurityPage() {
  return (
    <RequireBusinessUser>
      <BusinessAuthLayout>
        <AuthCard
          variant="business"
          title="Security & session"
          description="View your authenticated identity, rotate tokens, or sign out of this device."
          footer={
            <AuthFooterLink
              label="Back to workspace?"
              linkLabel="Dashboard home"
              to="/dashboard"
            />
          }
        >
          <SessionPanel showMfaLink logoutRedirect="/dashboard/login" />
        </AuthCard>
        <p className="mt-8 text-center">
          <Link
            to="/dashboard"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            ← All dashboards
          </Link>
        </p>
      </BusinessAuthLayout>
    </RequireBusinessUser>
  );
}
