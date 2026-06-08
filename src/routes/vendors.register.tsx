import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { ArrowLeft, Store } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";
import { registerVendor } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { useAuth } from "@/context/auth";
import { normalizeE164Phone } from "@/lib/phone";

export const Route = createFileRoute("/vendors/register")({
  component: VendorRegister,
  head: () => ({
    meta: [
      { title: "Vendor registration — GoMarket" },
      { name: "description", content: "Apply to sell on GoMarket." },
    ],
  }),
});

const schema = z.object({
  businessName: z.string().trim().min(2).max(100),
  contactName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(10).max(30),
  password: z.string().min(8).max(100),
  storeName: z.string().trim().min(2).max(100),
  city: z.string().trim().min(2).max(100),
  addressLine: z.string().trim().min(5).max(200),
});

function VendorRegister() {
  const navigate = useNavigate();
  const { setSessionFromTokens } = useAuth();
  const [form, setForm] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "+233",
    password: "",
    storeName: "",
    city: "Accra",
    addressLine: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        errs[i.path[0] as string] = i.message;
      });
      setErrors(errs);
      return;
    }
    setErrors({});
    const phone = normalizeE164Phone(parsed.data.phone);
    if (!phone) {
      setErrors({ phone: "Use E.164 format, e.g. +233200000011" });
      return;
    }
    setSubmitting(true);
    try {
      const tokens = await registerVendor({
        phone,
        email: parsed.data.email,
        password: parsed.data.password,
        businessName: parsed.data.businessName,
        contactName: parsed.data.contactName,
        store: {
          name: parsed.data.storeName,
          city: parsed.data.city,
          addressLine: parsed.data.addressLine,
          lat: 5.6037,
          lng: -0.187,
          prepTimeMinutes: 25,
          deliveryRadiusKm: 8,
        },
      });
      await setSessionFromTokens(tokens, parsed.data.businessName);
      toast.success("Application submitted — pending admin approval");
      navigate({ to: "/dashboard/vendor" });
    } catch (err) {
      toast.error(getErrorMessage(err, "Registration failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <Link to="/vendors" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="mt-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Store className="h-3.5 w-3.5" /> Vendor registration
          </span>
          <h1 className="mt-4 font-display text-2xl font-semibold sm:text-4xl">Register your business</h1>
          <p className="mt-3 text-muted-foreground">Creates your vendor account and first store via the API.</p>
        </div>

        <form onSubmit={(e) => void onSubmit(e)} className="mt-10 grid gap-5 rounded-3xl border border-border/60 bg-card p-6 sm:p-8">
          <Field label="Business name" error={errors.businessName}>
            <input className={inputCls} value={form.businessName} onChange={(e) => update("businessName", e.target.value)} />
          </Field>
          <Field label="Contact name" error={errors.contactName}>
            <input className={inputCls} value={form.contactName} onChange={(e) => update("contactName", e.target.value)} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Email" error={errors.email}>
              <input type="email" className={inputCls} value={form.email} onChange={(e) => update("email", e.target.value)} />
            </Field>
            <Field label="Phone" error={errors.phone}>
              <input className={inputCls} value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </Field>
          </div>
          <Field label="Password" error={errors.password}>
            <input type="password" className={inputCls} value={form.password} onChange={(e) => update("password", e.target.value)} />
          </Field>
          <Field label="Store name" error={errors.storeName}>
            <input className={inputCls} value={form.storeName} onChange={(e) => update("storeName", e.target.value)} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="City" error={errors.city}>
              <input className={inputCls} value={form.city} onChange={(e) => update("city", e.target.value)} />
            </Field>
            <Field label="Store address" error={errors.addressLine}>
              <input className={inputCls} value={form.addressLine} onChange={(e) => update("addressLine", e.target.value)} />
            </Field>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Link to="/vendors" className="rounded-full border border-border px-5 py-3 text-sm font-semibold">
              Cancel
            </Link>
            <button type="submit" disabled={submitting} className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">
              {submitting ? "Submitting…" : "Register"}
            </button>
          </div>
        </form>
      </section>
      <Footer />
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}
