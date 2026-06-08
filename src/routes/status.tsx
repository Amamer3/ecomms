import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Activity, Database, RefreshCw, Server } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { AsyncState } from "@/components/AsyncState";
import { getHealth } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/status")({
  component: StatusPage,
  head: () => ({ meta: [{ title: "Platform status — GoMarket" }] }),
});

function StatusPage() {
  const { data, isLoading, isError, error, refetch, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
    refetchInterval: 30_000,
  });

  const checkedAt = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleString() : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Operations</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Platform status</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Live health from the GoMarket API. Useful for verifying connectivity and dependency status.
          </p>
        </header>

        <AsyncState
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={() => void refetch()}
          isRetrying={isFetching && !isLoading}
          loadingMessage="Checking API health…"
          errorTitle="Couldn't reach the API"
        >
          {data && (
            <div className="space-y-6">
              <div
                className={cn(
                  "flex items-center gap-4 rounded-2xl border p-6",
                  data.status === "ok"
                    ? "border-primary/30 bg-primary/5"
                    : "border-destructive/30 bg-destructive/5",
                )}
              >
                <span
                  className={cn(
                    "grid h-12 w-12 place-items-center rounded-xl",
                    data.status === "ok" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive",
                  )}
                >
                  <Activity className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-sm text-muted-foreground">Overall</p>
                  <p className="text-2xl font-semibold capitalize">{data.status}</p>
                  {checkedAt && (
                    <p className="mt-1 text-xs text-muted-foreground">Last checked {checkedAt}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <StatusCard
                  icon={Server}
                  label="Process uptime"
                  value={`${data.uptime.toFixed(1)}s`}
                  ok={data.status === "ok"}
                />
                <StatusCard
                  icon={Database}
                  label="Database"
                  value={data.db}
                  ok={data.db === "up"}
                />
                <StatusCard
                  icon={Database}
                  label="Redis"
                  value={data.redis}
                  ok={data.redis === "up"}
                />
                <StatusCard
                  icon={Activity}
                  label="Timestamp"
                  value={new Date(data.timestamp).toLocaleString()}
                  ok
                />
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => void refetch()}
                  disabled={isFetching}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted/60 disabled:opacity-60"
                >
                  <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
                  Refresh
                </button>
                <a
                  href="https://grocery-marketplace-bk.onrender.com/api/v1/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  API documentation
                </a>
                <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  Back to home
                </Link>
              </div>
            </div>
          )}
        </AsyncState>
      </main>

      <Footer />
    </div>
  );
}

function StatusCard({
  icon: Icon,
  label,
  value,
  ok,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  ok: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase text-muted-foreground">{label}</p>
          <p className="mt-2 text-lg font-semibold">{value}</p>
        </div>
        <span
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
            ok ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive",
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}
