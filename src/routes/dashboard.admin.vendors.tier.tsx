import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, RefreshCw, Search, Store } from "lucide-react";
import { toast } from "sonner";
import { listAdminUsers, setVendorTier } from "@/lib/api";
import type { AdminUser } from "@/lib/api/types";
import { AsyncState } from "@/components/AsyncState";
import {
  adminInputCls,
  adminLabelCls,
  adminUserDisplayName,
  AdminDetailGrid,
  AdminFilterBar,
  AdminFilterField,
  AdminFormCard,
  AdminList,
  AdminListItem,
  AdminMono,
  AdminPageHeader,
  AdminPrimaryButton,
  AdminStat,
  AdminStatusBadge,
  useAdminAction,
  VENDOR_TIERS,
} from "@/components/admin/admin-ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/admin/vendors/tier")({
  component: AdminVendorTierPage,
  head: () => ({ meta: [{ title: "Vendor tier — GoMarket" }] }),
});

const TIER_DEFAULTS: Record<(typeof VENDOR_TIERS)[number], number> = {
  STANDARD: 0.15,
  PREMIUM: 0.12,
  ELITE: 0.1,
};

const TIER_DESCRIPTIONS: Record<(typeof VENDOR_TIERS)[number], string> = {
  STANDARD: "Default partnership — standard visibility and support.",
  PREMIUM: "Reduced commission for higher-volume partners.",
  ELITE: "Top-tier partners with the lowest platform fee.",
};

function vendorProfileId(user: AdminUser): string | null {
  return user.vendorProfile?.id ?? null;
}

