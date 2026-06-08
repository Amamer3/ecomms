import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bike, Calendar, MapPin, Wallet } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import riderImg from "@/assets/delivery-rider.jpg";

export const Route = createFileRoute("/delivery/")({
  component: DeliveryLanding,
  head: () => ({
    meta: [
      { title: "Drive with GoMarket — Flexible delivery work" },
      { name: "description", content: "Earn on your schedule with GoMarket. Smart routing, weekly payouts, supportive community." },
    ],
  }),
});

function DeliveryLanding() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:gap-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent-foreground">
            <Bike className="h-3.5 w-3.5" /> For couriers
          </span>
          <h1 className="mt-4 font-display text-3xl font-semibold leading-[1.08] sm:mt-5 sm:text-5xl lg:text-6xl">
            Earn on your schedule.
          </h1>
          <p className="mt-4 max-w-lg text-base text-muted-foreground sm:mt-5 sm:text-lg">
            Pick the hours that work for you and deliver fresh orders across the city. Smart routes, friendly customers,
            weekly payouts.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
            <Link
              to="/delivery/apply"
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-warm)]"
              style={{ backgroundImage: "var(--gradient-warm)" }}
            >
              Start an application <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/dashboard/login"
              search={{ redirect: "/dashboard/delivery" }}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-sm font-semibold"
            >
              Partner sign in
            </Link>
          </div>
        </div>
        <div className="overflow-hidden rounded-[2rem] shadow-[var(--shadow-card)]">
          <img src={riderImg} alt="Smiling delivery courier on motorbike" loading="lazy" className="h-full w-full object-cover" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Calendar, t: "Flexible shifts", d: "Pick mornings, evenings, or weekends — it's up to you." },
            { icon: MapPin, t: "Smart routing", d: "We optimize routes so you do less driving and earn more." },
            { icon: Wallet, t: "Weekly payouts", d: "Reliable, on-time payouts straight to your account." },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-soft)]">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent/15 text-accent-foreground">
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
