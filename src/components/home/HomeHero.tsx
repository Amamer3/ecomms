import { Link } from "@tanstack/react-router";
import { ArrowRight, CreditCard, ShoppingBasket, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import heroImg from "@/assets/hero-one.png";

type HomeHeroProps = {
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
};

export function HomeHero({
  imageSrc = heroImg,
  imageAlt = "GoMarket vendor using a tablet to manage orders",
  className,
}: HomeHeroProps) {
  return (
    <section className={cn("relative overflow-hidden bg-background hero-grocery-pattern", className)}>
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:gap-8 lg:px-8 lg:py-16 xl:gap-14">
        {/* Copy */}
        <div className="flex flex-col justify-center lg:pr-4">
          <span className="inline-flex w-fit items-center gap-2.5 rounded-full border border-border/50 bg-card px-4 py-2 text-sm font-medium text-foreground shadow-[var(--shadow-soft)]">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary">
              <ShoppingBasket className="h-4 w-4" aria-hidden />
            </span>
            The Best Online Grocery Store
          </span>

          <h1 className="mt-6 font-display text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] xl:text-[3.5rem]">
            Your One-Stop Shop for{" "}
            <span className="text-primary">Quality Groceries</span>
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            Fresh produce, frozen goods, pantry staples, and household essentials — sourced from trusted local
            vendors and delivered to your door, fast.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link
              to="/shop"
              className="group inline-flex items-center gap-0 overflow-hidden rounded-xl bg-primary pl-6 pr-1.5 py-1.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-all hover:brightness-110 active:scale-[0.98]"
            >
              Shop Now
              <span className="ml-3 grid h-9 w-9 place-items-center rounded-lg bg-primary-foreground/15 transition-transform group-hover:translate-x-0.5">
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
            <Link
              to="/shop"
              className="text-sm font-semibold text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
            >
              View All Products
            </Link>
          </div>
        </div>

        {/* Visual */}
        <div className="relative mx-auto w-full max-w-xl lg:max-w-none lg:justify-self-end">
          <div className="relative flex min-h-[320px] items-end justify-center sm:min-h-[380px] lg:min-h-[460px]">
            <img
              src={imageSrc}
              alt={imageAlt}
              width={640}
              height={720}
              className="relative z-10 max-h-[420px] w-auto max-w-full object-contain object-bottom lg:max-h-[520px]"
              fetchPriority="high"
            />

            <HeroFloatingBadge
              icon={CreditCard}
              label="Secure Payment"
              className="left-0 top-[12%] sm:left-[4%] lg:left-[2%]"
            />
            <HeroFloatingBadge
              icon={Truck}
              label="Fast Delivery"
              className="bottom-[18%] right-0 sm:right-[4%] lg:right-[2%]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroFloatingBadge({
  icon: Icon,
  label,
  className,
}: {
  icon: typeof CreditCard;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "absolute z-20 flex items-center gap-2.5 rounded-full border border-border/40 bg-card px-4 py-2.5 shadow-[var(--shadow-card)]",
        className,
      )}
    >
      <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span className="whitespace-nowrap text-sm font-semibold text-foreground">{label}</span>
    </div>
  );
}
