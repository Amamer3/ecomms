import { Link } from "@tanstack/react-router";
import { Globe, Menu, ShoppingBag, Truck, Users } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCart } from "@/context/cart";
import { cn } from "@/lib/utils";

type CustomerMobileMenuProps = {
  className?: string;
};

export function CustomerMobileMenu({ className }: CustomerMobileMenuProps) {
  const { count } = useCart();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className={cn(
            "grid h-10 w-10 place-items-center rounded-full text-foreground transition-colors hover:bg-secondary",
            className,
          )}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[min(100vw-3rem,20rem)] border-border/60 p-0">
        <SheetHeader className="border-b border-border/60 px-5 py-4 text-left">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <BrandLogo size="lg" className="h-8" />
        </SheetHeader>
        <nav className="flex flex-col gap-1 p-3">
          <Link
            to="/cart"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <ShoppingBag className="h-5 w-5 text-muted-foreground" />
            Cart
            {count > 0 && (
              <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
          <Link
            to="/delivery"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-foreground transition-colors hover:bg-secondary"
          >
            <Truck className="h-5 w-5 text-muted-foreground" />
            Become a Courier
          </Link>
          <Link
            to="/vendors"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-foreground transition-colors hover:bg-secondary"
          >
            <Users className="h-5 w-5 text-muted-foreground" />
            Become a Partner
          </Link>
          <div className="my-2 border-t border-border/60" />
          <span className="rounded-xl bg-secondary px-3 py-3 text-sm text-foreground/80">Get the app</span>
          <button
            type="button"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-foreground transition-colors hover:bg-secondary"
          >
            <Globe className="h-5 w-5 text-muted-foreground" />
            English
          </button>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
