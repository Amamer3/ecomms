import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Leaf, ShieldCheck, Truck, Sparkles, Snowflake, Store, Bike } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { categories, products } from "@/lib/products";
import heroImg from "@/assets/hero-groceries.jpg";
import vendorImg from "@/assets/vendor-market.jpg";
import riderImg from "@/assets/delivery-rider.jpg";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Randy's Commerce — Fresh groceries & essentials, delivered" },
      { name: "description", content: "One trusted marketplace for perishable, frozen, and everyday goods. Same-day delivery from local vendors you can trust." },
      { property: "og:title", content: "Randy's Commerce — Fresh groceries & essentials, delivered" },
      { property: "og:description", content: "Shop fresh produce, frozen, pantry, and household from trusted local vendors with same-day delivery." },
    ],
  }),
});

function Home() {
  const featured = products.slice(0, 8);
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[image:var(--gradient-hero)]" />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:pb-28 lg:pt-20">
          <div className="flex flex-col justify-center">
            {/* <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Same-day delivery in the city
            </span> */}
            <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Fresh from the market.{" "}
              <span className="bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">
                On your doorstep.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Randy's Commerce brings together local farmers, vendors, and household brands in one place — perishables,
              frozen, pantry essentials and more, delivered fast.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/shop"
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-all hover:scale-[1.02]"
              >
                Start shopping
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/vendors"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground transition-all hover:border-primary/40 hover:text-primary"
              >
                Become a vendor
              </Link>
            </div>
            <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-border/60 pt-6 text-sm">
              {[
                ["10k+", "Happy households"],
                ["500+", "Local vendors"],
                ["45 min", "Avg delivery"],
              ].map(([n, l]) => (
                <div key={l}>
                  <dt className="font-display text-2xl font-semibold text-foreground">{n}</dt>
                  <dd className="text-muted-foreground">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-[2rem] shadow-[var(--shadow-card)]">
              <img
                src="https://media.istockphoto.com/id/891600988/photo/shopping-together-for-all-their-essentials.jpg?s=612x612&w=0&k=20&c=LpNZcFdnN6sv8w-hJgiwd3NXuGWB-NiRQADHcDV3SBs="
                alt="Overhead arrangement of fresh groceries: tomatoes, leafy greens, avocado, bread and eggs"
                width={1600}
                height={1200}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:block">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Truck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Arriving in 38 min</p>
                  <p className="text-xs text-muted-foreground">2 vendors • cold-chain packed</p>
                </div>
              </div>
            </div>
            {/* delivery rider image */}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">Shop by category</h2>
            <p className="mt-2 text-muted-foreground">From the freshest greens to your weekly staples.</p>
          </div>
          <Link to="/shop" className="hidden text-sm font-medium text-primary hover:underline sm:inline-flex">
            See all →
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.name}
              to="/shop"
              search={{ category: c.name }}
              className="group flex flex-col gap-3 rounded-3xl border border-border/60 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[var(--shadow-card)]"
            >
              {/* <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[image:var(--gradient-hero)] text-3xl">
                {c.emoji}
              </span> */}
              <div>
                <h3 className="text-base font-semibold">{c.name}</h3>
                <p className="text-xs text-muted-foreground">{c.blurb}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Why Randy's */}
      <section className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="max-w-2xl font-display text-3xl font-semibold sm:text-4xl">
            Why thousands choose Randy's
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Clock, t: "Same-day delivery", d: "Order before 4pm and we'll get it to you today." },
              { icon: Snowflake, t: "Cold-chain ready", d: "Frozen and perishable goods, packed to stay fresh." },
              { icon: ShieldCheck, t: "Quality you can trust", d: "Every vendor vetted. Every order quality-checked." },
              { icon: Leaf, t: "Supports local", d: "Direct partnerships with farmers and local makers." },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-soft)]">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">Today's picks</h2>
            <p className="mt-2 text-muted-foreground">Hand-selected freshness, ready to drop in your basket.</p>
          </div>
          <Link to="/shop" className="hidden text-sm font-medium text-primary hover:underline sm:inline-flex">
            Browse all →
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Partner CTAs */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          <PartnerCard
            badge="For vendors"
            title="Reach more customers, daily."
            body="Join 500+ farmers, butchers, bakers and brands selling on Randy's. Simple onboarding, fair fees, real growth."
            cta="Sell with Randy's"
            icon={Store}
            img={vendorImg}
            tone="primary"
          />
          <PartnerCard
            badge="For couriers"
            title="Earn on your schedule."
            body="Flexible delivery shifts with smart routing, weekly payouts, and a community that has your back."
            cta="Drive with Randy's"
            icon={Bike}
            img={riderImg}
            tone="accent"
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}

function PartnerCard({
  badge, title, body, cta, icon: Icon, img, tone,
}: {
  badge: string; title: string; body: string; cta: string;
  icon: typeof Store; img: string; tone: "primary" | "accent";
}) {
  const grad = tone === "primary" ? "var(--gradient-primary)" : "var(--gradient-warm)";
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-[var(--shadow-card)]">
      <div className="grid sm:grid-cols-2">
        <div className="p-8 sm:p-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-foreground/5 px-3 py-1 text-xs font-medium text-foreground/70">
            <Icon className="h-3.5 w-3.5" /> {badge}
          </span>
          <h3 className="mt-4 font-display text-2xl font-semibold leading-tight sm:text-3xl">{title}</h3>
          <p className="mt-3 text-sm text-muted-foreground">{body}</p>
          <button
            className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
            style={{ backgroundImage: `${grad}` }}
          >
            {cta} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <div className="relative min-h-56">
          <img src={img} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        </div>
      </div>
    </div>
  );
}
