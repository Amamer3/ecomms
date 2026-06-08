import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { getTransaction } from "@/lib/api";
import { parseMoney } from "@/lib/api/client";
import { AsyncState } from "@/components/AsyncState";
import { CustomerDetailGrid, CustomerPageHeader } from "@/components/customer/customer-ui";
import { formatGhs } from "@/lib/format-money";

export const Route = createFileRoute("/account/transactions/$paymentId")({
  component: AccountTransactionDetailPage,
});

function AccountTransactionDetailPage() {
  const { paymentId } = Route.useParams();

  const { data: payment, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["transaction", paymentId],
    queryFn: () => getTransaction(paymentId),
  });

  return (
    <AsyncState
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
      isRetrying={isFetching && !isLoading}
      loadingMessage="Loading payment…"
      errorTitle="Couldn't load payment"
    >
      {!payment ? (
        <p className="text-sm text-destructive">Payment not found.</p>
      ) : (
    <div>
      <Link
        to="/account/transactions"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All payments
      </Link>

      <CustomerPageHeader
        title="Payment details"
        description="Transaction record for your order."
      />

      <CustomerDetailGrid
        rows={[
          { label: "Payment ID", value: payment.id },
          { label: "Order ID", value: payment.orderId },
          { label: "Status", value: payment.status },
          { label: "Amount", value: formatGhs(parseMoney(payment.amount)) },
          { label: "Currency", value: payment.currency },
          { label: "Channel", value: payment.channel ?? "—" },
          { label: "Provider", value: payment.provider ?? "—" },
          { label: "MoMo number", value: payment.momoNumber ?? "—" },
          { label: "Created", value: payment.createdAt ?? "—" },
        ]}
      />
    </div>
      )}
    </AsyncState>
  );
}
