import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Clock,
  Leaf,
  ShieldCheck,
  Truck,
  Snowflake,
  Store,
  Bike,
  ShoppingBag,
  MapPin,
  Star,
  Package,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HomeHero } from "@/components/home/HomeHero";
import { ProductCard } from "@/components/ProductCard";
import { QueryErrorState } from "@/components/QueryErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { listCategories, listStoreProducts, listStores } from "@/lib/api";
import { categoryEmoji, storeLabel, toShopProduct } from "@/lib/catalog-display";
import { cn } from "@/lib/utils";
import { useClientReady } from "@/lib/use-client-ready";
import vendorImg from "@/assets/vendor-market.jpg";
import riderImg from "@/assets/delivery-rider.jpg";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "GoMarket — Fresh groceries & essentials, delivered" },
      {
        name: "description",
        content:
          "One trusted marketplace for perishable, frozen, and everyday goods. Same-day delivery from local vendors you can trust.",
      },
      { property: "og:title", content: "GoMarket — Fresh groceries & essentials, delivered" },
      {
        property: "og:description",
        content:
          "Shop fresh produce, frozen, pantry, and household from trusted local vendors with same-day delivery.",
      },
    ],
  }),
});



const HOW_IT_WORKS = [
  {
    step: "01",
    icon: ShoppingBag,
    title: "Browse & pick",
    body: "Explore categories from trusted local vendors — produce, frozen, pantry, and more.",
  },
  {
    step: "02",
    icon: Package,
    title: "We pack it fresh",
    body: "Your order is quality-checked and cold-chain packed so everything arrives in great shape.",
  },
  {
    step: "03",
    icon: Truck,
    title: "To your door",
    body: "Track your delivery in real time. Most orders arrive within 45 minutes.",
  },
] as const;

const WHY_US = [
  { icon: Clock, t: "Same-day delivery", d: "Order before 4pm and we'll get it to you today." },
  { icon: Snowflake, t: "Cold-chain ready", d: "Frozen and perishable goods, packed to stay fresh." },
  { icon: ShieldCheck, t: "Quality you can trust", d: "Every vendor vetted. Every order quality-checked." },
  { icon: Leaf, t: "Supports local", d: "Direct partnerships with farmers and local makers." },
] as const;

