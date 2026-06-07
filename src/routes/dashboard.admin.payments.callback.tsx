import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { paymentCallback } from "@/lib/api";
import { ApiError } from "@/lib/api/client";
import { adminInputCls, AdminPageHeader } from "@/components/admin/admin-ui";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/admin/payments/callback")({
  component: PaymentCallbackPage,
  head: () => ({ meta: [{ title: "Payment callback — GoMarket" }] }),
});

function PaymentCallbackPage() {
  const [payload, setPayload] = useState('{\n  "reference": "",\n  "status": "SUCCESS"\n}');
  const [signature, setSignature] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let body: Record<string, unknown>;
    try {
      body = JSON.parse(payload) as Record<string, unknown>;
    } catch {
      toast.error("Payload must be valid JSON");
      return;
    }
    setSubmitting(true);
    setResponse(null);
    try {
      const res = await paymentCallback(body, signature.trim() || undefined);
      setResponse(JSON.stringify(res, null, 2));
      toast.success("Callback accepted");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Callback failed";
      setResponse(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <AdminPageHeader
        title="Payment provider callback"
        description="Simulate or replay a signed payment provider webhook."
      />

      <p className="mb-6 text-sm text-muted-foreground">
        In production, callbacks are sent automatically by the payment provider. Include the optional HMAC signature
        when testing signed webhooks.
      </p>

      <form onSubmit={(e) => void onSubmit(e)} className="space-y-4 rounded-2xl border border-border/60 bg-card p-6">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">JSON payload</span>
          <textarea
            className={`${adminInputCls} min-h-[10rem] font-mono text-xs`}
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Signature (optional)</span>
          <input
            className={adminInputCls}
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            placeholder="Provider HMAC signature"
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Send callback"}
        </button>
      </form>

      {response && (
        <pre className="mt-6 overflow-x-auto rounded-xl border border-border bg-muted/30 p-4 text-xs">{response}</pre>
      )}
    </div>
  );
}
