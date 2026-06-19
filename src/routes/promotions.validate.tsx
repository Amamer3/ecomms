import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { RequireCustomer } from "@/components/RequireCustomer";
import { CustomerOnlyPage } from "@/components/customer/CustomerOnlyPage";
import { CustomerSectionHeader } from "@/components/customer/CustomerPageChrome";
import { validatePromotion } from "@/lib/api";
import { parseMoney } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/errors";
import { customerInputCls } from "@/components/customer/customer-ui";
import { formatGhs } from "@/lib/format-money";
import { loadSelectedStoreId } from "@/lib/catalog-display";

export const Route = createFileRoute("/promotions/validate")({
  component: ValidatePromotionPage,
  head: () => ({ meta: [{ title: "Validate promo — GoMarket" }] }),
});

function ValidatePromotionPage() {
  const [code, setCode] = useState("");
  const [storeId, setStoreId] = useState(loadSelectedStoreId() ?? "");
  const [subtotal, setSubtotal] = useState("50.00");
  const [result, setResult] = useState<{ valid: boolean; discount: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !storeId.trim()) {
      toast.error("Enter a code and store ID");
      return;
    }
    setSubmitting(true);
    setResult(null);
    try {
      const res = await validatePromotion(code.trim(), storeId.trim(), subtotal.trim());
      setResult({ valid: res.valid, discount: res.discount });
      if (res.valid) {
        toast.success(`Valid — saves ${formatGhs(parseMoney(res.discount))}`);
      } else {
        toast.error("Promotion not valid for this cart");
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Validation failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RequireCustomer>
      <CustomerOnlyPage activeTab="home" mainClassName="py-6">
        <div className="mx-auto max-w-md">
          <CustomerSectionHeader
            title="Validate promotion"
            description="Check whether a promo code applies to a store cart subtotal."
          />

          <form onSubmit={(e) => void onSubmit(e)} className="space-y-4 rounded-2xl border border-border/60 bg-card p-6">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Promo code</span>
              <input className={customerInputCls} value={code} onChange={(e) => setCode(e.target.value)} required />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Store ID</span>
              <input
                className={customerInputCls}
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                required
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Cart subtotal (GHS)</span>
              <input
                className={customerInputCls}
                value={subtotal}
                onChange={(e) => setSubtotal(e.target.value)}
                required
              />
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {submitting ? "Checking…" : "Validate code"}
            </button>
          </form>

          {result && (
            <dl className="mt-6 divide-y divide-border rounded-xl border border-border bg-card text-sm">
              <div className="flex justify-between px-4 py-3">
                <dt className="text-muted-foreground">Valid</dt>
                <dd className="font-semibold">{result.valid ? "Yes" : "No"}</dd>
              </div>
              <div className="flex justify-between px-4 py-3">
                <dt className="text-muted-foreground">Discount</dt>
                <dd className="font-semibold">{formatGhs(parseMoney(result.discount))}</dd>
              </div>
            </dl>
          )}
        </div>
      </CustomerOnlyPage>
    </RequireCustomer>
  );
}
