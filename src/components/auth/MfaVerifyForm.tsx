import { useState } from "react";
import { ArrowLeft, Loader2, Shield } from "lucide-react";
import { AuthBackButton, authPillButtonClass } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";

export function MfaVerifyForm({
  onVerify,
  onBack,
  submitting,
  autoSubmit = true,
}: {
  onVerify: (code: string) => void | Promise<void>;
  onBack: () => void;
  submitting: boolean;
  autoSubmit?: boolean;
}) {
  const [code, setCode] = useState("");

  const handleChange = (value: string) => {
    setCode(value);
    if (autoSubmit && value.length === 6 && !submitting) {
      void onVerify(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) return;
    void onVerify(code);
  };

  return (
    <>
      <AuthBackButton onClick={onBack}>
        <ArrowLeft className="h-4 w-4" /> Back to password
      </AuthBackButton>

      <div className="mb-6 flex justify-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Shield className="h-7 w-7" strokeWidth={1.75} aria-hidden />
        </span>
      </div>

      <p className="mb-6 rounded-full border border-border/60 bg-muted/40 px-4 py-3 text-center text-sm text-muted-foreground">
        Open your authenticator app and enter the current 6-digit code for this account.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="mfa-otp" className="block text-center">
            Authenticator code
          </Label>
          <InputOTP
            id="mfa-otp"
            maxLength={6}
            value={code}
            onChange={handleChange}
            disabled={submitting}
            containerClassName="justify-center gap-2"
          >
            <InputOTPGroup className="gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className="h-12 w-11 rounded-xl border border-input text-lg font-semibold first:rounded-xl last:rounded-xl"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button
          type="submit"
          disabled={submitting || code.length < 6}
          className={authPillButtonClass}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Verifying…
            </>
          ) : (
            "Complete sign in"
          )}
        </Button>
      </form>
    </>
  );
}
