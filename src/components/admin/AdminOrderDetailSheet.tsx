import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AdminOrderDetailContent } from "@/components/admin/AdminOrderDetailContent";
import type { FulfilmentOrder } from "@/lib/api/types";

export function AdminOrderDetailSheet({
  open,
  orderId,
  preview,
  onOpenChange,
}: {
  open: boolean;
  orderId: string | null;
  preview?: FulfilmentOrder | null;
  onOpenChange: (open: boolean) => void;
}) {
  const title = preview?.orderNumber ?? "Order details";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader className="text-left">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            Fulfilment summary, customer contact, payment, and line items.
          </SheetDescription>
        </SheetHeader>

        {orderId ? (
          <div className="mt-6 pb-8">
            <AdminOrderDetailContent orderId={orderId} preview={preview} />
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
