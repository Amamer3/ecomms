import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AdminUserDetailContent } from "@/components/admin/AdminUserDetailContent";
import { adminUserDisplayName } from "@/components/admin/admin-ui";
import type { AdminUser } from "@/lib/api/types";

export function AdminUserDetailSheet({
  open,
  userId,
  previewUser,
  onOpenChange,
  onUpdated,
}: {
  open: boolean;
  userId: string | null;
  previewUser?: AdminUser | null;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
}) {
  const title = previewUser ? adminUserDisplayName(previewUser) : "User details";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader className="text-left">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>Review account details, update profile, status, or password.</SheetDescription>
        </SheetHeader>

        {userId ? (
          <div className="mt-6 pb-8">
            <AdminUserDetailContent
              userId={userId}
              onDeleted={() => {
                onOpenChange(false);
                onUpdated?.();
              }}
              onUpdated={onUpdated}
            />
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
