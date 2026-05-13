import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { ArrowLeft, Bike } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";

export const Route = createFileRoute("/delivery/apply")({
  component: DeliveryApply,
  head: () => ({
    meta: [
      { title: "Delivery agent application — Randy's Commerce" },
      { name: "description", content: "Apply to deliver with Randy's Commerce. Flexible hours and weekly payouts." },
    ],
  }),
});

const schema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().min(6, "Phone is required").max(30),
  city: z.string().trim().min(2, "City is required").max(100),
  vehicle: z.string().min(1, "Pick a vehicle"),
  availability: z.string().min(1, "Pick availability"),
});

function DeliveryApply() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", city: "", vehicle: "", availability: "" });
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
      const existing = JSON.parse(localStorage.getItem("randys_riders") || "[]");
      existing.push({ ...parsed.data, id: crypto.randomUUID(), status: "pending", createdAt: Date.now() });
      localStorage.setItem("randys_riders", JSON.stringify(existing));
      localStorage.setItem("randys_active_rider", parsed.data.fullName);
      toast.success("Application received!", { description: "Welcome to the team. Redirecting to your dashboard…" });
      setTimeout(() => navigate({ to: "/dashboard/delivery" }), 800);
    } catch {
      toast.error("Something went wrong. Try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Link to="/delivery" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="mt-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent-foreground">
            <Bike className="h-3.5 w-3.5" /> Courier application
          </span>
          <h1 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">Start delivering with Randy's</h1>
          <p className="mt-3 text-muted-foreground">Fill in your details — we'll get back within 48 hours.</p>
        </div>

        <form onSubmit={onSubmit} className="mt-10 grid gap-5 rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8">
          <Field label="Full name" error={errors.fullName}>
            <input className={inputCls} value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Email" error={errors.email}>
              <input type="email" className={inputCls} value={form.email} onChange={(e) => update("email", e.target.value)} />
            </Field>
            <Field label="Phone" error={errors.phone}>
              <input className={inputCls} value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </Field>
          </div>
          <Field label="City" error={errors.city}>
            <input className={inputCls} value={form.city} onChange={(e) => update("city", e.target.value)} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Vehicle" error={errors.vehicle}>
              <select className={inputCls} value={form.vehicle} onChange={(e) => update("vehicle", e.target.value)}>
                <option value="">Select…</option>
                {["Bicycle","Motorbike","Car","Van"].map((v) => <option key={v}>{v}</option>)}
              </select>
            </Field>
            <Field label="Availability" error={errors.availability}>
              <select className={inputCls} value={form.availability} onChange={(e) => update("availability", e.target.value)}>
                <option value="">Select…</option>
                {["Mornings","Evenings","Weekends","Full-time"].map((v) => <option key={v}>{v}</option>)}
              </select>
            </Field>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link to="/delivery" className="rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold">Cancel</Link>
            <button type="submit" disabled={submitting} className="rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-warm)] disabled:opacity-60" style={{ backgroundImage: "var(--gradient-warm)" }}>
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
