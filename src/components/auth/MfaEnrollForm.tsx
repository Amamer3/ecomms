import { useState } from "react";
import { ArrowLeft, Loader2, Shield } from "lucide-react";
import { AuthBackButton, authPillButtonClass } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";

export function MfaEnrollForm({
  otpauthUri,
  message,
  onVerify,
  onBack,
  submitting,
}: {
  otpauthUri: string;
  message?: string;
  onVerify: (code: string) => void | Promise<void>;
  onBack: () => void;
  submitting: boolean;
}) {
  const [code, setCode] = useState("");

  const handleChange = (value: string) => {
    setCode(value);
    if (value.length === 6 && !submitting) {
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

      <p className="mb-6 text-center text-sm text-muted-foreground">
        {message ??
          "Two-factor authentication is required for this account. Scan the QR code, then enter a code to finish signing in."}
      </p>

      <div className="mb-6 flex flex-col items-center gap-4 rounded-2xl border border-border/60 bg-muted/30 p-5">
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(otpauthUri)}`}
          alt="QR code for authenticator app"
          width={180}
          height={180}
          className="rounded-xl bg-white p-2"
        />
        <p className="max-w-sm text-center text-xs text-muted-foreground">
          Scan this in Google Authenticator, Authy, or another TOTP app.
        </p>
        <details className="w-full max-w-sm text-left">
          <summary className="cursor-pointer text-xs font-medium text-primary">
            Can&apos;t scan? Show setup key
          </summary>
          <code className="mt-2 block max-w-full break-all rounded-xl bg-background px-3 py-2 text-xs">
            {otpauthUri}
          </code>
        </details>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="mfa-enroll-otp" className="block text-center">
            Enter code from your app
          </Label>
          <InputOTP
            id="mfa-enroll-otp"
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
