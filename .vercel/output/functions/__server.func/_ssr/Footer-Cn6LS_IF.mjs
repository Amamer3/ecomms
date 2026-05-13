import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { s as Sprout } from "../_libs/lucide-react.mjs";
function Footer() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "mt-24 border-t border-border/60 bg-secondary/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-10 md:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-9 w-9 place-items-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sprout, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-xl font-semibold", children: "Randy's" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 max-w-xs text-sm text-muted-foreground", children: "Everything for your kitchen and home — delivered fresh, fast, and fairly priced." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FooterCol, { title: "Shop", links: [["/shop", "All categories"], ["/shop", "Fresh produce"], ["/shop", "Frozen"], ["/shop", "Pantry"]] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FooterCol, { title: "Partners", links: [["/vendors", "Become a vendor"], ["/delivery", "Drive with us"], ["/", "Wholesale"]] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FooterCol, { title: "Company", links: [["/", "About"], ["/", "Press"], ["/", "Contact"]] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        "© ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " Randy's Commerce. All rights reserved."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Built for fresh living." })
    ] })
  ] }) });
}
function FooterCol({ title, links }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold text-foreground", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-4 space-y-2", children: links.map(([to, label], i) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to, className: "text-sm text-muted-foreground transition-colors hover:text-primary", children: label }) }, i)) })
  ] });
}
export {
  Footer as F
};
