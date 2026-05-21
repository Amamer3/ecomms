import { Q as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { c as createRouter, a as createRootRouteWithContext, u as useRouter, L as Link, O as Outlet, H as HeadContent, S as Scripts, b as createFileRoute, l as lazyRouteComponent } from "../_libs/tanstack__react-router.mjs";
import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { T as Toaster$1 } from "../_libs/sonner.mjs";
import { o as objectType, s as stringType } from "../_libs/zod.mjs";
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
const appCss = "/assets/styles-vU6h43BW.css";
const AUTH_STORAGE_KEY = "randys_auth_session";
function parseSession(raw) {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw);
    if (!p || typeof p.id !== "string" || typeof p.role !== "string") return null;
    if (p.role !== "admin" && p.role !== "vendor" && p.role !== "delivery" && p.role !== "customer")
      return null;
    return {
      id: p.id,
      email: typeof p.email === "string" ? p.email : "",
      name: typeof p.name === "string" ? p.name : "",
      role: p.role,
      createdAt: typeof p.createdAt === "string" ? p.createdAt : (/* @__PURE__ */ new Date()).toISOString()
    };
  } catch {
    return null;
  }
}
function loadSessionFromStorage() {
  if (typeof window === "undefined") return null;
  return parseSession(localStorage.getItem(AUTH_STORAGE_KEY));
}
function saveSessionToStorage(session) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}
function clearSessionFromStorage() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}
function roleLabel(role) {
  switch (role) {
    case "customer":
      return "Customer";
    case "vendor":
      return "Vendor";
    case "delivery":
      return "Courier";
    case "admin":
      return "Admin";
  }
}
function dashboardPathForRole(role) {
  switch (role) {
    case "admin":
      return "/dashboard/admin";
    case "vendor":
      return "/dashboard/vendor";
    case "delivery":
      return "/dashboard/delivery";
  }
}
function appHomePathForRole(role) {
  if (role === "customer") return "/shop";
  return dashboardPathForRole(role);
}
function pathRole(path) {
  if (path === "/dashboard/admin") return "admin";
  if (path === "/dashboard/vendor") return "vendor";
  if (path === "/dashboard/delivery") return "delivery";
  return null;
}
function safePostLoginRedirect(role, redirect) {
  const home = dashboardPathForRole(role);
  if (!redirect || !redirect.startsWith("/dashboard")) return home;
  if (redirect === "/dashboard/login") return home;
  if (redirect === "/dashboard") return "/dashboard";
  const needed = pathRole(redirect);
  if (!needed) return home;
  if (needed !== role) return home;
  return redirect;
}
function safeShopperPostLoginRedirect(redirect) {
  if (!redirect || !redirect.startsWith("/")) return "/shop";
  if (redirect.startsWith("//")) return "/shop";
  if (redirect.startsWith("/dashboard") || redirect.startsWith("/login")) return "/shop";
  if (redirect === "/cart" || redirect.startsWith("/cart/")) return "/cart";
  if (redirect === "/checkout" || redirect.startsWith("/checkout/")) return "/checkout";
  if (redirect === "/account" || redirect.startsWith("/account/")) return "/account";
  if (redirect === "/shop" || redirect.startsWith("/shop/")) return "/shop";
  return "/shop";
}
const Ctx$1 = reactExports.createContext(null);
function defaultDisplayName(role) {
  return roleLabel(role);
}
function AuthProvider({ children }) {
  const [session, setSession] = reactExports.useState(null);
  const [ready, setReady] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setSession(loadSessionFromStorage());
    setReady(true);
  }, []);
  reactExports.useEffect(() => {
    const onStorage = (e) => {
      if (e.key === AUTH_STORAGE_KEY || e.key === null) {
        setSession(loadSessionFromStorage());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  const login = reactExports.useCallback((input) => {
    const next = {
      id: crypto.randomUUID(),
      email: input.email.trim(),
      name: input.name.trim() || defaultDisplayName(input.role),
      role: input.role,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    saveSessionToStorage(next);
    setSession(next);
  }, []);
  const logout = reactExports.useCallback(() => {
    clearSessionFromStorage();
    setSession(null);
  }, []);
  const value = reactExports.useMemo(() => ({ session, ready, login, logout }), [session, ready, login, logout]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Ctx$1.Provider, { value, children });
}
function useAuth() {
  const v = reactExports.useContext(Ctx$1);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
const Ctx = reactExports.createContext(null);
const KEY = "randys.cart.v1";
function CartProvider({ children }) {
  const [items, setItems] = reactExports.useState([]);
  reactExports.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
    }
  }, []);
  reactExports.useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
    }
  }, [items]);
  const value = reactExports.useMemo(() => ({
    items,
    add: (p) => setItems((cur) => {
      const ex = cur.find((i) => i.product.id === p.id);
      if (ex) return cur.map((i) => i.product.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...cur, { product: p, qty: 1 }];
    }),
    remove: (id) => setItems((cur) => cur.filter((i) => i.product.id !== id)),
    setQty: (id, qty) => setItems(
      (cur) => qty <= 0 ? cur.filter((i) => i.product.id !== id) : cur.map((i) => i.product.id === id ? { ...i, qty } : i)
    ),
    clear: () => setItems([]),
    count: items.reduce((n, i) => n + i.qty, 0),
    subtotal: items.reduce((s, i) => s + i.qty * i.product.price, 0)
  }), [items]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Ctx.Provider, { value, children });
}
function useCart() {
  const v = reactExports.useContext(Ctx);
  if (!v) throw new Error("useCart must be inside CartProvider");
  return v;
}
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$h = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lovable App" },
      { name: "description", content: "Lovable Generated Project" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Lovable App" },
      { property: "og:description", content: "Lovable Generated Project" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" }
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap"
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", suppressHydrationWarning: true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { suppressHydrationWarning: true, children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$h.useRouteContext();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AuthProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CartProvider, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { richColors: true, position: "top-right" })
  ] }) }) });
}
const $$splitComponentImporter$g = () => import("./vendors-CbJfcukU.mjs");
const Route$g = createFileRoute("/vendors")({
  component: lazyRouteComponent($$splitComponentImporter$g, "component")
});
const $$splitComponentImporter$f = () => import("./shop-DOmQhGRp.mjs");
const search = objectType({
  category: stringType().optional()
});
const Route$f = createFileRoute("/shop")({
  component: lazyRouteComponent($$splitComponentImporter$f, "component"),
  validateSearch: search,
  head: () => ({
    meta: [{
      title: "Shop fresh groceries & essentials — Randy's Commerce"
    }, {
      name: "description",
      content: "Browse perishable, frozen, pantry, and household goods from local vendors."
    }]
  })
});
const $$splitComponentImporter$e = () => import("./login-CektE46t.mjs");
const searchSchema$1 = objectType({
  redirect: stringType().optional()
});
const Route$e = createFileRoute("/login")({
  validateSearch: searchSchema$1,
  component: lazyRouteComponent($$splitComponentImporter$e, "component"),
  head: () => ({
    meta: [{
      title: "Sign in — Randy's Commerce"
    }]
  })
});
const $$splitComponentImporter$d = () => import("./delivery-DhO88isr.mjs");
const Route$d = createFileRoute("/delivery")({
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./dashboard-BXt-AbAK.mjs");
const Route$c = createFileRoute("/dashboard")({
  component: lazyRouteComponent($$splitComponentImporter$c, "component"),
  head: () => ({
    meta: [{
      title: "Dashboard — Randy's Commerce"
    }, {
      name: "description",
      content: "Manage your business on Randy's Commerce."
    }]
  })
});
const $$splitComponentImporter$b = () => import("./checkout-CToJziSC.mjs");
const Route$b = createFileRoute("/checkout")({
  component: lazyRouteComponent($$splitComponentImporter$b, "component"),
  head: () => ({
    meta: [{
      title: "Checkout — Randy's Commerce"
    }]
  })
});
const $$splitComponentImporter$a = () => import("./cart-B5teuXj8.mjs");
const Route$a = createFileRoute("/cart")({
  component: lazyRouteComponent($$splitComponentImporter$a, "component"),
  head: () => ({
    meta: [{
      title: "Your cart — Randy's Commerce"
    }]
  })
});
const $$splitComponentImporter$9 = () => import("./account-BUtkdkC8.mjs");
const Route$9 = createFileRoute("/account")({
  component: lazyRouteComponent($$splitComponentImporter$9, "component"),
  head: () => ({
    meta: [{
      title: "My account — Randy's Commerce"
    }]
  })
});
const $$splitComponentImporter$8 = () => import("./index-Bq1KamA_.mjs");
const Route$8 = createFileRoute("/")({
  component: lazyRouteComponent($$splitComponentImporter$8, "component"),
  head: () => ({
    meta: [{
      title: "Randy's Commerce — Fresh groceries & essentials, delivered"
    }, {
      name: "description",
      content: "One trusted marketplace for perishable, frozen, and everyday goods. Same-day delivery from local vendors you can trust."
    }, {
      property: "og:title",
      content: "Randy's Commerce — Fresh groceries & essentials, delivered"
    }, {
      property: "og:description",
      content: "Shop fresh produce, frozen, pantry, and household from trusted local vendors with same-day delivery."
    }]
  })
});
const $$splitComponentImporter$7 = () => import("./vendors.index-HJWDva5Z.mjs");
const Route$7 = createFileRoute("/vendors/")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component"),
  head: () => ({
    meta: [{
      title: "Sell with Randy's — Grow your business"
    }, {
      name: "description",
      content: "Join 500+ farmers, butchers and brands selling on Randy's Commerce. Simple onboarding, fair fees, real growth."
    }]
  })
});
const $$splitComponentImporter$6 = () => import("./delivery.index-xoOgpUyI.mjs");
const Route$6 = createFileRoute("/delivery/")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component"),
  head: () => ({
    meta: [{
      title: "Drive with Randy's — Flexible delivery work"
    }, {
      name: "description",
      content: "Earn on your schedule with Randy's Commerce. Smart routing, weekly payouts, supportive community."
    }]
  })
});
const $$splitComponentImporter$5 = () => import("./vendors.register-DAQoIBk6.mjs");
const Route$5 = createFileRoute("/vendors/register")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component"),
  head: () => ({
    meta: [{
      title: "Vendor registration — Randy's Commerce"
    }, {
      name: "description",
      content: "Apply to sell on Randy's Commerce. Tell us about your business and start reaching new customers."
    }]
  })
});
const $$splitComponentImporter$4 = () => import("./delivery.apply-CXaIFDxb.mjs");
const Route$4 = createFileRoute("/delivery/apply")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component"),
  head: () => ({
    meta: [{
      title: "Delivery agent application — Randy's Commerce"
    }, {
      name: "description",
      content: "Apply to deliver with Randy's Commerce. Flexible hours and weekly payouts."
    }]
  })
});
const $$splitComponentImporter$3 = () => import("./dashboard.vendor-DrA81F7V.mjs");
const Route$3 = createFileRoute("/dashboard/vendor")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./dashboard.login-kAncir39.mjs");
const searchSchema = objectType({
  redirect: stringType().optional()
});
const Route$2 = createFileRoute("/dashboard/login")({
  validateSearch: searchSchema,
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./dashboard.delivery-MuQz2kLd.mjs");
const Route$1 = createFileRoute("/dashboard/delivery")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./dashboard.admin-De1ROr07.mjs");
const Route = createFileRoute("/dashboard/admin")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const VendorsRoute = Route$g.update({
  id: "/vendors",
  path: "/vendors",
  getParentRoute: () => Route$h
});
const ShopRoute = Route$f.update({
  id: "/shop",
  path: "/shop",
  getParentRoute: () => Route$h
});
const LoginRoute = Route$e.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$h
});
const DeliveryRoute = Route$d.update({
  id: "/delivery",
  path: "/delivery",
  getParentRoute: () => Route$h
});
const DashboardRoute = Route$c.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => Route$h
});
const CheckoutRoute = Route$b.update({
  id: "/checkout",
  path: "/checkout",
  getParentRoute: () => Route$h
});
const CartRoute = Route$a.update({
  id: "/cart",
  path: "/cart",
  getParentRoute: () => Route$h
});
const AccountRoute = Route$9.update({
  id: "/account",
  path: "/account",
  getParentRoute: () => Route$h
});
const IndexRoute = Route$8.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$h
});
const VendorsIndexRoute = Route$7.update({
  id: "/",
  path: "/",
  getParentRoute: () => VendorsRoute
});
const DeliveryIndexRoute = Route$6.update({
  id: "/",
  path: "/",
  getParentRoute: () => DeliveryRoute
});
const VendorsRegisterRoute = Route$5.update({
  id: "/register",
  path: "/register",
  getParentRoute: () => VendorsRoute
});
const DeliveryApplyRoute = Route$4.update({
  id: "/apply",
  path: "/apply",
  getParentRoute: () => DeliveryRoute
});
const DashboardVendorRoute = Route$3.update({
  id: "/vendor",
  path: "/vendor",
  getParentRoute: () => DashboardRoute
});
const DashboardLoginRoute = Route$2.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => DashboardRoute
});
const DashboardDeliveryRoute = Route$1.update({
  id: "/delivery",
  path: "/delivery",
  getParentRoute: () => DashboardRoute
});
const DashboardAdminRoute = Route.update({
  id: "/admin",
  path: "/admin",
  getParentRoute: () => DashboardRoute
});
const DashboardRouteChildren = {
  DashboardAdminRoute,
  DashboardDeliveryRoute,
  DashboardLoginRoute,
  DashboardVendorRoute
};
const DashboardRouteWithChildren = DashboardRoute._addFileChildren(
  DashboardRouteChildren
);
const DeliveryRouteChildren = {
  DeliveryApplyRoute,
  DeliveryIndexRoute
};
const DeliveryRouteWithChildren = DeliveryRoute._addFileChildren(
  DeliveryRouteChildren
);
const VendorsRouteChildren = {
  VendorsRegisterRoute,
  VendorsIndexRoute
};
const VendorsRouteWithChildren = VendorsRoute._addFileChildren(VendorsRouteChildren);
const rootRouteChildren = {
  IndexRoute,
  AccountRoute,
  CartRoute,
  CheckoutRoute,
  DashboardRoute: DashboardRouteWithChildren,
  DeliveryRoute: DeliveryRouteWithChildren,
  LoginRoute,
  ShopRoute,
  VendorsRoute: VendorsRouteWithChildren
};
const routeTree = Route$h._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Route$f as R,
  Route$e as a,
  useCart as b,
  appHomePathForRole as c,
  dashboardPathForRole as d,
  Route$2 as e,
  safePostLoginRedirect as f,
  router as g,
  roleLabel as r,
  safeShopperPostLoginRedirect as s,
  useAuth as u
};
