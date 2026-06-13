import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Plus, X } from "lucide-react";
import { listAdminUsers } from "@/lib/api";
import type { AdminUser } from "@/lib/api/types";
import { AsyncState } from "@/components/AsyncState";
import { CreateAdminDialog } from "@/components/admin/CreateAdminDialog";
import { AdminUserDetailSheet } from "@/components/admin/AdminUserDetailSheet";
import {
  adminInputCls,
  adminUserDisplayName,
  AdminFilterBar,
  AdminFilterField,
  AdminList,
  AdminListItem,
  AdminPageHeader,
  AdminPrimaryButton,
  AdminRoleBadge,
  AdminStatusBadge,
} from "@/components/admin/admin-ui";
import { normalizeE164Phone } from "@/lib/phone";

export const Route = createFileRoute("/dashboard/admin/users/")({
  validateSearch: (search: Record<string, unknown>) => ({
    userId: typeof search.userId === "string" ? search.userId : undefined,
  }),
  component: AdminUsersPage,
  head: () => ({ meta: [{ title: "Users — GoMarket Admin" }] }),
});

const ROLES = ["", "CUSTOMER", "VENDOR", "RIDER", "ADMIN"] as const;
const STATUSES = ["", "ACTIVE", "PENDING_APPROVAL", "SUSPENDED", "DELETED"] as const;
const SEARCH_DEBOUNCE_MS = 400;

function normalizeAdminUserSearch(input: string): string | undefined {
  const trimmed = input.trim();
  if (!trimmed) return undefined;

  const phoneLike = /^[\d\s\-+().]+$/.test(trimmed) && /\d{6,}/.test(trimmed);
  if (phoneLike) {
    const normalized = normalizeE164Phone(trimmed);
    if (normalized) return normalized;
  }

  return trimmed;
}

function AdminUsersPage() {
  const { userId: searchUserId } = Route.useSearch();
  const [createOpen, setCreateOpen] = useState(false);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [detailPreview, setDetailPreview] = useState<AdminUser | null>(null);
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const filters = useMemo(
    () => ({
      role: role || undefined,
      status: status || undefined,
      search: normalizeAdminUserSearch(debouncedSearch),
    }),
    [role, status, debouncedSearch],
  );

  const hasFilters = Boolean(filters.role || filters.status || filters.search);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-users", filters],
    queryFn: () =>
      listAdminUsers({
        role: filters.role,
        status: filters.status,
        search: filters.search,
        limit: 50,
      }),
  });

  const users = data?.items ?? [];

  useEffect(() => {
    if (searchUserId) {
      setDetailUserId(searchUserId);
      setDetailPreview(users.find((u) => u.id === searchUserId) ?? null);
    }
  }, [searchUserId, users]);

  const openUser = (user: AdminUser) => {
    setDetailPreview(user);
    setDetailUserId(user.id);
  };

  const onFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(searchInput.trim());
  };

  const clearFilters = () => {
    setRole("");
    setStatus("");
    setSearchInput("");
    setDebouncedSearch("");
  };

  return (
    <div>
      <AdminPageHeader
        title="User management"
        description="Search accounts, review roles, and open a user to edit profiles or change account status."
        actions={
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:shadow-md"
          >
            <Plus className="h-4 w-4" /> Create admin
          </button>
        }
      />

      <CreateAdminDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => void refetch()}
        onViewUser={(userId) => {
          setCreateOpen(false);
          setDetailPreview(null);
          setDetailUserId(userId);
        }}
      />

      <AdminUserDetailSheet
        open={detailUserId !== null}
        userId={detailUserId}
        previewUser={detailPreview}
        onOpenChange={(open) => {
          if (!open) {
            setDetailUserId(null);
            setDetailPreview(null);
          }
        }}
        onUpdated={() => void refetch()}
      />

      <AdminFilterBar onSubmit={onFilter}>
        <AdminFilterField label="Role">
          <select className={adminInputCls} value={role} onChange={(e) => setRole(e.target.value)}>
            {ROLES.map((r) => (
              <option key={r || "all"} value={r}>
                {r || "All roles"}
              </option>
            ))}
          </select>
        </AdminFilterField>
        <AdminFilterField label="Status">
          <select className={adminInputCls} value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => (
              <option key={s || "all"} value={s}>
                {s ? s.replace(/_/g, " ") : "All statuses"}
              </option>
            ))}
          </select>
        </AdminFilterField>
        <AdminFilterField label="Search" className="min-w-[14rem] flex-1">
          <input
            className={adminInputCls}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Phone, email, or name…"
            autoComplete="off"
          />
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
          {isFetching && !isLoading ? "Searching…" : `${data?.total ?? 0} matching users`}
          {filters.search ? ` · “${filters.search}”` : ""}
          {filters.role ? ` · ${filters.role}` : ""}
          {filters.status ? ` · ${filters.status.replace(/_/g, " ")}` : ""}
        </p>
      ) : null}

      <AsyncState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isRetrying={isFetching && !isLoading}
        loadingMessage="Loading users…"
        errorTitle="Couldn't load users"
      >
        <AdminList emptyMessage={hasFilters ? "No users match this search" : "No users found"}>
          {users.map((user) => (
            <AdminListItem
              key={user.id}
              onClick={() => openUser(user)}
              title={<span className="font-semibold text-foreground">{adminUserDisplayName(user)}</span>}
              badges={
                <>
                  <AdminRoleBadge role={user.role} />
                  <AdminStatusBadge status={user.status} />
                </>
              }
              action={
                <button
                  type="button"
                  onClick={() => openUser(user)}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
                >
                  View
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              }
              meta={
                <>
                  {user.phone}
                  {user.email ? ` · ${user.email}` : ""}
                </>
              }
              footer={
                <>
                  Joined {new Date(user.createdAt).toLocaleString()}
                  {user.lastLoginAt ? ` · Last login ${new Date(user.lastLoginAt).toLocaleString()}` : ""}
                </>
              }
            />
          ))}
        </AdminList>
        {data && data.total > users.length && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Showing {users.length} of {data.total} users
          </p>
        )}
      </AsyncState>
    </div>
  );
}
