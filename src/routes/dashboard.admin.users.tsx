import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listAdminUsers } from "@/lib/api";
import type { AdminUser, UserStatus } from "@/lib/api/types";
import { AsyncState } from "@/components/AsyncState";
import { adminInputCls, AdminPageHeader } from "@/components/admin/admin-ui";

export const Route = createFileRoute("/dashboard/admin/users")({
  component: AdminUsersPage,
  head: () => ({ meta: [{ title: "Users — GoMarket Admin" }] }),
});

const ROLES = ["", "CUSTOMER", "VENDOR", "RIDER", "ADMIN"] as const;
const STATUSES = ["", "ACTIVE", "PENDING_APPROVAL", "SUSPENDED", "DELETED"] as const;

function displayName(user: AdminUser): string {
  if (user.role === "CUSTOMER" && user.customerProfile) {
    const name = [user.customerProfile.firstName, user.customerProfile.lastName].filter(Boolean).join(" ");
    if (name) return name;
  }
  if (user.role === "VENDOR" && user.vendorProfile?.businessName) {
    return user.vendorProfile.businessName;
  }
  if (user.role === "RIDER" && user.riderProfile?.fullName) {
    return user.riderProfile.fullName;
  }
  return user.email ?? user.phone;
}

function statusCls(status: UserStatus): string {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
    case "PENDING_APPROVAL":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400";
    case "SUSPENDED":
      return "bg-orange-500/10 text-orange-700 dark:text-orange-400";
    case "DELETED":
      return "bg-muted text-muted-foreground";
  }
}

function AdminUsersPage() {
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [applied, setApplied] = useState<{ role?: string; status?: string; search?: string }>({});

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-users", applied],
    queryFn: () =>
      listAdminUsers({
        role: applied.role,
        status: applied.status,
        search: applied.search,
        limit: 50,
      }),
  });

  const users = data?.items ?? [];

  const onFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setApplied({
      role: role || undefined,
      status: status || undefined,
      search: search.trim() || undefined,
    });
  };

  return (
    <div>
      <AdminPageHeader
        title="User management"
        description="Search accounts, review roles, and open a user to edit profiles or change account status."
      />

      <form onSubmit={onFilter} className="mb-6 flex flex-wrap items-end gap-3">
        <label className="block min-w-[10rem]">
          <span className="mb-1.5 block text-xs font-medium">Role</span>
          <select className={adminInputCls} value={role} onChange={(e) => setRole(e.target.value)}>
            {ROLES.map((r) => (
              <option key={r || "all"} value={r}>
                {r || "All roles"}
              </option>
            ))}
          </select>
        </label>
        <label className="block min-w-[10rem]">
          <span className="mb-1.5 block text-xs font-medium">Status</span>
          <select className={adminInputCls} value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => (
              <option key={s || "all"} value={s}>
                {s ? s.replace(/_/g, " ") : "All statuses"}
              </option>
            ))}
          </select>
        </label>
        <label className="block min-w-[14rem] flex-1">
          <span className="mb-1.5 block text-xs font-medium">Search</span>
          <input
            className={adminInputCls}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Phone, email, name…"
          />
        </label>
        <button
          type="submit"
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Apply
        </button>
      </form>

      <AsyncState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isRetrying={isFetching && !isLoading}
        loadingMessage="Loading users…"
        errorTitle="Couldn't load users"
      >
        <ul className="space-y-3">
          {users.map((user) => (
            <li key={user.id} className="rounded-2xl border border-border/60 bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link
                  to="/dashboard/admin/users/$userId"
                  params={{ userId: user.id }}
                  className="font-semibold text-primary hover:underline"
                >
                  {displayName(user)}
                </Link>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">{user.role}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusCls(user.status)}`}>
                    {user.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {user.phone}
                {user.email ? ` · ${user.email}` : ""}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Joined {new Date(user.createdAt).toLocaleString()}
                {user.lastLoginAt ? ` · Last login ${new Date(user.lastLoginAt).toLocaleString()}` : ""}
              </p>
            </li>
          ))}
          {users.length === 0 && (
            <li className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              No users match this filter
            </li>
          )}
        </ul>
        {data && data.total > users.length && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Showing {users.length} of {data.total} users
          </p>
        )}
      </AsyncState>
    </div>
  );
}
