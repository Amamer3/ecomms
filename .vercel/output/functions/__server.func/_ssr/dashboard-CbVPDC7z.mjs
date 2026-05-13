import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useRouterState, d as useNavigate, O as Outlet, L as Link } from "../_libs/tanstack__react-router.mjs";
import { F as Footer } from "./Footer-Cn6LS_IF.mjs";
import { u as useAuth, r as roleLabel, d as dashboardPathForRole } from "./router-Da0tdzn1.mjs";
import { s as selectPathname } from "./router-pathname-B_nSBnfm.mjs";
import "../_libs/sonner.mjs";
import { b as Store, B as Bike, c as Shield, L as LayoutDashboard, d as LogIn, e as LogOut } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/zod.mjs";
const allTabs = [{
  to: "/dashboard/vendor",
  label: "Vendor",
  icon: Store,
  role: "vendor"
}, {
  to: "/dashboard/delivery",
  label: "Courier",
  icon: Bike,
  role: "delivery"
}, {
  to: "/dashboard/admin",
  label: "Admin",
  icon: Shield,
  role: "admin"
}];
function DashboardLayout() {
  const path = useRouterState({
    select: selectPathname
  });
  const navigate = useNavigate();
  const {
    session,
    logout
  } = useAuth();
  const isRoot = path === "/dashboard";
  const isLogin = path === "/dashboard/login";
  const isRoleWorkspace = path === "/dashboard/admin" || path === "/dashboard/vendor" || path === "/dashboard/delivery";
  reactExports.useEffect(() => {
    if (session?.role === "customer") {
      navigate({
        to: "/shop",
        replace: true
      });
    }
  }, [session, navigate]);
  const tabs = session && session.role !== "customer" ? allTabs.filter((t) => t.role === session.role) : [];
  const showTabs = session && !isLogin && !isRoleWorkspace;
  if (isRoleWorkspace) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutDashboard, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-semibold", children: isLogin ? "Sign in" : "Dashboards" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: isLogin ? "Choose a role — session is stored locally in your browser." : session && session.role !== "customer" ? `Signed in as ${session.name} (${roleLabel(session.role)}).` : "Sign in to open your role dashboard." })
          ] })
        ] }),
        !session && !isLogin && /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/dashboard/login", className: "inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LogIn, { className: "h-4 w-4" }),
          " Sign in"
        ] }),
        session && !isLogin && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => logout(), className: "inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2.5 text-sm font-semibold text-muted-foreground shadow-[var(--shadow-soft)] transition-colors hover:border-destructive/40 hover:text-destructive", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4" }),
          " Log out"
        ] })
      ] }),
      showTabs && /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "mt-8 flex flex-wrap gap-2 border-b border-border/60", "aria-label": "Dashboard sections", children: tabs.map(({
        to,
        label,
        icon: Icon
      }) => {
        const active = path.startsWith(to);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to, className: `inline-flex items-center gap-2 rounded-t-xl px-4 py-2.5 text-sm font-medium transition-colors ${active ? "border border-b-card border-border/60 bg-card text-foreground" : "text-muted-foreground hover:text-foreground"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }),
          " ",
          label
        ] }, to);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: isRoot ? /* @__PURE__ */ jsxRuntimeExports.jsx(DashHome, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] });
}
function DashHome() {
  const {
    session
  } = useAuth();
  if (!session) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "max-w-xl text-sm text-muted-foreground", children: [
        "Use the ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-medium text-foreground", children: "Sign in" }),
        " button above, or pick a dashboard below. You will be asked to choose",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-medium text-foreground", children: "Vendor" }),
        ",",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-medium text-foreground", children: "Courier" }),
        ", or",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-medium text-foreground", children: "Admin" }),
        " — each role only sees its own tools."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-3", children: [{
        to: "/dashboard/vendor",
        title: "Vendor dashboard",
        desc: "Products, orders, payouts.",
        icon: Store
      }, {
        to: "/dashboard/delivery",
        title: "Courier dashboard",
        desc: "Active runs and earnings.",
        icon: Bike
      }, {
        to: "/dashboard/admin",
        title: "Admin",
        desc: "Approvals and platform stats.",
        icon: Shield
      }].map(({
        to,
        title,
        desc,
        icon: Icon
      }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/dashboard/login", search: {
        redirect: to
      }, className: "rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-soft)] transition-all hover:shadow-[var(--shadow-card)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-4 text-lg font-semibold", children: title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: desc }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-xs font-medium text-primary", children: "Sign in to open →" })
      ] }, to)) })
    ] });
  }
  if (session.role === "customer") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
      "Customer accounts use the storefront.",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/shop", className: "font-medium text-primary hover:underline", children: "Go to shop" }),
      " ",
      "or",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/account", className: "font-medium text-primary hover:underline", children: "open deliveries" }),
      "."
    ] });
  }
  const home = dashboardPathForRole(session.role);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: home, className: "rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-soft)] transition-all hover:shadow-[var(--shadow-card)] sm:col-span-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary", children: [
      session.role === "vendor" && /* @__PURE__ */ jsxRuntimeExports.jsx(Store, { className: "h-5 w-5" }),
      session.role === "delivery" && /* @__PURE__ */ jsxRuntimeExports.jsx(Bike, { className: "h-5 w-5" }),
      session.role === "admin" && /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-5 w-5" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-4 text-lg font-semibold", children: "Your dashboard" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
      "Open your ",
      roleLabel(session.role),
      " workspace."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-xs font-medium text-primary", children: "Go →" })
  ] }) });
}
export {
  DashboardLayout as component
};
