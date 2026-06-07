import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MapPin, Package, Scale, Share2, Star, User, Wallet } from "lucide-react";

export const Route = createFileRoute("/account/")({
  component: AccountHomePage,
  head: () => ({ meta: [{ title: "My account — GoMarket" }] }),
});

const LINKS = [
  {
    to: "/account/orders",
    label: "Orders",
    icon: Package,
    description: "View your orders and live delivery tracking.",
  },
  {
    to: "/account/profile",
    label: "Profile",
    icon: User,
    description: "View and update your personal details.",
  },
  {
    to: "/account/addresses",
    label: "Addresses",
    icon: MapPin,
    description: "Manage delivery addresses for checkout.",
  },
  {
    to: "/account/transactions",
    label: "Payments",
    icon: Wallet,
    description: "Payment history and transaction details.",
  },
  {
    to: "/account/disputes",
    label: "Disputes",
    icon: Scale,
    description: "Open and track order disputes.",
  },
  {
    to: "/account/referral",
    label: "Referral",
    icon: Share2,
    description: "Share your code and claim friend referrals for rewards.",
  },
  {
    to: "/reviews/new",
    label: "Write a review",
    icon: Star,
    description: "Rate a store, product, or courier after delivery.",
  },
  {
    to: "/reviews",
    label: "Browse reviews",
    icon: Star,
    description: "Read ratings for stores, products, and couriers.",
  },
] as const;

function AccountHomePage() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {LINKS.map(({ to, label, icon: Icon, description }) => (
        <Link
          key={to}
          to={to}
          className="group rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
        >
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </span>
          <h2 className="mt-4 text-lg font-semibold">{label}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
            Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      ))}
    </div>
  );
}
