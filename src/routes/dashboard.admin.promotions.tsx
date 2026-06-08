import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { listPromotions } from "@/lib/api";
import { parseMoney } from "@/lib/api/client";
import { AsyncState } from "@/components/AsyncState";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { PromotionStatusBadge } from "@/components/promotions/promotion-ui";
import { formatGhs } from "@/lib/format-money";

export const Route = createFileRoute("/dashboard/admin/promotions")({
  component: AdminPromotionsPage,
  head: () => ({ meta: [{ title: "Promotions — GoMarket" }] }),
});

function AdminPromotionsPage() {
  const { data: promotions = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["promotions", "admin"],
    queryFn: () => listPromotions(),
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <AdminPageHeader
          title="Promotions"
          description="Platform and store-scoped coupon codes."
        />
        <Link
          to="/dashboard/admin/promotions/new"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> New promotion
        </Link>
      </div>

      <AsyncState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isRetrying={isFetching && !isLoading}
        loadingMessage="Loading promotions…"
        errorTitle="Couldn't load promotions"
      >
        <ul className="space-y-3">
          {promotions.map((p) => (
            <li key={p.id} className="rounded-2xl border border-border/60 bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link
                  to="/dashboard/admin/promotions/$promotionId"
                  params={{ promotionId: p.id }}
                  className="font-semibold text-primary hover:underline"
                >
                  {p.code}
                </Link>
                <PromotionStatusBadge status={p.status} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {p.type} · {p.type === "PERCENT" ? `${p.value}%` : formatGhs(parseMoney(p.value))} · redeemed{" "}
                {p.redeemedCount}
                {p.storeId ? ` · store ${p.storeId.slice(0, 8)}` : " · platform"}
              </p>
            </li>
          ))}
          {promotions.length === 0 && (
            <li className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              No promotions yet
            </li>
          )}
        </ul>
      </AsyncState>
    </div>
  );
}
