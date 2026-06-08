import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Coins, HeartHandshake, Store } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import vendorImg from "@/assets/vendor-market.jpg";

export const Route = createFileRoute("/vendors/")({
  component: VendorsLanding,
  head: () => ({
    meta: [
      { title: "Sell with GoMarket — Grow your business" },
      {
        name: "description",
        content:
          "Join 500+ farmers, butchers and brands selling on GoMarket. Simple onboarding, fair fees, real growth.",
      },
    ],
  }),
});

function VendorsLanding() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:gap-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Store className="h-3.5 w-3.5" /> For vendors
          </span>
          <h1 className="mt-4 font-display text-3xl font-semibold leading-[1.08] sm:mt-5 sm:text-5xl lg:text-6xl">
            Grow your business with GoMarket.
          </h1>
          <p className="mt-4 max-w-lg text-base text-muted-foreground sm:mt-5 sm:text-lg">
            Reach more customers in your city with a partner that handles the tech, logistics, and discovery — so you can
            focus on what you do best.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
            <Link
              to="/vendors/register"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
            >
              Apply to sell <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/dashboard/login"
              search={{ redirect: "/dashboard/vendor" }}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-sm font-semibold"
            >
              Partner sign in
            </Link>
          </div>
        </div>
        <div className="overflow-hidden rounded-[2rem] shadow-[var(--shadow-card)]">
          <img src={vendorImg} alt="Local vendor at fresh market" loading="lazy" className="h-full w-full object-cover" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Coins, t: "Fair, transparent fees", d: "Simple commission per order — no hidden charges." },
            { icon: BarChart3, t: "Insights that grow", d: "See trending products, peak hours, and customer demand." },
            { icon: HeartHandshake, t: "We handle delivery", d: "Our courier network picks up and delivers for you." },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-soft)]">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
