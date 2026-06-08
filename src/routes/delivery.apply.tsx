import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { ArrowLeft, Bike } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";
import { registerRider } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { useAuth } from "@/context/auth";
import { PhoneInput } from "@/components/PhoneInput";
import { defaultGhanaPhoneInput, normalizeE164Phone } from "@/lib/phone";

export const Route = createFileRoute("/delivery/apply")({
  component: DeliveryApply,
  head: () => ({
    meta: [{ title: "Courier application — GoMarket" }],
  }),
});

const schema = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  phone: z.string().trim().min(10).max(30),
  password: z.string().min(8).max(100),
  vehicleType: z.string().min(1),
  plateNumber: z.string().optional(),
});

function DeliveryApply() {
  const navigate = useNavigate();
  const { setSessionFromTokens } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: defaultGhanaPhoneInput(),
    password: "",
    vehicleType: "motorbike",
    plateNumber: "",
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
    const phone = normalizeE164Phone(parsed.data.phone);
    if (!phone) {
      setErrors({ phone: "Use E.164 format, e.g. +233200000012" });
      return;
    }
    setSubmitting(true);
    try {
      const tokens = await registerRider({
        phone,
        fullName: parsed.data.fullName,
        password: parsed.data.password,
        vehicleType: parsed.data.vehicleType,
        email: parsed.data.email || undefined,
        plateNumber: parsed.data.plateNumber || undefined,
      });
      await setSessionFromTokens(tokens, parsed.data.fullName);
      toast.success("Application submitted — pending admin approval");
      navigate({ to: "/dashboard/delivery" });
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
        <Link to="/delivery" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="mt-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium">
            <Bike className="h-3.5 w-3.5" /> Courier registration
          </span>
          <h1 className="mt-4 font-display text-2xl font-semibold sm:text-4xl">Join as a courier</h1>
        </div>

        <form onSubmit={(e) => void onSubmit(e)} className="mt-10 grid gap-5 rounded-3xl border border-border/60 bg-card p-6 sm:p-8">
          <Field label="Full name" error={errors.fullName}>
            <input className={inputCls} value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
          </Field>
          <Field label="Phone" error={errors.phone}>
            <PhoneInput className={inputCls} value={form.phone} onChange={(v) => update("phone", v)} />
          </Field>
          <Field label="Email (optional)" error={errors.email}>
            <input type="email" className={inputCls} value={form.email} onChange={(e) => update("email", e.target.value)} />
          </Field>
          <Field label="Password" error={errors.password}>
            <input type="password" className={inputCls} value={form.password} onChange={(e) => update("password", e.target.value)} />
          </Field>
          <Field label="Vehicle" error={errors.vehicleType}>
            <select className={inputCls} value={form.vehicleType} onChange={(e) => update("vehicleType", e.target.value)}>
              <option value="motorbike">Motorbike</option>
              <option value="bicycle">Bicycle</option>
              <option value="car">Car</option>
              <option value="van">Van</option>
            </select>
          </Field>
          <Field label="Plate number">
            <input className={inputCls} value={form.plateNumber} onChange={(e) => update("plateNumber", e.target.value)} />
          </Field>
          <button type="submit" disabled={submitting} className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            {submitting ? "Submitting…" : "Register"}
          </button>
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
