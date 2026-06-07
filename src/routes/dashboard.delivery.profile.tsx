import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getRiderProfile, updateRiderProfile } from "@/lib/api";
import { riderInputCls, RiderDetailGrid, RiderPageHeader, useRiderAction } from "@/components/rider/rider-ui";

export const Route = createFileRoute("/dashboard/delivery/profile")({
  component: RiderProfilePage,
  head: () => ({ meta: [{ title: "Courier profile — GoMarket" }] }),
});

function RiderProfilePage() {
  const { runAction } = useRiderAction();
  const [vehicleType, setVehicleType] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["rider-profile"],
    queryFn: getRiderProfile,
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await runAction("Profile updated", () =>
        updateRiderProfile({
          vehicleType: vehicleType.trim() || undefined,
          plateNumber: plateNumber.trim() || undefined,
        }),
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || !profile) {
    return <p className="text-sm text-muted-foreground">Loading profile…</p>;
  }

  return (
    <div className="max-w-lg">
      <RiderPageHeader
        title="Courier profile"
        description="Your rider account and vehicle details."
      />

      <RiderDetailGrid
        rows={[
          { label: "Availability", value: profile.availability },
          {
            label: "Last location",
            value:
              profile.currentLat != null && profile.currentLng != null
                ? `${profile.currentLat.toFixed(4)}, ${profile.currentLng.toFixed(4)}`
                : "—",
          },
          {
            label: "Last seen",
            value: profile.lastSeenAt ? new Date(profile.lastSeenAt).toLocaleString() : "—",
          },
        ]}
      />

      <form
        onSubmit={(e) => void onSubmit(e)}
        className="mt-8 space-y-4 rounded-2xl border border-border/60 bg-card p-6"
      >
        <h3 className="font-semibold">Update details</h3>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Vehicle type</span>
          <input className={riderInputCls} value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Plate number</span>
          <input className={riderInputCls} value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save profile"}
        </button>
      </form>
    </div>
  );
}
