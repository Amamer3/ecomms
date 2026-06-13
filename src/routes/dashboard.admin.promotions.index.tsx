import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Plus, RefreshCw, Search, Tag, X } from "lucide-react";
import { listPromotions } from "@/lib/api";
import { parseMoney } from "@/lib/api/client";
import type { Promotion } from "@/lib/api/types";
import { AsyncState } from "@/components/AsyncState";
import { CreatePromotionDialog } from "@/components/admin/CreatePromotionDialog";
import { AdminPromotionDetailSheet } from "@/components/admin/AdminPromotionDetailSheet";
import {
  adminInputCls,
  AdminFilterBar,
  AdminFilterField,
  AdminList,
  AdminListItem,
  AdminMono,
  AdminPageHeader,
  AdminPrimaryButton,
  AdminStat,
  AdminStatusBadge,
} from "@/components/admin/admin-ui";
import { formatGhs } from "@/lib/format-money";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/admin/promotions/")({
  validateSearch: (search: Record<string, unknown>) => ({
    promotionId: typeof search.promotionId === "string" ? search.promotionId : undefined,
  }),
  component: AdminPromotionsPage,
  head: () => ({ meta: [{ title: "Promotions — GoMarket Admin" }] }),
});

const STATUSES = ["", "ACTIVE", "PAUSED", "EXPIRED"] as const;
const TYPES = ["", "PERCENT", "FIXED", "FREE_DELIVERY"] as const;
const SCOPES = ["", "platform", "store"] as const;
const SEARCH_DEBOUNCE_MS = 400;

function formatPromotionValue(p: Promotion): string {
  if (p.type === "PERCENT") return `${p.value}% off`;
  if (p.type === "FREE_DELIVERY") return "Free delivery";
  return formatGhs(parseMoney(p.value));
}

function matchesPromotionSearch(promotion: Promotion, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [promotion.code, promotion.type, promotion.storeId, promotion.id, promotion.status]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

function AdminPromotionsPage() {
  const { promotionId: searchPromotionId } = Route.useSearch();
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [scope, setScope] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const filters = useMemo(() => ({ status: status || undefined }), [status]);
  const hasFilters = Boolean(filters.status || type || scope || debouncedSearch);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const { data: promotions = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["promotions", "admin", filters],
    queryFn: () => listPromotions({ status: filters.status }),
  });

  const filtered = useMemo(() => {
    return promotions.filter((p) => {
      if (type && p.type !== type) return false;
      if (scope === "platform" && p.storeId) return false;
      if (scope === "store" && !p.storeId) return false;
      return matchesPromotionSearch(p, debouncedSearch);
    });
  }, [promotions, type, scope, debouncedSearch]);

  const selected =
    filtered.find((p) => p.id === selectedId) ?? promotions.find((p) => p.id === selectedId) ?? null;

  useEffect(() => {
    if (searchPromotionId) setSelectedId(searchPromotionId);
  }, [searchPromotionId]);

  const activeCount = promotions.filter((p) => p.status === "ACTIVE").length;
  const pausedCount = promotions.filter((p) => p.status === "PAUSED").length;
  const totalRedemptions = promotions.reduce((sum, p) => sum + p.redeemedCount, 0);

  const openPromotion = (promotion: Promotion) => setSelectedId(promotion.id);

  const clearFilters = () => {
    setStatus("");
    setType("");
    setScope("");
    setSearchInput("");
    setDebouncedSearch("");
  };

  return (
    <div>
      <AdminPageHeader
        title="Promotions"
        description="Create and manage platform or store-scoped coupon codes for checkout."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/40 disabled:opacity-60"
            >
              <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:shadow-md"
            >
              <Plus className="h-4 w-4" /> New promotion
            </button>
          </div>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStat label="Active" value={String(activeCount)} sub="Currently redeemable" icon={Tag} accent={activeCount > 0 ? "primary" : "default"} />
        <AdminStat label="Paused" value={String(pausedCount)} sub="Not accepting redemptions" />
        <AdminStat label="Total redemptions" value={String(totalRedemptions)} sub="Across all codes" />
        <AdminStat label="Shown" value={String(filtered.length)} sub={`${promotions.length} loaded`} />
      </div>

      <CreatePromotionDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => void refetch()}
        onViewPromotion={(id) => {
          setCreateOpen(false);
          setSelectedId(id);
        }}
      />

      <AdminPromotionDetailSheet
        open={selectedId !== null}
        promotion={selected}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
        onUpdated={() => void refetch()}
      />

      <AdminFilterBar
        onSubmit={(e) => {
          e.preventDefault();
          setDebouncedSearch(searchInput.trim());
        }}
      >
        <AdminFilterField label="Status" className="min-w-[10rem]">
          <select className={adminInputCls} value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => (
              <option key={s || "all"} value={s}>
                {s ? s.replace(/_/g, " ") : "All statuses"}
              </option>
            ))}
          </select>
        </AdminFilterField>
        <AdminFilterField label="Type" className="min-w-[10rem]">
          <select className={adminInputCls} value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES.map((t) => (
              <option key={t || "all"} value={t}>
                {t ? t.replace(/_/g, " ") : "All types"}
              </option>
            ))}
          </select>
        </AdminFilterField>
        <AdminFilterField label="Scope" className="min-w-[10rem]">
          <select className={adminInputCls} value={scope} onChange={(e) => setScope(e.target.value)}>
            {SCOPES.map((s) => (
              <option key={s || "all"} value={s}>
                {s === "platform" ? "Platform-wide" : s === "store" ? "Store-scoped" : "All scopes"}
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
              placeholder="Code, store ID…"
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
          {isFetching && !isLoading ? "Searching…" : `${filtered.length} matching promotions`}
        </p>
      ) : null}

      <AsyncState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isRetrying={isFetching && !isLoading}
        loadingMessage="Loading promotions…"
        errorTitle="Couldn't load promotions"
      >
        <AdminList
          emptyMessage={
            hasFilters ? "No promotions match this filter" : "No promotions yet — create your first code"
          }
        >
          {filtered.map((p) => {
            const isSelected = selectedId === p.id;
            return (
              <AdminListItem
                key={p.id}
                onClick={() => openPromotion(p)}
                title={
                  <span
                    className={cn(
                      "font-mono font-semibold",
                      isSelected ? "text-primary" : "text-foreground",
                    )}
                  >
                    {p.code}
                  </span>
                }
                badges={<AdminStatusBadge status={p.status} />}
                meta={
                  <>
                    {formatPromotionValue(p)} · redeemed {p.redeemedCount}
                    {p.storeId ? (
                      <>
                        {" "}
                        · store <AdminMono>{p.storeId.slice(0, 8)}…</AdminMono>
                      </>
                    ) : (
                      " · platform-wide"
                    )}
                  </>
                }
                footer={
                  <>
                    {new Date(p.startsAt).toLocaleDateString()} – {new Date(p.endsAt).toLocaleDateString()}
                  </>
                }
                action={
                  <button
                    type="button"
                    onClick={() => openPromotion(p)}
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
