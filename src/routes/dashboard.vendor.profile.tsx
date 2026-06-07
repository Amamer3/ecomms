import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getVendorProfile, updateVendorProfile } from "@/lib/api";
import {
  useVendorAction,
  vendorInputCls,
  VendorDetailGrid,
  VendorPageHeader,
} from "@/components/vendor/vendor-ui";

export const Route = createFileRoute("/dashboard/vendor/profile")({
  component: VendorProfilePage,
  head: () => ({ meta: [{ title: "Vendor profile — GoMarket" }] }),
});

function VendorProfilePage() {
  const { runAction } = useVendorAction();
  const [submitting, setSubmitting] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["vendor-profile"],
    queryFn: getVendorProfile,
  });

  useEffect(() => {
    if (!profile) return;
    setBusinessName(profile.businessName);
    setContactName(profile.contactName ?? "");
    setEmail(profile.email ?? "");
  }, [profile]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await runAction("Profile updated", () =>
        updateVendorProfile({
          businessName: businessName.trim(),
          contactName: contactName.trim() || undefined,
          email: email.trim() || undefined,
        }),
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || !profile) {
    return <p className="text-sm text-muted-foreground">Loading profile…</p>;
  }

  return (
    <div className="max-w-lg">
      <VendorPageHeader
        title="Vendor profile"
        description="Your business identity on the marketplace."
      />

      <VendorDetailGrid
        rows={[
          { label: "Status", value: profile.approvalStatus },
          { label: "Tier", value: profile.tier },
          { label: "Commission", value: `${(profile.commissionRate * 100).toFixed(0)}%` },
          { label: "Stores", value: String(profile.storeCount) },
          { label: "Phone", value: profile.phone },
        ]}
      />

      <form
        onSubmit={(e) => void onSubmit(e)}
        className="mt-8 space-y-4 rounded-2xl border border-border/60 bg-card p-6"
      >
        <h3 className="font-semibold">Update details</h3>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Business name</span>
          <input
            className={vendorInputCls}
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Contact name</span>
          <input
            className={vendorInputCls}
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Email</span>
          <input
            type="email"
            className={vendorInputCls}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save profile"}
        </button>
      </form>
    </div>
  );
}
