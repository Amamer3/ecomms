import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AdminProductDetailContent } from "@/components/admin/AdminProductDetailContent";
import type { AdminVendorCatalogProduct } from "@/lib/admin-vendor-catalog";

export function AdminProductDetailSheet({
  open,
  productId,
  preview,
  onOpenChange,
  onUpdated,
}: {
  open: boolean;
  productId: string | null;
  preview?: AdminVendorCatalogProduct | null;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
}) {
  const title = preview?.product.name ?? "Product details";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader className="text-left">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            Marketplace listing details, inventory, and vendor context.
          </SheetDescription>
        </SheetHeader>

        {productId ? (
          <div className="mt-6 pb-8">
            <AdminProductDetailContent
              productId={productId}
              preview={preview}
              onUpdated={onUpdated}
              onArchived={() => {
                onOpenChange(false);
                onUpdated?.();
              }}
            />
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
