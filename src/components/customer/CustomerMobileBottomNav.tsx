import { useNavigate } from "@tanstack/react-router";
import { Home, Receipt, Search, ShoppingBasket, User } from "lucide-react";
import type { CustomerBottomTab } from "@/components/customer/customer-shell";
import { cn } from "@/lib/utils";

const TABS: {
  id: CustomerBottomTab;
  label: string;
  icon: typeof Home;
  to: string;
  search?: Record<string, string>;
}[] = [
  { id: "home", label: "Home", icon: Home, to: "/" },
  { id: "stores", label: "Stores", icon: ShoppingBasket, to: "/shop" },
  { id: "search", label: "Search", icon: Search, to: "/shop", search: { view: "search" } },
  { id: "orders", label: "Orders", icon: Receipt, to: "/account/orders" },
  { id: "account", label: "Account", icon: User, to: "/account" },
];

type CustomerMobileBottomNavProps = {
  activeTab: CustomerBottomTab;
};

export function CustomerMobileBottomNav({ activeTab }: CustomerMobileBottomNavProps) {
  const navigate = useNavigate();

  return (
    <nav
      aria-label="Customer navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-xl supports-[backdrop-filter]:bg-background/90 md:hidden"
    >
      <div className="mx-auto grid h-14 max-w-lg grid-cols-5 items-end px-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                if (tab.search) {
                  navigate({ to: tab.to, search: tab.search });
                  return;
                }
                navigate({ to: tab.to });
              }}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[10px] font-medium transition-colors",
                isActive ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
