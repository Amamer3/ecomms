import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { N as Navbar } from "./Navbar-CMGNV7sE.mjs";
import { F as Footer } from "./Footer-Cn6LS_IF.mjs";
import { p as products, c as categories, P as ProductCard } from "./products-BdahJgXQ.mjs";
import { R as Route$f } from "./router-Da0tdzn1.mjs";
import "../_libs/sonner.mjs";
import { S as Search } from "../_libs/lucide-react.mjs";
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
import "./router-pathname-B_nSBnfm.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "./sheet-QwDa3FUb.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "tslib";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/class-variance-authority.mjs";
import "./format-money-D3U6Lvgy.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/zod.mjs";
function Shop() {
  const {
    category
  } = Route$f.useSearch();
  const navigate = Route$f.useNavigate();
  const [q, setQ] = reactExports.useState("");
  const active = category ? category : "All";
  const filtered = products.filter((p) => {
    const cMatch = active === "All" || p.category === active;
    const qMatch = !q || p.name.toLowerCase().includes(q.toLowerCase()) || p.vendor.toLowerCase().includes(q.toLowerCase());
    return cMatch && qMatch;
  });
  const setCat = (c) => navigate({
    search: c ? {
      category: c
    } : {}
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Navbar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "border-b border-border/60 bg-[image:var(--gradient-hero)]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-4xl font-semibold sm:text-5xl", children: active === "All" ? "Everything in store" : active }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-muted-foreground", children: [
        filtered.length,
        " item",
        filtered.length === 1 ? "" : "s",
        " from trusted local vendors."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex max-w-xl items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 shadow-[var(--shadow-soft)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Search products or vendors…", className: "w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pill, { active: active === "All", onClick: () => setCat(void 0), label: "All" }),
        categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(Pill, { active: active === c.name, onClick: () => setCat(c.name), label: `${c.emoji} ${c.name}` }, c.name))
      ] }),
      filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-16 rounded-3xl border border-dashed border-border p-12 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-medium", children: "Nothing matched your search." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Try a different category or keyword." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/shop", className: "mt-4 inline-block text-sm font-medium text-primary hover:underline", children: "Reset filters" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4", children: filtered.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(ProductCard, { product: p }, p.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] });
}
function Pill({
  active,
  onClick,
  label
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick, className: `rounded-full border px-4 py-2 text-sm font-medium transition-all ${active ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-soft)]" : "border-border bg-card text-foreground/70 hover:border-primary/40 hover:text-foreground"}`, children: label });
}
export {
  Shop as component
};
