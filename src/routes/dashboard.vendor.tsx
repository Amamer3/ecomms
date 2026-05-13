import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Banknote, Camera, Image as ImageIcon, LayoutDashboard, MapPinned, Package, Phone, ShieldCheck, ShoppingCart, Star, TrendingUp, Plus, Trash2, Pencil } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { DeliveryTrackingMap } from "@/components/DeliveryTrackingMap";
import { DashboardRoleShell } from "@/components/DashboardRoleShell";
import { RequireDashboardRole } from "@/components/RequireDashboardRole";
import { getVendorDeliveries } from "@/lib/delivery-tracking";
import { formatGhs } from "@/lib/format-money";

export const Route = createFileRoute("/dashboard/vendor")({
  component: VendorDashboard,
}); 

type VProduct = { id: string; name: string; price: number; stock: number; category: string; imageDataUrl?: string };

const KEY = "randys_vendor_products";
const CURRENT_VENDOR_ID = "pure-dairy";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

const seed: VProduct[] = [
  { id: "v1", name: "Vine Tomatoes", price: 4.5, stock: 38, category: "Fresh Produce" },
  { id: "v2", name: "Baby Spinach", price: 3.2, stock: 12, category: "Fresh Produce" },
  { id: "v3", name: "Free-range Eggs", price: 5.5, stock: 0, category: "Dairy & Eggs" },
];

const orders = [
  { id: "ORD-1042", customer: "Ama Mensah", total: 32.4, status: "Packed" },
  { id: "ORD-1041", customer: "Nana Boateng", total: 18.0, status: "In transit" },
  { id: "ORD-1039", customer: "Kwame Adjei", total: 54.9, status: "Delivered" },
  { id: "ORD-1038", customer: "Afia Sarpong", total: 22.5, status: "In transit" },
];

function VendorDashboard() {
  return (
    <RequireDashboardRole role="vendor">
      <VendorDashboardInner />
    </RequireDashboardRole>
  );
}

