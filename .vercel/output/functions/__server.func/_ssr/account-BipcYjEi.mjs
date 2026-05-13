import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { g as getCustomerProfileOrders, C as CUSTOMER_TRACKER_DEMO_EMAIL } from "./delivery-tracking-B2j3fUjs.mjs";
import { f as formatGhs } from "./format-money-D3U6Lvgy.mjs";
import { F as Footer } from "./Footer-Cn6LS_IF.mjs";
import { N as Navbar } from "./Navbar-CMGNV7sE.mjs";
import { R as RequireCustomer } from "./RequireCustomer-DayQvIQe.mjs";
import { u as useAuth } from "./router-Da0tdzn1.mjs";
import "../_libs/sonner.mjs";
import { U as User, g as Package, b as Store, B as Bike, h as Truck, i as MapPin, j as Clock } from "../_libs/lucide-react.mjs";
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
function CustomerJourneyMap({
  delivery,
  showLiveRoute,
  className
}) {
  const mapRef = reactExports.useRef(null);
  const [resetCount, setResetCount] = reactExports.useState(0);
  const courier = reactExports.useMemo(
    () => toLatLng(delivery.courierPoint),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- track coordinates, not GeoPoint identity
    [delivery.courierPoint.lat, delivery.courierPoint.lng]
  );
  const pickup = reactExports.useMemo(
    () => toLatLng(delivery.pickupPoint),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- track coordinates, not GeoPoint identity
    [delivery.pickupPoint.lat, delivery.pickupPoint.lng]
  );
  const dropoff = reactExports.useMemo(
    () => toLatLng(delivery.dropoffPoint),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- track coordinates, not GeoPoint identity
    [delivery.dropoffPoint.lat, delivery.dropoffPoint.lng]
  );
  const boundsPoints = reactExports.useMemo(() => [courier, pickup, dropoff], [courier, pickup, dropoff]);
  const [roadRoute, setRoadRoute] = reactExports.useState(null);
  const routeFetchSig = reactExports.useRef("");
  const visibleRoute = reactExports.useMemo(() => {
    if (roadRoute?.length) return roadRoute;
    return [courier, pickup, dropoff];
  }, [courier, pickup, dropoff, roadRoute]);
  const visibleRouteKey = visibleRoute.map(([lat, lng]) => `${lat},${lng}`).join("|");
  reactExports.useEffect(() => {
    let cancelled = false;
    if (!showLiveRoute) {
      setRoadRoute(null);
      routeFetchSig.current = "";
      return;
    }
    const sig = `${delivery.id}-${delivery.pickupPoint.lat}-${delivery.pickupPoint.lng}-${delivery.dropoffPoint.lat}-${delivery.dropoffPoint.lng}`;
    if (routeFetchSig.current === sig) return;
    routeFetchSig.current = sig;
    const { courierPoint, pickupPoint, dropoffPoint } = delivery;
    const routeUrl = `https://router.project-osrm.org/route/v1/driving/${courierPoint.lng},${courierPoint.lat};${pickupPoint.lng},${pickupPoint.lat};${dropoffPoint.lng},${dropoffPoint.lat}?overview=full&geometries=geojson`;
    fetch(routeUrl).then((response) => response.json()).then((data) => {
      const coordinates = data.routes?.[0]?.geometry?.coordinates;
      if (!cancelled && coordinates?.length) {
        setRoadRoute(coordinates.map(([lng, lat]) => [lat, lng]));
      }
    }).catch(() => {
      if (!cancelled) {
        setRoadRoute([
          toLatLng(delivery.courierPoint),
          toLatLng(delivery.pickupPoint),
          toLatLng(delivery.dropoffPoint)
        ]);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [showLiveRoute, delivery]);
  reactExports.useEffect(() => {
    if (!mapRef.current) return;
    let cancelled = false;
    let map = null;
    Promise.all([import("../_libs/leaflet.mjs").then(function(n) {
      return n.l;
    }), Promise.resolve({})]).then(([L]) => {
      if (cancelled || !mapRef.current) return;
      map = L.map(mapRef.current, {
        center: courier,
        zoom: 13,
        scrollWheelZoom: true,
        zoomControl: true
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);
      L.control.scale({ position: "bottomleft" }).addTo(map);
      map.fitBounds(boundsPoints, { padding: [48, 48], maxZoom: 14 });
      if (showLiveRoute && visibleRoute.length > 1) {
        const pane = map.createPane("customer-route");
        pane.style.zIndex = "410";
        L.polyline(visibleRoute, {
          pane: "customer-route",
          color: "#ffffff",
          opacity: 0.65,
          weight: 6,
          lineCap: "round",
          lineJoin: "round"
        }).addTo(map);
        L.polyline(visibleRoute, {
          pane: "customer-route",
          color: "#0f766e",
          opacity: 0.85,
          weight: 3,
          lineCap: "round",
          lineJoin: "round"
        }).addTo(map);
      }
      const vendorIcon = L.divIcon({
        className: "",
        html: getPinHtml("Vendor", "bg-amber-500", "bg-white"),
        iconSize: [104, 54],
        iconAnchor: [52, 51]
      });
      const courierIcon = L.divIcon({
        className: "",
        html: getPinHtml("Courier", "bg-primary", "bg-primary-foreground"),
        iconSize: [104, 54],
        iconAnchor: [52, 51]
      });
      const youIcon = L.divIcon({
        className: "",
        html: getPinHtml("You", "bg-accent", "bg-accent-foreground"),
        iconSize: [104, 54],
        iconAnchor: [52, 51]
      });
      L.marker(pickup, { icon: vendorIcon }).bindPopup(`<strong>Vendor pickup</strong><br />${escapeHtml(delivery.pickup)}`).addTo(map);
      L.marker(courier, { icon: courierIcon }).bindPopup(
        `<strong>Courier</strong><br />${escapeHtml(delivery.courier.name)} · ${escapeHtml(delivery.courierLocation)}`
      ).addTo(map);
      L.marker(dropoff, { icon: youIcon }).bindPopup(`<strong>Your address</strong><br />${escapeHtml(delivery.dropoff)}`).addTo(map);
      window.setTimeout(() => map?.invalidateSize(), 0);
    });
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [
    boundsPoints,
    courier,
    delivery.courier.name,
    delivery.courierLocation,
    delivery.courierPoint.lat,
    delivery.courierPoint.lng,
    delivery.dropoff,
    delivery.pickup,
    dropoff,
    pickup,
    resetCount,
    showLiveRoute,
    visibleRoute,
    visibleRouteKey
  ]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative h-full min-h-[300px] w-full ${className ?? ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(LeafletStyleFix, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        ref: mapRef,
        className: "h-full min-h-[300px] w-full rounded-2xl border border-border/60"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: () => setResetCount((c) => c + 1),
        className: "absolute right-3 top-3 z-[1000] rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs font-semibold shadow-sm",
        children: "Reset view"
      }
    )
  ] });
}
function getPinHtml(label, pinClass, dotClass) {
  return `
    <div class="flex h-[54px] w-[104px] flex-col items-center">
      <div class="whitespace-nowrap rounded-full border border-border/60 bg-card px-1.5 py-0.5 text-[10px] font-semibold shadow-sm">${label}</div>
      <div class="relative mt-1 h-7 w-7">
        <div class="absolute inset-0 -rotate-45 rounded-[50%_50%_50%_0] ${pinClass} shadow-md ring-2 ring-background/80"></div>
        <div class="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ${dotClass}"></div>
      </div>
    </div>
  `;
}
function toLatLng(point) {
  return [point.lat, point.lng];
}
function escapeHtml(value) {
  return value.replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char
  );
}
function LeafletStyleFix() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        .leaflet-container { font: inherit; z-index: 0; }
        .leaflet-control-attribution { border-radius: 9999px 0 0 0; font-size: 10px; }
      ` });
}
function nudgePoint(p) {
  return {
    lat: p.lat + (Math.random() - 0.5) * 35e-5,
    lng: p.lng + (Math.random() - 0.5) * 35e-5
  };
}
function CustomerAccountPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(RequireCustomer, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CustomerAccountInner, {}) });
}
function CustomerAccountInner() {
  const {
    session
  } = useAuth();
  const email = session?.email ?? "";
  const name = session?.name ?? "";
  const {
    orders,
    isDemoSample
  } = reactExports.useMemo(() => getCustomerProfileOrders(email, name), [email, name]);
  const [liveCourierById, setLiveCourierById] = reactExports.useState({});
  reactExports.useEffect(() => {
    const tick = () => {
      setLiveCourierById((prev) => {
        const next = {
          ...prev
        };
        for (const o of orders) {
          if (o.status !== "accepted") continue;
          const base = next[o.id] ?? o.courierPoint;
          next[o.id] = nudgePoint(base);
        }
        return next;
      });
    };
    const id = window.setInterval(tick, 5e3);
    tick();
    return () => window.clearInterval(id);
  }, [orders]);
  const resolvedOrders = reactExports.useMemo(() => orders.map((o) => o.status === "accepted" && liveCourierById[o.id] ? {
    ...o,
    courierPoint: liveCourierById[o.id]
  } : o), [orders, liveCourierById]);
  const active = resolvedOrders.filter((o) => o.status === "available" || o.status === "accepted");
  const past = resolvedOrders.filter((o) => o.status === "delivered");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Navbar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-start justify-between gap-6 border-b border-border/60 pb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-primary", children: "Customer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-1 font-display text-3xl font-semibold", children: "Your profile & deliveries" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-xl text-sm text-muted-foreground", children: "Track every step after you pay: the vendor prepares your order, a courier is matched (by the vendor or automatically), then you follow live movement on the map to your door." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-card px-5 py-4 shadow-[var(--shadow-soft)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-6 w-6" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: name || "Customer" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: email || "No email on file" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/shop", className: "rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground", children: "Continue shopping" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/cart", className: "rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground", children: "Basket" })
          ] })
        ] })
      ] }),
      isDemoSample && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-6 rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-sm text-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-medium", children: "Demo tracking:" }),
        " showing sample orders so you can try the map. Sign in with",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "rounded bg-muted px-1.5 py-0.5 text-xs", children: CUSTOMER_TRACKER_DEMO_EMAIL }),
        " ",
        "to load the same three orders as “your” history."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl font-semibold", children: "How delivery works" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [{
          step: "1",
          title: "You pay",
          body: "Checkout confirms your basket; the vendor gets the order instantly.",
          icon: Package
        }, {
          step: "2",
          title: "Vendor prepares",
          body: "They pack at their location. They can assign a courier they trust.",
          icon: Store
        }, {
          step: "3",
          title: "Courier match",
          body: "If no courier is chosen, nearby couriers can accept within about one minute.",
          icon: Bike
        }, {
          step: "4",
          title: "Live to you",
          body: "Watch pickup → your address on the map with updates along the route.",
          icon: Truck
        }].map(({
          step,
          title,
          body,
          icon: Icon
        }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "rounded-2xl border border-border/60 bg-card p-4 shadow-[var(--shadow-soft)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-primary", children: step }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "mt-2 h-5 w-5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm font-semibold", children: title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: body })
        ] }, step)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl font-semibold", children: "Active deliveries" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Maps update on a short interval while a courier is en route (demo simulation)." }),
        active.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-6 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground", children: "No active deliveries. When you place an order, it will show here with vendor and courier on the map." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-6 space-y-10", children: active.map((order) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(OrderHeader, { order }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DeliveryTimeline, { order }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden rounded-3xl border border-border/60 bg-card shadow-[var(--shadow-card)]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border/60 px-4 py-3 sm:px-5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "Live map" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-foreground", children: [
                "Vendor pickup, courier position, and your drop-off",
                order.status === "accepted" ? "" : " (route activates once a courier accepts)",
                "."
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-[min(52vh,420px)] p-3 sm:p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CustomerJourneyMap, { delivery: order, showLiveRoute: order.status === "accepted" }) })
          ] })
        ] }, order.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-14", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl font-semibold", children: "Past orders" }),
        past.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-sm text-muted-foreground", children: "No completed deliveries yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-4 divide-y divide-border/60 rounded-2xl border border-border/60 bg-card", children: past.map((order) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: order.orderId }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              order.vendorName,
              " · ",
              order.dropoff
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground", children: "Delivered" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "w-full text-xs text-muted-foreground sm:w-auto", children: [
            "Courier ",
            order.courier.name,
            " · ",
            formatGhs(order.payout),
            " est. payout leg"
          ] })
        ] }, order.id)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] });
}
function OrderHeader({
  order
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium uppercase tracking-wide text-muted-foreground", children: order.orderId }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-semibold", children: order.vendorName }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "mr-1 inline h-3.5 w-3.5" }),
        order.customerArea,
        " → ",
        order.dropoff
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: order.status })
  ] });
}
function StatusBadge({
  status
}) {
  if (status === "accepted") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3.5 w-3.5" }),
      " Courier en route"
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-900 dark:text-amber-100", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Store, { className: "h-3.5 w-3.5" }),
    " Awaiting courier"
  ] });
}
function DeliveryTimeline({
  order
}) {
  const [poolSeconds, setPoolSeconds] = reactExports.useState(60);
  reactExports.useEffect(() => {
    if (order.status !== "available") return;
    const id = window.setInterval(() => {
      setPoolSeconds((s) => s > 0 ? s - 1 : 0);
    }, 1e3);
    return () => window.clearInterval(id);
  }, [order.status, order.id]);
  const steps = order.status === "available" ? [{
    key: "pay",
    label: "Order paid",
    done: true,
    current: false
  }, {
    key: "prep",
    label: "Vendor preparing",
    done: true,
    current: false
  }, {
    key: "pool",
    label: "Courier matching",
    done: false,
    current: true,
    detail: `Vendor may assign a courier; otherwise nearby couriers can accept within about one minute (demo countdown ${poolSeconds}s).`
  }, {
    key: "transit",
    label: "Live to your address",
    done: false,
    current: false
  }] : [{
    key: "pay",
    label: "Order paid",
    done: true,
    current: false
  }, {
    key: "prep",
    label: "Vendor preparing",
    done: true,
    current: false
  }, {
    key: "accept",
    label: "Courier accepted",
    done: true,
    current: false
  }, {
    key: "transit",
    label: "En route to you",
    done: false,
    current: true,
    detail: `ETA about ${order.etaMinutes} min · ${order.courier.name} (${order.courier.vehicle})`
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "relative space-y-0 border-l-2 border-border/80 pl-6", children: steps.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: `pb-6 last:pb-0 ${i === 0 ? "-mt-0.5" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `absolute -left-[9px] mt-1.5 h-4 w-4 rounded-full border-2 border-background ${s.done ? "bg-primary" : s.current ? "bg-amber-500" : "bg-muted"}` }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-sm font-semibold ${s.current ? "text-foreground" : "text-muted-foreground"}`, children: s.label }),
    s.detail && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: s.detail })
  ] }, s.key)) });
}
export {
  CustomerAccountPage as component
};
