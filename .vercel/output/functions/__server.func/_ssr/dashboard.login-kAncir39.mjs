import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { e as Route$2, u as useAuth, s as safeShopperPostLoginRedirect, f as safePostLoginRedirect } from "./router-DPkHdSCT.mjs";
import { c as cn } from "./utils-H80jjgLf.mjs";
import { b as Store, B as Bike, c as Shield } from "../_libs/lucide-react.mjs";
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
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
const roles = [{
  id: "vendor",
  label: "Vendor",
  blurb: "Manage products and orders.",
  icon: Store
}, {
  id: "delivery",
  label: "Courier",
  blurb: "Accept runs and track earnings.",
  icon: Bike
}, {
  id: "admin",
  label: "Admin",
  blurb: "Review applications and platform stats.",
  icon: Shield
}];
function DashboardLogin() {
  const {
    redirect
  } = Route$2.useSearch();
  const {
    session,
    ready,
    login
  } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = reactExports.useState("");
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [role, setRole] = reactExports.useState("vendor");
  reactExports.useEffect(() => {
    if (!ready || !session) return;
    if (session.role === "customer") {
      navigate({
        to: safeShopperPostLoginRedirect(redirect)
      });
      return;
    }
    navigate({
      to: safePostLoginRedirect(session.role, redirect)
    });
  }, [ready, session, navigate, redirect]);
  const onSubmit = (e) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error("Enter any password — auth is simulated and stored in this browser only.");
      return;
    }
    login({
      name,
      email,
      role
    });
    const dest = safePostLoginRedirect(role, redirect);
    toast.success("Signed in");
    navigate({
      to: dest
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-semibold", children: "Sign in (demo)" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm text-muted-foreground", children: [
      "Session is saved in",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "rounded bg-muted px-1 py-0.5 text-xs", children: "localStorage" }),
      " as",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "rounded bg-muted px-1 py-0.5 text-xs", children: "randys_auth_session" }),
      ". Each role only opens its own dashboard."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit, className: "mt-8 space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: "Role" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 grid gap-3 sm:grid-cols-3", children: roles.map((r) => {
          const Icon = r.icon;
          const active = role === r.id;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setRole(r.id), className: cn("flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-colors", active ? "border-primary bg-primary/5 shadow-[var(--shadow-soft)]" : "border-border/60 bg-card hover:border-primary/30"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold", children: r.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: r.blurb })
          ] }, r.id);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-foreground", children: "Display name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: name, onChange: (e) => setName(e.target.value), autoComplete: "name", placeholder: "e.g. Amina Okafor", className: "mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-foreground", children: "Email (optional)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), autoComplete: "email", placeholder: "you@example.com", className: "mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-foreground", children: "Password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), autoComplete: "current-password", placeholder: "Any value — not verified", className: "mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", className: "w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition-all hover:shadow-[var(--shadow-glow)]", children: "Continue" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-6 text-center text-sm text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "font-medium text-primary hover:underline", children: "Shopping on the site? Customer sign in" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-center text-sm text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/dashboard", className: "font-medium text-primary hover:underline", children: "Back to dashboards" }) })
  ] });
}
export {
  DashboardLogin as component
};