function VendorDashboardInner() {
  const [items, setItems] = useState<VProduct[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<VProduct | null>(null);
  const [form, setForm] = useState({ name: "", price: "", stock: "", category: "Fresh Produce", imageDataUrl: "" });
  const vendorDeliveries = getVendorDeliveries(CURRENT_VENDOR_ID);
  const visibleDeliveries = vendorDeliveries.filter((delivery) => delivery.status !== "available");
  const [selectedDeliveryId, setSelectedDeliveryId] = useState(visibleDeliveries[0]?.id);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    setItems(raw ? JSON.parse(raw) : seed);
  }, []);

  const persist = (next: VProduct[]) => {
    setItems(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  const stats = useMemo(() => ({
    revenue: orders.reduce((s, o) => s + o.total, 0),
    orderCount: orders.length,
    products: items.length,
    growth: 12.4,
  }), [items.length]);

  const applyImageFile = (file: File | undefined) => {
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
      if (typeof url === "string") setForm((f) => ({ ...f, imageDataUrl: url }));
    };
    reader.readAsDataURL(file);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", price: "", stock: "", category: "Fresh Produce", imageDataUrl: "" });
    setOpen(true);
  };
  const openEdit = (p: VProduct) => {
    setEditing(p);
    setForm({ name: p.name, price: String(p.price), stock: String(p.stock), category: p.category, imageDataUrl: "" });
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
      persist(items.map((i) => i.id === editing.id ? { ...editing, name: form.name.trim(), price, stock, category: form.category, imageDataUrl } : i));
      toast.success("Product updated");
    } else {
      persist([...items, { id: crypto.randomUUID(), name: form.name.trim(), price, stock, category: form.category, imageDataUrl }]);
      toast.success("Product added");
    }
    setOpen(false);
  };

  const previewUrl = form.imageDataUrl || editing?.imageDataUrl;
  const selectedDelivery = visibleDeliveries.find((delivery) => delivery.id === selectedDeliveryId) ?? visibleDeliveries[0];

  const remove = (id: string) => {
    persist(items.filter((i) => i.id !== id));
    toast.success("Product removed");
  };

  return (
    <DashboardRoleShell
      workspacePath="/dashboard/vendor"
      workspaceTitle="Vendor"
      navItems={[
        { sectionId: "overview", label: "Overview", icon: LayoutDashboard },
        { sectionId: "tracking", label: "Delivery tracking", icon: MapPinned },
        { sectionId: "products", label: "Products", icon: Package },
        { sectionId: "orders", label: "Orders", icon: ShoppingCart },
      ]}
    >
    <div className="space-y-6">
      <section id="overview" className="scroll-mt-28">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Banknote} label="Revenue (7d)" value={formatGhs(stats.revenue)} />
        <Stat icon={ShoppingCart} label="Orders" value={String(stats.orderCount)} />
        <Stat icon={Package} label="Products" value={String(stats.products)} />
        <Stat icon={TrendingUp} label="Growth" value={`+${stats.growth}%`} />
      </div>
      </section>

      <section id="tracking" className="scroll-mt-28">
      <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-[var(--shadow-soft)]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 p-5">
          <div>
            <div className="flex items-center gap-2">
              <MapPinned className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Delivery tracking</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Only deliveries from your vendor account are shown here.</p>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {visibleDeliveries.filter((delivery) => delivery.status === "accepted").length} active
          </span>
        </div>
        {selectedDelivery ? (
          <div className="grid gap-5 p-5 xl:grid-cols-[1.4fr_0.9fr]">
            <div className="relative min-h-[360px] overflow-hidden rounded-3xl border border-border/60 bg-muted">
              <DeliveryTrackingMap delivery={selectedDelivery} showDirections={selectedDelivery.status === "accepted"} />
            </div>
            <div className="grid content-start gap-4">
              <div className="rounded-2xl border border-border/60 bg-primary/5 p-4">
                <div className="flex items-center gap-2 text-primary">
                  <ShieldCheck className="h-4 w-4" />
                  <p className="text-sm font-semibold">Courier security details</p>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Shown for delivery accountability. Share only with staff handling this order.
                </p>
                <div className="mt-4 grid gap-3 text-sm">
                  <p><span className="text-muted-foreground">Courier:</span> <span className="font-semibold">{selectedDelivery.courier.name}</span></p>
                  <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> {selectedDelivery.courier.phone}</p>
                  <p><span className="text-muted-foreground">Vehicle:</span> {selectedDelivery.courier.vehicle} · {selectedDelivery.courier.plateNumber}</p>
                  <p className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-primary text-primary" /> {selectedDelivery.courier.rating.toFixed(1)} rating</p>
                </div>
              </div>
              <div className="grid gap-2">
                {visibleDeliveries.map((delivery) => (
                  <button
                    key={delivery.id}
                    type="button"
                    onClick={() => setSelectedDeliveryId(delivery.id)}
                    className={`rounded-2xl border p-4 text-left transition-colors ${selectedDelivery.id === delivery.id ? "border-primary bg-primary/5" : "border-border/60 hover:bg-muted/30"}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold">{delivery.orderId}</p>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">{delivery.status === "accepted" ? "In transit" : delivery.status}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{delivery.customerName} · {delivery.customerArea}</p>
                    <p className="mt-1 text-sm">{delivery.courierLocation} → {delivery.dropoff}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="p-8 text-center text-sm text-muted-foreground">No deliveries are currently being tracked for your vendor account.</p>
        )}
      </div>
      </section>

      <section id="products" className="scroll-mt-28">
      <div className="rounded-3xl border border-border/60 bg-card shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between border-b border-border/60 p-5">
          <div>
            <h2 className="text-lg font-semibold">Your products</h2>
            <p className="text-sm text-muted-foreground">Add, edit, and manage stock.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button onClick={openNew} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
                <Plus className="h-4 w-4" /> Add product
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Edit product" : "Add product"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <div>
                  <span className="mb-1 block text-sm font-medium text-foreground/80">Product photo</span>
                  <p className="mb-3 text-xs text-muted-foreground">Required — take a picture or choose one from your gallery so customers know exactly what they’re buying.</p>
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="sr-only"
                    onChange={(e) => {
                      applyImageFile(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      applyImageFile(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                  <div
                    className={`relative flex min-h-[140px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-4 py-6 transition-colors ${previewUrl ? "border-primary/40 bg-primary/5" : "border-border bg-muted/30"}`}
                  >
                    {previewUrl ? (
                      <>
                        <img src={previewUrl} alt="" className="max-h-32 max-w-full rounded-xl object-contain shadow-sm" />
                        <div className="flex flex-wrap justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => cameraInputRef.current?.click()}
                            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-accent/10"
                          >
                            <Camera className="h-3.5 w-3.5" /> Retake
                          </button>
                          <button
                            type="button"
                            onClick={() => galleryInputRef.current?.click()}
                            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-accent/10"
                          >
                            <ImageIcon className="h-3.5 w-3.5" /> Replace
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground">
                          <ImageIcon className="h-6 w-6" />
                        </span>
                        <div className="flex flex-wrap justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => cameraInputRef.current?.click()}
                            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                          >
                            <Camera className="h-4 w-4" /> Take photo
                          </button>
                          <button
                            type="button"
                            onClick={() => galleryInputRef.current?.click()}
                            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-accent/10"
                          >
                            <ImageIcon className="h-4 w-4" /> Gallery
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <Field label="Name"><input className={inp} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Price (GHS)"><input type="number" step="0.01" className={inp} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></Field>
                  <Field label="Stock"><input type="number" className={inp} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></Field>
                </div>
                <Field label="Category">
                  <select className={inp} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {["Fresh Produce","Meat & Seafood","Dairy & Eggs","Bakery","Pantry","Frozen","Beverages","Household"].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
              </div>
              <DialogFooter>
                <button onClick={() => setOpen(false)} className="rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold">Cancel</button>
                <button
                  type="button"
                  onClick={save}
                  disabled={!previewUrl}
                  className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:pointer-events-none disabled:opacity-40"
                >
                  Save
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3 w-16">Photo</th>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Price (GHS)</th>
                <th className="px-5 py-3">Stock</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-t border-border/60">
                  <td className="px-5 py-3">
                    {p.imageDataUrl ? (
                      <img src={p.imageDataUrl} alt="" className="h-11 w-11 rounded-lg object-cover ring-1 ring-border" />
                    ) : (
                      <span className="grid h-11 w-11 place-items-center rounded-lg bg-muted text-muted-foreground ring-1 ring-border" title="No photo yet">
                        <ImageIcon className="h-4 w-4" />
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 font-medium">{p.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{p.category}</td>
                  <td className="px-5 py-3">{formatGhs(p.price)}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.stock === 0 ? "bg-destructive/10 text-destructive" : p.stock < 15 ? "bg-accent/15 text-accent-foreground" : "bg-primary/10 text-primary"}`}>
                      {p.stock === 0 ? "Out" : p.stock}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(p)} className="rounded-full border border-border p-2 hover:bg-accent/10" aria-label="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => remove(p.id)} className="rounded-full border border-border p-2 text-destructive hover:bg-destructive/10" aria-label="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">No products yet — add your first one.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </section>

      <section id="orders" className="scroll-mt-28">
      <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)]">
        <h2 className="text-lg font-semibold">Recent orders</h2>
        <div className="mt-4 divide-y divide-border/60">
          {orders.map((o) => (
            <div key={o.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">{o.id}</p>
                <p className="text-xs text-muted-foreground">{o.customer}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold">{formatGhs(o.total)}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{o.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      </section>
    </div>
    </DashboardRoleShell>
  );
}

const inp = "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-foreground/80">{label}</span>
      {children}
    </label>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span>
      </div>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
    </div>
  );
}
