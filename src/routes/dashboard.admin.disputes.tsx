import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, RefreshCw, Scale, Search, X } from "lucide-react";
import { getAdminDashboard, listAdminDisputes } from "@/lib/api";
import type { Dispute } from "@/lib/api/types";
import { AsyncState } from "@/components/AsyncState";
import { AdminDisputeDetailSheet } from "@/components/admin/AdminDisputeDetailSheet";
import {
  adminInputCls,
  AdminFilterBar,
  AdminFilterField,
  AdminList,
  AdminListItem,
  AdminPageHeader,
  AdminPrimaryButton,
  AdminStat,
  AdminStatusBadge,
} from "@/components/admin/admin-ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/admin/disputes")({
  validateSearch: (search: Record<string, unknown>) => ({
    disputeId: typeof search.disputeId === "string" ? search.disputeId : undefined,
  }),
  component: AdminDisputesPage,
  head: () => ({ meta: [{ title: "Disputes — GoMarket Admin" }] }),
});

const STATUSES = ["", "OPEN", "UNDER_REVIEW", "RESOLVED", "REJECTED"] as const;
const SEARCH_DEBOUNCE_MS = 400;

function matchesDisputeSearch(dispute: Dispute, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    dispute.orderNumber,
    dispute.orderId,
    dispute.customerPhone,
    dispute.customerId,
    dispute.storeName,
    dispute.reason,
    dispute.description,
    dispute.id,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

function AdminDisputesPage() {
  const { disputeId: searchDisputeId } = Route.useSearch();
  const [status, setStatus] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filters = useMemo(
    () => ({
      status: status || undefined,
    }),
    [status],
  );

  const hasFilters = Boolean(filters.status || debouncedSearch);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const { data: dashboard } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getAdminDashboard,
  });

  const { data: disputes = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-disputes", filters],
    queryFn: () => listAdminDisputes({ status: filters.status, limit: 100 }),
  });

  const filtered = useMemo(
    () => disputes.filter((d) => matchesDisputeSearch(d, debouncedSearch)),
    [disputes, debouncedSearch],
  );

  const selected =
    filtered.find((d) => d.id === selectedId) ?? disputes.find((d) => d.id === selectedId) ?? null;

  useEffect(() => {
    if (searchDisputeId) {
      setSelectedId(searchDisputeId);
    }
  }, [searchDisputeId]);

  const openCount = disputes.filter((d) => d.status === "OPEN").length;
  const reviewCount = disputes.filter((d) => d.status === "UNDER_REVIEW").length;
  const resolvedCount = disputes.filter((d) => d.status === "RESOLVED").length;

  const openDispute = (dispute: Dispute) => {
    setSelectedId(dispute.id);
  };

  const clearFilters = () => {
    setStatus("");
    setSearchInput("");
    setDebouncedSearch("");
  };

  return (
    <div>
      <AdminPageHeader
        title="Customer disputes"
        description="Review claims from customers, investigate orders, and record resolutions."
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

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStat
          label="Open"
          value={String(dashboard?.openDisputes ?? openCount)}
          sub="Needs first review"
          icon={Scale}
          accent={(dashboard?.openDisputes ?? openCount) > 0 ? "warning" : "default"}
        />
        <AdminStat label="Under review" value={String(reviewCount)} sub="In progress" />
        <AdminStat label="Resolved" value={String(resolvedCount)} sub="Closed successfully" accent="default" />
        <AdminStat
          label="Shown"
          value={String(filtered.length)}
          sub={`${disputes.length} loaded`}
        />
      </div>

      <AdminFilterBar
        onSubmit={(e) => {
          e.preventDefault();
          setDebouncedSearch(searchInput.trim());
        }}
      >
        <AdminFilterField label="Status" className="min-w-[12rem]">
          <select className={adminInputCls} value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => (
              <option key={s || "all"} value={s}>
                {s ? s.replace(/_/g, " ") : "All statuses"}
              </option>
            ))}
          </select>
        </AdminFilterField>
        <AdminFilterField label="Search" className="min-w-[14rem] flex-1">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className={cn(adminInputCls, "pl-9")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Order, customer, store, reason…"
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

      {hasFilters ? (
        <p className="-mt-2 mb-4 text-sm text-muted-foreground">
          {isFetching && !isLoading ? "Searching…" : `${filtered.length} matching disputes`}
          {debouncedSearch ? ` · “${debouncedSearch}”` : ""}
          {status ? ` · ${status.replace(/_/g, " ")}` : ""}
        </p>
      ) : null}

      <AdminDisputeDetailSheet
        open={selectedId !== null}
        dispute={selected}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
        onUpdated={() => void refetch()}
      />

      <AsyncState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isRetrying={isFetching && !isLoading}
        loadingMessage="Loading disputes…"
        errorTitle="Couldn't load disputes"
      >
        <AdminList
          emptyMessage={
            hasFilters ? "No disputes match this search" : "No customer disputes on record"
          }
        >
          {filtered.map((d) => {
            const isSelected = selectedId === d.id;
            return (
              <AdminListItem
                key={d.id}
                onClick={() => openDispute(d)}
                title={
                  <span
                    className={cn(
                      "font-semibold",
                      isSelected ? "text-primary" : "text-foreground",
                    )}
                  >
                    {d.orderNumber ?? d.orderId}
                  </span>
                }
                badges={<AdminStatusBadge status={d.status} />}
                meta={
                  <>
                    {d.customerPhone ?? d.customerId} · {d.storeName ?? "—"} · {d.reason}
                  </>
                }
                footer={
                  <>
                    Opened {new Date(d.createdAt).toLocaleString()}
                    {d.resolvedAt ? ` · Resolved ${new Date(d.resolvedAt).toLocaleString()}` : ""}
                  </>
                }
                action={
                  <button
                    type="button"
                    onClick={() => openDispute(d)}
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
                  >
                    Review
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                }
              />
            );
          })}
        </AdminList>
      </AsyncState>
    </div>
  );
}
