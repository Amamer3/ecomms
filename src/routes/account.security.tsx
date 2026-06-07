import { createFileRoute } from "@tanstack/react-router";
import { SessionPanel } from "@/components/auth/SessionPanel";
import { CustomerPageHeader } from "@/components/customer/customer-ui";

export const Route = createFileRoute("/account/security")({
  component: AccountSecurityPage,
  head: () => ({ meta: [{ title: "Security — GoMarket" }] }),
});

function AccountSecurityPage() {
  return (
    <div>
      <CustomerPageHeader
        title="Security & session"
        description="View your signed-in identity, refresh tokens, or sign out."
      />
      <section className="rounded-2xl border border-border bg-card p-6">
        <SessionPanel logoutRedirect="/login" />
      </section>
    </div>
  );
}
