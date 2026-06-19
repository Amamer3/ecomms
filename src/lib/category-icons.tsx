import type { ReactNode } from "react";
import {
  Box,
  Coffee,
  Cpu,
  Leaf,
  Package,
  Refrigerator,
  ShoppingBasket,
  Sparkles,
} from "lucide-react";
import type { Category } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const ICON_SIZE = "h-6 w-6";

export function CategoryTypeIcon({
  type,
  className,
}: {
  type: Category["type"];
  className?: string;
}) {
  const cls = cn(ICON_SIZE, className);

  switch (type) {
    case "PERISHABLE":
      return <Leaf className={cn(cls, "text-lime-400")} />;
    case "FROZEN":
      return <Refrigerator className={cn(cls, "text-sky-300")} />;
    case "PANTRY":
      return <ShoppingBasket className={cn(cls, "text-amber-400")} />;
    case "BEVERAGES":
      return <Coffee className={cn(cls, "text-orange-400")} />;
    case "HOUSEHOLD":
      return <Box className={cn(cls, "text-slate-300")} />;
    case "PERSONAL_CARE":
      return <Sparkles className={cn(cls, "text-violet-400")} />;
    case "ELECTRONICS":
      return <Cpu className={cn(cls, "text-blue-400")} />;
    default:
      return <Package className={cn(cls, "text-emerald-400")} />;
  }
}

export function categoryTypeIcon(type: Category["type"]): ReactNode {
  return <CategoryTypeIcon type={type} />;
}

export function categoryEmoji(type: Category["type"]): string {
  const EMOJI: Record<Category["type"], string> = {
    PERISHABLE: "🥬",
    FROZEN: "🧊",
    PANTRY: "🛒",
    BEVERAGES: "🥤",
    HOUSEHOLD: "🧹",
    PERSONAL_CARE: "✨",
    ELECTRONICS: "📱",
    OTHER: "📦",
  };
  return EMOJI[type] ?? "📦";
}
