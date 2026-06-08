import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AsyncState } from "@/components/AsyncState";
import { customerInputCls, CustomerDetailGrid, CustomerPageHeader } from "@/components/customer/customer-ui";
import { listCustomerDisputes, openDispute } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import type { Dispute } from "@/lib/api/types";

export const Route = createFileRoute("/account/disputes")({
  component: AccountDisputesPage,
  head: () => ({ meta: [{ title: "Disputes — GoMarket" }] }),
});

function AccountDisputesPage() {
  const { data: disputes = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["disputes"],
    queryFn: listCustomerDisputes,
  });
  const [orderId, setOrderId] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() || !reason.trim()) {
      toast.error("Order ID and reason are required");
      return;
    }
    setSubmitting(true);
    try {
      await openDispute({
        orderId: orderId.trim(),
        reason: reason.trim(),
        description: description.trim() || undefined,
      });
      toast.success("Dispute opened");
      setOrderId("");
      setReason("");
      setDescription("");
      void refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to open dispute"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <CustomerPageHeader
        title="Disputes"
        description="View disputes you have opened and submit new ones for delivered orders."
      />

      <form
        onSubmit={(e) => void onSubmit(e)}
        className="mb-8 space-y-4 rounded-2xl border border-border/60 bg-card p-6"
      >
        <h3 className="font-semibold">Open a dispute</h3>
        <p className="text-xs text-muted-foreground">
          Use an order ID from{" "}
          <Link to="/account/orders" className="font-medium text-primary hover:underline">
            your orders
          </Link>
          .
        </p>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Order ID</span>
          <input
            className={customerInputCls}
            placeholder="Order UUID"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Reason</span>
          <input
            className={customerInputCls}
            placeholder="e.g. Missing items, wrong order"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Description (optional)</span>
          <textarea
            className={`${customerInputCls} min-h-[5rem] resize-y`}
            placeholder="Additional details…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit dispute"}
        </button>
      </form>

      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Your disputes</h3>
      <AsyncState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isRetrying={isFetching && !isLoading}
        loadingMessage="Loading disputes…"
        errorTitle="Couldn't load disputes"
      >
        {disputes.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            No disputes yet
          </p>
        ) : (
          <ul className="space-y-4">
            {disputes.map((d) => (
              <DisputeCard key={d.id} dispute={d} />
            ))}
          </ul>
        )}
      </AsyncState>
    </div>
  );
}

function DisputeCard({ dispute: d }: { dispute: Dispute }) {
  return (
    <li className="rounded-2xl border border-border/60 bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold">{d.orderNumber ?? d.orderId}</p>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">{d.status}</span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{d.reason}</p>
      {d.description && <p className="mt-2 text-sm">{d.description}</p>}
      <div className="mt-4">
        <CustomerDetailGrid
          rows={[
            { label: "Opened", value: new Date(d.createdAt).toLocaleString() },
            ...(d.resolution ? [{ label: "Resolution", value: d.resolution }] : []),
            ...(d.resolvedAt
              ? [{ label: "Resolved", value: new Date(d.resolvedAt).toLocaleString() }]
              : []),
          ]}
        />
      </div>
    </li>
  );
}
