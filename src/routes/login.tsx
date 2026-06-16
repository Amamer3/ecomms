import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Briefcase, Loader2, Phone, User } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import {
  AuthBackButton,
  AuthDivider,
  AuthFooterLink,
  ShopperAuthLayout,
  authPillButtonClass,
  authPillFieldClass,
} from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth";
import { getCustomerProfile, getMe, requestOtp, resendOtp, updateCustomerProfile, verifyOtp } from "@/lib/api";
import { saveTokens, loadTokens } from "@/lib/api/client";
import { getAuthErrorMessage } from "@/lib/errors";
import {
  customerProfileDisplayName,
  customerProfileNeedsName,
  safeShopperPostLoginRedirect,
  splitFullName,
} from "@/lib/auth-storage";
import { PhoneInput } from "@/components/PhoneInput";
import { defaultGhanaPhoneInput, E164_PHONE_HINT, normalizeE164Phone } from "@/lib/phone";
import { cn } from "@/lib/utils";
import type { TokenPair } from "@/lib/api/types";

const searchSchema = z.object({
  redirect: z.string().optional(),
  completeProfile: z.boolean().optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: searchSchema,
  component: ShopperLoginPage,
  head: () => ({ meta: [{ title: "Sign in — GoMarket" }] }),
});

type LoginStep = "phone" | "code" | "profile";

function ShopperLoginPage() {
  const { redirect, completeProfile = false } = Route.useSearch();
  const { session, ready, setSessionFromTokens } = useAuth();
  const navigate = useNavigate();
  const [phoneInput, setPhoneInput] = useState(defaultGhanaPhoneInput);
  const [e164Phone, setE164Phone] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [step, setStep] = useState<LoginStep>("phone");
  const [pendingTokens, setPendingTokens] = useState<TokenPair | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!ready || !session || session.role !== "customer") return;
    if (session.profileComplete === false) {
      setStep("profile");
      return;
    }
    navigate({ to: safeShopperPostLoginRedirect(redirect) });
  }, [ready, session, navigate, redirect]);

  useEffect(() => {
    if (!ready || session) return;
    if (!completeProfile && !loadTokens()) return;

    let cancelled = false;
    void (async () => {
      try {
        const user = await getMe();
        if (cancelled || user.role !== "CUSTOMER") return;
        const profile = await getCustomerProfile();
        if (cancelled || !customerProfileNeedsName(profile)) return;
        setStep("profile");
      } catch {
        /* user can sign in again */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, session, completeProfile]);

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
    setFullName("");
    setPendingTokens(null);
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

  const finishSignIn = async (tokens: TokenPair, displayName?: string) => {
    await setSessionFromTokens(tokens, displayName);
    toast.success("Signed in");
    navigate({ to: safeShopperPostLoginRedirect(redirect) });
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
      saveTokens({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });

      if (tokens.user.role === "CUSTOMER") {
        const profile = await getCustomerProfile();
        if (customerProfileNeedsName(profile)) {
          setPendingTokens(tokens);
          setStep("profile");
          return;
        }
      }

      await finishSignIn(tokens);
    } catch (err) {
      toast.error(getAuthErrorMessage(err, "Invalid PIN"));
    } finally {
      setSubmitting(false);
    }
  };

  const onCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = fullName.trim();
    if (trimmed.length < 2) {
      toast.error("Enter your full name");
      return;
    }
    setSubmitting(true);
    try {
      const { firstName, lastName } = splitFullName(trimmed);
      const updated = await updateCustomerProfile({ firstName, lastName });
      const displayName = customerProfileDisplayName(updated);

      if (pendingTokens) {
        await finishSignIn(pendingTokens, displayName);
        setPendingTokens(null);
        return;
      }

      const stored = loadTokens();
      if (!stored) {
        toast.error("Session expired — sign in again");
        goToPhone();
        return;
      }

      const user = await getMe();
      await finishSignIn(
        {
          accessToken: stored.accessToken,
          refreshToken: stored.refreshToken,
          tokenType: "Bearer",
          expiresIn: "",
          user,
        },
        displayName,
      );
    } catch (err) {
      toast.error(getAuthErrorMessage(err, "Could not save your name"));
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

  const heading =
    step === "phone" ? "Welcome back!" : step === "code" ? "Verify your PIN" : "What's your name?";
  const subheading =
    step === "phone"
      ? "Enter your mobile number to receive a one-time PIN."
      : step === "code"
        ? "Enter the code we sent to your phone to continue."
        : "We need your name to finish setting up your account.";

  return (
    <ShopperAuthLayout
      footer={
        step === "profile" ? null : (
          <AuthFooterLink label="New here?" linkLabel="Browse the shop" to="/shop" />
        )
      }
    >
      <header className="text-center">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-[2rem]">
          {heading}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{subheading}</p>
      </header>

      <div className="mt-8">
        {step === "phone" ? (
          <form onSubmit={(e) => void sendOtp(e)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile number</Label>
              <div className="relative">
                <Phone
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <PhoneInput
                  id="phone"
                  value={phoneInput}
                  onChange={setPhoneInput}
                  required
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
        ) : step === "code" ? (
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
        ) : (
          <form onSubmit={(e) => void onCompleteProfile(e)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <div className="relative">
                <User
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={100}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ama Mensah"
                  className={cn(authPillFieldClass, "pl-11")}
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={submitting || fullName.trim().length < 2}
              className={authPillButtonClass}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </form>
        )}
      </div>
    </ShopperAuthLayout>
  );
}
