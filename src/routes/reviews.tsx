import { createFileRoute, Outlet } from "@tanstack/react-router";
import { MessageSquarePlus, Star } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { CustomerPillNav, CustomerSectionHeader } from "@/components/customer/CustomerPageChrome";
import { StorefrontPage } from "@/components/customer/StorefrontPage";
import { useIsCustomerApp } from "@/hooks/use-is-customer-app";

export const Route = createFileRoute("/reviews")({
  component: ReviewsLayout,
});

const REVIEW_NAV = [
  { to: "/reviews", label: "Browse reviews", icon: Star, exact: true },
  { to: "/reviews/new", label: "Write a review", icon: MessageSquarePlus },
] as const;

function ReviewsLayout() {
  const isCustomerApp = useIsCustomerApp();

  const guestHero = (
    <PageHero>
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">Reviews</p>
      <h1 className="mt-1 font-display text-3xl font-semibold">Ratings & feedback</h1>
      <CustomerPillNav items={REVIEW_NAV} />
    </PageHero>
  );

  return (
    <StorefrontPage activeTab="home" guestHero={guestHero} mainClassName={isCustomerApp ? "py-6" : undefined}>
      {isCustomerApp && (
        <>
          <CustomerSectionHeader eyebrow="Reviews" title="Ratings & feedback" />
          <CustomerPillNav items={REVIEW_NAV} />
        </>
      )}
      <div className={isCustomerApp ? "max-w-3xl" : "mx-auto max-w-3xl"}>
        <Outlet />
      </div>
    </StorefrontPage>
  );
}
