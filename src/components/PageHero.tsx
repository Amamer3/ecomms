import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const MAX_WIDTH = {
  "5xl": "max-w-5xl",
  "7xl": "max-w-7xl",
} as const;

type PageHeroProps = {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  maxWidth?: keyof typeof MAX_WIDTH;
};

/** Gradient page header that extends behind the fixed navbar. Pair with `<Navbar overlay />`. */
export function PageHero({
  children,
  className,
  innerClassName,
  maxWidth = "7xl",
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "border-b border-border/60 bg-[image:var(--gradient-hero)] pt-[var(--navbar-offset)]",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto px-4 py-8 sm:px-6 lg:px-8",
          MAX_WIDTH[maxWidth],
          innerClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}
