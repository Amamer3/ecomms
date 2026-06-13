import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AdminDisputeDetailContent } from "@/components/admin/AdminDisputeDetailContent";
import type { Dispute } from "@/lib/api/types";

export function AdminDisputeDetailSheet({
  open,
  dispute,
  onOpenChange,
  onUpdated,
}: {
  open: boolean;
  dispute: Dispute | null;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
}) {
  const title = dispute?.orderNumber ?? dispute?.orderId ?? "Dispute details";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader className="text-left">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            Review the customer&apos;s claim and update status or resolution notes.
          </SheetDescription>
        </SheetHeader>

        {dispute ? (
          <div className="mt-6 pb-8">
            <AdminDisputeDetailContent
              key={dispute.id + dispute.updatedAt}
              dispute={dispute}
              onUpdated={onUpdated}
            />
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
