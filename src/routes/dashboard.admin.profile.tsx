import { createFileRoute } from "@tanstack/react-router";
import { SessionPanel } from "@/components/auth/SessionPanel";
import { AdminFormCard, AdminPageHeader } from "@/components/admin/admin-ui";

export const Route = createFileRoute("/dashboard/admin/profile")({
  component: AdminProfilePage,
  head: () => ({ meta: [{ title: "Admin profile — GoMarket" }] }),
});

function AdminProfilePage() {
  return (
    <div className="max-w-2xl">
      <AdminPageHeader
        title="Your profile"
        description="View your admin account, manage your session, and configure two-factor authentication."
      />
      <AdminFormCard title="Account & security" description="Your signed-in identity and session controls.">
        <SessionPanel showMfaLink logoutRedirect="/dashboard/login" />
      </AdminFormCard>
    </div>
  );
}
