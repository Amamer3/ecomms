import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Bike, CheckCircle2, ExternalLink, RefreshCw, Search } from "lucide-react";
import { approveRider, listAdminUsers } from "@/lib/api";
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
} from "@/components/admin/admin-ui";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/admin/riders/approve")({
  component: AdminApproveRiderPage,
  head: () => ({ meta: [{ title: "Approve courier — GoMarket" }] }),
});

function riderProfileId(user: AdminUser): string | null {
  return user.riderProfile?.id ?? null;
}

function matchesRiderSearch(user: AdminUser, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const profile = user.riderProfile;
  const haystack = [
    profile?.fullName,
    profile?.vehicleType,
    profile?.plateNumber,
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

function AdminApproveRiderPage() {
  const { runAction } = useAdminAction();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmUser, setConfirmUser] = useState<AdminUser | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [manualId, setManualId] = useState("");
  const [manualOpen, setManualOpen] = useState(false);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-pending-riders"],
    queryFn: () =>
      listAdminUsers({
        role: "RIDER",
        status: "PENDING_APPROVAL",
        limit: 100,
      }),
  });

  const pendingRiders = useMemo(() => {
    const items = (data?.items ?? []).filter(
      (user) => user.riderProfile?.approvalStatus === "PENDING_APPROVAL" && riderProfileId(user),
    );
    return items.filter((user) => matchesRiderSearch(user, search));
  }, [data?.items, search]);

  const selected =
    pendingRiders.find((user) => user.id === selectedId) ??
    (data?.items ?? []).find((user) => user.id === selectedId) ??
    null;

  const openConfirm = (user: AdminUser) => {
    if (!riderProfileId(user)) return;
    setConfirmUser(user);
  };

  const onApprove = async (profileId: string) => {
    setApprovingId(profileId);
    try {
      await runAction("Courier approved", () => approveRider(profileId));
      if (selected?.riderProfile?.id === profileId) {
        setSelectedId(null);
      }
      setConfirmUser(null);
      setManualId("");
    } finally {
      setApprovingId(null);
    }
  };

  const onManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = manualId.trim();
    if (!id) return;
    setConfirmUser({
      id: "manual",
      role: "RIDER",
      phone: "",
      status: "PENDING_APPROVAL",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      riderProfile: {
        id,
        approvalStatus: "PENDING_APPROVAL",
        availability: "OFFLINE",
      },
    });
  };

  const pendingTotal = data?.total ?? pendingRiders.length;
  const confirmProfileId = confirmUser ? (riderProfileId(confirmUser) ?? manualId.trim()) : "";

  return (
    <div>
      <AdminPageHeader
        title="Approve couriers"
        description="Review pending rider applications and activate accounts so they can accept deliveries."
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

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:max-w-xl">
        <AdminStat
          label="Pending couriers"
          value={String(pendingTotal)}
          sub={
            pendingRiders.length === pendingTotal
              ? "Awaiting your review"
              : `${pendingRiders.length} shown after filter`
          }
          icon={Bike}
          accent={pendingTotal > 0 ? "warning" : "default"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <AdminFilterBar
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <AdminFilterField label="Search queue" className="min-w-[14rem] flex-1">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  className={cn(adminInputCls, "pl-9")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Name, vehicle, plate, phone, email…"
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
            loadingMessage="Loading pending couriers…"
            errorTitle="Couldn't load courier queue"
          >
            <AdminList
              emptyMessage={
                search ? "No pending couriers match this search" : "No couriers awaiting approval"
              }
            >
              {pendingRiders.map((user) => {
                const profileId = riderProfileId(user)!;
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
                    badges={<AdminStatusBadge status={user.riderProfile?.approvalStatus ?? user.status} />}
                    meta={
                      <>
                        {user.riderProfile?.vehicleType ? `${user.riderProfile.vehicleType}` : "—"}
                        {user.riderProfile?.plateNumber ? ` · ${user.riderProfile.plateNumber}` : ""}
                        {` · ${user.phone}`}
                        {user.email ? ` · ${user.email}` : ""}
                      </>
                    }
                    footer={`Applied ${new Date(user.createdAt).toLocaleString()}`}
                    action={
                      <button
                        type="button"
                        onClick={() => openConfirm(user)}
                        disabled={approvingId === profileId}
                        className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {approvingId === profileId ? "Approving…" : "Approve"}
                      </button>
                    }
                  />
                );
              })}
            </AdminList>
          </AsyncState>
        </div>

        <div className="lg:col-span-2">
          {selected && riderProfileId(selected) ? (
            <RiderReviewPanel
              user={selected}
              approving={approvingId === riderProfileId(selected)}
              onApprove={() => openConfirm(selected)}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-border/80 bg-muted/10 px-6 py-14 text-center lg:sticky lg:top-6">
              <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-muted/60 text-muted-foreground">
                <Bike className="h-6 w-6" />
              </span>
              <p className="text-sm font-medium text-foreground">Select a courier to review</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose an application from the queue to see rider details and approve.
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
          Approve by profile ID
          <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
            Use when you already have the rider profile ID from another system or support ticket.
          </span>
        </summary>
        <div className="border-t border-border/60 px-5 pb-5 pt-4">
          <form onSubmit={onManualSubmit} className="max-w-lg space-y-4">
            <label className="block">
              <span className={adminLabelCls}>Rider profile ID</span>
              <input
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                placeholder="e.g. clx…"
                className={adminInputCls}
              />
            </label>
            <AdminPrimaryButton type="submit" disabled={!manualId.trim()}>
              Review & approve
            </AdminPrimaryButton>
          </form>
        </div>
      </details>

      <AlertDialog
        open={confirmUser !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmUser(null);
        }}
      >
        {confirmUser ? (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Approve this courier?</AlertDialogTitle>
              <AlertDialogDescription>
                {confirmUser.id === "manual" ? (
                  <>
                    This will activate rider profile <AdminMono>{confirmProfileId}</AdminMono> so they can
                    accept and complete deliveries.
                  </>
                ) : (
                  <>
                    <span className="font-medium text-foreground">{adminUserDisplayName(confirmUser)}</span> will
                    be activated and can start accepting deliveries on the platform.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={approvingId !== null}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={!confirmProfileId || approvingId !== null}
                onClick={(e) => {
                  e.preventDefault();
                  void onApprove(confirmProfileId);
                }}
              >
                {approvingId ? "Approving…" : "Approve courier"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        ) : null}
      </AlertDialog>
    </div>
  );
}

function RiderReviewPanel({
  user,
  approving,
  onApprove,
}: {
  user: AdminUser;
  approving: boolean;
  onApprove: () => void;
}) {
  const profile = user.riderProfile!;

  return (
    <div className="space-y-4 lg:sticky lg:top-6">
      <AdminFormCard
        title={adminUserDisplayName(user)}
        description="Review application details before activating this courier account."
      >
        <AdminDetailGrid
          rows={[
            { label: "Full name", value: profile.fullName ?? "—" },
            { label: "Phone", value: user.phone },
            { label: "Email", value: user.email ?? "—" },
            { label: "Vehicle", value: profile.vehicleType ?? "—" },
            { label: "Plate number", value: profile.plateNumber ?? "—" },
            {
              label: "Account status",
              value: <AdminStatusBadge status={user.status} />,
            },
            {
              label: "Approval",
              value: <AdminStatusBadge status={profile.approvalStatus} />,
            },
            {
              label: "Availability",
              value: <AdminStatusBadge status={profile.availability} />,
            },
            {
              label: "Rating",
              value:
                profile.ratingCount && profile.ratingCount > 0
                  ? `${profile.rating?.toFixed(1) ?? "—"} (${profile.ratingCount})`
                  : "No ratings yet",
            },
            {
              label: "Profile ID",
              value: <AdminMono>{profile.id}</AdminMono>,
            },
            {
              label: "Applied",
              value: new Date(user.createdAt).toLocaleString(),
            },
          ]}
        />

        <div className="flex flex-col gap-2 sm:flex-row">
          <AdminPrimaryButton
            type="button"
            disabled={approving}
            onClick={onApprove}
            className="flex-1"
          >
            <CheckCircle2 className="h-4 w-4" />
            {approving ? "Approving…" : "Approve courier"}
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