function matchesVendorSearch(user: AdminUser, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const profile = user.vendorProfile;
  const haystack = [
    profile?.businessName,
    profile?.contactName,
    profile?.tier,
    user.email,
    user.phone,
    profile?.id,
    user.id,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

function parseCommissionRate(value: string): number | null {
  const rate = parseFloat(value);
  if (!Number.isFinite(rate) || rate < 0 || rate > 1) return null;
  return rate;
}

function formatCommissionRate(rate: string | number): string {
  const n = typeof rate === "number" ? rate : parseFloat(rate);
  return Number.isFinite(n) ? `${(n * 100).toFixed(1)}%` : "—";
}

function AdminVendorTierPage() {
  const { runAction } = useAdminAction();
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tier, setTier] = useState<(typeof VENDOR_TIERS)[number]>("STANDARD");
  const [commissionRate, setCommissionRate] = useState("0.15");
  const [submitting, setSubmitting] = useState(false);
  const [manualId, setManualId] = useState("");
  const [manualOpen, setManualOpen] = useState(false);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-vendors-tier"],
    queryFn: () =>
      listAdminUsers({
        role: "VENDOR",
        status: "ACTIVE",
        limit: 100,
      }),
  });

  const activeVendors = useMemo(() => {
    const items = (data?.items ?? []).filter(
      (user) =>
        user.vendorProfile?.approvalStatus === "ACTIVE" &&
        vendorProfileId(user) &&
        (!tierFilter || user.vendorProfile?.tier === tierFilter),
    );
    return items.filter((user) => matchesVendorSearch(user, search));
  }, [data?.items, search, tierFilter]);

  const selected =
    activeVendors.find((user) => user.id === selectedId) ??
    (data?.items ?? []).find((user) => user.id === selectedId) ??
    null;

  const tierCounts = useMemo(() => {
    const counts = { STANDARD: 0, PREMIUM: 0, ELITE: 0 };
    for (const user of data?.items ?? []) {
      const t = user.vendorProfile?.tier;
      if (t && t in counts) counts[t as keyof typeof counts] += 1;
    }
    return counts;
  }, [data?.items]);

  useEffect(() => {
    if (!selected?.vendorProfile) return;
    setTier(selected.vendorProfile.tier);
    setCommissionRate(String(parseFloat(selected.vendorProfile.commissionRate) || TIER_DEFAULTS.STANDARD));
  }, [selected?.id, selected?.vendorProfile?.tier, selected?.vendorProfile?.commissionRate]);

  const hasChanges =
    selected?.vendorProfile &&
    (tier !== selected.vendorProfile.tier ||
      parseCommissionRate(commissionRate) !== parseFloat(selected.vendorProfile.commissionRate));

  const onTierChange = (next: (typeof VENDOR_TIERS)[number]) => {
    setTier(next);
    setCommissionRate(String(TIER_DEFAULTS[next]));
  };

  const onSave = async (profileId: string) => {
    const rate = parseCommissionRate(commissionRate);
    if (rate === null) {
      toast.error("Commission rate must be between 0 and 1 (e.g. 0.12 for 12%)");
      return;
    }
    setSubmitting(true);
    try {
      await runAction("Vendor tier updated", () => setVendorTier(profileId, { tier, commissionRate: rate }));
      await refetch();
    } finally {
      setSubmitting(false);
    }
  };

  const onManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = manualId.trim();
    if (!id) return;
    setSelectedId(null);
    void onSave(id);
  };

  return (
    <div>
      <AdminPageHeader
        title="Vendor tiers"
        description="Manage partnership tiers and commission rates for active vendors on the platform."
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
          label="Active vendors"
          value={String(data?.total ?? activeVendors.length)}
          sub="Eligible for tier changes"
          icon={Store}
        />
        {VENDOR_TIERS.map((t) => (
          <AdminStat
            key={t}
            label={`${t} tier`}
            value={String(tierCounts[t])}
            sub={TIER_DESCRIPTIONS[t]}
            accent={t === "ELITE" ? "primary" : "default"}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <AdminFilterBar
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <AdminFilterField label="Tier" className="min-w-[10rem]">
              <select
                className={adminInputCls}
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
              >
                <option value="">All tiers</option>
                {VENDOR_TIERS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </AdminFilterField>
            <AdminFilterField label="Search vendors" className="min-w-[14rem] flex-1">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  className={cn(adminInputCls, "pl-9")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Business, contact, phone, email…"
                  autoComplete="off"
                />
              </div>
            </AdminFilterField>
          </AdminFilterBar>

          <AsyncState
            isLoading={isLoading}
            isError={isError}
            error={error}
            onRetry={() => void refetch()}
            isRetrying={isFetching && !isLoading}
            loadingMessage="Loading vendors…"
            errorTitle="Couldn't load vendors"
          >
            <AdminList
              emptyMessage={
                search || tierFilter
                  ? "No active vendors match this filter"
                  : "No active vendors found"
              }
            >
              {activeVendors.map((user) => {
                const profile = user.vendorProfile!;
                const isSelected = selectedId === user.id;
                return (
                  <AdminListItem
                    key={user.id}
                    onClick={() => setSelectedId(user.id)}
                    title={
                      <span
                        className={cn(
                          "font-semibold",
                          isSelected ? "text-primary" : "text-foreground",
                        )}
                      >
                        {adminUserDisplayName(user)}
                      </span>
                    }
                    badges={
                      <>
                        <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                          {profile.tier}
                        </span>
                        <AdminStatusBadge status={profile.approvalStatus} />
                      </>
                    }
                    meta={
                      <>
                        {formatCommissionRate(profile.commissionRate)} commission
                        {profile.contactName ? ` · ${profile.contactName}` : ""}
                        {` · ${user.phone}`}
                      </>
                    }
                    footer={`${profile.storeCount} store${profile.storeCount === 1 ? "" : "s"}`}
                  />
                );
              })}
            </AdminList>
          </AsyncState>
        </div>

        <div className="lg:col-span-2">
          {selected && vendorProfileId(selected) ? (
            <VendorTierEditor
              user={selected}
              tier={tier}
              commissionRate={commissionRate}
              submitting={submitting}
              hasChanges={Boolean(hasChanges)}
              onTierChange={onTierChange}
              onCommissionChange={setCommissionRate}
              onApplyTierDefault={() => setCommissionRate(String(TIER_DEFAULTS[tier]))}
              onSave={() => void onSave(vendorProfileId(selected)!)}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-border/80 bg-muted/10 px-6 py-14 text-center lg:sticky lg:top-6">
              <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-muted/60 text-muted-foreground">
                <Store className="h-6 w-6" />
              </span>
              <p className="text-sm font-medium text-foreground">Select a vendor</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose a vendor from the list to view their tier and update commission.
              </p>
            </div>
          )}
        </div>
      </div>

      <details
        className="mt-8 rounded-2xl border border-border/60 bg-card/50 shadow-[var(--shadow-soft)]"
        open={manualOpen}
        onToggle={(e) => setManualOpen(e.currentTarget.open)}
      >
        <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
          Update by profile ID
          <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
            Apply tier changes when you have the vendor profile ID but not the account in the list.
          </span>
        </summary>
        <div className="border-t border-border/60 px-5 pb-5 pt-4">
          <form onSubmit={onManualSubmit} className="max-w-lg space-y-4">
            <label className="block">
              <span className={adminLabelCls}>Vendor profile ID</span>
              <input
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                placeholder="e.g. clx…"
                className={adminInputCls}
              />
            </label>
            <label className="block">
              <span className={adminLabelCls}>Tier</span>
              <select
                value={tier}
                onChange={(e) => onTierChange(e.target.value as (typeof VENDOR_TIERS)[number])}
                className={adminInputCls}
              >
                {VENDOR_TIERS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={adminLabelCls}>Commission rate (0–1)</span>
              <input
                type="number"
                min={0}
                max={1}
                step={0.01}
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                className={adminInputCls}
              />
              <span className="mt-1 block text-xs text-muted-foreground">
                {parseCommissionRate(commissionRate) !== null
                  ? `Equals ${formatCommissionRate(commissionRate)} platform fee`
                  : "Enter a decimal between 0 and 1"}
              </span>
            </label>
            <AdminPrimaryButton type="submit" disabled={submitting || !manualId.trim()}>
              {submitting ? "Updating…" : "Update tier"}
            </AdminPrimaryButton>
          </form>
        </div>
      </details>
    </div>
  );
}

function VendorTierEditor({
  user,
  tier,
  commissionRate,
  submitting,
  hasChanges,
  onTierChange,
  onCommissionChange,
  onApplyTierDefault,
  onSave,
}: {
  user: AdminUser;
  tier: (typeof VENDOR_TIERS)[number];
  commissionRate: string;
  submitting: boolean;
  hasChanges: boolean;
  onTierChange: (tier: (typeof VENDOR_TIERS)[number]) => void;
  onCommissionChange: (value: string) => void;
  onApplyTierDefault: () => void;
  onSave: () => void;
}) {
  const profile = user.vendorProfile!;
  const parsedRate = parseCommissionRate(commissionRate);

  return (
    <div className="lg:sticky lg:top-6">
      <AdminFormCard
        title={adminUserDisplayName(user)}
        description="Adjust partnership tier and commission. Changes apply immediately for new orders."
      >
        <AdminDetailGrid
          rows={[
            { label: "Business", value: profile.businessName },
            { label: "Contact", value: profile.contactName ?? "—" },
            { label: "Current tier", value: profile.tier },
            {
              label: "Current commission",
              value: formatCommissionRate(profile.commissionRate),
            },
            { label: "Stores", value: String(profile.storeCount) },
            {
              label: "Profile ID",
              value: <AdminMono>{profile.id}</AdminMono>,
            },
          ]}
        />

        <div className="space-y-4">
          <label className="block">
            <span className={adminLabelCls}>New tier</span>
            <select
              value={tier}
              onChange={(e) => onTierChange(e.target.value as (typeof VENDOR_TIERS)[number])}
              className={adminInputCls}
            >
              {VENDOR_TIERS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-xs text-muted-foreground">{TIER_DESCRIPTIONS[tier]}</span>
          </label>

          <label className="block">
            <span className={adminLabelCls}>Commission rate (0–1)</span>
            <input
              type="number"
              min={0}
              max={1}
              step={0.01}
              value={commissionRate}
              onChange={(e) => onCommissionChange(e.target.value)}
              className={adminInputCls}
            />
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>
                {parsedRate !== null
                  ? `Equals ${formatCommissionRate(parsedRate)} platform fee`
                  : "Enter a decimal between 0 and 1"}
              </span>
              <button
                type="button"
                onClick={onApplyTierDefault}
                className="font-semibold text-primary hover:underline"
              >
                Use {formatCommissionRate(TIER_DEFAULTS[tier])} default
              </button>
            </div>
          </label>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <AdminPrimaryButton
            type="button"
            disabled={submitting || parsedRate === null || !hasChanges}
            onClick={onSave}
            className="flex-1"
          >
            {submitting ? "Saving…" : hasChanges ? "Save changes" : "No changes"}
          </AdminPrimaryButton>
          <Link
            to="/dashboard/admin/users"
            search={{ userId: user.id }}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/40"
          >
            <ExternalLink className="h-4 w-4" />
            Full profile
          </Link>
        </div>
      </AdminFormCard>
    </div>
  );
}
