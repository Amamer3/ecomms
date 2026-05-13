import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Clock, LayoutDashboard, MapPin, MapPinned, Maximize2, Navigation, Power, Wallet, Bike } from "lucide-react";
import { toast } from "sonner";
import { DeliveryTrackingMap } from "@/components/DeliveryTrackingMap";
import { DashboardRoleShell } from "@/components/DashboardRoleShell";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RequireDashboardRole } from "@/components/RequireDashboardRole";
import {
  deliveryTrackingSeed,
  getDistanceKm,
  NEARBY_DELIVERY_KM,
  type DeliveryTracking,
} from "@/lib/delivery-tracking";
import { formatGhs } from "@/lib/format-money";

export const Route = createFileRoute("/dashboard/delivery")({
  component: DeliveryDashboard,
}); 

type Run = DeliveryTracking;
const seed: Run[] = deliveryTrackingSeed.map((delivery) => ({
  ...delivery,
  status: delivery.status === "delivered" ? "delivered" : "available",
}));

function DeliveryDashboard() {
  return (
    <RequireDashboardRole role="delivery">
      <DeliveryDashboardInner />
    </RequireDashboardRole>
  );
}

function DeliveryDashboardInner() {
  const [online, setOnline] = useState(true);
  const [runs, setRuns] = useState<Run[]>(seed);
  const [selectedRunId, setSelectedRunId] = useState(seed[0]?.id);

  useEffect(() => {
    if (runs.some((run) => run.pickup.includes("Lekki") || run.dropoff.includes("Victoria Island"))) {
      setRuns(seed);
      setSelectedRunId(seed[0]?.id);
    }
  }, [runs]);

  const acceptedRuns = runs.filter((r) => r.status === "accepted");
  const canStackDelivery = (candidate: Run) => (
    acceptedRuns.length === 0
    || acceptedRuns.some((activeRun) => getDistanceKm(candidate.dropoffPoint, activeRun.dropoffPoint) <= NEARBY_DELIVERY_KM)
  );

  const update = (id: string, status: Run["status"]) => {
    setRuns((rs) => rs.map((r) => r.id === id ? { ...r, status } : r));
    toast.success(`Run ${id} → ${status}`);
  };

  const acceptRun = (id: string) => {
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

  return (
    <DashboardRoleShell
      workspacePath="/dashboard/delivery"
      workspaceTitle="Courier"
      navItems={[
        { sectionId: "overview", label: "Overview", icon: LayoutDashboard },
        { sectionId: "map", label: "Delivery map", icon: MapPinned },
        { sectionId: "runs", label: "Runs", icon: Bike },
      ]}
    >
    <div className="space-y-6">
      <section id="overview" className="scroll-mt-28 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)]">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
          <p className="mt-1 text-lg font-semibold">{online ? "You're online" : "You're offline"}</p>
        </div>
        <button
          onClick={() => { setOnline(!online); toast.success(online ? "You're now offline" : "You're now online"); }}
          className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold ${online ? "bg-primary text-primary-foreground" : "border border-border bg-background"}`}
        >
          <Power className="h-4 w-4" /> {online ? "Go offline" : "Go online"}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={Wallet} label="Today's earnings" value={formatGhs(earnings)} />
        <Stat icon={Clock} label="Active runs" value={String(active)} />
        <Stat icon={CheckCircle2} label="Completed" value={String(completed)} />
      </div>
      </section>

      {selectedRun && (
        <section id="map" className="scroll-mt-28">
        <DeliveryMap run={selectedRun} online={online} />
        </section>
      )}

      <section id="runs" className="scroll-mt-28">
      <div className="rounded-3xl border border-border/60 bg-card shadow-[var(--shadow-soft)]">
        <div className="border-b border-border/60 p-5">
          <h2 className="text-lg font-semibold">Available & active runs</h2>
          <p className="text-sm text-muted-foreground">Accept a run, then mark as delivered when complete.</p>
        </div>
        <div className="divide-y divide-border/60">
          {runs.map((r) => (
            <div
              key={r.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedRunId(r.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") setSelectedRunId(r.id);
              }}
              className={`flex w-full flex-wrap items-center justify-between gap-3 p-5 text-left transition-colors hover:bg-muted/30 ${selectedRunId === r.id ? "bg-primary/5" : ""}`}
            >
              <div>
                <p className="text-sm font-semibold">{r.id}</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> {r.pickup} → {r.dropoff}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{r.distanceKm.toFixed(1)} km · about {r.etaMinutes} min</p>
                {r.status === "available" && acceptedRuns.length > 0 && (
                  <p className={`mt-1 text-xs font-medium ${canStackDelivery(r) ? "text-primary" : "text-destructive"}`}>
                    {canStackDelivery(r) ? "Close enough to add to this run" : `Too far from your active drop-off (${NEARBY_DELIVERY_KM} km limit)`}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">{formatGhs(r.payout)}</span>
                {r.status === "available" && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      acceptRun(r.id);
                    }}
                    disabled={!online || !canStackDelivery(r)}
                    title={!canStackDelivery(r) ? `Only deliveries within ${NEARBY_DELIVERY_KM} km of your active drop-off can be accepted.` : undefined}
                    className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
                  >
                    Accept
                  </button>
                )}
                {r.status === "accepted" && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      update(r.id, "delivered");
                    }}
                    className="rounded-full px-4 py-2 text-xs font-semibold text-primary-foreground"
                    style={{ backgroundImage: "var(--gradient-warm)" }}
                  >
                    Mark delivered
                  </button>
                )}
                {r.status === "delivered" && (
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Delivered</span>
                )}
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

function DeliveryMap({ run, online }: { run: Run; online: boolean }) {
  const [fullMapOpen, setFullMapOpen] = useState(false);
  const statusCopy = {
    available: "Available for pickup",
    accepted: "Active delivery",
    delivered: "Delivered",
  } satisfies Record<Run["status"], string>;

  return (
    <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-[var(--shadow-soft)]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 p-5">
        <div>
          <div className="flex items-center gap-2">
            <MapPinned className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Delivery map</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Showing {run.id}: {run.pickup} to {run.dropoff}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${online ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
          {online ? "Live routing" : "Offline preview"}
        </span>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[1.5fr_0.8fr]">
        <div className="relative min-h-[320px] overflow-hidden rounded-3xl border border-border/60 bg-muted">
          <DeliveryTrackingMap delivery={run} />
          <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-border/60 bg-card/90 p-4 shadow-sm backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{statusCopy[run.status]}</p>
                <p className="mt-1 text-sm font-semibold">{run.courierLocation} → {run.dropoff}</p>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Navigation className="h-4 w-4 text-primary" />
                {run.distanceKm.toFixed(1)} km
              </div>
            </div>
          </div>
        </div>

        <div className="grid content-start gap-3">
          <button
            type="button"
            onClick={() => setFullMapOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            View in full <Maximize2 className="h-4 w-4" />
          </button>
          <RouteStop label="Courier is here" value={run.courierLocation} />
          <RouteStop label="Pickup" value={run.pickup} />
          <RouteStop label="Going to deliver at" value={run.dropoff} />
          <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Estimated time</p>
            <p className="mt-1 text-2xl font-semibold">{run.etaMinutes} min</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Payout</p>
            <p className="mt-1 text-2xl font-semibold">{formatGhs(run.payout)}</p>
          </div>
        </div>
      </div>

      <Dialog open={fullMapOpen} onOpenChange={setFullMapOpen}>
        <DialogContent className="max-w-6xl overflow-hidden p-0 sm:rounded-3xl">
          <DialogHeader className="p-5 pb-0">
            <DialogTitle>Full delivery map</DialogTitle>
            <DialogDescription>
              {run.id}: {run.pickup} to {run.dropoff}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 p-5">
            <div className="relative h-[70vh] min-h-[420px] overflow-hidden rounded-3xl border border-border/60 bg-muted">
              <DeliveryTrackingMap delivery={run} />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <RouteStop label="Courier is here" value={run.courierLocation} />
              <RouteStop label="Pickup" value={run.pickup} />
              <RouteStop label="Going to deliver at" value={run.dropoff} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RouteStop({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent/15 text-accent-foreground"><Icon className="h-4 w-4" /></span>
      </div>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
    </div>
  );
}
