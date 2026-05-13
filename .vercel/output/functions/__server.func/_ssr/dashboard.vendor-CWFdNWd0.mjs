import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { D as Dialog, a as DialogTrigger, b as DialogContent, c as DialogHeader, d as DialogTitle, e as DialogFooter } from "./dialog-xwQogGr8.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { R as RequireDashboardRole, D as DashboardRoleShell, a as DeliveryTrackingMap } from "./RequireDashboardRole-BvatzLew.mjs";
import { a as getVendorDeliveries } from "./delivery-tracking-B2j3fUjs.mjs";
import { f as formatGhs } from "./format-money-D3U6Lvgy.mjs";
import { L as LayoutDashboard, u as MapPinned, g as Package, v as ShoppingCart, w as Banknote, x as TrendingUp, n as ShieldCheck, y as Phone, z as Star, P as Plus, D as Camera, I as Image, E as Pencil, T as Trash2 } from "../_libs/lucide-react.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
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
import "./utils-H80jjgLf.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
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
import "./sheet-QwDa3FUb.mjs";
import "../_libs/class-variance-authority.mjs";
import "./router-pathname-B_nSBnfm.mjs";
const KEY = "randys_vendor_products";
const CURRENT_VENDOR_ID = "pure-dairy";
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const seed = [{
  id: "v1",
  name: "Vine Tomatoes",
  price: 4.5,
  stock: 38,
  category: "Fresh Produce"
}, {
  id: "v2",
  name: "Baby Spinach",
  price: 3.2,
  stock: 12,
  category: "Fresh Produce"
}, {
  id: "v3",
  name: "Free-range Eggs",
  price: 5.5,
  stock: 0,
  category: "Dairy & Eggs"
}];
const orders = [{
  id: "ORD-1042",
  customer: "Ama Mensah",
  total: 32.4,
  status: "Packed"
}, {
  id: "ORD-1041",
  customer: "Nana Boateng",
  total: 18,
  status: "In transit"
}, {
  id: "ORD-1039",
  customer: "Kwame Adjei",
  total: 54.9,
  status: "Delivered"
}, {
  id: "ORD-1038",
  customer: "Afia Sarpong",
  total: 22.5,
  status: "In transit"
}];
function VendorDashboard() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(RequireDashboardRole, { role: "vendor", children: /* @__PURE__ */ jsxRuntimeExports.jsx(VendorDashboardInner, {}) });
}
function VendorDashboardInner() {
  const [items, setItems] = reactExports.useState([]);
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({
    name: "",
    price: "",
    stock: "",
    category: "Fresh Produce",
    imageDataUrl: ""
  });
  const vendorDeliveries = getVendorDeliveries(CURRENT_VENDOR_ID);
  const visibleDeliveries = vendorDeliveries.filter((delivery) => delivery.status !== "available");
  const [selectedDeliveryId, setSelectedDeliveryId] = reactExports.useState(visibleDeliveries[0]?.id);
  const cameraInputRef = reactExports.useRef(null);
  const galleryInputRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const raw = localStorage.getItem(KEY);
    setItems(raw ? JSON.parse(raw) : seed);
  }, []);
  const persist = (next) => {
    setItems(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };
  const stats = reactExports.useMemo(() => ({
    revenue: orders.reduce((s, o) => s + o.total, 0),
    orderCount: orders.length,
    products: items.length,
    growth: 12.4
  }), [items.length]);
  const applyImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose a photo (JPG, PNG, or WebP).");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Photo must be under 2 MB. Try a smaller image.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result;
      if (typeof url === "string") setForm((f) => ({
        ...f,
        imageDataUrl: url
      }));
    };
    reader.readAsDataURL(file);
  };
  const openNew = () => {
    setEditing(null);
    setForm({
      name: "",
      price: "",
      stock: "",
      category: "Fresh Produce",
      imageDataUrl: ""
    });
    setOpen(true);
  };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name,
      price: String(p.price),
      stock: String(p.stock),
      category: p.category,
      imageDataUrl: ""
    });
    setOpen(true);
  };
  const save = () => {
    const price = parseFloat(form.price);
    const stock = parseInt(form.stock, 10);
    if (!form.name.trim() || Number.isNaN(price) || Number.isNaN(stock)) {
      toast.error("Please fill all fields with valid values.");
      return;
    }
    const imageDataUrl = form.imageDataUrl.trim() || editing?.imageDataUrl;
    if (!imageDataUrl) {
      toast.error("Add a product photo — customers need to see what they’re ordering.");
      return;
    }
    if (editing) {
      persist(items.map((i) => i.id === editing.id ? {
        ...editing,
        name: form.name.trim(),
        price,
        stock,
        category: form.category,
        imageDataUrl
      } : i));
      toast.success("Product updated");
    } else {
      persist([...items, {
        id: crypto.randomUUID(),
        name: form.name.trim(),
        price,
        stock,
        category: form.category,
        imageDataUrl
      }]);
      toast.success("Product added");
    }
    setOpen(false);
  };
  const previewUrl = form.imageDataUrl || editing?.imageDataUrl;
  const selectedDelivery = visibleDeliveries.find((delivery) => delivery.id === selectedDeliveryId) ?? visibleDeliveries[0];
  const remove = (id) => {
    persist(items.filter((i) => i.id !== id));
    toast.success("Product removed");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardRoleShell, { workspacePath: "/dashboard/vendor", workspaceTitle: "Vendor", navItems: [{
    sectionId: "overview",
    label: "Overview",
    icon: LayoutDashboard
  }, {
    sectionId: "tracking",
    label: "Delivery tracking",
    icon: MapPinned
  }, {
    sectionId: "products",
    label: "Products",
    icon: Package
  }, {
    sectionId: "orders",
    label: "Orders",
    icon: ShoppingCart
  }], children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "overview", className: "scroll-mt-28", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Banknote, label: "Revenue (7d)", value: formatGhs(stats.revenue) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: ShoppingCart, label: "Orders", value: String(stats.orderCount) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Package, label: "Products", value: String(stats.products) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: TrendingUp, label: "Growth", value: `+${stats.growth}%` })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "tracking", className: "scroll-mt-28", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden rounded-3xl border border-border/60 bg-card shadow-[var(--shadow-soft)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4 border-b border-border/60 p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPinned, { className: "h-5 w-5 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Delivery tracking" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Only deliveries from your vendor account are shown here." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary", children: [
          visibleDeliveries.filter((delivery) => delivery.status === "accepted").length,
          " active"
        ] })
      ] }),
      selectedDelivery ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-5 p-5 xl:grid-cols-[1.4fr_0.9fr]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative min-h-[360px] overflow-hidden rounded-3xl border border-border/60 bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DeliveryTrackingMap, { delivery: selectedDelivery, showDirections: selectedDelivery.status === "accepted" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid content-start gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-primary/5 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-primary", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: "Courier security details" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-muted-foreground", children: "Shown for delivery accountability. Share only with staff handling this order." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid gap-3 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Courier:" }),
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: selectedDelivery.courier.name })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5 text-muted-foreground" }),
                " ",
                selectedDelivery.courier.phone
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Vehicle:" }),
                " ",
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
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2", children: visibleDeliveries.map((delivery) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setSelectedDeliveryId(delivery.id), className: `rounded-2xl border p-4 text-left transition-colors ${selectedDelivery.id === delivery.id ? "border-primary bg-primary/5" : "border-border/60 hover:bg-muted/30"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: delivery.orderId }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-muted px-2 py-0.5 text-xs capitalize", children: delivery.status === "accepted" ? "In transit" : delivery.status })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
              delivery.customerName,
              " · ",
              delivery.customerArea
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm", children: [
              delivery.courierLocation,
              " → ",
              delivery.dropoff
            ] })
          ] }, delivery.id)) })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "p-8 text-center text-sm text-muted-foreground", children: "No deliveries are currently being tracked for your vendor account." })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "products", className: "scroll-mt-28", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-border/60 bg-card shadow-[var(--shadow-soft)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border/60 p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Your products" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Add, edit, and manage stock." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open, onOpenChange: setOpen, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: openNew, className: "inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
            " Add product"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit product" : "Add product" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-1 block text-sm font-medium text-foreground/80", children: "Product photo" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-3 text-xs text-muted-foreground", children: "Required — take a picture or choose one from your gallery so customers know exactly what they’re buying." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: cameraInputRef, type: "file", accept: "image/*", capture: "environment", className: "sr-only", onChange: (e) => {
                  applyImageFile(e.target.files?.[0]);
                  e.target.value = "";
                } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: galleryInputRef, type: "file", accept: "image/*", className: "sr-only", onChange: (e) => {
                  applyImageFile(e.target.files?.[0]);
                  e.target.value = "";
                } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `relative flex min-h-[140px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-4 py-6 transition-colors ${previewUrl ? "border-primary/40 bg-primary/5" : "border-border bg-muted/30"}`, children: previewUrl ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: previewUrl, alt: "", className: "max-h-32 max-w-full rounded-xl object-contain shadow-sm" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => cameraInputRef.current?.click(), className: "inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-accent/10", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-3.5 w-3.5" }),
                      " Retake"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => galleryInputRef.current?.click(), className: "inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-accent/10", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "h-3.5 w-3.5" }),
                      " Replace"
                    ] })
                  ] })
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "h-6 w-6" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => cameraInputRef.current?.click(), className: "inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-4 w-4" }),
                      " Take photo"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => galleryInputRef.current?.click(), className: "inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-accent/10", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "h-4 w-4" }),
                      " Gallery"
                    ] })
                  ] })
                ] }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Name", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: inp, value: form.name, onChange: (e) => setForm({
                ...form,
                name: e.target.value
              }) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Price (GHS)", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", step: "0.01", className: inp, value: form.price, onChange: (e) => setForm({
                  ...form,
                  price: e.target.value
                }) }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Stock", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", className: inp, value: form.stock, onChange: (e) => setForm({
                  ...form,
                  stock: e.target.value
                }) }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Category", children: /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: inp, value: form.category, onChange: (e) => setForm({
                ...form,
                category: e.target.value
              }), children: ["Fresh Produce", "Meat & Seafood", "Dairy & Eggs", "Bakery", "Pantry", "Frozen", "Beverages", "Household"].map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: c }, c)) }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setOpen(false), className: "rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold", children: "Cancel" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: save, disabled: !previewUrl, className: "rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:pointer-events-none disabled:opacity-40", children: "Save" })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-left text-xs uppercase tracking-wide text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-3 w-16", children: "Photo" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-3", children: "Product" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-3", children: "Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-3", children: "Price (GHS)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-3", children: "Stock" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-3" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
          items.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border/60", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3", children: p.imageDataUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: p.imageDataUrl, alt: "", className: "h-11 w-11 rounded-lg object-cover ring-1 ring-border" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-11 w-11 place-items-center rounded-lg bg-muted text-muted-foreground ring-1 ring-border", title: "No photo yet", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "h-4 w-4" }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3 font-medium", children: p.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3 text-muted-foreground", children: p.category }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3", children: formatGhs(p.price) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-2 py-0.5 text-xs font-semibold ${p.stock === 0 ? "bg-destructive/10 text-destructive" : p.stock < 15 ? "bg-accent/15 text-accent-foreground" : "bg-primary/10 text-primary"}`, children: p.stock === 0 ? "Out" : p.stock }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openEdit(p), className: "rounded-full border border-border p-2 hover:bg-accent/10", "aria-label": "Edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => remove(p.id), className: "rounded-full border border-border p-2 text-destructive hover:bg-destructive/10", "aria-label": "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
            ] }) })
          ] }, p.id)),
          items.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, className: "px-5 py-10 text-center text-muted-foreground", children: "No products yet — add your first one." }) })
        ] })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "orders", className: "scroll-mt-28", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Recent orders" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 divide-y divide-border/60", children: orders.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: o.id }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: o.customer })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold", children: formatGhs(o.total) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-muted px-2 py-0.5 text-xs", children: o.status })
        ] })
      ] }, o.id)) })
    ] }) })
  ] }) });
}
const inp = "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";
function Field({
  label,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-1 block text-sm font-medium text-foreground/80", children: label }),
    children
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
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-2xl font-semibold", children: value })
  ] });
}
export {
  VendorDashboard as component
};
