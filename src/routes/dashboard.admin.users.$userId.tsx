import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import {
  deleteAdminUser,
  listAdminUsers,
  resetAdminUserPassword,
  updateAdminUser,
  updateAdminUserStatus,
} from "@/lib/api";
import type { AdminUser, UserStatus } from "@/lib/api/types";
import { PhoneInput } from "@/components/PhoneInput";
import { adminInputCls, AdminPageHeader, useAdminAction } from "@/components/admin/admin-ui";

export const Route = createFileRoute("/dashboard/admin/users/$userId")({
  component: AdminUserDetailPage,
  head: () => ({ meta: [{ title: "User — GoMarket Admin" }] }),
});

const STATUSES: UserStatus[] = ["ACTIVE", "PENDING_APPROVAL", "SUSPENDED", "DELETED"];

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

function AdminUserDetailPage() {
  const { userId } = Route.useParams();
  const navigate = useNavigate();
  const { runAction } = useAdminAction();

  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [statusSubmitting, setStatusSubmitting] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [defaultAddressId, setDefaultAddressId] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [riderFullName, setRiderFullName] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [accountStatus, setAccountStatus] = useState<UserStatus>("ACTIVE");
  const [newPassword, setNewPassword] = useState("");
  const [revokeSessions, setRevokeSessions] = useState(true);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-users", "detail", userId],
    queryFn: () => listAdminUsers({ limit: 100 }),
  });

  const user = data?.items.find((u) => u.id === userId);

  useEffect(() => {
    if (!user) return;
    setPhone(user.phone);
    setEmail(user.email ?? "");
    setAccountStatus(user.status);
    setFirstName(user.customerProfile?.firstName ?? "");
    setLastName(user.customerProfile?.lastName ?? "");
    setDefaultAddressId(user.customerProfile?.defaultAddressId ?? "");
    setBusinessName(user.vendorProfile?.businessName ?? "");
    setContactName(user.vendorProfile?.contactName ?? "");
    setRiderFullName(user.riderProfile?.fullName ?? "");
    setVehicleType(user.riderProfile?.vehicleType ?? "");
    setPlateNumber(user.riderProfile?.plateNumber ?? "");
  }, [user]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading user…</p>;
  }

  if (!user) {
    return (
      <div>
        <p className="text-sm text-destructive">User not found.</p>
        <Link
          to="/dashboard/admin/users"
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> All users
        </Link>
      </div>
    );
  }

  const isCredentialed = user.role === "ADMIN" || Boolean(user.email);

  const onUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSubmitting(true);

    const body: Record<string, unknown> = {
      phone,
      email: email.trim() || null,
    };

    if (user.role === "CUSTOMER") {
      body.customerProfile = {
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        defaultAddressId: defaultAddressId.trim() || undefined,
      };
    } else if (user.role === "VENDOR") {
      body.vendorProfile = {
        businessName: businessName.trim() || undefined,
        contactName: contactName.trim() || undefined,
      };
    } else if (user.role === "RIDER") {
      body.riderProfile = {
        fullName: riderFullName.trim() || undefined,
        vehicleType: vehicleType.trim() || undefined,
        plateNumber: plateNumber.trim() || undefined,
      };
    }

    const ok = await runAction("User updated", () => updateAdminUser(userId, body));
    setProfileSubmitting(false);
    if (ok) void refetch();
  };

  const onUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusSubmitting(true);
    const ok = await runAction("Status updated", () => updateAdminUserStatus(userId, accountStatus));
    setStatusSubmitting(false);
    if (ok) void refetch();
  };

  const onResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return;
    setPasswordSubmitting(true);
    const ok = await runAction("Password reset", () =>
      resetAdminUserPassword(userId, { password: newPassword, revokeSessions }),
    );
    setPasswordSubmitting(false);
    if (ok) setNewPassword("");
  };

  const onSoftDelete = async () => {
    if (!window.confirm(`Soft-delete ${displayName(user)}? Their account will be marked deleted.`)) return;
    setDeleteSubmitting(true);
    const ok = await runAction("User soft-deleted", () => deleteAdminUser(userId));
    setDeleteSubmitting(false);
    if (ok) {
      void refetch();
      void navigate({ to: "/dashboard/admin/users" });
    }
  };

  return (
    <div className="max-w-lg">
      <Link
        to="/dashboard/admin/users"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All users
      </Link>

      <AdminPageHeader
        title={displayName(user)}
        description={`${user.role} · ${user.phone}${user.email ? ` · ${user.email}` : ""}`}
      />

      <dl className="mb-8 divide-y divide-border rounded-xl border border-border/70 bg-muted/20 text-sm">
        {[
          { label: "Status", value: user.status.replace(/_/g, " ") },
          { label: "Role", value: user.role },
          { label: "Joined", value: new Date(user.createdAt).toLocaleString() },
          ...(user.lastLoginAt
            ? [{ label: "Last login", value: new Date(user.lastLoginAt).toLocaleString() }]
            : []),
          ...(user.phoneVerifiedAt
            ? [{ label: "Phone verified", value: new Date(user.phoneVerifiedAt).toLocaleString() }]
            : []),
          ...(user.emailVerifiedAt
            ? [{ label: "Email verified", value: new Date(user.emailVerifiedAt).toLocaleString() }]
            : []),
          ...(user.vendorProfile
            ? [
                { label: "Vendor tier", value: user.vendorProfile.tier },
                {
                  label: "Approval",
                  value: user.vendorProfile.approvalStatus.replace(/_/g, " "),
                },
              ]
            : []),
          ...(user.riderProfile
            ? [
                {
                  label: "Rider approval",
                  value: user.riderProfile.approvalStatus.replace(/_/g, " "),
                },
                { label: "Availability", value: user.riderProfile.availability.replace(/_/g, " ") },
              ]
            : []),
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:justify-between">
            <dt className="text-xs font-medium uppercase text-muted-foreground">{label}</dt>
            <dd className="font-medium sm:text-right">{value}</dd>
          </div>
        ))}
      </dl>

      <form
        onSubmit={(e) => void onUpdateProfile(e)}
        className="space-y-4 rounded-2xl border border-border/60 bg-card p-6"
      >
        <h3 className="font-semibold">Edit profile</h3>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Phone</span>
          <PhoneInput className={adminInputCls} value={phone} onChange={setPhone} required />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Email</span>
          <input
            type="email"
            className={adminInputCls}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Optional"
          />
        </label>

        {user.role === "CUSTOMER" && (
          <>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">First name</span>
              <input className={adminInputCls} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Last name</span>
              <input className={adminInputCls} value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Default address ID</span>
              <input
                className={adminInputCls}
                value={defaultAddressId}
                onChange={(e) => setDefaultAddressId(e.target.value)}
                placeholder="UUID"
              />
            </label>
          </>
        )}

        {user.role === "VENDOR" && (
          <>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Business name</span>
              <input
                className={adminInputCls}
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Contact name</span>
              <input
                className={adminInputCls}
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
            </label>
          </>
        )}

        {user.role === "RIDER" && (
          <>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Full name</span>
              <input
                className={adminInputCls}
                value={riderFullName}
                onChange={(e) => setRiderFullName(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Vehicle type</span>
              <input
                className={adminInputCls}
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Plate number</span>
              <input
                className={adminInputCls}
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
              />
            </label>
          </>
        )}

        <button
          type="submit"
          disabled={profileSubmitting}
          className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {profileSubmitting ? "Saving…" : "Save profile"}
        </button>
      </form>

      <form
        onSubmit={(e) => void onUpdateStatus(e)}
        className="mt-6 space-y-4 rounded-2xl border border-border/60 bg-card p-6"
      >
        <h3 className="font-semibold">Account status</h3>
        <p className="text-sm text-muted-foreground">
          Suspend, reactivate, or mark the account deleted without removing records.
        </p>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Status</span>
          <select
            className={adminInputCls}
            value={accountStatus}
            onChange={(e) => setAccountStatus(e.target.value as UserStatus)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          disabled={statusSubmitting}
          className="w-full rounded-full border border-border px-5 py-3 text-sm font-semibold hover:bg-muted/50 disabled:opacity-60"
        >
          {statusSubmitting ? "Updating…" : "Update status"}
        </button>
      </form>

      {isCredentialed && (
        <form
          onSubmit={(e) => void onResetPassword(e)}
          className="mt-6 space-y-4 rounded-2xl border border-border/60 bg-card p-6"
        >
          <h3 className="font-semibold">Reset password</h3>
          <p className="text-sm text-muted-foreground">
            Set a new password for this credentialed account.
          </p>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">New password</span>
            <input
              type="password"
              className={adminInputCls}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={revokeSessions}
              onChange={(e) => setRevokeSessions(e.target.checked)}
              className="rounded border-border"
            />
            Revoke active sessions
          </label>
          <button
            type="submit"
            disabled={passwordSubmitting || !newPassword.trim()}
            className="w-full rounded-full border border-border px-5 py-3 text-sm font-semibold hover:bg-muted/50 disabled:opacity-60"
          >
            {passwordSubmitting ? "Resetting…" : "Reset password"}
          </button>
        </form>
      )}

      <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
        <h3 className="font-semibold text-destructive">Danger zone</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Soft-delete permanently marks this user as deleted. This cannot be undone from the dashboard.
        </p>
        <button
          type="button"
          onClick={() => void onSoftDelete()}
          disabled={deleteSubmitting || user.status === "DELETED"}
          className="mt-4 w-full rounded-full border border-destructive/50 px-5 py-3 text-sm font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-60"
        >
          {deleteSubmitting ? "Deleting…" : "Soft-delete account"}
        </button>
      </div>
    </div>
  );
}
