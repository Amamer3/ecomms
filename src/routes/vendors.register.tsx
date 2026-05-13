import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { ArrowLeft, Store } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";

export const Route = createFileRoute("/vendors/register")({
  component: VendorRegister,
  head: () => ({
    meta: [
      { title: "Vendor registration — Randy's Commerce" },
      { name: "description", content: "Apply to sell on Randy's Commerce. Tell us about your business and start reaching new customers." },
    ],
  }),
});

const schema = z.object({
  businessName: z.string().trim().min(2, "Business name is required").max(100),
  ownerName: z.string().trim().min(2, "Owner name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().min(6, "Phone is required").max(30),
  category: z.string().min(1, "Pick a category"),
  city: z.string().trim().min(2, "City is required").max(100),
  description: z.string().trim().min(10, "Tell us a bit more").max(500),
});

function VendorRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    businessName: "", ownerName: "", email: "", phone: "",
    category: "", city: "", description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const existing = JSON.parse(localStorage.getItem("randys_vendors") || "[]");
      existing.push({ ...parsed.data, id: crypto.randomUUID(), status: "pending", createdAt: Date.now() });
      localStorage.setItem("randys_vendors", JSON.stringify(existing));
      localStorage.setItem("randys_active_vendor", parsed.data.businessName);
      toast.success("Application received!", { description: "Welcome aboard. Redirecting to your dashboard…" });
      setTimeout(() => navigate({ to: "/dashboard/vendor" }), 800);
    } catch {
      toast.error("Something went wrong. Try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Link to="/vendors" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="mt-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Store className="h-3.5 w-3.5" /> Vendor application
          </span>
          <h1 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">Tell us about your business</h1>
          <p className="mt-3 text-muted-foreground">A few quick details and you're on your way to selling on Randy's.</p>
        </div>

        <form onSubmit={onSubmit} className="mt-10 grid gap-5 rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8">
          <Field label="Business name" error={errors.businessName}>
            <input className={inputCls} value={form.businessName} onChange={(e) => update("businessName", e.target.value)} placeholder="Akwa Farms" />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Owner name" error={errors.ownerName}>
              <input className={inputCls} value={form.ownerName} onChange={(e) => update("ownerName", e.target.value)} placeholder="Jane Doe" />
            </Field>
            <Field label="City" error={errors.city}>
              <input className={inputCls} value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="Lagos" />
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Email" error={errors.email}>
              <input type="email" className={inputCls} value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@business.com" />
            </Field>
            <Field label="Phone" error={errors.phone}>
              <input className={inputCls} value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+234…" />
            </Field>
          </div>
          <Field label="Primary category" error={errors.category}>
            <select className={inputCls} value={form.category} onChange={(e) => update("category", e.target.value)}>
              <option value="">Select…</option>
              {["Fresh Produce","Meat & Seafood","Dairy & Eggs","Bakery","Pantry","Frozen","Beverages","Household"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="About your business" error={errors.description}>
            <textarea rows={4} className={inputCls} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="What you sell, where you source from, what makes you different…" />
          </Field>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link to="/vendors" className="rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold">Cancel</Link>
            <button type="submit" disabled={submitting} className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] disabled:opacity-60">
              {submitting ? "Submitting…" : "Submit application"}
            </button>
          </div>
        </form>
      </section>
      <Footer />
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground/80">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}
