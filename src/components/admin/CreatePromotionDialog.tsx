import { useState } from "react";
import { Tag } from "lucide-react";
import { createPromotion } from "@/lib/api";
import {
  AdminPrimaryButton,
} from "@/components/admin/admin-ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PromoFields,
  type PromotionFormState,
  usePromotionAction,
} from "@/components/promotions/promotion-ui";

function defaultPromotionForm(): PromotionFormState {
  return {
    code: "",
    type: "PERCENT",
    value: "10",
    minSubtotal: "",
    storeId: "",
    maxRedemptions: "",
    perUserLimit: "1",
    startsAt: new Date().toISOString().slice(0, 16),
    endsAt: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 16),
  };
}

export function CreatePromotionDialog({
  open,
  onOpenChange,
  onCreated,
  onViewPromotion,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
  onViewPromotion?: (promotionId: string) => void;
}) {
  const { runAction } = usePromotionAction();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<PromotionFormState>(defaultPromotionForm);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [createdCode, setCreatedCode] = useState("");

  const reset = () => {
    setForm(defaultPromotionForm());
    setCreatedId(null);
    setCreatedCode("");
  };

  const onOpenChangeWrapped = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const ok = await runAction("Promotion created", async () => {
        const result = await createPromotion({
          code: form.code.trim().toUpperCase(),
          type: form.type,
          value: form.value,
          minSubtotal: form.minSubtotal.trim() || undefined,
          storeId: form.storeId.trim() || undefined,
          maxRedemptions: form.maxRedemptions ? parseInt(form.maxRedemptions, 10) : undefined,
          perUserLimit: form.perUserLimit ? parseInt(form.perUserLimit, 10) : undefined,
          startsAt: new Date(form.startsAt).toISOString(),
          endsAt: new Date(form.endsAt).toISOString(),
        });
        setCreatedId(result.id);
        setCreatedCode(result.code);
        return result;
      });
      if (ok) onCreated?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChangeWrapped}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {createdId ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Tag className="h-4 w-4" />
                </span>
                Promotion created
              </DialogTitle>
              <DialogDescription>
                Code <span className="font-semibold text-foreground">{createdCode}</span> is ready to use.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <AdminPrimaryButton
                type="button"
                onClick={() => {
                  onOpenChangeWrapped(false);
                  if (createdId) onViewPromotion?.(createdId);
                }}
              >
                View promotion
              </AdminPrimaryButton>
              <button
                type="button"
                onClick={() => {
                  reset();
                }}
                className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/40"
              >
                Create another
              </button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={(e) => void onSubmit(e)}>
            <DialogHeader>
              <DialogTitle>Create promotion</DialogTitle>
              <DialogDescription>
                Add a platform-wide or store-scoped coupon code for customers at checkout.
              </DialogDescription>
            </DialogHeader>
            <div className="my-4 space-y-4">
              <PromoFields form={form} setForm={setForm} />
            </div>
            <DialogFooter>
              <AdminPrimaryButton type="submit" disabled={submitting}>
                {submitting ? "Creating…" : "Create promotion"}
              </AdminPrimaryButton>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
