import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getVendorEarningsSummary, listVendorEarnings } from "@/lib/api";
import { parseMoney } from "@/lib/api/client";
import { CatalogDataTable } from "@/components/catalog/catalog-ui";
import { VendorDetailGrid, VendorPageHeader } from "@/components/vendor/vendor-ui";
import { formatGhs } from "@/lib/format-money";

export const Route = createFileRoute("/dashboard/vendor/earnings")({
  component: VendorEarningsPage,
  head: () => ({ meta: [{ title: "Earnings — GoMarket" }] }),
});

function VendorEarningsPage() {
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["vendor-earnings"],
    queryFn: getVendorEarningsSummary,
  });

  const { data: ledger = [], isLoading: ledgerLoading } = useQuery({
    queryKey: ["vendor-earnings-ledger"],
    queryFn: () => listVendorEarnings({ limit: 50 }),
  });

  return (
    <div>
      <VendorPageHeader
        title="Earnings"
        description="Balance summary and ledger entries for your vendor account."
      />

      {summaryLoading ? (
        <p className="text-sm text-muted-foreground">Loading summary…</p>
      ) : summary ? (
        <VendorDetailGrid
          rows={[
            { label: "Available", value: formatGhs(parseMoney(summary.availableBalance)) },
            { label: "Pending", value: formatGhs(parseMoney(summary.pendingBalance)) },
            { label: "Lifetime", value: formatGhs(parseMoney(summary.lifetimeEarnings)) },
            { label: "Currency", value: summary.currency },
          ]}
        />
      ) : null}

      <div className="mt-10">
        {ledgerLoading ? (
          <p className="text-sm text-muted-foreground">Loading ledger…</p>
        ) : (
          <CatalogDataTable
            title={`${ledger.length} ledger entr${ledger.length === 1 ? "y" : "ies"}`}
            headers={["Type", "Status", "Amount", "Date"]}
            rows={ledger.map((e) => [
              e.type,
              e.status,
              formatGhs(parseMoney(e.amount)),
              new Date(e.createdAt).toLocaleDateString(),
            ])}
          />
        )}
      </div>
    </div>
  );
}
