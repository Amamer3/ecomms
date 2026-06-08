import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { MessageSquarePlus, Star } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { PageHero } from "@/components/PageHero";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reviews")({
  component: ReviewsLayout,
});

const REVIEW_NAV = [
  { to: "/reviews", label: "Browse reviews", icon: Star, exact: true },
  { to: "/reviews/new", label: "Write a review", icon: MessageSquarePlus },
] as const;

function ReviewsLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar overlay />
      <PageHero>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Reviews</p>
        <h1 className="mt-1 font-display text-3xl font-semibold">Ratings & feedback</h1>
        <nav className="mt-4 flex flex-wrap gap-2" aria-label="Review actions">
          {REVIEW_NAV.map(({ to, label, icon: Icon, ...rest }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                "border-border bg-card hover:border-primary/40",
              )}
              activeOptions={"exact" in rest && rest.exact ? { exact: true } : undefined}
              activeProps={{
                className: "border-primary bg-primary text-primary-foreground",
              }}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </PageHero>
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <Outlet />
      </section>
      <Footer />
    </div>
  );
}
