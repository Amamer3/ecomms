import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listRiderPayouts } from "@/lib/api";
import { parseMoney } from "@/lib/api/client";
import { AsyncState } from "@/components/AsyncState";
import { CatalogDataTable } from "@/components/catalog/catalog-ui";
import { RiderPageHeader } from "@/components/rider/rider-ui";
import { formatGhs } from "@/lib/format-money";

export const Route = createFileRoute("/dashboard/delivery/payouts")({
  component: RiderPayoutsPage,
  head: () => ({ meta: [{ title: "Courier payouts — GoMarket" }] }),
});

function RiderPayoutsPage() {
  const { data: payouts = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["rider-payouts"],
    queryFn: () => listRiderPayouts({ limit: 50 }),
  });

  return (
    <div>
      <RiderPageHeader
        title="Payout runs"
        description="Settlement payouts issued to your courier account."
      />

      <AsyncState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isRetrying={isFetching && !isLoading}
        loadingMessage="Loading payouts…"
        errorTitle="Couldn't load payouts"
      >
        <CatalogDataTable
          title={`${payouts.length} payout${payouts.length === 1 ? "" : "s"}`}
          headers={["Status", "Amount", "Created", "Completed"]}
          rows={payouts.map((p) => [
            p.status,
            formatGhs(parseMoney(p.totalAmount)),
            new Date(p.createdAt).toLocaleDateString(),
            p.completedAt ? new Date(p.completedAt).toLocaleDateString() : "—",
          ])}
        />
      </AsyncState>
    </div>
  );
}
