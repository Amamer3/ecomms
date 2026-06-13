import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import { listAdminRefunds, processRefunds } from "@/lib/api";
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

export const Route = createFileRoute("/dashboard/admin/settlements/refunds")({
  component: AdminRefundsPage,
  head: () => ({ meta: [{ title: "Refunds — GoMarket Admin" }] }),
});

function AdminRefundsPage() {
  const { runAction } = useAdminAction();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const { data: refunds = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-refunds"],
    queryFn: () => listAdminRefunds({ limit: 100 }),
  });

  const statuses = useMemo(() => {
    const set = new Set(refunds.map((r) => r.status));
    return ["", ...Array.from(set).sort()];
  }, [refunds]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return refunds.filter((r) => {
      if (status && r.status !== status) return false;
      if (!q) return true;
      return [r.id, r.orderId, r.status, r.channel, r.provider].filter(Boolean).join(" ").toLowerCase().includes(q);
    });
  }, [refunds, search, status]);

  const pendingCount = refunds.filter((r) => r.status.toUpperCase().includes("PENDING")).length;
  const pendingTotal = refunds
    .filter((r) => r.status.toUpperCase().includes("PENDING"))
    .reduce((sum, r) => sum + parseMoney(r.amount), 0);

  const onProcess = async () => {
    setProcessing(true);
    try {
      await runAction("Refund scan complete", () => processRefunds());
      setConfirmOpen(false);
      await refetch();
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <AdminActionBar
        title="Refund operations"
        description="Scan rejected or cancelled paid orders and create refund records."
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
          <AdminPrimaryButton type="button" disabled={processing} onClick={() => setConfirmOpen(true)}>
            {processing ? "Scanning…" : "Run refund scan"}
          </AdminPrimaryButton>
        </div>
      </AdminActionBar>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <AdminStat
          label="Total refunds"
          value={String(refunds.length)}
          sub={`${filtered.length} shown`}
          accent="default"
        />
        <AdminStat
          label="Pending"
          value={String(pendingCount)}
          sub={formatGhs(pendingTotal)}
          accent={pendingCount > 0 ? "warning" : "default"}
        />
        <AdminStat
          label="Filtered results"
          value={String(filtered.length)}
          sub={search || status ? "Active filter" : "All records"}
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
              placeholder="Payment ID, order ID…"
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
        loadingMessage="Loading refunds…"
        errorTitle="Couldn't load refunds"
      >
        <AdminDataTable
          title={`${filtered.length} refund${filtered.length === 1 ? "" : "s"}`}
          headers={["Payment ID", "Status", "Amount", "Order", "Created"]}
          emptyMessage={search || status ? "No refunds match this filter" : "No refunds recorded"}
          rows={filtered.map((r) => [
            <AdminMono key="id" title={r.id}>
              {r.id.slice(0, 12)}…
            </AdminMono>,
            <AdminStatusBadge key="status" status={r.status} />,
            <span key="amount" className="font-medium tabular-nums">
              {formatGhs(parseMoney(r.amount))}
            </span>,
            <AdminMono key="order" title={r.orderId}>
              {r.orderId.slice(0, 12)}…
            </AdminMono>,
            r.createdAt ? new Date(r.createdAt).toLocaleString() : "—",
          ])}
        />
      </AsyncState>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Run refund scan?</AlertDialogTitle>
            <AlertDialogDescription>
              This scans rejected or cancelled paid orders and creates refund records for any that qualify.
              Existing refunds are not duplicated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={processing}
              onClick={(e) => {
                e.preventDefault();
                void onProcess();
              }}
            >
              {processing ? "Scanning…" : "Run scan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
