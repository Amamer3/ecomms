import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  CUSTOMER_TRACKER_DEMO_EMAIL,
  getCustomerProfileOrders,
  type DeliveryTracking,
  type GeoPoint,
} from "@/lib/delivery-tracking";
import { formatGhs } from "@/lib/format-money";
import { CustomerJourneyMap } from "@/components/CustomerJourneyMap";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { RequireCustomer } from "@/components/RequireCustomer";
import { useAuth } from "@/context/auth";
import { Bike, Clock, MapPin, Package, Store, Truck, User } from "lucide-react";

export const Route = createFileRoute("/account")({
  component: CustomerAccountPage,
  head: () => ({ meta: [{ title: "My account — Randy's Commerce" }] }),
});

function nudgePoint(p: GeoPoint): GeoPoint {
  return {
    lat: p.lat + (Math.random() - 0.5) * 0.00035,
    lng: p.lng + (Math.random() - 0.5) * 0.00035,
  };
}

function CustomerAccountPage() {
  return (
    <RequireCustomer>
      <CustomerAccountInner />
    </RequireCustomer>
  );
}

function CustomerAccountInner() {
  const { session } = useAuth();
  const email = session?.email ?? "";
  const name = session?.name ?? "";
  const { orders, isDemoSample } = useMemo(
    () => getCustomerProfileOrders(email, name),
    [email, name],
  );

  const [liveCourierById, setLiveCourierById] = useState<Record<string, GeoPoint>>({});

  useEffect(() => {
    const tick = () => {
      setLiveCourierById((prev) => {
        const next = { ...prev };
        for (const o of orders) {
          if (o.status !== "accepted") continue;
          const base = next[o.id] ?? o.courierPoint;
          next[o.id] = nudgePoint(base);
        }
        return next;
      });
    };
    const id = window.setInterval(tick, 5000);
    tick();
    return () => window.clearInterval(id);
  }, [orders]);

  const resolvedOrders = useMemo(
    () =>
      orders.map((o) =>
        o.status === "accepted" && liveCourierById[o.id]
          ? { ...o, courierPoint: liveCourierById[o.id]! }
          : o,
      ),
    [orders, liveCourierById],
  );

  const active = resolvedOrders.filter((o) => o.status === "available" || o.status === "accepted");
  const past = resolvedOrders.filter((o) => o.status === "delivered");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-border/60 pb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Customer</p>
            <h1 className="mt-1 font-display text-3xl font-semibold">Your profile & deliveries</h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Track every step after you pay: the vendor prepares your order, a courier is matched
              (by the vendor or automatically), then you follow live movement on the map to your
              door.
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card px-5 py-4 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <User className="h-6 w-6" />
              </span>
              <div>
                <p className="font-semibold">{name || "Customer"}</p>
                <p className="text-xs text-muted-foreground">{email || "No email on file"}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                to="/shop"
                className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
              >
                Continue shopping
              </Link>
              <Link
                to="/cart"
                className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground"
              >
                Basket
              </Link>
            </div>
          </div>
        </header>

        {isDemoSample && (
          <p className="mt-6 rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-sm text-foreground">
            <strong className="font-medium">Demo tracking:</strong> showing sample orders so you can
            try the map. Sign in with{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              {CUSTOMER_TRACKER_DEMO_EMAIL}
            </code>{" "}
            to load the same three orders as “your” history.
          </p>
        )}

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">How delivery works</h2>
          <ol className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "1",
                title: "You pay",
                body: "Checkout confirms your basket; the vendor gets the order instantly.",
                icon: Package,
              },
              {
                step: "2",
                title: "Vendor prepares",
                body: "They pack at their location. They can assign a courier they trust.",
                icon: Store,
              },
              {
                step: "3",
                title: "Courier match",
                body: "If no courier is chosen, nearby couriers can accept within about one minute.",
                icon: Bike,
              },
              {
                step: "4",
                title: "Live to you",
                body: "Watch pickup → your address on the map with updates along the route.",
                icon: Truck,
              },
            ].map(({ step, title, body, icon: Icon }) => (
              <li
                key={step}
                className="rounded-2xl border border-border/60 bg-card p-4 shadow-[var(--shadow-soft)]"
              >
                <span className="text-xs font-bold text-primary">{step}</span>
                <Icon className="mt-2 h-5 w-5 text-primary" />
                <p className="mt-2 text-sm font-semibold">{title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold">Active deliveries</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Maps update on a short interval while a courier is en route (demo simulation).
          </p>

          {active.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No active deliveries. When you place an order, it will show here with vendor and
              courier on the map.
            </p>
          ) : (
            <ul className="mt-6 space-y-10">
              {active.map((order) => (
                <li key={order.id} className="space-y-4">
                  <OrderHeader order={order} />
                  <DeliveryTimeline order={order} />
                  <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-[var(--shadow-card)]">
                    <div className="border-b border-border/60 px-4 py-3 sm:px-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Live map
                      </p>
                      <p className="text-sm text-foreground">
                        Vendor pickup, courier position, and your drop-off
                        {order.status === "accepted"
                          ? ""
                          : " (route activates once a courier accepts)"}
                        .
                      </p>
                    </div>
                    <div className="h-[min(52vh,420px)] p-3 sm:p-4">
                      <CustomerJourneyMap
                        delivery={order}
                        showLiveRoute={order.status === "accepted"}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-14">
          <h2 className="font-display text-xl font-semibold">Past orders</h2>
          {past.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No completed deliveries yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border/60 rounded-2xl border border-border/60 bg-card">
              {past.map((order) => (
                <li
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5"
                >
                  <div>
                    <p className="font-medium">{order.orderId}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.vendorName} · {order.dropoff}
                    </p>
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    Delivered
                  </span>
                  <p className="w-full text-xs text-muted-foreground sm:w-auto">
                    Courier {order.courier.name} · {formatGhs(order.payout)} est. payout leg
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

function OrderHeader({ order }: { order: DeliveryTracking }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {order.orderId}
        </p>
        <p className="text-lg font-semibold">{order.vendorName}</p>
        <p className="text-sm text-muted-foreground">
          <MapPin className="mr-1 inline h-3.5 w-3.5" />
          {order.customerArea} → {order.dropoff}
        </p>
      </div>
      <StatusBadge status={order.status} />
    </div>
  );
}

function StatusBadge({ status }: { status: DeliveryTracking["status"] }) {
  if (status === "accepted") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
        <Clock className="h-3.5 w-3.5" /> Courier en route
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-900 dark:text-amber-100">
      <Store className="h-3.5 w-3.5" /> Awaiting courier
    </span>
  );
}

function DeliveryTimeline({ order }: { order: DeliveryTracking }) {
  const [poolSeconds, setPoolSeconds] = useState(60);

  useEffect(() => {
    if (order.status !== "available") return;
    const id = window.setInterval(() => {
      setPoolSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [order.status, order.id]);

  const steps: { key: string; label: string; done: boolean; current: boolean; detail?: string }[] =
    order.status === "available"
      ? [
          { key: "pay", label: "Order paid", done: true, current: false },
          { key: "prep", label: "Vendor preparing", done: true, current: false },
          {
            key: "pool",
            label: "Courier matching",
            done: false,
            current: true,
            detail: `Vendor may assign a courier; otherwise nearby couriers can accept within about one minute (demo countdown ${poolSeconds}s).`,
          },
          { key: "transit", label: "Live to your address", done: false, current: false },
        ]
      : [
          { key: "pay", label: "Order paid", done: true, current: false },
          { key: "prep", label: "Vendor preparing", done: true, current: false },
          { key: "accept", label: "Courier accepted", done: true, current: false },
          {
            key: "transit",
            label: "En route to you",
            done: false,
            current: true,
            detail: `ETA about ${order.etaMinutes} min · ${order.courier.name} (${order.courier.vehicle})`,
          },
        ];

  return (
    <ol className="relative space-y-0 border-l-2 border-border/80 pl-6">
      {steps.map((s, i) => (
        <li key={s.key} className={`pb-6 last:pb-0 ${i === 0 ? "-mt-0.5" : ""}`}>
          <span
            className={`absolute -left-[9px] mt-1.5 h-4 w-4 rounded-full border-2 border-background ${
              s.done ? "bg-primary" : s.current ? "bg-amber-500" : "bg-muted"
            }`}
          />
          <p
            className={`text-sm font-semibold ${s.current ? "text-foreground" : "text-muted-foreground"}`}
          >
            {s.label}
          </p>
          {s.detail && <p className="mt-1 text-xs text-muted-foreground">{s.detail}</p>}
        </li>
      ))}
    </ol>
  );
}
