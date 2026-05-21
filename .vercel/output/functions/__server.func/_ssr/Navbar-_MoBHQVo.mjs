import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useRouterState, L as Link } from "../_libs/tanstack__react-router.mjs";
import { b as useCart, u as useAuth, c as appHomePathForRole } from "./router-DPkHdSCT.mjs";
import { s as selectPathname } from "./router-pathname-B_nSBnfm.mjs";
import { c as cn } from "./utils-H80jjgLf.mjs";
import { S as Sheet, a as SheetTrigger, b as SheetContent, c as SheetHeader, d as SheetTitle, e as SheetClose } from "./sheet-QwDa3FUb.mjs";
import { r as Sprout, e as LogOut, d as LogIn, s as Menu, a as ShoppingBag } from "../_libs/lucide-react.mjs";
const NAV_ITEMS_BASE = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/vendors", label: "Sell with us" },
  { to: "/delivery", label: "Deliver" },
  { to: "/dashboard", label: "Dashboard", hideForCustomer: true }
];
const NAV_ITEMS_CUSTOMER = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/account", label: "My delivery" },
  { to: "/vendors", label: "Sell with us" },
  { to: "/delivery", label: "Deliver" }
];
function navLinkActive(path, to) {
  if (to === "/dashboard") return path === "/dashboard" || path.startsWith("/dashboard/");
  if (to === "/account") return path === "/account" || path.startsWith("/account/");
  return path === to;
}
function Navbar() {
  const { count } = useCart();
  const { session, ready, logout } = useAuth();
  const path = useRouterState({ select: selectPathname });
  const navItems = session?.role === "customer" ? NAV_ITEMS_CUSTOMER : NAV_ITEMS_BASE;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "flex shrink-0 items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-9 w-9 place-items-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-soft)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sprout, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-display text-xl font-semibold tracking-tight", children: [
        "Randy's",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: "." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "hidden flex-1 items-center justify-center gap-8 md:flex", "aria-label": "Main", children: navItems.map(({ to, label }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to,
        className: cn(
          "text-sm font-medium transition-colors hover:text-primary",
          navLinkActive(path, to) ? "text-primary" : "text-foreground/70"
        ),
        children: label
      },
      to
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto flex shrink-0 items-center gap-2", children: [
      !ready ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "span",
        {
          className: "hidden h-9 w-20 animate-pulse rounded-full bg-muted/60 md:inline-block",
          "aria-hidden": true
        }
      ) : session ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden items-center gap-2 md:flex", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: session.role === "customer" ? "/account" : appHomePathForRole(session.role),
            className: "max-w-[140px] truncate rounded-full border border-border/60 bg-card px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/40",
            title: session.name,
            children: session.name
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => logout(),
            className: "inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-3.5 w-3.5" }),
              " Out"
            ]
          }
        )
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/login",
          className: "hidden items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2 text-sm font-medium text-foreground shadow-[var(--shadow-soft)] transition-colors hover:border-primary/40 md:inline-flex",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LogIn, { className: "h-4 w-4" }),
            " Log in"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Sheet, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            className: "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-card text-foreground shadow-[var(--shadow-soft)] transition-colors hover:bg-secondary md:hidden",
            "aria-label": "Open navigation menu",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, { className: "h-5 w-5" })
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetContent, { side: "left", className: "flex w-[min(100vw-2rem,20rem)] flex-col gap-0 p-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SheetHeader, { className: "border-b border-border/60 p-6 pb-4 text-left", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTitle, { className: "font-display text-xl", children: "Menu" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "flex flex-1 flex-col gap-1 p-4", "aria-label": "Main", children: [
            navItems.map(({ to, label }) => /* @__PURE__ */ jsxRuntimeExports.jsx(SheetClose, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Link,
              {
                to,
                className: cn(
                  "rounded-xl px-4 py-3 text-base font-medium transition-colors hover:bg-secondary/80",
                  navLinkActive(path, to) ? "bg-primary/10 text-primary" : "text-foreground/80"
                ),
                children: label
              }
            ) }, to)),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-auto border-t border-border/60 pt-4", children: !ready ? null : session ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SheetClose, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Link,
                {
                  to: session.role === "customer" ? "/account" : appHomePathForRole(session.role),
                  className: "mb-2 block rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary/80",
                  children: session.role === "customer" ? `${session.name} — deliveries` : `${session.name} — dashboard`
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SheetClose, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => logout(),
                  className: "w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
                  children: "Log out"
                }
              ) })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(SheetClose, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Link,
              {
                to: "/login",
                className: "block rounded-xl px-4 py-3 text-sm font-medium text-primary hover:bg-primary/10",
                children: "Log in"
              }
            ) }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/cart",
          className: "relative inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-[var(--shadow-soft)] transition-all hover:shadow-[var(--shadow-glow)]",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Cart" }),
            count > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground", children: count })
          ]
        }
      )
    ] })
  ] }) });
}
export {
  Navbar as N
};
