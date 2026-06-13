import type { LucideIcon } from "lucide-react";
import { Check, Package, Shield, ShoppingBag, Store, Truck } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { BrandLogo } from "@/components/BrandLogo";
import { APP_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

/** Shared field styling — neutral surface, no browser autofill tint */
export const authFieldClass =
  "h-11 rounded-lg border-border/80 bg-card text-[15px] shadow-none transition-shadow placeholder:text-muted-foreground/70 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/15 md:text-sm";

export const authPillFieldClass =
  "h-12 w-full rounded-full border-border/80 bg-background text-[15px] shadow-none transition-shadow placeholder:text-muted-foreground/70 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/15 md:text-sm";

export const authPrimaryButtonClass =
  "h-11 w-full rounded-lg text-sm font-semibold shadow-sm transition-all hover:shadow-md";

export const authPillButtonClass =
  "h-12 w-full rounded-full text-sm font-semibold shadow-sm transition-all hover:shadow-md";

type AuthPromoSlide = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const SHOPPER_PROMO_SLIDES: AuthPromoSlide[] = [
  {
    title: "Track every order",
    description:
      "Follow your groceries from checkout to doorstep. Live updates keep you in the loop without switching screens.",
    icon: Truck,
  },
  {
    title: "Shop trusted local vendors",
    description:
      "Browse fresh produce, pantry staples, and household essentials from vendors in your neighbourhood.",
    icon: ShoppingBag,
  },
  {
    title: "Delivered with care",
    description:
      "Reliable couriers and clear order history — everything organized, clear, and always accessible.",
    icon: Package,
  },
];

const BUSINESS_PROMO_SLIDES: AuthPromoSlide[] = [
  {
    title: "Run your storefront",
    description:
      "Manage products, stores, and promotions from one secure workspace built for marketplace vendors.",
    icon: Store,
  },
  {
    title: "Fulfil orders with confidence",
    description:
      "See incoming orders, update fulfilment status, and keep customers informed at every step.",
    icon: Package,
  },
  {
    title: "Secure business access",
    description:
      "Encrypted sign-in with optional two-factor authentication for admins and audit-ready session handling.",
    icon: Shield,
  },
];

function AuthPromoPanel({ slides }: { slides: AuthPromoSlide[] }) {
  const [active, setActive] = useState(0);
  const slide = slides[active]!;
  const Icon = slide.icon;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((index) => (index + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  return (
    <aside className="relative hidden min-h-full flex-col overflow-hidden bg-primary px-10 py-10 text-primary-foreground lg:flex">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, oklch(1 0 0 / 0.12) 0%, transparent 45%), radial-gradient(circle at 80% 70%, oklch(1 0 0 / 0.08) 0%, transparent 40%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(1 0 0 / 0.5) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 0.5) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
        aria-hidden
      />

      <div className="relative flex flex-1 flex-col justify-center">
        <div className="relative mx-auto flex max-w-sm flex-col items-center text-center">
          <div className="relative mb-8 grid h-36 w-36 place-items-center">
            <span
              className="absolute inset-0 rounded-full bg-primary-foreground/10 blur-2xl"
              aria-hidden
            />
            <span className="relative grid h-28 w-28 place-items-center rounded-[2rem] bg-primary-foreground/15 ring-1 ring-primary-foreground/20">
              <Icon className="h-14 w-14 text-primary-foreground" strokeWidth={1.25} aria-hidden />
            </span>
          </div>
          <h2 className="font-display text-3xl font-semibold leading-snug tracking-tight">{slide.title}</h2>
          <p className="mt-4 text-sm leading-relaxed text-primary-foreground/85">{slide.description}</p>
        </div>
      </div>

      <div className="relative mt-auto flex justify-center gap-2 pt-10" role="tablist" aria-label="Feature highlights">
        {slides.map((item, index) => (
          <button
            key={item.title}
            type="button"
            role="tab"
            aria-selected={index === active}
            aria-label={item.title}
            onClick={() => setActive(index)}
            className={cn(
              "h-2 rounded-full transition-all",
              index === active ? "w-6 bg-primary-foreground" : "w-2 bg-primary-foreground/35 hover:bg-primary-foreground/55",
            )}
          />
        ))}
      </div>
    </aside>
  );
}

export function SplitAuthLayout({
  children,
  footer,
  promoSlides,
}: {
  children: ReactNode;
  footer?: ReactNode;
  promoSlides: AuthPromoSlide[];
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-3 py-6 sm:px-6 sm:py-10">
      <div className="grid w-full max-w-[1080px] overflow-hidden rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-card)] sm:rounded-[2rem] lg:min-h-[min(720px,88vh)] lg:grid-cols-2">
        <div className="flex min-h-full flex-col px-5 py-6 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
          <div className="flex justify-center pt-6 sm:pt-8">
            <Link to="/" className="inline-block w-fit transition-opacity hover:opacity-80">
              <BrandLogo size="2xl" className="h-14 w-auto max-w-[min(100%,280px)] sm:h-16" />
            </Link>
          </div>

          <div className="flex flex-1 flex-col justify-center py-8 lg:py-10">
            <div className="mx-auto w-full max-w-md">{children}</div>
          </div>

          {footer ? <div className="mx-auto w-full max-w-md pt-2">{footer}</div> : null}
        </div>

        <AuthPromoPanel slides={promoSlides} />
      </div>
    </div>
  );
}

export function ShopperAuthLayout({
  children,
  footer,
}: {
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <SplitAuthLayout promoSlides={SHOPPER_PROMO_SLIDES} footer={footer}>
      {children}
    </SplitAuthLayout>
  );
}

export function BusinessLoginLayout({
  children,
  footer,
}: {
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <SplitAuthLayout promoSlides={BUSINESS_PROMO_SLIDES} footer={footer}>
      {children}
    </SplitAuthLayout>
  );
}

export function AuthDivider({ label = "or continue" }: { label?: string }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center" aria-hidden>
        <span className="w-full border-t border-border/80" />
      </div>
      <p className="relative mx-auto w-fit bg-card px-3 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export function BusinessAuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] xl:grid-cols-[minmax(0,1.1fr)_minmax(0,480px)]">
        <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-border/60 bg-muted/25 px-10 py-10 lg:flex">
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{ background: "var(--gradient-hero)" }}
            aria-hidden
          />
          <div className="relative">
            <Link to="/" className="inline-block transition-opacity hover:opacity-80">
              <BrandLogo size="2xl" className="h-10 sm:h-11" />
            </Link>
          </div>
          <div className="relative max-w-md space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Business portal</p>
            <h2 className="font-display text-3xl font-semibold leading-snug tracking-tight text-foreground">
              Manage operations from one secure workspace.
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Vendors fulfil orders, couriers complete deliveries, and admins oversee the marketplace — each
              with role-based access.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-muted-foreground">
              {["Encrypted sign-in", "Optional two-factor for admins", "Audit-ready session handling"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                      <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                    </span>
                    {item}
                  </li>
                ),
              )}
            </ul>
          </div>
          <p className="relative text-xs text-muted-foreground">© {new Date().getFullYear()} {APP_NAME}</p>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="flex items-center justify-between border-b border-border/60 px-6 py-4 lg:border-b-0 lg:px-10 lg:pt-10">
            <Link to="/" className="lg:hidden">
              <BrandLogo size="lg" className="h-9" />
            </Link>
            <span className="hidden text-sm text-muted-foreground lg:inline" />
            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              ← Storefront
            </Link>
          </header>
          <main className="flex flex-1 flex-col justify-center px-6 py-8 sm:px-10 lg:px-12 lg:py-12">
            <div className="mx-auto w-full max-w-md">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

export function AuthCard({
  icon: Icon,
  title,
  description,
  children,
  footer,
  className,
  variant = "default",
}: {
  icon?: LucideIcon;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  variant?: "default" | "business";
}) {
  const isBusiness = variant === "business";

  return (
    <div
      className={cn(
        "w-full",
        isBusiness
          ? "space-y-0"
          : "rounded-2xl border border-border/70 bg-card p-6 shadow-[var(--shadow-card)] sm:p-8",
        className,
      )}
    >
      {!isBusiness && Icon ? (
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      ) : null}

      <header className={cn(isBusiness && "border-b border-border/60 pb-6")}>
        {isBusiness ? (
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Sign in</p>
        ) : null}
        <h1
          className={cn(
            "font-display font-semibold tracking-tight text-foreground",
            isBusiness ? "mt-2 text-2xl sm:text-[1.75rem]" : "mt-4 text-2xl sm:text-3xl",
          )}
        >
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </header>

      <div className={cn(isBusiness ? "pt-8" : "mt-8")}>{children}</div>
      {footer ? (
        <div className={cn("border-t border-border/60 pt-6", isBusiness ? "mt-8" : "mt-8")}>{footer}</div>
      ) : null}
    </div>
  );
}

export function AuthStepIndicator({
  steps,
  current,
}: {
  steps: { id: string; label: string }[];
  current: string;
}) {
  const currentIndex = Math.max(0, steps.findIndex((s) => s.id === current));

  return (
    <div className="mb-8" aria-label="Sign-in progress">
      <div className="flex gap-1">
        {steps.map((step, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          return (
            <div
              key={step.id}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                done || active ? "bg-primary" : "bg-border",
                active && !done && "bg-primary/60",
              )}
              aria-hidden
            />
          );
        })}
      </div>
      <ol className="mt-3 flex justify-between gap-2">
        {steps.map((step, index) => {
          const active = index === currentIndex;
          const done = index < currentIndex;
          return (
            <li
              key={step.id}
              className={cn(
                "text-xs font-medium",
                active ? "text-foreground" : done ? "text-muted-foreground" : "text-muted-foreground/70",
              )}
              aria-current={active ? "step" : undefined}
            >
              {step.label}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export type RoleOption<T extends string> = {
  id: T;
  label: string;
  description: string;
  icon: LucideIcon;
  demoHint?: string;
};

export function RoleSelect<T extends string>({
  legend = "Sign in as",
  options,
  value,
  onChange,
  onDemoFill,
}: {
  legend?: string;
  options: RoleOption<T>[];
  value: T;
  onChange: (id: T) => void;
  onDemoFill?: (demoHint: string) => void;
}) {
  const active = options.find((o) => o.id === value);

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-foreground">{legend}</legend>
      <div
        role="radiogroup"
        aria-label={legend}
        className="grid gap-2 sm:grid-cols-3 sm:gap-0 sm:overflow-hidden sm:rounded-lg sm:border sm:border-border/80 sm:bg-muted/30 sm:p-1"
      >
        {options.map((option) => {
          const Icon = option.icon;
          const selected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option.id)}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3.5 py-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-col sm:items-center sm:gap-2 sm:rounded-md sm:border-0 sm:px-2 sm:py-2.5",
                selected
                  ? "border-primary/50 bg-card shadow-sm ring-1 ring-primary/15 sm:bg-card sm:shadow-sm"
                  : "border-border/70 bg-card/50 hover:border-border hover:bg-card sm:bg-transparent sm:hover:bg-transparent",
                selected && "sm:ring-1 sm:ring-primary/20",
              )}
            >
              <span
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-colors sm:h-8 sm:w-8",
                  selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1 sm:text-center">
                <span className="block text-sm font-semibold">{option.label}</span>
                <span className="block text-xs text-muted-foreground">{option.description}</span>
              </span>
            </button>
          );
        })}
      </div>
      {active?.demoHint && onDemoFill ? (
        <p className="text-xs text-muted-foreground">
          Demo account:{" "}
          <button
            type="button"
            className="font-medium text-primary underline-offset-2 hover:underline"
            onClick={() => onDemoFill(active.demoHint!)}
          >
            {active.demoHint}
          </button>
        </p>
      ) : null}
    </fieldset>
  );
}

export function AuthFooterLink({
  label,
  linkLabel,
  to,
}: {
  label: string;
  linkLabel: string;
  to: string;
}) {
  return (
    <p className="text-center text-sm text-muted-foreground">
      {label}{" "}
      <Link to={to} className="font-semibold text-primary underline-offset-4 hover:underline">
        {linkLabel}
      </Link>
    </p>
  );
}

export function AuthBackButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      {children}
    </button>
  );
}
