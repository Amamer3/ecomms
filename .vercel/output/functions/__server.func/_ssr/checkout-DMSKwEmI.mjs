import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { N as Navbar } from "./Navbar-CMGNV7sE.mjs";
import { R as RequireCustomer } from "./RequireCustomer-DayQvIQe.mjs";
import { F as Footer } from "./Footer-Cn6LS_IF.mjs";
import { b as useCart } from "./router-Da0tdzn1.mjs";
import { f as formatGhs } from "./format-money-D3U6Lvgy.mjs";
import "../_libs/sonner.mjs";
import { C as CircleCheck, f as Lock } from "../_libs/lucide-react.mjs";
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
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/zod.mjs";
const DELIVERY = 3.5;
function CheckoutPage() {
  const {
    items,
    subtotal,
    clear
  } = useCart();
  const navigate = useNavigate();
  const [done, setDone] = reactExports.useState(false);
  const total = subtotal + (items.length ? DELIVERY : 0);
  const submit = (e) => {
    e.preventDefault();
    setDone(true);
    setTimeout(() => clear(), 600);
  };
  if (done) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(RequireCustomer, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Navbar, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto grid max-w-2xl place-items-center px-4 py-24 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-8 w-8" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-6 font-display text-4xl font-semibold", children: "Order placed!" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 max-w-md text-muted-foreground", children: "Thanks for shopping with Randy's. Your order is being prepared and will arrive in about 45 minutes." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/shop", className: "rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold", children: "Keep shopping" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate({
            to: "/"
          }), className: "rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground", children: "Back to home" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(RequireCustomer, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Navbar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-4xl font-semibold", children: "Checkout" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-muted-foreground", children: "Almost there — just a few details." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "mt-10 grid gap-8 lg:grid-cols-[1fr_360px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Delivery details", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Full name", required: true, placeholder: "Jane Doe" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Phone", required: true, placeholder: "+233 ..." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Address", required: true, placeholder: "123 Independence Ave", full: true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "City", required: true, placeholder: "Accra" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Notes (optional)", placeholder: "Gate code, leave at door…", full: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Payment", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Card number", required: true, placeholder: "4242 4242 4242 4242", full: true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Expiry", required: true, placeholder: "MM / YY" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "CVC", required: true, placeholder: "123" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "col-span-full inline-flex items-center gap-2 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-3.5 w-3.5" }),
              " Demo checkout — no real charges."
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "h-fit rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)] lg:sticky lg:top-24", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl font-semibold", children: "Order" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "mt-4 max-h-72 space-y-3 overflow-auto pr-1 text-sm", children: [
            items.map(({
              product,
              qty
            }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl", children: product.emoji }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block font-medium", children: product.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                    "× ",
                    qty
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: formatGhs(product.price * qty) })
            ] }, product.id)),
            items.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Your basket is empty." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "mt-5 space-y-2 border-t border-border pt-4 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Subtotal" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: formatGhs(subtotal) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-muted-foreground", children: "Delivery" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: formatGhs(DELIVERY) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-t border-border pt-2 text-base font-semibold", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { children: "Total" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: formatGhs(total) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: items.length === 0, className: "mt-6 w-full rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.01] disabled:opacity-50", children: "Place order" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] }) });
}
function Section({
  title,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-soft)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl font-semibold", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2", children })
  ] });
}
function Field({
  label,
  full,
  ...rest
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: `flex flex-col gap-1.5 ${full ? "sm:col-span-2" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-foreground/80", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ...rest, className: "rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20" })
  ] });
}
export {
  CheckoutPage as component
};
