import { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { createAdminUser } from "@/lib/api";
import type { AdminUserCreateResult } from "@/lib/api/types";
import { PhoneInput } from "@/components/PhoneInput";
import { PasswordField } from "@/components/auth/PasswordField";
import {
  adminInputCls,
  adminLabelCls,
  AdminPrimaryButton,
  useAdminAction,
} from "@/components/admin/admin-ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { defaultGhanaPhoneInput, E164_PHONE_HINT, normalizeE164Phone } from "@/lib/phone";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "sonner";

export function CreateAdminDialog({
  open,
  onOpenChange,
  onCreated,
  onViewUser,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
  onViewUser?: (userId: string) => void;
}) {
  const { invalidate } = useAdminAction();
  const [submitting, setSubmitting] = useState(false);
  const [phone, setPhone] = useState(defaultGhanaPhoneInput);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [created, setCreated] = useState<AdminUserCreateResult | null>(null);

  const resetForm = () => {
    setPhone(defaultGhanaPhoneInput());
    setEmail("");
    setPassword("");
    setCreated(null);
  };

  useEffect(() => {
    if (!open) resetForm();
  }, [open]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedPhone = normalizeE164Phone(phone);
    if (!normalizedPhone) {
      toast.error(E164_PHONE_HINT);
      return;
    }
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error("Email is required");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createAdminUser({
        phone: normalizedPhone,
        email: trimmedEmail,
        password,
      });
      toast.success("Admin user created");
      invalidate();
      onCreated?.();
      setCreated(result);
      setPassword("");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not create admin user"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,40rem)] overflow-y-auto sm:max-w-md">
        {created ? (
          <>
            <DialogHeader>
              <DialogTitle>Admin created</DialogTitle>
              <DialogDescription>
                {created.message ?? "The new admin can sign in at the business portal."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] p-4">
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Shield className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{created.user.email ?? created.user.phone}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {created.user.role} · {created.user.status}
                  </p>
                </div>
              </div>

              {created.mfaRequired && created.otpauthUri ? (
                <div className="rounded-lg border border-border/60 bg-card p-3">
                  <p className="text-sm font-semibold">Two-factor setup required</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Share this TOTP URI so they can enrol an authenticator before first sign-in.
                  </p>
                  <p className="mt-2 break-all rounded-md bg-muted/40 p-2 font-mono text-[11px]">
                    {created.otpauthUri}
                  </p>
                </div>
              ) : null}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <AdminPrimaryButton
                onClick={() => {
                  resetForm();
                }}
              >
                Create another
              </AdminPrimaryButton>
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  onViewUser?.(created.user.id);
                }}
                className="inline-flex items-center justify-center rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted/50"
              >
                View user
              </button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create admin</DialogTitle>
              <DialogDescription>
                Add a platform administrator. They sign in at the business portal with email and password.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
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
                  placeholder="ops.admin@gromarket.com"
                  autoComplete="off"
                  required
                />
              </label>
              <PasswordField
                key={open ? "create-admin-password" : "closed"}
                id="create-admin-password"
                label="Initial password"
                value={password}
                onChange={setPassword}
                autoComplete="new-password"
                inputClassName={adminInputCls}
                labelClassName={adminLabelCls}
                className="space-y-1.5"
              />
              <p className="text-xs text-muted-foreground">At least 8 characters.</p>

              <DialogFooter className="gap-2 pt-2 sm:gap-0">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="inline-flex items-center justify-center rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted/50"
                >
                  Cancel
                </button>
                <AdminPrimaryButton type="submit" disabled={submitting}>
                  {submitting ? "Creating…" : "Create admin"}
                </AdminPrimaryButton>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
