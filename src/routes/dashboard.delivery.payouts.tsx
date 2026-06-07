import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listRiderPayouts } from "@/lib/api";
import { parseMoney } from "@/lib/api/client";
import { CatalogDataTable } from "@/components/catalog/catalog-ui";
import { RiderPageHeader } from "@/components/rider/rider-ui";
import { formatGhs } from "@/lib/format-money";

export const Route = createFileRoute("/dashboard/delivery/payouts")({
  component: RiderPayoutsPage,
  head: () => ({ meta: [{ title: "Courier payouts — GoMarket" }] }),
});

function RiderPayoutsPage() {
  const { data: payouts = [], isLoading } = useQuery({
    queryKey: ["rider-payouts"],
    queryFn: () => listRiderPayouts({ limit: 50 }),
  });

  return (
    <div>
      <RiderPageHeader
        title="Payout runs"
        description="Settlement payouts issued to your courier account."
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading payouts…</p>
      ) : (
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
      )}
    </div>
  );
}
