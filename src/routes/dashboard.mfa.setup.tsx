import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";
import {
  AuthCard,
  AuthFooterLink,
  AuthStepIndicator,
  BusinessAuthLayout,
  authFieldClass,
  authPrimaryButtonClass,
} from "@/components/auth/AuthShell";
import { RequireDashboardRole } from "@/components/RequireDashboardRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setupMfa } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";

export const Route = createFileRoute("/dashboard/mfa/setup")({
  component: MfaSetupPage,
  head: () => ({ meta: [{ title: "Set up 2FA — GoMarket" }] }),
});

const STEPS = [
  { id: "scan", label: "Scan" },
  { id: "confirm", label: "Confirm" },
] as const;

function MfaSetupPage() {
  return (
    <RequireDashboardRole role="admin">
      <MfaSetupInner />
    </RequireDashboardRole>
  );
}

function MfaSetupInner() {
  const [step, setStep] = useState<"scan" | "confirm" | "done">("scan");
  const [otpauthUri, setOtpauthUri] = useState<string | null>(null);
  const [totp, setTotp] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const res = await setupMfa();
        if (res.enabled) {
          setStep("done");
        } else if (res.otpauthUri) {
          setOtpauthUri(res.otpauthUri);
          setStep("scan");
        } else {
          toast.error("Could not start MFA enrolment");
        }
      } catch (err) {
        toast.error(getErrorMessage(err, "Could not start MFA setup"));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totp.trim().length < 6) {
      toast.error("Enter the 6-digit code from your authenticator");
      return;
    }
    setSubmitting(true);
    try {
      const res = await setupMfa(totp.trim());
      if (res.enabled) {
        setStep("done");
        toast.success("Two-factor authentication enabled");
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Invalid code"));
    } finally {
      setSubmitting(false);
    }
  };

  const currentStep = step === "done" ? "confirm" : step;

  return (
    <BusinessAuthLayout>
      <AuthCard
        variant="business"
        icon={Shield}
        title="Set up two-factor authentication"
        description="Scan the QR code with your authenticator app, then enter a code to confirm enrolment."
        footer={
          <AuthFooterLink
            label="Already enrolled?"
            linkLabel="Security settings"
            to="/dashboard/security"
          />
        }
      >
        <AuthStepIndicator steps={[...STEPS]} current={currentStep} />

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground" aria-busy="true">
            <Loader2 className="h-4 w-4 animate-spin" /> Preparing enrolment…
          </div>
        ) : step === "done" ? (
          <div className="space-y-4 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
              <Check className="h-7 w-7" strokeWidth={2.5} />
            </span>
            <p className="text-sm text-muted-foreground">
              Two-factor authentication is active on your admin account. You&apos;ll be asked for a code
              on each sign-in.
            </p>
            <Button asChild className={authPrimaryButtonClass}>
              <Link to="/dashboard/admin">Go to admin dashboard</Link>
            </Button>
          </div>
        ) : otpauthUri ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4 rounded-xl border border-border/70 bg-muted/30 p-6">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(otpauthUri)}`}
                alt="QR code for authenticator app"
                width={180}
                height={180}
                className="rounded-lg bg-white p-2"
              />
              <p className="max-w-sm text-center text-xs text-muted-foreground">
                Can&apos;t scan? Add the account manually using this URI:
              </p>
              <code className="block max-w-full break-all rounded-lg bg-background px-3 py-2 text-left text-xs">
                {otpauthUri}
              </code>
            </div>

            <form onSubmit={(e) => void onConfirm(e)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="totp">Confirmation code</Label>
                <Input
                  id="totp"
                  value={totp}
                  onChange={(e) => setTotp(e.target.value)}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  maxLength={6}
                  className={`${authFieldClass} font-mono tracking-[0.2em]`}
                />
              </div>
              <Button
                type="submit"
                disabled={submitting || totp.trim().length < 6}
                className={authPrimaryButtonClass}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Confirming…
                  </>
                ) : (
                  "Enable 2FA"
                )}
              </Button>
            </form>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            MFA enrolment could not be started. Try again from{" "}
            <Link to="/dashboard/security" className="font-medium text-primary hover:underline">
              security settings
            </Link>
            .
          </p>
        )}
      </AuthCard>

      <p className="mt-8 text-center">
        <Link
          to="/dashboard/security"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Security settings
        </Link>
      </p>
    </BusinessAuthLayout>
  );
}
