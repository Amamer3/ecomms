import { useEffect } from "react";
import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Store, Bike, Shield, LogIn, LogOut } from "lucide-react";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/auth";
import { dashboardPathForRole, roleLabel } from "@/lib/auth-storage";
import { selectPathname } from "@/lib/router-pathname";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
  head: () => ({
    meta: [
      { title: "Dashboard — GoMarket" },
      { name: "description", content: "Manage your business on GoMarket." },
    ],
  }),
});

const allTabs = [
  { to: "/dashboard/vendor" as const, label: "Vendor", icon: Store, role: "vendor" as const },
  { to: "/dashboard/delivery" as const, label: "Courier", icon: Bike, role: "delivery" as const },
  { to: "/dashboard/admin" as const, label: "Admin", icon: Shield, role: "admin" as const },
];

function DashboardLayout() {
  const path = useRouterState({ select: selectPathname });
  const navigate = useNavigate();
  const { session, logout } = useAuth();
  const isRoot = path === "/dashboard";
  const isLogin = path === "/dashboard/login";
  const isAuthUtility =
    path === "/dashboard/security" || path === "/dashboard/mfa/setup";
  const isAdminWorkspace = path === "/dashboard/admin" || path.startsWith("/dashboard/admin/");
  const isVendorWorkspace = path === "/dashboard/vendor" || path.startsWith("/dashboard/vendor/");
  const isDeliveryWorkspace =
    path === "/dashboard/delivery" || path.startsWith("/dashboard/delivery/");
  const isRoleWorkspace = isAdminWorkspace || isVendorWorkspace || isDeliveryWorkspace;

  useEffect(() => {
    if (!session) return;
    if (session.role === "customer") {
      navigate({ to: "/", replace: true });
      return;
    }
    if (isRoot && !isLogin) {
      navigate({ to: dashboardPathForRole(session.role), replace: true });
    }
  }, [session, navigate, isRoot, isLogin]);

  const tabs =
    session && session.role !== "customer" ? allTabs.filter((t) => t.role === session.role) : [];
  const showTabs = session && !isLogin && !isRoleWorkspace;

  if (isRoleWorkspace || isLogin || isAuthUtility) {
    return (
      <div className="h-screen overflow-hidden bg-background">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <LayoutDashboard className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-display text-3xl font-semibold">Dashboards</h1>
              <p className="text-sm text-muted-foreground">
                {session && session.role !== "customer"
                  ? `Signed in as ${session.name} (${roleLabel(session.role)}).`
                  : "Sign in to open your role dashboard."}
              </p>
            </div>
          </div>
          {!session && !isLogin && (
            <Link
              to="/dashboard/login"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)]"
            >
              <LogIn className="h-4 w-4" /> Sign in
            </Link>
          )}
          {session && !isLogin && (
            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2.5 text-sm font-semibold text-muted-foreground shadow-[var(--shadow-soft)] transition-colors hover:border-destructive/40 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
          )}
        </div>

        {showTabs && (
          <nav
            className="mt-8 flex flex-wrap gap-2 border-b border-border/60"
            aria-label="Dashboard sections"
          >
            {tabs.map(({ to, label, icon: Icon }) => {
              const active = path.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`inline-flex items-center gap-2 rounded-t-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "border border-b-card border-border/60 bg-card text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" /> {label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="mt-6">{isRoot ? <DashHome /> : <Outlet />}</div>
      </div>
      <Footer />
    </div>
  );
}

function DashHome() {
  const { session } = useAuth();

  if (!session) {
    return (
      <div className="space-y-6">
        <p className="max-w-xl text-sm text-muted-foreground">
          Sign in with your business account. GoMarket detects your role from the API and sends you
          to the right workspace — vendor, courier, or admin.
        </p>
        <Link
          to="/dashboard/login"
          className="inline-flex max-w-sm items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:shadow-md"
        >
          <LogIn className="h-4 w-4" /> Business sign in
        </Link>
      </div>
    );
  }

  if (session.role === "customer") {
    return (
      <p className="text-sm text-muted-foreground">
        Customer accounts use the storefront.{" "}
        <Link to="/" className="font-medium text-primary hover:underline">
          Go to home
        </Link>{" "}
        or{" "}
        <Link to="/account" className="font-medium text-primary hover:underline">
          open deliveries
        </Link>.
      </p>
    );
  }

  const home = dashboardPathForRole(session.role);
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Link
        to={home}
        className="rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-soft)] transition-all hover:shadow-[var(--shadow-card)] sm:col-span-1"
      >
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
          {session.role === "vendor" && <Store className="h-5 w-5" />}
          {session.role === "delivery" && <Bike className="h-5 w-5" />}
          {session.role === "admin" && <Shield className="h-5 w-5" />}
        </span>
        <h3 className="mt-4 text-lg font-semibold">Your dashboard</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Open your {roleLabel(session.role)} workspace.
        </p>
        <p className="mt-3 text-xs font-medium text-primary">Go →</p>
      </Link>
    </div>
  );
}
