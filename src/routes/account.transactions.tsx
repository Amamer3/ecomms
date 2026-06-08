import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";
import { listTransactions } from "@/lib/api";
import { parseMoney } from "@/lib/api/client";
import { AsyncState } from "@/components/AsyncState";
import { CustomerPageHeader } from "@/components/customer/customer-ui";
import { formatGhs } from "@/lib/format-money";

export const Route = createFileRoute("/account/transactions")({
  component: AccountTransactionsPage,
  head: () => ({ meta: [{ title: "Payments — GoMarket" }] }),
});

function AccountTransactionsPage() {
  const { data: txs = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => listTransactions({ limit: 50 }),
  });

  return (
    <div>
      <CustomerPageHeader
        title="Payment history"
        description="Transactions for orders on your account."
      />

      <AsyncState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isRetrying={isFetching && !isLoading}
        loadingMessage="Loading payments…"
        errorTitle="Couldn't load payments"
      >
        {txs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No payments yet.</p>
        ) : (
          <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
            {txs.map((t) => (
              <li key={t.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <Link
                    to="/account/transactions/$paymentId"
                    params={{ paymentId: t.id }}
                    className="font-medium text-primary hover:underline"
                  >
                    {t.id.slice(0, 8)}…
                  </Link>
                  <span className="text-muted-foreground">{t.status}</span>
                </div>
                <span className="font-semibold">{formatGhs(parseMoney(t.amount))}</span>
              </li>
            ))}
          </ul>
        )}
      </AsyncState>
    </div>
  );
}
