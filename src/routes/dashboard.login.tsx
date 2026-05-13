import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Bike, Shield, Store } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth";
import {
  safePostLoginRedirect,
  safeShopperPostLoginRedirect,
  type DashboardRole,
} from "@/lib/auth-storage";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/dashboard/login")({
  validateSearch: searchSchema,
  component: DashboardLogin,
});

const roles: { id: DashboardRole; label: string; blurb: string; icon: typeof Store }[] = [
  { id: "vendor", label: "Vendor", blurb: "Manage products and orders.", icon: Store },
  { id: "delivery", label: "Courier", blurb: "Accept runs and track earnings.", icon: Bike },
  { id: "admin", label: "Admin", blurb: "Review applications and platform stats.", icon: Shield },
];

function DashboardLogin() {
  const { redirect } = Route.useSearch();
  const { session, ready, login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<DashboardRole>("vendor");

  useEffect(() => {
    if (!ready || !session) return;
    if (session.role === "customer") {
      navigate({ to: safeShopperPostLoginRedirect(redirect) });
      return;
    }
    navigate({ to: safePostLoginRedirect(session.role, redirect) });
  }, [ready, session, navigate, redirect]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error("Enter any password — auth is simulated and stored in this browser only.");
      return;
    }
    login({ name, email, role });
    const dest = safePostLoginRedirect(role, redirect);
    toast.success("Signed in");
    navigate({ to: dest });
  };

  return (
    <div className="mx-auto max-w-lg">
      <h2 className="font-display text-2xl font-semibold">Sign in (demo)</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Session is saved in{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">localStorage</code> as{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">randys_auth_session</code>. Each role
        only opens its own dashboard.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <div>
          <p className="text-sm font-medium text-foreground">Role</p>
          <div className="mt-2 grid gap-3 sm:grid-cols-3">
            {roles.map((r) => {
              const Icon = r.icon;
              const active = role === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-colors",
                    active
                      ? "border-primary bg-primary/5 shadow-[var(--shadow-soft)]"
                      : "border-border/60 bg-card hover:border-primary/30",
                  )}
                >
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-semibold">{r.label}</span>
                  <span className="text-xs text-muted-foreground">{r.blurb}</span>
                </button>
              );
            })}
          </div>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-foreground">Display name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            placeholder="e.g. Amina Okafor"
            className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-foreground">Email (optional)</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
            className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-foreground">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="Any value — not verified"
            className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition-all hover:shadow-[var(--shadow-glow)]"
        >
          Continue
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link to="/login" className="font-medium text-primary hover:underline">
          Shopping on the site? Customer sign in
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        <Link to="/dashboard" className="font-medium text-primary hover:underline">
          Back to dashboards
        </Link>
      </p>
    </div>
  );
}
