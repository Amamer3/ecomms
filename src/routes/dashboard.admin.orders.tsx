import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, RefreshCw, Search, ShoppingBag, X } from "lucide-react";
import { getAdminDashboard, listAdminOrders } from "@/lib/api";
import type { FulfilmentOrder } from "@/lib/api/types";
import { parseMoney } from "@/lib/api/client";
import { AsyncState } from "@/components/AsyncState";
import { AdminOrderDetailSheet } from "@/components/admin/AdminOrderDetailSheet";
import { formatOrderCustomer } from "@/components/admin/AdminOrderDetailContent";
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
import { formatGhs } from "@/lib/format-money";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/admin/orders")({
  validateSearch: (search: Record<string, unknown>) => ({
    orderId: typeof search.orderId === "string" ? search.orderId : undefined,
  }),
  component: AdminOrdersPage,
  head: () => ({ meta: [{ title: "Platform orders — GoMarket Admin" }] }),
});

const STATUSES = [
  "",
  "PLACED",
  "PAID",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "PICKED_UP",
  "ON_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "REJECTED",
] as const;

const PENDING_STATUSES = new Set(["PLACED", "PAID", "ACCEPTED", "PREPARING", "READY"]);
const SEARCH_DEBOUNCE_MS = 400;

function matchesOrderSearch(order: FulfilmentOrder, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    order.orderNumber,
    order.id,
    order.storeName,
    order.store?.name,
    formatOrderCustomer(order),
    order.customer?.phone,
    order.customerPhone,
    order.status,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

function AdminOrdersPage() {
  const { orderId: searchOrderId } = Route.useSearch();
  const [status, setStatus] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filters = useMemo(() => ({ status: status || undefined }), [status]);
  const hasFilters = Boolean(filters.status || debouncedSearch);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const { data: dashboard } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getAdminDashboard,
  });

  const { data: orders = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-orders", filters],
    queryFn: () => listAdminOrders({ status: filters.status, limit: 100 }),
  });

  const filtered = useMemo(
    () => orders.filter((o) => matchesOrderSearch(o, debouncedSearch)),
    [orders, debouncedSearch],
  );

  const selected =
    filtered.find((o) => o.id === selectedId) ?? orders.find((o) => o.id === selectedId) ?? null;

  useEffect(() => {
    if (searchOrderId) setSelectedId(searchOrderId);
  }, [searchOrderId]);

  const pendingCount = orders.filter((o) => PENDING_STATUSES.has(o.status.toUpperCase())).length;
  const deliveredCount = orders.filter((o) => o.status.toUpperCase() === "DELIVERED").length;

  const openOrder = (order: FulfilmentOrder) => setSelectedId(order.id);

  const clearFilters = () => {
    setStatus("");
    setSearchInput("");
    setDebouncedSearch("");
  };

  return (
    <div>
      <AdminPageHeader
        title="Platform orders"
        description="Browse fulfilment orders across the marketplace for operations and customer support."
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
          label="Total orders"
          value={String(dashboard?.orders ?? orders.length)}
          sub={`${filtered.length} shown`}
          icon={ShoppingBag}
        />
        <AdminStat
          label="Pending fulfilment"
          value={String(dashboard?.pendingOrders ?? pendingCount)}
          sub="Placed through ready"
          accent={(dashboard?.pendingOrders ?? pendingCount) > 0 ? "warning" : "default"}
        />
        <AdminStat label="Delivered" value={String(deliveredCount)} sub="Completed in this list" />
        <AdminStat
          label="Active deliveries"
          value={String(dashboard?.activeDeliveries ?? 0)}
          sub="From dashboard metrics"
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
              placeholder="Order #, customer, store…"
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
          {isFetching && !isLoading ? "Searching…" : `${filtered.length} matching orders`}
          {debouncedSearch ? ` · “${debouncedSearch}”` : ""}
          {status ? ` · ${status.replace(/_/g, " ")}` : ""}
        </p>
      ) : null}

      <AdminOrderDetailSheet
        open={selectedId !== null}
        orderId={selectedId}
        preview={selected}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      />

      <AsyncState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isRetrying={isFetching && !isLoading}
        loadingMessage="Loading orders…"
        errorTitle="Couldn't load orders"
      >
        <AdminList
          emptyMessage={hasFilters ? "No orders match this search" : "No orders on record yet"}
        >
          {filtered.map((order) => {
            const isSelected = selectedId === order.id;
            return (
              <AdminListItem
                key={order.id}
                onClick={() => openOrder(order)}
                title={
                  <span
                    className={cn(
                      "font-semibold",
                      isSelected ? "text-primary" : "text-foreground",
                    )}
                  >
                    {order.orderNumber}
                  </span>
                }
                badges={<AdminStatusBadge status={order.status} />}
                meta={
                  <>
                    {order.storeName ?? order.store?.name ?? "—"} · {formatOrderCustomer(order)}
                    {order.payment ? (
                      <>
                        {" "}
                        · payment <AdminStatusBadge status={order.payment.status} />
                      </>
                    ) : null}
                  </>
                }
                footer={
                  <>
                    {formatGhs(parseMoney(order.total))}
                    {order.createdAt ? ` · ${new Date(order.createdAt).toLocaleString()}` : ""}
                  </>
                }
                action={
                  <button
                    type="button"
                    onClick={() => openOrder(order)}
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
                  >
                    View
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
