import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { customerInputCls, CustomerDetailGrid, CustomerPageHeader } from "@/components/customer/customer-ui";
import { claimReferral, getReferral } from "@/lib/api";
import { ApiError, parseMoney } from "@/lib/api/client";
import { formatGhs } from "@/lib/format-money";

export const Route = createFileRoute("/account/referral")({
  component: AccountReferralPage,
  head: () => ({ meta: [{ title: "Referral — GoMarket" }] }),
});

function AccountReferralPage() {
  const qc = useQueryClient();
  const { data: ref, isLoading } = useQuery({ queryKey: ["referral"], queryFn: getReferral });
  const [code, setCode] = useState("");
  const [claiming, setClaiming] = useState(false);

  const copyCode = async () => {
    if (!ref?.code) return;
    try {
      await navigator.clipboard.writeText(ref.code);
      toast.success("Referral code copied");
    } catch {
      toast.error("Could not copy code");
    }
  };

  const onClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) {
      toast.error("Enter a referral code");
      return;
    }
    setClaiming(true);
    try {
      const res = await claimReferral(trimmed);
      toast.success(res.message || "Referral claimed");
      setCode("");
      void qc.invalidateQueries({ queryKey: ["referral"] });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Claim failed");
    } finally {
      setClaiming(false);
    }
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading referral…</p>;
  }

  if (!ref) {
    return <p className="text-sm text-destructive">Could not load referral info.</p>;
  }

  return (
    <div className="max-w-lg">
      <CustomerPageHeader
        title="Referral rewards"
        description="Get or create your referral code and claim a friend's code for rewards."
      />

      <section className="rounded-2xl border border-border/60 bg-card p-6">
        <p className="text-sm text-muted-foreground">Your referral code</p>
        <div className="mt-2 flex items-center gap-3">
          <p className="font-display text-2xl font-semibold tracking-wide">{ref.code}</p>
          <button
            type="button"
            onClick={() => void copyCode()}
            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
          >
            <Copy className="h-3.5 w-3.5" /> Copy
          </button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Share this code with friends. When they sign up and order, you both earn rewards.
        </p>
      </section>

      <div className="mt-6">
        <CustomerDetailGrid
          rows={[
            { label: "Referrals", value: String(ref.referralCount) },
            { label: "Reward balance", value: formatGhs(parseMoney(ref.rewardBalance)) },
            { label: "Currency", value: ref.currency },
          ]}
        />
      </div>

      <form
        onSubmit={(e) => void onClaim(e)}
        className="mt-8 space-y-4 rounded-2xl border border-border/60 bg-card p-6"
      >
        <h3 className="font-semibold">Claim a friend&apos;s code</h3>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Referral code</span>
          <input
            className={customerInputCls}
            placeholder="Enter code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </label>
        <button
          type="submit"
          disabled={claiming}
          className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {claiming ? "Claiming…" : "Claim referral"}
        </button>
      </form>
    </div>
  );
}
