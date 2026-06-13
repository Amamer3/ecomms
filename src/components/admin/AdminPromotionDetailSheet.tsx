import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AdminPromotionDetailContent } from "@/components/admin/AdminPromotionDetailContent";
import type { Promotion } from "@/lib/api/types";

export function AdminPromotionDetailSheet({
  open,
  promotion,
  onOpenChange,
  onUpdated,
}: {
  open: boolean;
  promotion: Promotion | null;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader className="text-left">
          <SheetTitle>{promotion?.code ?? "Promotion details"}</SheetTitle>
          <SheetDescription>
            Review coupon settings, update value or limits, or pause the promotion.
          </SheetDescription>
        </SheetHeader>

        {promotion ? (
          <div className="mt-6 pb-8">
            <AdminPromotionDetailContent
              key={promotion.id + promotion.status + promotion.value}
              promotion={promotion}
              onUpdated={onUpdated}
            />
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
