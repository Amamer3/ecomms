import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Briefcase, Loader2, Phone } from "lucide-react";
import { toast } from "sonner";
import {
  AuthBackButton,
  AuthDivider,
  AuthFooterLink,
  AuthStepIndicator,
  ShopperAuthLayout,
  authPillButtonClass,
  authPillFieldClass,
} from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth";
import { requestOtp, resendOtp, verifyOtp } from "@/lib/api";
import { getAuthErrorMessage } from "@/lib/errors";
import { safeShopperPostLoginRedirect } from "@/lib/auth-storage";
import { E164_PHONE_HINT, normalizeE164Phone } from "@/lib/phone";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "phone", label: "Phone" },
  { id: "code", label: "Verify" },
] as const;

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: ShopperLoginPage,
  head: () => ({ meta: [{ title: "Sign in — GoMarket" }] }),
});

function ShopperLoginPage() {
  const { redirect } = Route.useSearch();
  const { session, ready, setSessionFromTokens } = useAuth();
  const navigate = useNavigate();
  const [phoneInput, setPhoneInput] = useState("+233");
  const [e164Phone, setE164Phone] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!ready || !session || session.role !== "customer") return;
    navigate({ to: safeShopperPostLoginRedirect(redirect) });
  }, [ready, session, navigate, redirect]);

  const resolvePhone = (): string | null => {
    const normalized = normalizeE164Phone(phoneInput);
    if (!normalized) {
      toast.error(E164_PHONE_HINT);
      return null;
    }
    return normalized;
  };

  const goToPhone = () => {
    setStep("phone");
    setCode("");
  };

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const phone = resolvePhone();
    if (!phone) return;
    setSubmitting(true);
    try {
      await requestOtp(phone);
      setE164Phone(phone);
      setStep("code");
      setCode("");
      toast.success("PIN sent to your phone");
    } catch (err) {
      toast.error(getAuthErrorMessage(err, "Could not send PIN"));
    } finally {
      setSubmitting(false);
    }
  };

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const phone = e164Phone ?? resolvePhone();
    if (!phone) return;
    if (code.length < 4) {
      toast.error("Enter the PIN from your phone");
      return;
    }
    setSubmitting(true);
    try {
      const tokens = await verifyOtp(phone, code.trim());
      await setSessionFromTokens(tokens);
      toast.success("Signed in");
      navigate({ to: safeShopperPostLoginRedirect(redirect) });
    } catch (err) {
      toast.error(getAuthErrorMessage(err, "Invalid PIN"));
    } finally {
      setSubmitting(false);
    }
  };

  const onResend = async () => {
    const phone = e164Phone ?? resolvePhone();
    if (!phone) return;
    setResending(true);
    try {
      await resendOtp(phone);
      toast.success("PIN resent");
    } catch (err) {
      toast.error(getAuthErrorMessage(err, "Could not resend PIN"));
    } finally {
      setResending(false);
    }
  };

  return (
    <ShopperAuthLayout
      footer={
        <AuthFooterLink
          label="New here?"
          linkLabel="Browse the shop"
          to="/shop"
        />
      }
    >
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-[2rem]">
          {step === "phone" ? "Welcome back!" : "Verify your PIN"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {step === "phone"
            ? "Enter your mobile number to receive a one-time PIN."
            : "Enter the code we sent to your phone to continue."}
        </p>
      </header>

      <div className="mt-8">
        <AuthStepIndicator steps={[...STEPS]} current={step} />

        {step === "phone" ? (
          <form onSubmit={(e) => void sendOtp(e)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile number</Label>
              <div className="relative">
                <Phone
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="phone"
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  autoComplete="tel"
                  required
                  placeholder="+233200000001"
                  className={cn(authPillFieldClass, "pl-11")}
                />
              </div>
            </div>

            <Button type="submit" disabled={submitting} className={authPillButtonClass}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Sending PIN…
                </>
              ) : (
                "Sign in"
              )}
            </Button>

            <AuthDivider />

            <Button
              type="button"
              variant="outline"
              className="h-12 w-full rounded-full border-border/80 bg-background text-sm font-semibold"
              asChild
            >
              <Link to="/dashboard/login">
                <Briefcase className="mr-2 h-4 w-4" />
                Business sign in
              </Link>
            </Button>
          </form>
        ) : (
          <>
            <AuthBackButton onClick={goToPhone}>
              <ArrowLeft className="h-4 w-4" /> Change number
            </AuthBackButton>
            <form onSubmit={(e) => void onVerify(e)} className="space-y-6">
              <p className="rounded-full border border-border/60 bg-muted/40 px-4 py-3 text-center text-sm text-muted-foreground">
                PIN sent to{" "}
                <span className="font-semibold text-foreground">{e164Phone}</span>
              </p>
              <div className="space-y-3">
                <Label htmlFor="otp" className="text-center block">
                  Enter PIN
                </Label>
                <InputOTP
                  id="otp"
                  maxLength={6}
                  value={code}
                  onChange={setCode}
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
                disabled={submitting || code.length < 4}
                className={authPillButtonClass}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Verifying…
                  </>
                ) : (
                  "Verify & continue"
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={resending}
                onClick={() => void onResend()}
                className="w-full rounded-full text-primary"
              >
                {resending ? "Resending…" : "Resend PIN"}
              </Button>
            </form>
          </>
        )}
      </div>
    </ShopperAuthLayout>
  );
}
