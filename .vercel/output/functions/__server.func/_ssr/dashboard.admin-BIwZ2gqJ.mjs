import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { R as RequireDashboardRole, D as DashboardRoleShell, a as DeliveryTrackingMap } from "./RequireDashboardRole-BvatzLew.mjs";
import { c as getActiveDeliveries, d as deliveryTrackingSeed } from "./delivery-tracking-B2j3fUjs.mjs";
import { a as formatGhsCompact } from "./format-money-D3U6Lvgy.mjs";
import { L as LayoutDashboard, u as MapPinned, b as Store, B as Bike, J as Users, a as ShoppingBag, n as ShieldCheck, y as Phone, z as Star, K as Check, X } from "../_libs/lucide-react.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "./router-Da0tdzn1.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/zod.mjs";
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
import "./router-pathname-B_nSBnfm.mjs";
function AdminDashboard() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(RequireDashboardRole, { role: "admin", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AdminDashboardInner, {}) });
}
function AdminDashboardInner() {
  const [vendors, setVendors] = reactExports.useState([]);
  const [riders, setRiders] = reactExports.useState([]);
  const activeDeliveries = getActiveDeliveries(deliveryTrackingSeed);
  const [selectedDeliveryId, setSelectedDeliveryId] = reactExports.useState(activeDeliveries[0]?.id);
  const selectedDelivery = activeDeliveries.find((delivery) => delivery.id === selectedDeliveryId) ?? activeDeliveries[0];
  reactExports.useEffect(() => {
    setVendors(JSON.parse(localStorage.getItem("randys_vendors") || "[]"));
    setRiders(JSON.parse(localStorage.getItem("randys_riders") || "[]"));
  }, []);
  const updateVendor = (id, status) => {
    const next = vendors.map((v) => v.id === id ? {
      ...v,
      status
    } : v);
    setVendors(next);
    localStorage.setItem("randys_vendors", JSON.stringify(next));
    toast.success(`Vendor ${status}`);
  };
  const updateRider = (id, status) => {
    const next = riders.map((r) => r.id === id ? {
      ...r,
      status
    } : r);
    setRiders(next);
    localStorage.setItem("randys_riders", JSON.stringify(next));
    toast.success(`Rider ${status}`);
  };
  const pendingV = vendors.filter((v) => v.status === "pending").length;
  const pendingR = riders.filter((r) => r.status === "pending").length;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardRoleShell, { workspacePath: "/dashboard/admin", workspaceTitle: "Admin", navItems: [{
    sectionId: "overview",
    label: "Overview",
    icon: LayoutDashboard
  }, {
    sectionId: "live-ops",
    label: "Live operations",
    icon: MapPinned
  }, {
    sectionId: "vendors",
    label: "Vendor applications",
    icon: Store
  }, {
    sectionId: "couriers",
    label: "Courier applications",
    icon: Bike
  }], children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "overview", className: "scroll-mt-28", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Store, label: "Vendors", value: String(vendors.length), sub: `${pendingV} pending` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Bike, label: "Couriers", value: String(riders.length), sub: `${pendingR} pending` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Users, label: "Customers", value: "2,184", sub: "+38 today" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: ShoppingBag, label: "GMV (30d)", value: formatGhsCompact(48200), sub: "+12% MoM" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "live-ops", className: "scroll-mt-28", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden rounded-3xl border border-border/60 bg-card shadow-[var(--shadow-soft)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4 border-b border-border/60 p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPinned, { className: "h-5 w-5 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Live delivery operations" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Admin view of all active courier deliveries across vendors." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary", children: [
          activeDeliveries.length,
          " active deliveries"
        ] })
      ] }),
      selectedDelivery ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-5 p-5 xl:grid-cols-[1.5fr_0.9fr]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative min-h-[380px] overflow-hidden rounded-3xl border border-border/60 bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DeliveryTrackingMap, { delivery: selectedDelivery, showDirections: true }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid content-start gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-muted/30 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium uppercase tracking-wide text-muted-foreground", children: "Selected delivery" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-lg font-semibold", children: [
              selectedDelivery.id,
              " · ",
              selectedDelivery.orderId
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
              selectedDelivery.vendorName,
              " to ",
              selectedDelivery.customerArea
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid gap-2 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Customer:" }),
                " ",
                selectedDelivery.customerName
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Route:" }),
                " ",
                selectedDelivery.courierLocation,
                " → ",
                selectedDelivery.dropoff
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "ETA:" }),
                " ",
                selectedDelivery.etaMinutes,
                " min · ",
                selectedDelivery.distanceKm.toFixed(1),
                " km"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-primary/5 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-primary", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: "Courier identity" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 grid gap-2 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: selectedDelivery.courier.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5 text-muted-foreground" }),
                " ",
                selectedDelivery.courier.phone
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                selectedDelivery.courier.vehicle,
                " · ",
                selectedDelivery.courier.plateNumber
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3.5 w-3.5 fill-primary text-primary" }),
                " ",
                selectedDelivery.courier.rating.toFixed(1),
                " rating"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid max-h-[260px] gap-2 overflow-y-auto pr-1", children: activeDeliveries.map((delivery) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setSelectedDeliveryId(delivery.id), className: `rounded-2xl border p-4 text-left transition-colors ${selectedDelivery.id === delivery.id ? "border-primary bg-primary/5" : "border-border/60 hover:bg-muted/30"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: delivery.vendorName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary", children: "Active" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
              delivery.orderId,
              " · ",
              delivery.customerArea
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm", children: [
              delivery.courier.name,
              " → ",
              delivery.dropoff
            ] })
          ] }, delivery.id)) })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "p-8 text-center text-sm text-muted-foreground", children: "No active deliveries right now." })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "vendors", className: "scroll-mt-28", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Vendor applications", empty: "No vendor applications yet.", children: vendors.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-left text-xs uppercase tracking-wide text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-3", children: "Business" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-3", children: "Owner" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-3", children: "City" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-3", children: "Category" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-3", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-3" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: vendors.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border/60", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3 font-medium", children: v.businessName }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3", children: v.ownerName }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3", children: v.city }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3 text-muted-foreground", children: v.category }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { status: v.status }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Actions, { onApprove: () => updateVendor(v.id, "approved"), onReject: () => updateVendor(v.id, "rejected") }) })
      ] }, v.id)) })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "couriers", className: "scroll-mt-28", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Courier applications", empty: "No courier applications yet.", children: riders.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-left text-xs uppercase tracking-wide text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-3", children: "Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-3", children: "City" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-3", children: "Vehicle" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-3", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-3" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: riders.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border/60", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3 font-medium", children: r.fullName }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3", children: r.city }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3", children: r.vehicle }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { status: r.status }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Actions, { onApprove: () => updateRider(r.id, "approved"), onReject: () => updateRider(r.id, "rejected") }) })
      ] }, r.id)) })
    ] }) }) })
  ] }) });
}
function Section({
  title,
  children,
  empty
}) {
  const isEmpty = !children || Array.isArray(children) && children.length === 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden rounded-3xl border border-border/60 bg-card shadow-[var(--shadow-soft)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b border-border/60 p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: title }) }),
    isEmpty ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "p-8 text-center text-sm text-muted-foreground", children: empty }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children })
  ] });
}
function Actions({
  onApprove,
  onReject
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onApprove, className: "inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5" }),
      " Approve"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onReject, className: "inline-flex items-center gap-1 rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" }),
      " Reject"
    ] })
  ] });
}
function StatusPill({
  status
}) {
  const map = {
    pending: "bg-accent/15 text-accent-foreground",
    approved: "bg-primary/10 text-primary",
    rejected: "bg-destructive/10 text-destructive"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${map[status] || "bg-muted"}`, children: status });
}
function Stat({
  icon: Icon,
  label,
  value,
  sub
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium uppercase tracking-wide text-muted-foreground", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-2xl font-semibold", children: value }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: sub })
  ] });
}
export {
  AdminDashboard as component
};
