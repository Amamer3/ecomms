import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Award, Phone } from "lucide-react";
import { toast } from "sonner";
import {
  customerInputCls,
  CustomerPageHeader,
  formatTier,
} from "@/components/customer/customer-ui";
import { useAuth } from "@/context/auth";
import { getCustomerProfile, getMe, updateCustomerProfile } from "@/lib/api";
import { ApiError, parseMoney } from "@/lib/api/client";
import { customerProfileDisplayName, saveSessionToStorage, sessionFromUser } from "@/lib/auth-storage";
import { formatGhs } from "@/lib/format-money";

export const Route = createFileRoute("/account/profile")({
  component: AccountProfilePage,
  head: () => ({ meta: [{ title: "Profile — GoMarket" }] }),
});

function AccountProfilePage() {
  const qc = useQueryClient();
  const { session, refreshMe } = useAuth();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["customer-profile"],
    queryFn: getCustomerProfile,
  });

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.firstName ?? "");
    setLastName(profile.lastName ?? "");
    setEmail(profile.email ?? "");
  }, [profile]);

  const loyalty = profile?.loyalty;
  const lifetime = loyalty ? parseMoney(loyalty.lifetimeSpend) : 0;
  const toNext = loyalty?.spendToNextTier ? parseMoney(loyalty.spendToNextTier) : 0;
  const tierProgress =
    loyalty && toNext > 0 ? Math.min(100, Math.round((lifetime / (lifetime + toNext)) * 100)) : 0;

  const save = async () => {
    try {
      const updated = await updateCustomerProfile({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        email: email.trim() || undefined,
      });
      await qc.invalidateQueries({ queryKey: ["customer-profile"] });
      if (session) {
        const user = await getMe();
        saveSessionToStorage(sessionFromUser(user, customerProfileDisplayName(updated)));
        await refreshMe();
      }
      toast.success("Profile updated");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Update failed");
    }
  };

  if (isLoading || !profile) {
    return <p className="text-sm text-muted-foreground">Loading profile…</p>;
  }

  return (
    <div>
      <CustomerPageHeader
        title="Your profile"
        description="View your customer profile and update personal details."
      />

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="order-last space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-6 lg:order-first">
          <h3 className="font-semibold">Personal details</h3>
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">First name</span>
            <input
              className={`mt-1 ${customerInputCls}`}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Last name</span>
            <input
              className={`mt-1 ${customerInputCls}`}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Email (optional)</span>
            <input
              type="email"
              className={`mt-1 ${customerInputCls}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Phone</span>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm">
              <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 break-all">{profile.phone}</span>
            </div>
          </label>
          <button
            type="button"
            onClick={() => void save()}
            className="w-full rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground sm:w-auto"
          >
            Save profile
          </button>
        </section>

        {loyalty && (
          <aside className="order-first h-fit rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)] sm:p-6 lg:order-last">
            <div className="flex items-center gap-2 text-primary">
              <Award className="h-5 w-5" />
              <h3 className="font-semibold">Loyalty</h3>
            </div>
            <p className="mt-3 text-2xl font-semibold">{formatTier(loyalty.tier)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {loyalty.points} point{loyalty.points === 1 ? "" : "s"}
            </p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Lifetime spend</dt>
                <dd className="font-medium">{formatGhs(lifetime)}</dd>
              </div>
              {loyalty.nextTier && loyalty.spendToNextTier && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">To {loyalty.nextTier}</dt>
                  <dd className="font-medium">{formatGhs(toNext)}</dd>
                </div>
              )}
            </dl>
            {loyalty.nextTier && toNext > 0 && (
              <div className="mt-4">
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${tierProgress}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {tierProgress}% toward {loyalty.nextTier}
                </p>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
