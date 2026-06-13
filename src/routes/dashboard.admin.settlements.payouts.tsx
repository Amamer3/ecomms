import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import { listAdminPayouts, runAdminPayouts } from "@/lib/api";
import { parseMoney } from "@/lib/api/client";
import { AsyncState } from "@/components/AsyncState";
import {
  adminInputCls,
  AdminActionBar,
  AdminDataTable,
  AdminFilterBar,
  AdminFilterField,
  AdminMono,
  AdminPrimaryButton,
  AdminStat,
  AdminStatusBadge,
  useAdminAction,
} from "@/components/admin/admin-ui";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatGhs } from "@/lib/format-money";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/admin/settlements/payouts")({
  component: AdminPayoutsPage,
  head: () => ({ meta: [{ title: "Payouts — GoMarket Admin" }] }),
});

function AdminPayoutsPage() {
  const { runAction } = useAdminAction();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [running, setRunning] = useState(false);

  const { data: payouts = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-payouts"],
    queryFn: () => listAdminPayouts({ limit: 100 }),
  });

  const statuses = useMemo(() => {
    const set = new Set(payouts.map((p) => p.status));
    return ["", ...Array.from(set).sort()];
  }, [payouts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return payouts.filter((p) => {
      if (status && p.status !== status) return false;
      if (!q) return true;
      return [p.id, p.status, p.currency].filter(Boolean).join(" ").toLowerCase().includes(q);
    });
  }, [payouts, search, status]);

  const pendingCount = payouts.filter((p) => p.status.toUpperCase().includes("PENDING")).length;
  const totalAmount = filtered.reduce((sum, p) => sum + parseMoney(p.totalAmount), 0);

  const onRun = async () => {
    setRunning(true);
    try {
      await runAction("Payout runs created", () => runAdminPayouts());
      setConfirmOpen(false);
      await refetch();
    } finally {
      setRunning(false);
    }
  };

  return (
    <div>
      <AdminActionBar
        title="Payout runs"
        description="Creates vendor and courier payouts from pending settlement ledger entries."
      >
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/40 disabled:opacity-60"
          >
            <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
            Refresh
          </button>
          <AdminPrimaryButton type="button" disabled={running} onClick={() => setConfirmOpen(true)}>
            {running ? "Running…" : "Run payouts"}
          </AdminPrimaryButton>
        </div>
      </AdminActionBar>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <AdminStat label="Total runs" value={String(payouts.length)} sub={`${filtered.length} shown`} />
        <AdminStat
          label="Pending"
          value={String(pendingCount)}
          sub="In progress or queued"
          accent={pendingCount > 0 ? "warning" : "default"}
        />
        <AdminStat
          label="Filtered total"
          value={formatGhs(totalAmount)}
          sub={search || status ? "Matching runs" : "All visible runs"}
        />
      </div>

      <AdminFilterBar
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <AdminFilterField label="Status" className="min-w-[10rem]">
          <select className={adminInputCls} value={status} onChange={(e) => setStatus(e.target.value)}>
            {statuses.map((s) => (
              <option key={s || "all"} value={s}>
                {s ? s.replace(/_/g, " ") : "All statuses"}
              </option>
            ))}
          </select>
        </AdminFilterField>
        <AdminFilterField label="Search" className="min-w-[14rem] flex-1">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className={cn(adminInputCls, "pl-9")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Run ID, status…"
              autoComplete="off"
            />
          </div>
        </AdminFilterField>
      </AdminFilterBar>

      <AsyncState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isRetrying={isFetching && !isLoading}
        loadingMessage="Loading payouts…"
        errorTitle="Couldn't load payouts"
      >
        <AdminDataTable
          title={`${filtered.length} payout run${filtered.length === 1 ? "" : "s"}`}
          headers={["Run ID", "Status", "Amount", "Currency", "Created", "Completed"]}
          emptyMessage={search || status ? "No payout runs match this filter" : "No payout runs yet"}
          rows={filtered.map((p) => [
            <AdminMono key="id" title={p.id}>
              {p.id.slice(0, 12)}…
            </AdminMono>,
            <AdminStatusBadge key="status" status={p.status} />,
            <span key="amount" className="font-medium tabular-nums">
              {formatGhs(parseMoney(p.totalAmount))}
            </span>,
            p.currency,
            new Date(p.createdAt).toLocaleString(),
            p.completedAt ? new Date(p.completedAt).toLocaleString() : "—",
          ])}
        />
      </AsyncState>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Run payouts?</AlertDialogTitle>
            <AlertDialogDescription>
              This creates vendor and courier payout runs from pending settlement ledger entries. Ensure
              refunds are processed and ledger entries are generated first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={running}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={running}
              onClick={(e) => {
                e.preventDefault();
                void onRun();
              }}
            >
              {running ? "Running…" : "Run payouts"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
