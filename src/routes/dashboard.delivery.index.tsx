import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Power } from "lucide-react";
import {
  getRiderEarningsSummary,
  getRiderProfile,
  listRiderDeliveries,
  setRiderAvailability,
  updateRiderLocation,
} from "@/lib/api";
import { parseMoney } from "@/lib/api/client";
import { RiderPageHeader, useRiderAction } from "@/components/rider/rider-ui";
import { formatGhs } from "@/lib/format-money";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/delivery/")({
  component: RiderOverviewPage,
  head: () => ({ meta: [{ title: "Courier overview — GoMarket" }] }),
});

function RiderOverviewPage() {
  const { runAction } = useRiderAction();

  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ["rider-profile"],
    queryFn: getRiderProfile,
  });
  const { data: deliveries = [] } = useQuery({
    queryKey: ["rider-deliveries"],
    queryFn: () => listRiderDeliveries({ limit: 30 }),
    refetchInterval: 20_000,
  });
  const { data: earnings } = useQuery({
    queryKey: ["rider-earnings"],
    queryFn: getRiderEarningsSummary,
  });

  const online = profile?.availability === "ONLINE" || profile?.availability === "ON_DELIVERY";
  const active = deliveries.filter((d) => !["DELIVERED", "FAILED", "CANCELLED"].includes(d.status)).length;

  const toggleOnline = () => {
    void runAction(online ? "You are offline" : "You are online", () =>
      setRiderAvailability(online ? "OFFLINE" : "ONLINE"),
    ).then(() => refetchProfile());
  };

  const shareLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not available");
      return;
    }
    navigator.geolocation.getCurrentPosition((pos) => {
      void runAction("Location updated", () =>
        updateRiderLocation(pos.coords.latitude, pos.coords.longitude),
      );
    });
  };

  return (
    <div>
      <RiderPageHeader
        title="Courier overview"
        description="Go online, share your location, and monitor active runs."
      />

      <div className="mb-6 flex items-center justify-between rounded-2xl border border-border/60 bg-card p-5">
        <p className="font-semibold">
          {online ? "Online — accepting offers" : "Offline"}
          {profile?.availability === "ON_DELIVERY" && " · On delivery"}
        </p>
        <button
          type="button"
          onClick={toggleOnline}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
            online ? "bg-primary text-primary-foreground" : "border border-border"
          }`}
        >
          <Power className="h-4 w-4" /> {online ? "Go offline" : "Go online"}
        </button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Available balance" value={formatGhs(parseMoney(earnings?.availableBalance ?? "0"))} />
        <Stat label="Active deliveries" value={String(active)} />
        <Stat label="Lifetime earnings" value={formatGhs(parseMoney(earnings?.lifetimeEarnings ?? "0"))} />
      </div>

      <button type="button" onClick={shareLocation} className="text-sm font-medium text-primary hover:underline">
        Update my GPS location
      </button>

      {active > 0 && (
        <p className="mt-6 text-sm text-muted-foreground">
          <Link to="/dashboard/delivery/deliveries" className="font-medium text-primary hover:underline">
            View {active} active deliver{active === 1 ? "y" : "ies"}
          </Link>
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}
