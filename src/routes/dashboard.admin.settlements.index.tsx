import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Banknote, BookOpen, RotateCcw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAdminDashboard } from "@/lib/api";
import { AdminQuickLink } from "@/components/admin/admin-ui";

export const Route = createFileRoute("/dashboard/admin/settlements/")({
  component: SettlementsHubPage,
});

const WORKFLOW = [
  {
    step: 1,
    label: "Refunds",
    to: "/dashboard/admin/settlements/refunds",
    description: "Scan cancelled or rejected paid orders and create refund records.",
    action: "Run refund scan",
    icon: RotateCcw,
  },
  {
    step: 2,
    label: "Ledger",
    to: "/dashboard/admin/settlements/ledger",
    description: "Generate settlement ledger entries for completed paid orders.",
    action: "Generate entries",
    icon: BookOpen,
  },
  {
    step: 3,
    label: "Payouts",
    to: "/dashboard/admin/settlements/payouts",
    description: "Create vendor and courier payout runs from pending ledger balances.",
    action: "Run payouts",
    icon: Banknote,
  },
] as const;

function SettlementsHubPage() {
  const { data: stats } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getAdminDashboard,
  });

  const pendingRefunds = stats?.pendingRefunds ?? 0;
  const pendingPayouts = stats?.pendingPayouts ?? 0;
  const nextStep =
    pendingRefunds > 0
      ? WORKFLOW[0]
      : pendingPayouts > 0
        ? WORKFLOW[2]
        : WORKFLOW[1];

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border/60 bg-card/50 p-5 shadow-[var(--shadow-soft)] sm:p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Recommended workflow</h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Run settlement tasks in order: refunds first, then ledger generation, then payout runs. Each step
          prepares data for the next.
        </p>

        <ol className="mt-6 grid gap-4 lg:grid-cols-3">
          {WORKFLOW.map(({ step, label, to, description, action, icon: Icon }) => (
            <li
              key={to}
              className="relative rounded-2xl border border-border/60 bg-card p-4 shadow-[var(--shadow-soft)]"
            >
              <div className="flex items-start gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {step}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold text-foreground">{label}</h4>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                  <Link
                    to={to}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                  >
                    {action}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ol>

        {(pendingRefunds > 0 || pendingPayouts > 0) && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3">
            <p className="text-sm text-foreground">
              {pendingRefunds > 0
                ? `${pendingRefunds} refund${pendingRefunds === 1 ? "" : "s"} need attention.`
                : `${pendingPayouts} payout${pendingPayouts === 1 ? "" : "s"} are queued.`}{" "}
              <span className="text-muted-foreground">Start with {nextStep.label.toLowerCase()}.</span>
            </p>
            <Link
              to={nextStep.to}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:shadow-md"
            >
              {nextStep.action}
            </Link>
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Settlement areas</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AdminQuickLink
            to="/dashboard/admin/settlements/refunds"
            label="Refunds"
            description="Review refund records and scan orders that need money returned."
            icon={RotateCcw}
          />
          <AdminQuickLink
            to="/dashboard/admin/settlements/ledger"
            label="Ledger"
            description="Settlement ledger entries for vendors and couriers on completed orders."
            icon={BookOpen}
          />
          <AdminQuickLink
            to="/dashboard/admin/settlements/payouts"
            label="Payouts"
            description="Payout runs that move funds to vendor and rider accounts."
            icon={Banknote}
          />
        </div>
      </section>
    </div>
  );
}
