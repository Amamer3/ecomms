import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { createAddress, listAddresses } from "@/lib/api";
import { ApiError } from "@/lib/api/client";
import { AsyncState } from "@/components/AsyncState";
import { customerInputCls, CustomerPageHeader } from "@/components/customer/customer-ui";
import { PhoneInput } from "@/components/PhoneInput";
import { useAuth } from "@/context/auth";
import { ghanaPhoneInputFrom, normalizeE164Phone } from "@/lib/phone";

export const Route = createFileRoute("/account/addresses")({
  component: AccountAddressesPage,
  head: () => ({ meta: [{ title: "Addresses — GoMarket" }] }),
});

function AccountAddressesPage() {
  const { session } = useAuth();
  const { data: addresses = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["addresses"],
    queryFn: listAddresses,
  });

  const [form, setForm] = useState({
    label: "Home",
    line1: "",
    line2: "",
    city: "Accra",
    region: "Greater Accra",
    country: "GH",
    lat: "5.6037",
    lng: "-0.187",
    landmark: "",
    contactPhone: ghanaPhoneInputFrom(session?.phone),
    isDefault: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phone = normalizeE164Phone(form.contactPhone);
    setSubmitting(true);
    try {
      await createAddress({
        label: form.label.trim() || undefined,
        line1: form.line1.trim(),
        line2: form.line2.trim() || undefined,
        city: form.city.trim(),
        region: form.region.trim() || undefined,
        country: form.country.trim(),
        lat: parseFloat(form.lat),
        lng: parseFloat(form.lng),
        landmark: form.landmark.trim() || undefined,
        contactPhone: phone ?? undefined,
        isDefault: form.isDefault,
      });
      toast.success("Address created");
      setForm((f) => ({
        ...f,
        line1: "",
        line2: "",
        landmark: "",
        contactPhone: ghanaPhoneInputFrom(session?.phone),
      }));
      void refetch();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Could not create address");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <CustomerPageHeader
        title="Delivery addresses"
        description="Saved addresses for checkout and deliveries."
      />

      <AsyncState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isRetrying={isFetching && !isLoading}
        loadingMessage="Loading addresses…"
        errorTitle="Couldn't load addresses"
      >
        <ul className="mb-8 divide-y divide-border rounded-2xl border border-border bg-card">
          {addresses.map((a) => (
            <li key={a.id} className="px-4 py-3 text-sm">
              <p className="font-semibold">
                {a.label ?? "Address"}
                {a.isDefault && (
                  <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    Default
                  </span>
                )}
              </p>
              <p className="text-muted-foreground">
                {a.line1}
                {a.line2 ? `, ${a.line2}` : ""} · {a.city}
              </p>
              {a.landmark && <p className="text-xs text-muted-foreground">{a.landmark}</p>}
            </li>
          ))}
          {addresses.length === 0 && (
            <li className="px-4 py-8 text-center text-muted-foreground">No addresses yet</li>
          )}
        </ul>
      </AsyncState>

      <form
        onSubmit={(e) => void onSubmit(e)}
        className="max-w-lg space-y-4 rounded-2xl border border-border/60 bg-card p-6"
      >
        <h3 className="font-semibold">Add address</h3>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Label</span>
          <input
            className={customerInputCls}
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Address line 1</span>
          <input
            className={customerInputCls}
            value={form.line1}
            onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))}
            required
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Address line 2</span>
          <input
            className={customerInputCls}
            value={form.line2}
            onChange={(e) => setForm((f) => ({ ...f, line2: e.target.value }))}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">City</span>
            <input
              className={customerInputCls}
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              required
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Region</span>
            <input
              className={customerInputCls}
              value={form.region}
              onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
            />
          </label>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Landmark</span>
          <input
            className={customerInputCls}
            value={form.landmark}
            onChange={(e) => setForm((f) => ({ ...f, landmark: e.target.value }))}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Contact phone</span>
          <PhoneInput
            className={customerInputCls}
            value={form.contactPhone}
            onChange={(v) => setForm((f) => ({ ...f, contactPhone: v }))}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
          />
          Set as default address
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Add address"}
        </button>
      </form>
    </div>
  );
}
