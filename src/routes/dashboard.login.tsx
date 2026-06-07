import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import {
  AuthDivider,
  AuthStepIndicator,
  BusinessLoginLayout,
  authPillButtonClass,
  authPillFieldClass,
} from "@/components/auth/AuthShell";
import { MfaEnrollForm } from "@/components/auth/MfaEnrollForm";
import { MfaVerifyForm } from "@/components/auth/MfaVerifyForm";
import { PasswordField } from "@/components/auth/PasswordField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth";
import { login, verifyMfa } from "@/lib/api";
import { ApiError, isMfaChallenge, isMfaEnrollment, isTokenPair } from "@/lib/api/client";
import type { MfaLoginChallenge } from "@/lib/api/types";
import { postAuthRedirectPath, safePostLoginRedirect, safeShopperPostLoginRedirect } from "@/lib/auth-storage";

const MFA_SESSION_KEY = "gmarket_mfa_session";

type StoredMfaSession = {
  mfaToken: string;
  otpauthUri?: string;
  message?: string;
};

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/dashboard/login")({
  validateSearch: searchSchema,
  component: DashboardLogin,
  head: () => ({ meta: [{ title: "Business sign in — GoMarket" }] }),
});

const STEPS = [
  { id: "credentials", label: "Account" },
  { id: "setup", label: "Set up" },
  { id: "verify", label: "Verify" },
] as const;

function loadMfaSession(): StoredMfaSession | null {
  try {
    const raw = sessionStorage.getItem(MFA_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredMfaSession;
    if (typeof parsed.mfaToken === "string" && parsed.mfaToken.length > 0) return parsed;
    return null;
  } catch {
    return null;
  }
}

function DashboardLogin() {
  const { redirect } = Route.useSearch();
  const { session, ready, setSessionFromTokens } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [mfaSession, setMfaSession] = useState<StoredMfaSession | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMfaSession(loadMfaSession());
  }, []);

  useEffect(() => {
    if (!ready || !session) return;
    if (session.role === "customer") {
      navigate({ to: safeShopperPostLoginRedirect(redirect) });
      return;
    }
    navigate({ to: safePostLoginRedirect(session.role, redirect) });
  }, [ready, session, navigate, redirect]);

  const persistMfaSession = (challenge: MfaLoginChallenge) => {
    const next: StoredMfaSession = {
      mfaToken: challenge.mfaToken,
      otpauthUri: challenge.otpauthUri,
      message: challenge.message,
    };
    setMfaSession(next);
    sessionStorage.setItem(MFA_SESSION_KEY, JSON.stringify(next));
  };

  const clearMfaSession = () => {
    setMfaSession(null);
    sessionStorage.removeItem(MFA_SESSION_KEY);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || !identifier.trim()) {
      toast.error("Enter your email and password");
      return;
    }
    setSubmitting(true);
    try {
      const res = await login(identifier.trim(), password);

      if (isMfaChallenge(res)) {
        persistMfaSession(res);
        if (isMfaEnrollment(res)) {
          toast("Scan the QR code in your authenticator app to continue");
        } else {
          toast("Enter the code from your authenticator app");
        }
        return;
      }

      if (isTokenPair(res)) {
        await setSessionFromTokens(res);
        navigate({ to: postAuthRedirectPath(res.user, redirect) });
        toast.success("Signed in");
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Sign in failed");
    } finally {
      setSubmitting(false);
    }
  };

  const onMfaVerify = async (code: string) => {
    if (!mfaSession?.mfaToken || code.length < 6) return;
    setSubmitting(true);
    try {
      const tokens = await verifyMfa(mfaSession.mfaToken, code.trim());
      clearMfaSession();
      await setSessionFromTokens(tokens);
      navigate({ to: postAuthRedirectPath(tokens.user, redirect) });
      toast.success("Signed in");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Invalid code");
    } finally {
      setSubmitting(false);
    }
  };

  const enrolling = mfaSession?.otpauthUri != null && mfaSession.otpauthUri.length > 0;
  const step = !mfaSession ? "credentials" : enrolling ? "setup" : "verify";

  return (
    <BusinessLoginLayout
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Shopping on the site?{" "}
          <Link
            to="/login"
            search={{ redirect: undefined }}
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Customer sign in
          </Link>
        </p>
      }
    >
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-[2rem]">
          {step === "credentials"
            ? "Welcome back!"
            : enrolling
              ? "Set up two-factor authentication"
              : "Two-factor verification"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {step === "credentials"
            ? "Enter your business credentials to access your workspace."
            : enrolling
              ? "Scan the TOTP URI in your authenticator app, then confirm with a 6-digit code."
              : "Your account is protected with two-factor authentication."}
        </p>
      </header>

      <div className="mt-8">
        <AuthStepIndicator steps={[...STEPS]} current={step} />

        {mfaSession ? (
          enrolling ? (
            <MfaEnrollForm
              otpauthUri={mfaSession.otpauthUri!}
              message={mfaSession.message}
              submitting={submitting}
              onBack={clearMfaSession}
              onVerify={onMfaVerify}
            />
          ) : (
            <MfaVerifyForm
              submitting={submitting}
              onBack={clearMfaSession}
              onVerify={onMfaVerify}
            />
          )
        ) : (
          <form onSubmit={(e) => void onSubmit(e)} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">Email or phone</Label>
                <Input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="username"
                  placeholder="you@company.com"
                  className={authPillFieldClass}
                />
              </div>
              <PasswordField value={password} onChange={setPassword} variant="pill" />
            </div>

            <Button type="submit" disabled={submitting} className={authPillButtonClass}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
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
              <Link to="/login" search={{ redirect: undefined }}>
                <ShoppingBag className="mr-2 h-4 w-4" />
                Customer sign in
              </Link>
            </Button>
          </form>
        )}
      </div>
    </BusinessLoginLayout>
  );
}
