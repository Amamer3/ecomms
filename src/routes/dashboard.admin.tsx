import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, Store, Bike, ShoppingBag, Check, X, MapPinned, Phone, ShieldCheck, Star, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";
import { DeliveryTrackingMap } from "@/components/DeliveryTrackingMap";
import { DashboardRoleShell } from "@/components/DashboardRoleShell";
import { RequireDashboardRole } from "@/components/RequireDashboardRole";
import { deliveryTrackingSeed, getActiveDeliveries } from "@/lib/delivery-tracking";
import { formatGhsCompact } from "@/lib/format-money";

export const Route = createFileRoute("/dashboard/admin")({
  component: AdminDashboard, 
});

type Vendor = { id: string; businessName: string; ownerName: string; city: string; category: string; status: string };
type Rider = { id: string; fullName: string; city: string; vehicle: string; status: string };

function AdminDashboard() {
  return (
    <RequireDashboardRole role="admin">
      <AdminDashboardInner />
    </RequireDashboardRole>
  );
}

function AdminDashboardInner() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const activeDeliveries = getActiveDeliveries(deliveryTrackingSeed);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState(activeDeliveries[0]?.id);
  const selectedDelivery = activeDeliveries.find((delivery) => delivery.id === selectedDeliveryId) ?? activeDeliveries[0];

  useEffect(() => {
    setVendors(JSON.parse(localStorage.getItem("randys_vendors") || "[]"));
    setRiders(JSON.parse(localStorage.getItem("randys_riders") || "[]"));
  }, []);

  const updateVendor = (id: string, status: string) => {
    const next = vendors.map((v) => v.id === id ? { ...v, status } : v);
    setVendors(next);
    localStorage.setItem("randys_vendors", JSON.stringify(next));
    toast.success(`Vendor ${status}`);
  };
  const updateRider = (id: string, status: string) => {
    const next = riders.map((r) => r.id === id ? { ...r, status } : r);
    setRiders(next);
    localStorage.setItem("randys_riders", JSON.stringify(next));
    toast.success(`Rider ${status}`);
  };

  const pendingV = vendors.filter((v) => v.status === "pending").length;
  const pendingR = riders.filter((r) => r.status === "pending").length;

  return (
    <DashboardRoleShell
      workspacePath="/dashboard/admin"
      workspaceTitle="Admin"
      navItems={[
        { sectionId: "overview", label: "Overview", icon: LayoutDashboard },
        { sectionId: "live-ops", label: "Live operations", icon: MapPinned },
        { sectionId: "vendors", label: "Vendor applications", icon: Store },
        { sectionId: "couriers", label: "Courier applications", icon: Bike },
      ]}
    >
    <div className="space-y-6">
      <section id="overview" className="scroll-mt-28">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Store} label="Vendors" value={String(vendors.length)} sub={`${pendingV} pending`} />
        <Stat icon={Bike} label="Couriers" value={String(riders.length)} sub={`${pendingR} pending`} />
        <Stat icon={Users} label="Customers" value="2,184" sub="+38 today" />
        <Stat icon={ShoppingBag} label="GMV (30d)" value={formatGhsCompact(48_200)} sub="+12% MoM" />
      </div>
      </section>

      <section id="live-ops" className="scroll-mt-28">
      <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-[var(--shadow-soft)]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 p-5">
          <div>
            <div className="flex items-center gap-2">
              <MapPinned className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Live delivery operations</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Admin view of all active courier deliveries across vendors.</p>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {activeDeliveries.length} active deliveries
          </span>
        </div>
        {selectedDelivery ? (
          <div className="grid gap-5 p-5 xl:grid-cols-[1.5fr_0.9fr]">
            <div className="relative min-h-[380px] overflow-hidden rounded-3xl border border-border/60 bg-muted">
              <DeliveryTrackingMap delivery={selectedDelivery} showDirections />
            </div>
            <div className="grid content-start gap-4">
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Selected delivery</p>
                <p className="mt-1 text-lg font-semibold">{selectedDelivery.id} · {selectedDelivery.orderId}</p>
                <p className="mt-1 text-sm text-muted-foreground">{selectedDelivery.vendorName} to {selectedDelivery.customerArea}</p>
                <div className="mt-4 grid gap-2 text-sm">
                  <p><span className="text-muted-foreground">Customer:</span> {selectedDelivery.customerName}</p>
                  <p><span className="text-muted-foreground">Route:</span> {selectedDelivery.courierLocation} → {selectedDelivery.dropoff}</p>
                  <p><span className="text-muted-foreground">ETA:</span> {selectedDelivery.etaMinutes} min · {selectedDelivery.distanceKm.toFixed(1)} km</p>
                </div>
              </div>
              <div className="rounded-2xl border border-border/60 bg-primary/5 p-4">
                <div className="flex items-center gap-2 text-primary">
                  <ShieldCheck className="h-4 w-4" />
                  <p className="text-sm font-semibold">Courier identity</p>
                </div>
                <div className="mt-3 grid gap-2 text-sm">
                  <p className="font-semibold">{selectedDelivery.courier.name}</p>
                  <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> {selectedDelivery.courier.phone}</p>
                  <p>{selectedDelivery.courier.vehicle} · {selectedDelivery.courier.plateNumber}</p>
                  <p className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-primary text-primary" /> {selectedDelivery.courier.rating.toFixed(1)} rating</p>
                </div>
              </div>
              <div className="grid max-h-[260px] gap-2 overflow-y-auto pr-1">
                {activeDeliveries.map((delivery) => (
                  <button
                    key={delivery.id}
                    type="button"
                    onClick={() => setSelectedDeliveryId(delivery.id)}
                    className={`rounded-2xl border p-4 text-left transition-colors ${selectedDelivery.id === delivery.id ? "border-primary bg-primary/5" : "border-border/60 hover:bg-muted/30"}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold">{delivery.vendorName}</p>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">Active</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{delivery.orderId} · {delivery.customerArea}</p>
                    <p className="mt-1 text-sm">{delivery.courier.name} → {delivery.dropoff}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="p-8 text-center text-sm text-muted-foreground">No active deliveries right now.</p>
        )}
      </div>
      </section>

      <section id="vendors" className="scroll-mt-28">
      <Section title="Vendor applications" empty="No vendor applications yet.">
        {vendors.length > 0 && (
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Business</th><th className="px-5 py-3">Owner</th><th className="px-5 py-3">City</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Status</th><th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v.id} className="border-t border-border/60">
                  <td className="px-5 py-3 font-medium">{v.businessName}</td>
                  <td className="px-5 py-3">{v.ownerName}</td>
                  <td className="px-5 py-3">{v.city}</td>
                  <td className="px-5 py-3 text-muted-foreground">{v.category}</td>
                  <td className="px-5 py-3"><StatusPill status={v.status} /></td>
                  <td className="px-5 py-3"><Actions onApprove={() => updateVendor(v.id, "approved")} onReject={() => updateVendor(v.id, "rejected")} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>
      </section>

      <section id="couriers" className="scroll-mt-28">
      <Section title="Courier applications" empty="No courier applications yet.">
        {riders.length > 0 && (
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Name</th><th className="px-5 py-3">City</th><th className="px-5 py-3">Vehicle</th><th className="px-5 py-3">Status</th><th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {riders.map((r) => (
                <tr key={r.id} className="border-t border-border/60">
                  <td className="px-5 py-3 font-medium">{r.fullName}</td>
                  <td className="px-5 py-3">{r.city}</td>
                  <td className="px-5 py-3">{r.vehicle}</td>
                  <td className="px-5 py-3"><StatusPill status={r.status} /></td>
                  <td className="px-5 py-3"><Actions onApprove={() => updateRider(r.id, "approved")} onReject={() => updateRider(r.id, "rejected")} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>
      </section>
    </div>
    </DashboardRoleShell>
  );
}

function Section({ title, children, empty }: { title: string; children: React.ReactNode; empty: string }) {
  const isEmpty = !children || (Array.isArray(children) && children.length === 0);
  return (
    <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-[var(--shadow-soft)]">
      <div className="border-b border-border/60 p-5">
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {isEmpty ? <p className="p-8 text-center text-sm text-muted-foreground">{empty}</p> : <div className="overflow-x-auto">{children}</div>}
    </div>
  );
}

function Actions({ onApprove, onReject }: { onApprove: () => void; onReject: () => void }) {
  return (
    <div className="flex justify-end gap-2">
      <button onClick={onApprove} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"><Check className="h-3.5 w-3.5" /> Approve</button>
      <button onClick={onReject} className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/20"><X className="h-3.5 w-3.5" /> Reject</button>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-accent/15 text-accent-foreground",
    approved: "bg-primary/10 text-primary",
    rejected: "bg-destructive/10 text-destructive",
  };
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${map[status] || "bg-muted"}`}>{status}</span>;
}

function Stat({ icon: Icon, label, value, sub }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span>
      </div>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