function Home() {
  const clientReady = useClientReady();
  const {
    data: stores = [],
    isLoading: storesLoading,
    isError: storesError,
    error: storesQueryError,
    refetch: refetchStores,
    isFetching: storesFetching,
  } = useQuery({
    queryKey: ["stores"],
    queryFn: () => listStores({ limit: 5 }),
  });
  const store = stores[0];
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
  });
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["featured", store?.id],
    queryFn: () => listStoreProducts(store!.id, { limit: 8, status: "ACTIVE" }),
    enabled: !!store?.id,
  });

  const catName = new Map(categories.map((c) => [c.id, c.name]));
  const featured = products.map((p) =>
    toShopProduct(p, store?.name ?? "Store", catName.get(p.categoryId) ?? "Groceries"),
  );

  const categoriesPending = !clientReady || categoriesLoading;
  const storesPending = !clientReady || storesLoading;
  const productsPending = !clientReady || productsLoading;
  const showStoresSection = !clientReady || storesPending || stores.length > 0 || storesError;

  return (
    <div className="min-h-screen bg-background">
      <Navbar overlay />
      <div className="relative">
        <HomeHero className="pt-[var(--navbar-offset)]" />
      </div>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <SectionHeader
          title="How GoMarket works"
          subtitle="From market to doorstep in three simple steps."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {HOW_IT_WORKS.map(({ step, icon: Icon, title, body }, i) => (
            <div
              key={step}
              className="relative rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
            >
              {i < HOW_IT_WORKS.length - 1 && (
                <span
                  className="pointer-events-none absolute right-0 top-1/2 hidden h-px w-6 translate-x-full bg-border md:block lg:w-10"
                  aria-hidden
                />
              )}
              <span className="font-display text-xs font-semibold tracking-widest text-primary/70">{step}</span>
              <span className="mt-4 grid h-11 w-11 place-items-center rounded-xl bg-secondary text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {/* <section className="bg-secondary/30 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Shop by category"
            subtitle="From the freshest greens to your weekly staples."
            href="/shop"
            linkLabel="See all"
          />
          {categoriesPending ? (
            <div className="mt-8 flex gap-4 overflow-hidden sm:grid sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-36 w-40 shrink-0 rounded-3xl sm:h-40 sm:w-auto" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <EmptyPanel
              className="mt-8"
              message="Categories are loading soon."
              action={{ to: "/shop", label: "Browse the shop" }}
            />
          ) : (
            <div className="mt-8 flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 lg:grid-cols-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {categories.slice(0, 8).map((c) => (
                <Link
                  key={c.id}
                  to="/shop"
                  search={{ categoryId: c.id, storeId: store?.id }}
                  className="group flex w-[9.5rem] shrink-0 flex-col gap-3 rounded-3xl border border-border/60 bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[var(--shadow-card)] sm:w-auto sm:p-6"
                >
                  <span className="text-3xl transition-transform duration-300 group-hover:scale-110" aria-hidden>
                    {categoryEmoji(c.type)}
                  </span>
                  <div>
                    <h3 className="text-base font-semibold leading-tight">{c.name}</h3>
                    <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                      {c.type.toLowerCase().replace("_", " ")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section> */}

      {/* Local stores */}
      {showStoresSection && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <SectionHeader
            title="Shop local stores"
            subtitle="Fresh picks from vendors near you."
            href="/shop"
            linkLabel="View all stores"
          />
          {storesError ? (
            <QueryErrorState
              error={storesQueryError}
              title="Couldn't load stores"
              onRetry={() => void refetchStores()}
              retrying={storesFetching && !storesLoading}
              className="mt-8"
            />
          ) : storesPending ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-3xl" />
              ))}
            </div>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stores.map((s) => (
                <Link
                  key={s.id}
                  to="/shop"
                  search={{ storeId: s.id }}
                  className="group flex items-start gap-4 rounded-3xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-card)]"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[image:var(--gradient-primary)] text-lg font-bold text-primary-foreground">
                    {s.logoUrl ? (
                      <img src={s.logoUrl} alt="" className="h-full w-full rounded-2xl object-cover" />
                    ) : (
                      s.name.charAt(0)
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold group-hover:text-primary">{s.name}</h3>
                    {s.city && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {storeLabel(s)}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3 w-3 fill-accent text-accent" />
                        {s.rating.toFixed(1)}
                        {s.ratingCount > 0 && ` (${s.ratingCount})`}
                      </span>
                      <span>{s.prepTimeMinutes} min prep</span>
                      {s.status === "OPEN" && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">Open</span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <SectionHeader
          title="Today's picks"
          subtitle="Hand-selected freshness, ready to drop in your basket."
          href="/shop"
          linkLabel="Browse all"
        />
        {productsPending ? (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3 rounded-3xl border border-border/60 p-4">
                <Skeleton className="aspect-square rounded-2xl" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-6 w-1/3" />
              </div>
            ))}
          </div>
        ) : featured.length === 0 ? (
          <EmptyPanel
            className="mt-8"
            message="No featured products yet — explore the full shop."
            action={{ to: "/shop", label: "Go to shop" }}
          />
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
        <div className="mt-8 text-center sm:hidden">
          <Link to="/shop" className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
            Browse all products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>


{/* Why us */}
<section className="bg-secondary/40 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="max-w-2xl font-display text-2xl font-semibold sm:text-3xl lg:text-4xl">
            Why thousands choose GoMarket
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {WHY_US.map(({ icon: Icon, t, d }) => (
              <div
                key={t}
                className="rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[var(--shadow-card)]"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{t}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>




      {/* Partner CTAs */}
      <section className="mx-auto max-w-7xl px-4 pt-12 pb-12 sm:px-6 sm:pb-16 lg:px-8 lg:pb-20">
        <div className="grid gap-6 md:grid-cols-2">
          <PartnerCard
            badge="For vendors"
            title="Reach more customers, daily."
            body="Join 500+ farmers, butchers, bakers and brands selling on GoMarket. Simple onboarding, fair fees, real growth."
            cta="Sell on GoMarket"
            href="/vendors"
            icon={Store}
            img={vendorImg}
            tone="primary"
          />
          <PartnerCard
            badge="For couriers"
            title="Earn on your schedule."
            body="Flexible delivery shifts with smart routing, weekly payouts, and a community that has your back."
            cta="Deliver with GoMarket"
            href="/delivery"
            icon={Bike}
            img={riderImg}
            tone="accent"
          />
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[image:var(--gradient-primary)] px-5 py-10 text-center shadow-[var(--shadow-glow)] sm:rounded-[2rem] sm:px-12 sm:py-16">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/5 blur-2xl"
            aria-hidden
          />
          <h2 className="relative font-display text-2xl font-semibold text-primary-foreground sm:text-3xl lg:text-4xl">
            Ready for fresher groceries?
          </h2>
          <p className="relative mx-auto mt-3 max-w-lg text-sm text-primary-foreground/85 sm:text-base">
            Join thousands of households getting farm-fresh food delivered today.
          </p>
          <div className="relative mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-card px-6 py-3.5 text-sm font-semibold text-foreground shadow-[var(--shadow-card)] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Start shopping
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              search={{ redirect: "/shop" }}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-primary-foreground/30 px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
            >
              Create account
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
  href,
  linkLabel,
}: {
  title: string;
  subtitle: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="font-display text-2xl font-semibold sm:text-3xl lg:text-4xl">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">{subtitle}</p>
      </div>
      {href && linkLabel && (
        <Link
          to={href}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary transition-colors hover:underline"
        >
          {linkLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

function EmptyPanel({
  message,
  action,
  className,
}: {
  message: string;
  action: { to: string; label: string };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-dashed border-border/80 bg-muted/20 px-6 py-12 text-center",
        className,
      )}
    >
      <p className="text-muted-foreground">{message}</p>
      <Link to={action.to} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
        {action.label}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function PartnerCard({
  badge,
  title,
  body,
  cta,
  href,
  icon: Icon,
  img,
  tone,
}: {
  badge: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  icon: typeof Store;
  img: string;
  tone: "primary" | "accent";
}) {
  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)]">
      <div className="grid sm:grid-cols-2">
        <div className="flex flex-col p-6 sm:p-8 lg:p-10">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-foreground/5 px-3 py-1 text-xs font-medium text-foreground/70">
            <Icon className="h-3.5 w-3.5" aria-hidden /> {badge}
          </span>
          <h3 className="mt-4 font-display text-xl font-semibold leading-tight sm:text-2xl lg:text-3xl">{title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
          <Link
            to={href}
            className={cn(
              "group/link mt-6 inline-flex w-fit items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]",
              tone === "primary" ? "bg-[image:var(--gradient-primary)]" : "bg-[image:var(--gradient-warm)]",
            )}
          >
            {cta}
            <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-0.5" />
          </Link>
        </div>
        <div className="relative min-h-48 sm:min-h-56">
          <img
            src={img}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-card via-transparent to-transparent sm:via-card/20" />
        </div>
      </div>
    </div>
  );
}
