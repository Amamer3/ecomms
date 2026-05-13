import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { N as Navbar } from "./Navbar-CMGNV7sE.mjs";
import { F as Footer } from "./Footer-Cn6LS_IF.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { r as ArrowLeft, b as Store } from "../_libs/lucide-react.mjs";
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
import "./router-Da0tdzn1.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
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
const schema = objectType({
  businessName: stringType().trim().min(2, "Business name is required").max(100),
  ownerName: stringType().trim().min(2, "Owner name is required").max(100),
  email: stringType().trim().email("Enter a valid email").max(255),
  phone: stringType().trim().min(6, "Phone is required").max(30),
  category: stringType().min(1, "Pick a category"),
  city: stringType().trim().min(2, "City is required").max(100),
  description: stringType().trim().min(10, "Tell us a bit more").max(500)
});
function VendorRegister() {
  const navigate = useNavigate();
  const [form, setForm] = reactExports.useState({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    category: "",
    city: "",
    description: ""
  });
  const [errors, setErrors] = reactExports.useState({});
  const [submitting, setSubmitting] = reactExports.useState(false);
  const update = (k, v) => setForm((p) => ({
    ...p,
    [k]: v
  }));
  const onSubmit = (e) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs = {};
      parsed.error.issues.forEach((i) => {
        errs[i.path[0]] = i.message;
      });
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const existing = JSON.parse(localStorage.getItem("randys_vendors") || "[]");
      existing.push({
        ...parsed.data,
        id: crypto.randomUUID(),
        status: "pending",
        createdAt: Date.now()
      });
      localStorage.setItem("randys_vendors", JSON.stringify(existing));
      localStorage.setItem("randys_active_vendor", parsed.data.businessName);
      toast.success("Application received!", {
        description: "Welcome aboard. Redirecting to your dashboard…"
      });
      setTimeout(() => navigate({
        to: "/dashboard/vendor"
      }), 800);
    } catch {
      toast.error("Something went wrong. Try again.");
      setSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Navbar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/vendors", className: "inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
        " Back"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Store, { className: "h-3.5 w-3.5" }),
          " Vendor application"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-4 font-display text-4xl font-semibold sm:text-5xl", children: "Tell us about your business" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-muted-foreground", children: "A few quick details and you're on your way to selling on Randy's." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit, className: "mt-10 grid gap-5 rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Business name", error: errors.businessName, children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: inputCls, value: form.businessName, onChange: (e) => update("businessName", e.target.value), placeholder: "Akwa Farms" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-5 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Owner name", error: errors.ownerName, children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: inputCls, value: form.ownerName, onChange: (e) => update("ownerName", e.target.value), placeholder: "Jane Doe" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "City", error: errors.city, children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: inputCls, value: form.city, onChange: (e) => update("city", e.target.value), placeholder: "Lagos" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-5 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Email", error: errors.email, children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "email", className: inputCls, value: form.email, onChange: (e) => update("email", e.target.value), placeholder: "you@business.com" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Phone", error: errors.phone, children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: inputCls, value: form.phone, onChange: (e) => update("phone", e.target.value), placeholder: "+234…" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Primary category", error: errors.category, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: inputCls, value: form.category, onChange: (e) => update("category", e.target.value), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select…" }),
          ["Fresh Produce", "Meat & Seafood", "Dairy & Eggs", "Bakery", "Pantry", "Frozen", "Beverages", "Household"].map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c, children: c }, c))
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "About your business", error: errors.description, children: /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { rows: 4, className: inputCls, value: form.description, onChange: (e) => update("description", e.target.value), placeholder: "What you sell, where you source from, what makes you different…" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-3 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/vendors", className: "rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold", children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: submitting, className: "rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] disabled:opacity-60", children: submitting ? "Submitting…" : "Submit application" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] });
}
const inputCls = "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20";
function Field({
  label,
  error,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-1.5 block text-sm font-medium text-foreground/80", children: label }),
    children,
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1 block text-xs text-destructive", children: error })
  ] });
}
export {
  VendorRegister as component
};
