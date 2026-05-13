import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/context/auth";
import { safeShopperPostLoginRedirect } from "@/lib/auth-storage";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: searchSchema,
  component: ShopperLoginPage,
  head: () => ({ meta: [{ title: "Sign in — Randy's Commerce" }] }),
});

function ShopperLoginPage() {
  const { redirect } = Route.useSearch();
  const { session, ready, login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!ready || !session || session.role !== "customer") return;
    navigate({ to: safeShopperPostLoginRedirect(redirect) });
  }, [ready, session, navigate, redirect]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error("Enter any password — auth is simulated and stored in this browser only.");
      return;
    }
    if (!email.trim()) {
      toast.error("Please enter your email.");
      return;
    }
    login({ name, email, role: "customer" });
    const dest = safeShopperPostLoginRedirect(redirect);
    toast.success("Signed in");
    navigate({ to: dest });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="mx-auto max-w-lg px-4 py-16 sm:px-6 lg:px-8">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
          <ShoppingBag className="h-6 w-6" />
        </span>
        <h1 className="mt-6 font-display text-3xl font-semibold">Sign in to shop</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your basket and checkout need an account. Session is saved in{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">localStorage</code> in this browser
          only (demo).
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-foreground">Display name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              placeholder="e.g. Jane Doe"
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-foreground">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
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

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Selling or delivering?{" "}
          <Link to="/dashboard/login" className="font-medium text-primary hover:underline">
            Business sign in
          </Link>
        </p>
      </section>
      <Footer />
    </div>
  );
}
