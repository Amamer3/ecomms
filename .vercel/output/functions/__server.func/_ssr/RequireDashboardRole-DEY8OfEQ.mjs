import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, e as useRouterState, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useAuth, d as dashboardPathForRole } from "./router-DPkHdSCT.mjs";
import { c as cn } from "./utils-H80jjgLf.mjs";
import { e as SheetClose, S as Sheet, a as SheetTrigger, b as SheetContent, c as SheetHeader, d as SheetTitle } from "./sheet-QwDa3FUb.mjs";
import { s as selectPathname } from "./router-pathname-B_nSBnfm.mjs";
import { r as Sprout, a as ShoppingBag, s as Menu, e as LogOut } from "../_libs/lucide-react.mjs";
function DeliveryTrackingMap({ delivery, showDirections = delivery.status === "accepted", className }) {
  const mapRef = reactExports.useRef(null);
  const [resetCount, setResetCount] = reactExports.useState(0);
  const courierPosition = reactExports.useMemo(() => toLatLng(delivery.courierPoint), [delivery.courierPoint.lat, delivery.courierPoint.lng]);
  const deliveryPosition = reactExports.useMemo(() => toLatLng(delivery.dropoffPoint), [delivery.dropoffPoint.lat, delivery.dropoffPoint.lng]);
  const [roadRoute, setRoadRoute] = reactExports.useState(null);
  const visibleRoute = reactExports.useMemo(
    () => roadRoute?.length ? roadRoute : [courierPosition, deliveryPosition],
    [courierPosition, deliveryPosition, roadRoute]
  );
  const visibleRouteKey = visibleRoute.map(([lat, lng]) => `${lat},${lng}`).join("|");
  reactExports.useEffect(() => {
    let cancelled = false;
    if (!showDirections) {
      setRoadRoute(null);
      return;
    }
    const routeUrl = `https://router.project-osrm.org/route/v1/driving/${delivery.courierPoint.lng},${delivery.courierPoint.lat};${delivery.dropoffPoint.lng},${delivery.dropoffPoint.lat}?overview=full&geometries=geojson`;
    fetch(routeUrl).then((response) => response.json()).then((data) => {
      const coordinates = data.routes?.[0]?.geometry?.coordinates;
      if (!cancelled && coordinates?.length) {
        setRoadRoute(coordinates.map(([lng, lat]) => [lat, lng]));
      }
    }).catch(() => {
      if (!cancelled) setRoadRoute([toLatLng(delivery.courierPoint), toLatLng(delivery.dropoffPoint)]);
    });
    return () => {
      cancelled = true;
    };
  }, [delivery.courierPoint.lat, delivery.courierPoint.lng, delivery.dropoffPoint.lat, delivery.dropoffPoint.lng, showDirections]);
  reactExports.useEffect(() => {
    if (!mapRef.current) return;
    let cancelled = false;
    let map = null;
    Promise.all([
      import("../_libs/leaflet.mjs").then(function(n) {
        return n.l;
      }),
      Promise.resolve({})
    ]).then(([L]) => {
      if (cancelled || !mapRef.current) return;
      map = L.map(mapRef.current, {
        center: courierPosition,
        zoom: 13,
        scrollWheelZoom: true,
        zoomControl: true
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);
      L.control.scale({ position: "bottomleft" }).addTo(map);
      map.fitBounds(visibleRoute, { padding: [56, 56], maxZoom: 14 });
      if (showDirections) {
        const pane = map.createPane("delivery-route");
        pane.style.zIndex = "410";
        L.polyline(visibleRoute, {
          pane: "delivery-route",
          color: "#ffffff",
          opacity: 0.7,
          weight: 6,
          lineCap: "round",
          lineJoin: "round"
        }).addTo(map);
        L.polyline(visibleRoute, {
          pane: "delivery-route",
          color: "#111827",
          opacity: 0.75,
          weight: 3,
          lineCap: "round",
          lineJoin: "round"
        }).addTo(map);
      }
      const courierIcon = L.divIcon({
        className: "",
        html: getPinHtml("Courier", "bg-primary", "bg-primary-foreground"),
        iconSize: [104, 54],
        iconAnchor: [52, 51]
      });
      const deliveryIcon = L.divIcon({
        className: "",
        html: getPinHtml("Delivery", "bg-accent", "bg-accent-foreground"),
        iconSize: [104, 54],
        iconAnchor: [52, 51]
      });
      L.marker(courierPosition, { icon: courierIcon }).bindPopup(`<strong>Courier is here</strong><br />${escapeHtml(delivery.courierLocation)}`).addTo(map);
      L.marker(deliveryPosition, { icon: deliveryIcon }).bindPopup(`<strong>Delivery location</strong><br />${escapeHtml(delivery.dropoff)}`).addTo(map);
      window.setTimeout(() => map?.invalidateSize(), 0);
    });
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [
    className,
    courierPosition,
    delivery.courierLocation,
    delivery.dropoff,
    deliveryPosition,
    resetCount,
    showDirections,
    visibleRoute,
    visibleRouteKey
  ]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative h-full min-h-[320px] w-full ${className ?? ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(LeafletStyleFix, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: mapRef, className: "h-full min-h-[320px] w-full" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: () => setResetCount((count) => count + 1),
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
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char] ?? char);
}
function LeafletStyleFix() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        .leaflet-container {
          font: inherit;
          z-index: 0;
        }

        .leaflet-control-attribution {
          border-radius: 9999px 0 0 0;
          font-size: 10px;
        }
      ` });
}
function useHashSection() {
  const [hash, setHash] = reactExports.useState("");
  reactExports.useEffect(() => {
    const read = () => setHash(window.location.hash.replace(/^#/, ""));
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);
  return hash;
}
function DashboardRoleShell({
  workspacePath,
  workspaceTitle,
  navItems,
  children
}) {
  const { session, logout } = useAuth();
  const hash = useHashSection();
  const defaultSection = navItems[0]?.sectionId ?? "";
  const [mobileNavOpen, setMobileNavOpen] = reactExports.useState(false);
  const navLinkClass = (sectionId) => {
    const active = hash === sectionId || hash === "" && sectionId === defaultSection;
    return cn(
      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
      active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
    );
  };
  const desktopNav = /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex flex-col gap-1 px-3 py-2", "aria-label": "Workspace", children: navItems.map(({ sectionId, label, icon: Icon }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: `#${sectionId}`, className: navLinkClass(sectionId), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4 shrink-0" }),
    label
  ] }, sectionId)) });
  const mobileNav = /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex flex-col gap-1 px-3 py-2", "aria-label": "Workspace", children: navItems.map(({ sectionId, label, icon: Icon }) => /* @__PURE__ */ jsxRuntimeExports.jsx(SheetClose, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "a",
    {
      href: `#${sectionId}`,
      onClick: () => setMobileNavOpen(false),
      className: navLinkClass(sectionId),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4 shrink-0" }),
        label
      ]
    }
  ) }, sectionId)) });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "aside",
      {
        className: "relative hidden w-60 shrink-0 flex-col border-r border-border/60 bg-card/30 md:flex",
        "aria-label": "Workspace navigation",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-16 items-center border-b border-border/60 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "flex items-center gap-2 text-foreground transition-opacity hover:opacity-90", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-9 w-9 place-items-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-soft)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sprout, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-display text-lg font-semibold tracking-tight", children: [
              "Randy's",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: "." })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border/60 px-4 py-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium uppercase tracking-wide text-muted-foreground", children: "Workspace" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 font-display text-lg font-semibold text-foreground", children: workspaceTitle }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: workspacePath, className: "mt-2 inline-flex text-xs font-medium text-primary hover:underline", children: "Dashboard home" })
          ] }),
          desktopNav,
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-auto border-t border-border/60 p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Link,
            {
              to: "/shop",
              className: "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "h-4 w-4" }),
                "Browse shop"
              ]
            }
          ) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 flex-1 flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border/60 bg-background/90 px-4 backdrop-blur-xl sm:px-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Sheet, { open: mobileNavOpen, onOpenChange: setMobileNavOpen, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              className: "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-card text-foreground shadow-[var(--shadow-soft)] transition-colors hover:bg-muted/50 md:hidden",
              "aria-label": "Open workspace menu",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, { className: "h-5 w-5" })
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetContent, { side: "left", className: "flex w-[min(100vw-2rem,18rem)] flex-col gap-0 p-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetHeader, { className: "border-b border-border/60 p-5 pb-4 text-left", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTitle, { className: "font-display text-lg", children: workspaceTitle }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-left text-xs text-muted-foreground", children: "Jump to a section" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto py-2", children: mobileNav }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-border/60 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SheetClose, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Link,
              {
                to: "/shop",
                className: "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/60",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "h-4 w-4" }),
                  "Browse shop"
                ]
              }
            ) }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "truncate font-display text-lg font-semibold sm:text-xl", children: workspaceTitle }),
          session ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "truncate text-xs text-muted-foreground sm:text-sm", children: [
            session.name,
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "hidden sm:inline", children: [
              " · ",
              session.email
            ] })
          ] }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => logout(),
            className: "inline-flex shrink-0 items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-2 text-xs font-semibold text-muted-foreground shadow-[var(--shadow-soft)] transition-colors hover:border-destructive/40 hover:text-destructive sm:px-4 sm:text-sm",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Log out" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-7xl", children }) })
    ] })
  ] });
}
function LoadingSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 animate-pulse", "aria-busy": "true", "aria-label": "Loading", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-24 rounded-3xl bg-muted/60" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-48 rounded-3xl bg-muted/40" })
  ] });
}
function RequireDashboardRole({
  role,
  children
}) {
  const { session, ready } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: selectPathname });
  reactExports.useEffect(() => {
    if (!ready) return;
    if (!session) {
      navigate({ to: "/dashboard/login", search: { redirect: pathname } });
      return;
    }
    if (session.role === "customer") {
      navigate({ to: "/shop" });
      return;
    }
    if (session.role !== role) {
      navigate({ to: dashboardPathForRole(session.role) });
    }
  }, [ready, session, role, navigate, pathname]);
  if (!ready) return /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSkeleton, {});
  if (!session || session.role === "customer" || session.role !== role) return /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSkeleton, {});
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children });
}
export {
  DashboardRoleShell as D,
  RequireDashboardRole as R,
  DeliveryTrackingMap as a
};
