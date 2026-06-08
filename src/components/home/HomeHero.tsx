import { Link } from "@tanstack/react-router";
import { ArrowRight, Bike, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import heroImg from "@/assets/hero-two-Photoroom.png";

type HomeHeroProps = {
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
};

export function HomeHero({
  imageSrc = heroImg,
  imageAlt = "Delivery driver holding a box of fresh groceries",
  className,
}: HomeHeroProps) {
  return (
    <section
      className={cn(
        "relative z-0 overflow-hidden bg-gradient-to-br from-card via-background to-secondary/25",
        className,
      )}
    >
      {/* Soft ambient shapes */}
      <div
        className="pointer-events-none absolute -left-20 top-1/4 h-64 w-64 rounded-full bg-primary/5 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-accent/10 blur-3xl md:right-[10%]"
        aria-hidden
      />

      {/* Decorative fruit — top left */}
      <div
        className="pointer-events-none absolute left-3 top-[calc(var(--navbar-offset)+0.5rem)] opacity-[0.08] sm:left-6 md:top-[calc(var(--navbar-offset)+2rem)] lg:left-[max(1rem,calc(50%-36rem))]"
        aria-hidden
      >
        <KiwiOutline className="h-12 w-12 text-primary sm:h-16 sm:w-16 md:h-20 md:w-20" />
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-2 md:items-stretch md:min-h-[min(88vh,760px)]">
        {/* Copy — below image on mobile, left column on desktop */}
        <div className="relative z-10 order-2 flex min-h-0 flex-col justify-center px-4 pb-8 pt-4 sm:px-6 sm:pb-10 sm:pt-6 md:order-1 md:h-full md:px-8 md:pb-16 md:pt-10 lg:px-10 lg:pb-20 xl:px-12">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-wider text-foreground/80 sm:text-sm sm:normal-case sm:tracking-wide">
            <span className="flex shrink-0 flex-col gap-1" aria-hidden>
              <span className="h-0.5 w-6 rounded-full bg-accent sm:w-8" />
              <span className="h-0.5 w-4 rounded-full bg-accent/60 sm:w-6" />
            </span>
            <span className="min-w-0 leading-snug">
              Fresh Products{" "}
              <span className="text-[oklch(0.55_0.19_38)]">Online Delivery Shop</span>
            </span>
          </div>

          <h1 className="mt-3 max-w-xl font-display text-[1.65rem] font-semibold leading-[1.12] tracking-tight text-foreground sm:mt-6 sm:text-4xl md:text-[2.75rem] lg:text-[3.35rem] xl:text-[3.6rem]">
            Make Healthy Life With{" "}
            <span className="bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">
              Fresh
            </span>{" "}
            Grocery
          </h1>

          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:mt-5 sm:text-base lg:text-lg lg:leading-relaxed">
            Farm-fresh produce, pantry staples, and household essentials from trusted local vendors —
            delivered to your door, same day.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3 sm:mt-9 sm:gap-4">
            <Link
              to="/shop"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[oklch(0.82_0.17_85)] px-8 py-3.5 text-sm font-bold text-foreground shadow-[0_10px_28px_-8px_oklch(0.75_0.16_75/0.65)] transition-all hover:scale-[1.02] hover:brightness-105 active:scale-[0.98] sm:w-auto sm:px-10 sm:text-base"
            >
              Shop Now
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/shop"
              className="inline-flex w-full items-center justify-center rounded-full border border-border/70 bg-card/80 px-6 py-3.5 text-sm font-semibold text-foreground backdrop-blur-sm transition-colors hover:border-primary/40 hover:text-primary sm:w-auto"
            >
              Browse catalog
            </Link>
          </div>
        </div>

        {/* Visual — first on mobile, right column on desktop */}
        <div className="relative order-1 flex min-h-[min(72vw,340px)] flex-col items-stretch justify-end px-4 pb-4 pt-0 sm:min-h-[380px] sm:px-6 sm:pb-6 md:order-2 md:h-full md:min-h-0 md:px-6 md:pb-12 md:pt-8 lg:pb-14">
          <div
            className="hero-green-panel pointer-events-none absolute inset-0 z-0 bg-[image:var(--gradient-hero-panel)] md:left-[-5%] lg:left-[-8%]"
            aria-hidden
          />

          <span
            className="pointer-events-none absolute right-4 top-[14%] z-[1] select-none font-sans text-5xl font-black uppercase tracking-[0.18em] text-white/[0.06] [writing-mode:vertical-rl] sm:top-1/2 sm:-translate-y-1/2 sm:text-6xl sm:text-white/[0.08] md:text-7xl lg:right-8 lg:text-[5.5rem] lg:leading-none xl:text-8xl"
            aria-hidden
          >
            Grocery
          </span>

          {/* Image stage — blend removes black PNG background on green */}
          <div className="relative z-10 flex h-full min-h-[min(68vw,300px)] w-full flex-1 items-end justify-center sm:min-h-[320px] md:min-h-0">
            <div
              className="pointer-events-none absolute bottom-[8%] left-1/2 h-[55%] w-[75%] -translate-x-1/2 rounded-full bg-white/10 blur-2xl"
              aria-hidden
            />
            <img
              src={imageSrc}
              alt={imageAlt}
              width={560}
              height={720}
              className="hero-subject-image relative h-full w-auto max-w-full object-contain object-bottom"
              fetchPriority="high"
            />
          </div>

          <DeliveryBadge className="relative z-20 mx-auto mt-3 w-full max-w-[17rem] sm:absolute sm:bottom-10 sm:left-6 sm:mx-0 sm:mt-0 sm:w-auto md:bottom-12 md:left-8 lg:bottom-14 lg:left-10" />
        </div>
      </div>

      {/* Smooth transition into next section */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent"
        aria-hidden
      />
    </section>
  );
}

function DeliveryBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "mx-auto flex items-center gap-3 rounded-2xl border border-white/40 bg-card/95 px-3.5 py-3 shadow-[var(--shadow-card)] backdrop-blur-md sm:mx-0 sm:px-4",
        className,
      )}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-soft)] sm:h-11 sm:w-11">
        <Bike className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold text-foreground sm:text-sm">Fast Delivery</p>
        <p className="flex flex-wrap items-center gap-x-1 gap-y-0 text-[11px] text-muted-foreground sm:text-xs">
          <Star className="h-3 w-3 shrink-0 fill-[oklch(0.82_0.17_85)] text-[oklch(0.82_0.17_85)] sm:h-3.5 sm:w-3.5" />
          <span className="font-semibold text-foreground">4.5</span>
          <span className="whitespace-nowrap">(10k reviews)</span>
        </p>
      </div>
    </div>
  );
}

function KiwiOutline({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="34" r="22" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M32 12c-4 0-8 3-10 8M32 12c4 0 8 3 10 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="26" cy="30" r="1.2" fill="currentColor" />
      <circle cx="34" cy="26" r="1.2" fill="currentColor" />
      <circle cx="38" cy="34" r="1.2" fill="currentColor" />
      <circle cx="30" cy="38" r="1.2" fill="currentColor" />
      <circle cx="36" cy="40" r="1.2" fill="currentColor" />
    </svg>
  );
}
