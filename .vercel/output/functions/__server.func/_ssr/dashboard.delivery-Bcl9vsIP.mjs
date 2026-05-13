import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { R as RequireDashboardRole, D as DashboardRoleShell, a as DeliveryTrackingMap } from "./RequireDashboardRole-BvatzLew.mjs";
import { D as Dialog, b as DialogContent, c as DialogHeader, d as DialogTitle, f as DialogDescription } from "./dialog-xwQogGr8.mjs";
import { N as NEARBY_DELIVERY_KM, d as deliveryTrackingSeed, b as getDistanceKm } from "./delivery-tracking-B2j3fUjs.mjs";
import { f as formatGhs } from "./format-money-D3U6Lvgy.mjs";
import { L as LayoutDashboard, u as MapPinned, B as Bike, F as Power, W as Wallet, j as Clock, C as CircleCheck, i as MapPin, N as Navigation, G as Maximize2 } from "../_libs/lucide-react.mjs";
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
const seed = deliveryTrackingSeed.map((delivery) => ({
  ...delivery,
  status: delivery.status === "delivered" ? "delivered" : "available"
}));
function DeliveryDashboard() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(RequireDashboardRole, { role: "delivery", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DeliveryDashboardInner, {}) });
}
function DeliveryDashboardInner() {
  const [online, setOnline] = reactExports.useState(true);
  const [runs, setRuns] = reactExports.useState(seed);
  const [selectedRunId, setSelectedRunId] = reactExports.useState(seed[0]?.id);
  reactExports.useEffect(() => {
    if (runs.some((run) => run.pickup.includes("Lekki") || run.dropoff.includes("Victoria Island"))) {
      setRuns(seed);
      setSelectedRunId(seed[0]?.id);
    }
  }, [runs]);
  const acceptedRuns = runs.filter((r) => r.status === "accepted");
  const canStackDelivery = (candidate) => acceptedRuns.length === 0 || acceptedRuns.some((activeRun) => getDistanceKm(candidate.dropoffPoint, activeRun.dropoffPoint) <= NEARBY_DELIVERY_KM);
  const update = (id, status) => {
    setRuns((rs) => rs.map((r) => r.id === id ? {
      ...r,
      status
    } : r));
    toast.success(`Run ${id} → ${status}`);
  };
  const acceptRun = (id) => {
    if (!online) {
      toast.error("Go online before accepting a delivery");
      return;
    }
    const run = runs.find((r) => r.id === id);
    if (!run) return;
    if (!canStackDelivery(run)) {
      toast.error(`Finish your active delivery first, or choose one within ${NEARBY_DELIVERY_KM} km of its drop-off.`);
      return;
    }
    setSelectedRunId(id);
    update(id, "accepted");
  };
  const earnings = runs.filter((r) => r.status === "delivered").reduce((s, r) => s + r.payout, 0);
  const active = acceptedRuns.length;
  const completed = runs.filter((r) => r.status === "delivered").length;
  const selectedRun = runs.find((r) => r.id === selectedRunId) ?? runs[0];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardRoleShell, { workspacePath: "/dashboard/delivery", workspaceTitle: "Courier", navItems: [{
    sectionId: "overview",
    label: "Overview",
    icon: LayoutDashboard
  }, {
    sectionId: "map",
    label: "Delivery map",
    icon: MapPinned
  }, {
    sectionId: "runs",
    label: "Runs",
    icon: Bike
  }], children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { id: "overview", className: "scroll-mt-28 space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-wide text-muted-foreground", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-lg font-semibold", children: online ? "You're online" : "You're offline" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
          setOnline(!online);
          toast.success(online ? "You're now offline" : "You're now online");
        }, className: `inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold ${online ? "bg-primary text-primary-foreground" : "border border-border bg-background"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Power, { className: "h-4 w-4" }),
          " ",
          online ? "Go offline" : "Go online"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Wallet, label: "Today's earnings", value: formatGhs(earnings) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Clock, label: "Active runs", value: String(active) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: CircleCheck, label: "Completed", value: String(completed) })
      ] })
    ] }),
    selectedRun && /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "map", className: "scroll-mt-28", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DeliveryMap, { run: selectedRun, online }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "runs", className: "scroll-mt-28", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-border/60 bg-card shadow-[var(--shadow-soft)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border/60 p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Available & active runs" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Accept a run, then mark as delivered when complete." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border/60", children: runs.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "button", tabIndex: 0, onClick: () => setSelectedRunId(r.id), onKeyDown: (event) => {
        if (event.key === "Enter" || event.key === " ") setSelectedRunId(r.id);
      }, className: `flex w-full flex-wrap items-center justify-between gap-3 p-5 text-left transition-colors hover:bg-muted/30 ${selectedRunId === r.id ? "bg-primary/5" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: r.id }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 flex items-center gap-1.5 text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3.5 w-3.5" }),
            " ",
            r.pickup,
            " → ",
            r.dropoff
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
            r.distanceKm.toFixed(1),
            " km · about ",
            r.etaMinutes,
            " min"
          ] }),
          r.status === "available" && acceptedRuns.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `mt-1 text-xs font-medium ${canStackDelivery(r) ? "text-primary" : "text-destructive"}`, children: canStackDelivery(r) ? "Close enough to add to this run" : `Too far from your active drop-off (${NEARBY_DELIVERY_KM} km limit)` })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold", children: formatGhs(r.payout) }),
          r.status === "available" && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: (event) => {
            event.stopPropagation();
            acceptRun(r.id);
          }, disabled: !online || !canStackDelivery(r), title: !canStackDelivery(r) ? `Only deliveries within ${NEARBY_DELIVERY_KM} km of your active drop-off can be accepted.` : void 0, className: "rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground", children: "Accept" }),
          r.status === "accepted" && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: (event) => {
            event.stopPropagation();
            update(r.id, "delivered");
          }, className: "rounded-full px-4 py-2 text-xs font-semibold text-primary-foreground", style: {
            backgroundImage: "var(--gradient-warm)"
          }, children: "Mark delivered" }),
          r.status === "delivered" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary", children: "Delivered" })
        ] })
      ] }, r.id)) })
    ] }) })
  ] }) });
}
function DeliveryMap({
  run,
  online
}) {
  const [fullMapOpen, setFullMapOpen] = reactExports.useState(false);
  const statusCopy = {
    available: "Available for pickup",
    accepted: "Active delivery",
    delivered: "Delivered"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden rounded-3xl border border-border/60 bg-card shadow-[var(--shadow-soft)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4 border-b border-border/60 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MapPinned, { className: "h-5 w-5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Delivery map" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
          "Showing ",
          run.id,
          ": ",
          run.pickup,
          " to ",
          run.dropoff
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-3 py-1 text-xs font-semibold ${online ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`, children: online ? "Live routing" : "Offline preview" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-5 p-5 lg:grid-cols-[1.5fr_0.8fr]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-h-[320px] overflow-hidden rounded-3xl border border-border/60 bg-muted", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DeliveryTrackingMap, { delivery: run }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-4 left-4 right-4 rounded-2xl border border-border/60 bg-card/90 p-4 shadow-sm backdrop-blur", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium uppercase tracking-wide text-muted-foreground", children: statusCopy[run.status] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm font-semibold", children: [
              run.courierLocation,
              " → ",
              run.dropoff
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm font-semibold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, { className: "h-4 w-4 text-primary" }),
            run.distanceKm.toFixed(1),
            " km"
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid content-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setFullMapOpen(true), className: "inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground", children: [
          "View in full ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Maximize2, { className: "h-4 w-4" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(RouteStop, { label: "Courier is here", value: run.courierLocation }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(RouteStop, { label: "Pickup", value: run.pickup }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(RouteStop, { label: "Going to deliver at", value: run.dropoff }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-muted/30 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium uppercase tracking-wide text-muted-foreground", children: "Estimated time" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-2xl font-semibold", children: [
            run.etaMinutes,
            " min"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-muted/30 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium uppercase tracking-wide text-muted-foreground", children: "Payout" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-2xl font-semibold", children: formatGhs(run.payout) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: fullMapOpen, onOpenChange: setFullMapOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-6xl overflow-hidden p-0 sm:rounded-3xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { className: "p-5 pb-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Full delivery map" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          run.id,
          ": ",
          run.pickup,
          " to ",
          run.dropoff
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative h-[70vh] min-h-[420px] overflow-hidden rounded-3xl border border-border/60 bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DeliveryTrackingMap, { delivery: run }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RouteStop, { label: "Courier is here", value: run.courierLocation }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(RouteStop, { label: "Pickup", value: run.pickup }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(RouteStop, { label: "Going to deliver at", value: run.dropoff })
        ] })
      ] })
    ] }) })
  ] });
}
function RouteStop({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium uppercase tracking-wide text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm font-semibold", children: value })
  ] });
}
function Stat({
  icon: Icon,
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium uppercase tracking-wide text-muted-foreground", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-8 w-8 place-items-center rounded-lg bg-accent/15 text-accent-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-2xl font-semibold", children: value })
  ] });
}
export {
  DeliveryDashboard as component
};
