import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  deleteAdminUser,
  getAdminUser,
  resetAdminUserPassword,
  updateAdminUser,
  updateAdminUserStatus,
} from "@/lib/api";
import type { UserStatus } from "@/lib/api/types";
import { PhoneInput } from "@/components/PhoneInput";
import { PasswordField } from "@/components/auth/PasswordField";
import {
  adminInputCls,
  adminLabelCls,
  adminUserDisplayName,
  AdminDetailGrid,
  AdminFormCard,
  AdminPageHeader,
  AdminPrimaryButton,
  AdminRoleBadge,
  AdminStatusBadge,
  useAdminAction,
} from "@/components/admin/admin-ui";

const STATUSES: UserStatus[] = ["ACTIVE", "PENDING_APPROVAL", "SUSPENDED", "DELETED"];

export function AdminUserDetailContent({
  userId,
  onDeleted,
  onUpdated,
}: {
  userId: string;
  onDeleted?: () => void;
  onUpdated?: () => void;
}) {
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

  const { data: user, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-user", userId],
    queryFn: () => getAdminUser(userId),
    enabled: Boolean(userId),
  });

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

  if (isError || !user) {
    return <p className="text-sm text-destructive">Could not load this user.</p>;
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
    if (ok) {
      void refetch();
      onUpdated?.();
    }
  };

  const onUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusSubmitting(true);
    const ok = await runAction("Status updated", () => updateAdminUserStatus(userId, accountStatus));
    setStatusSubmitting(false);
    if (ok) {
      void refetch();
      onUpdated?.();
    }
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
    if (!window.confirm(`Soft-delete ${adminUserDisplayName(user)}? Their account will be marked deleted.`)) {
      return;
    }
    setDeleteSubmitting(true);
    const ok = await runAction("User soft-deleted", () => deleteAdminUser(userId));
    setDeleteSubmitting(false);
    if (ok) onDeleted?.();
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={adminUserDisplayName(user)}
        description={`${user.phone}${user.email ? ` · ${user.email}` : ""}`}
        actions={
          <>
            <AdminRoleBadge role={user.role} />
            <AdminStatusBadge status={user.status} />
          </>
        }
      />

      <AdminDetailGrid
        rows={[
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
        ]}
      />

      <form onSubmit={(e) => void onUpdateProfile(e)}>
        <AdminFormCard title="Edit profile">
          <label className="block">
            <span className={adminLabelCls}>Phone</span>
            <PhoneInput className={adminInputCls} value={phone} onChange={setPhone} required />
          </label>
          <label className="block">
            <span className={adminLabelCls}>Email</span>
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
                <span className={adminLabelCls}>First name</span>
                <input className={adminInputCls} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </label>
              <label className="block">
                <span className={adminLabelCls}>Last name</span>
                <input className={adminInputCls} value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </label>
              <label className="block">
                <span className={adminLabelCls}>Default address ID</span>
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
                <span className={adminLabelCls}>Business name</span>
                <input
                  className={adminInputCls}
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </label>
              <label className="block">
                <span className={adminLabelCls}>Contact name</span>
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
                <span className={adminLabelCls}>Full name</span>
                <input
                  className={adminInputCls}
                  value={riderFullName}
                  onChange={(e) => setRiderFullName(e.target.value)}
                />
              </label>
              <label className="block">
                <span className={adminLabelCls}>Vehicle type</span>
                <input
                  className={adminInputCls}
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                />
              </label>
              <label className="block">
                <span className={adminLabelCls}>Plate number</span>
                <input
                  className={adminInputCls}
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                />
              </label>
            </>
          )}

          <AdminPrimaryButton type="submit" disabled={profileSubmitting} className="w-full">
            {profileSubmitting ? "Saving…" : "Save profile"}
          </AdminPrimaryButton>
        </AdminFormCard>
      </form>

      <form onSubmit={(e) => void onUpdateStatus(e)}>
        <AdminFormCard
          title="Account status"
          description="Suspend, reactivate, or mark the account deleted without removing records."
        >
          <label className="block">
            <span className={adminLabelCls}>Status</span>
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
          <AdminPrimaryButton type="submit" disabled={statusSubmitting} className="w-full">
            {statusSubmitting ? "Updating…" : "Update status"}
          </AdminPrimaryButton>
        </AdminFormCard>
      </form>

      {isCredentialed && (
        <form onSubmit={(e) => void onResetPassword(e)}>
          <AdminFormCard
            title="Reset password"
            description="Set a new password for this credentialed account."
          >
            <PasswordField
              id={`reset-password-${userId}`}
              label="New password"
              value={newPassword}
              onChange={setNewPassword}
              autoComplete="new-password"
              inputClassName={adminInputCls}
              labelClassName={adminLabelCls}
              className="space-y-1.5"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={revokeSessions}
                onChange={(e) => setRevokeSessions(e.target.checked)}
                className="rounded border-border"
              />
              Revoke active sessions
            </label>
            <AdminPrimaryButton
              type="submit"
              disabled={passwordSubmitting || !newPassword.trim()}
              className="w-full"
            >
              {passwordSubmitting ? "Resetting…" : "Reset password"}
            </AdminPrimaryButton>
          </AdminFormCard>
        </form>
      )}

      <AdminFormCard
        title="Danger zone"
        description="Soft-delete permanently marks this user as deleted. This cannot be undone from the dashboard."
        className="border-destructive/30 bg-destructive/5"
      >
        <button
          type="button"
          onClick={() => void onSoftDelete()}
          disabled={deleteSubmitting || user.status === "DELETED"}
          className="w-full rounded-full border border-destructive/50 px-5 py-3 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
        >
          {deleteSubmitting ? "Deleting…" : "Soft-delete account"}
        </button>
      </AdminFormCard>
    </div>
  );
}
