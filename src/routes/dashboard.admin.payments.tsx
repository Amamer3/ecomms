import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Search, X } from "lucide-react";
import { listAdminPayments } from "@/lib/api";
import { parseMoney } from "@/lib/api/client";
import type { Payment } from "@/lib/api/types";
import { AsyncState } from "@/components/AsyncState";
import {
  adminInputCls,
  AdminDataTable,
  AdminFilterBar,
  AdminFilterField,
  AdminMono,
  AdminPageHeader,
  AdminPrimaryButton,
  AdminStat,
  AdminStatusBadge,
} from "@/components/admin/admin-ui";
import { formatGhs } from "@/lib/format-money";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/admin/payments")({
  component: AdminPaymentsPage,
  head: () => ({ meta: [{ title: "Platform payments — GoMarket Admin" }] }),
});

const SEARCH_DEBOUNCE_MS = 400;

function matchesPaymentSearch(payment: Payment, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [payment.id, payment.orderId, payment.status, payment.channel, payment.provider]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

function AdminPaymentsPage() {
  const [status, setStatus] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const { data: payments = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-payments", status || undefined],
    queryFn: () => listAdminPayments({ status: status || undefined, limit: 100 }),
  });

  const filtered = useMemo(
    () => payments.filter((p) => matchesPaymentSearch(p, debouncedSearch)),
    [payments, debouncedSearch],
  );

  const hasFilters = Boolean(status || debouncedSearch);
  const pendingCount = payments.filter((p) => ["PENDING", "PROCESSING"].includes(p.status.toUpperCase())).length;

  const clearFilters = () => {
    setStatus("");
    setSearchInput("");
    setDebouncedSearch("");
  };

  return (
    <div>
      <AdminPageHeader
        title="Platform payments"
        description="Review payment records and statuses across customer checkouts."
        actions={
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/40 disabled:opacity-60"
          >
            <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
            Refresh
          </button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <AdminStat label="Total payments" value={String(payments.length)} sub={`${filtered.length} shown`} />
        <AdminStat
          label="Pending / processing"
          value={String(pendingCount)}
          sub="Awaiting provider confirmation"
          accent={pendingCount > 0 ? "warning" : "default"}
        />
      </div>

      <AdminFilterBar
        onSubmit={(e) => {
          e.preventDefault();
          setDebouncedSearch(searchInput.trim());
        }}
      >
        <AdminFilterField label="Status" className="min-w-[12rem]">
          <input
            className={adminInputCls}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            placeholder="e.g. SUCCESS, PENDING"
          />
        </AdminFilterField>
        <AdminFilterField label="Search" className="min-w-[14rem] flex-1">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className={cn(adminInputCls, "pl-9")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Payment ID, order ID…"
              autoComplete="off"
            />
          </div>
        </AdminFilterField>
        <AdminPrimaryButton type="submit">Search</AdminPrimaryButton>
        {hasFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        ) : null}
      </AdminFilterBar>

      <AsyncState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isRetrying={isFetching && !isLoading}
        loadingMessage="Loading payments…"
        errorTitle="Couldn't load payments"
      >
        <AdminDataTable
          title={`${filtered.length} payment${filtered.length === 1 ? "" : "s"}`}
          headers={["Payment ID", "Status", "Amount", "Order", "Created"]}
          emptyMessage={hasFilters ? "No payments match this filter" : "No payments recorded"}
          rows={filtered.map((p) => [
            <AdminMono key="id" title={p.id}>
              {p.id.slice(0, 12)}…
            </AdminMono>,
            <AdminStatusBadge key="status" status={p.status} />,
            <span key="amount" className="font-medium tabular-nums">
              {formatGhs(parseMoney(p.amount))}
            </span>,
            p.orderId ? (
              <AdminMono key="order" title={p.orderId}>
                {p.orderId.slice(0, 12)}…
              </AdminMono>
            ) : (
              "—"
            ),
            p.createdAt ? new Date(p.createdAt).toLocaleString() : "—",
          ])}
        />
      </AsyncState>
    </div>
  );
}
