import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, LogOut, RefreshCw, Shield } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authPrimaryButtonClass } from "@/components/auth/AuthShell";
import { useAuth } from "@/context/auth";
import { getMe, refreshAuth } from "@/lib/api";
import { loadTokens, saveTokens } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/errors";
import { QueryErrorState } from "@/components/QueryErrorState";
import type { PublicUser } from "@/lib/api/types";
import { Link } from "@tanstack/react-router";

function formatWhen(iso?: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function UserDetails({ user }: { user: PublicUser }) {
  const rows: { label: string; value: string }[] = [
    { label: "User ID", value: user.id },
    { label: "Role", value: user.role },
    { label: "Status", value: user.status },
    { label: "Phone", value: user.phone },
    { label: "Email", value: user.email ?? "—" },
    { label: "Phone verified", value: formatWhen(user.phoneVerifiedAt) },
    { label: "Email verified", value: formatWhen(user.emailVerifiedAt) },
    { label: "Last login", value: formatWhen(user.lastLoginAt) },
  ];

  return (
    <dl className="divide-y divide-border rounded-xl border border-border/70 bg-muted/20">
      {rows.map(({ label, value }) => (
        <div key={label} className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
          <dd className="break-all text-sm font-medium text-foreground sm:text-right">{value}</dd>
        </div>
      ))}
      {user.permissions.length > 0 && (
        <div className="px-4 py-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Permissions</dt>
          <dd className="mt-2 flex flex-wrap gap-1.5">
            {user.permissions.map((p) => (
              <span key={p} className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {p}
              </span>
            ))}
          </dd>
        </div>
      )}
    </dl>
  );
}

export function SessionPanel({
  showMfaLink = false,
  logoutRedirect = "/",
}: {
  showMfaLink?: boolean;
  logoutRedirect?: string;
}) {
  const navigate = useNavigate();
  const { logout, setSessionFromTokens } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const { data: user, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["auth-me"],
    queryFn: getMe,
  });

  const onRefresh = async () => {
    const tokens = loadTokens();
    if (!tokens?.refreshToken) {
      toast.error("No refresh token in storage");
      return;
    }
    setRefreshing(true);
    try {
      const next = await refreshAuth(tokens.refreshToken);
      saveTokens({ accessToken: next.accessToken, refreshToken: next.refreshToken });
      await setSessionFromTokens(next);
      await refetch();
      toast.success("Session refreshed");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not refresh session"));
    } finally {
      setRefreshing(false);
    }
  };

  const onLogout = async () => {
    setSigningOut(true);
    try {
      await logout();
      toast.success("Signed out");
      navigate({ to: logoutRedirect });
    } catch (err) {
      toast.error(getErrorMessage(err, "Sign out failed"));
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold">Current session</h2>
        <p className="mt-1 text-sm text-muted-foreground">Your signed-in account details.</p>
      </div>

      {isLoading || isFetching ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground" aria-busy="true">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading account…
        </div>
      ) : isError || !user ? (
        <QueryErrorState
          error={error}
          title="Couldn't load your account"
          onRetry={() => void refetch()}
          retrying={isFetching && !isLoading}
        />
      ) : (
        <UserDetails user={user} />
      )}

      {showMfaLink && user?.role === "ADMIN" && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-4">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Two-factor authentication</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Enrol an authenticator app for admin sign-in.
              </p>
              <Link
                to="/dashboard/mfa/setup"
                className="mt-3 inline-flex text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                Set up 2FA →
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          disabled={refreshing}
          onClick={() => void onRefresh()}
          className="h-11 flex-1 rounded-lg"
        >
          {refreshing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Refreshing…
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" /> Refresh tokens
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="destructive"
          disabled={signingOut}
          onClick={() => void onLogout()}
          className={`${authPrimaryButtonClass} flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90`}
        >
          {signingOut ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Signing out…
            </>
          ) : (
            <>
              <LogOut className="h-4 w-4" /> Sign out
            </>
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Refresh extends your session. Sign out ends it on this device.
      </p>
    </div>
  );
}
