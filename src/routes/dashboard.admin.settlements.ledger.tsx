import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import { generateLedger, listAdminLedger } from "@/lib/api";
import { parseMoney } from "@/lib/api/client";
import { AsyncState } from "@/components/AsyncState";
import {
  adminInputCls,
  AdminActionBar,
  AdminDataTable,
  AdminFilterBar,
  AdminFilterField,
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

export const Route = createFileRoute("/dashboard/admin/settlements/ledger")({
  component: AdminLedgerPage,
  head: () => ({ meta: [{ title: "Ledger — GoMarket Admin" }] }),
});

function AdminLedgerPage() {
  const { runAction } = useAdminAction();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  const { data: entries = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-ledger"],
    queryFn: () => listAdminLedger({ limit: 100 }),
  });

  const statuses = useMemo(() => {
    const set = new Set(entries.map((e) => e.status));
    return ["", ...Array.from(set).sort()];
  }, [entries]);

  const types = useMemo(() => {
    const set = new Set(entries.map((e) => e.type));
    return ["", ...Array.from(set).sort()];
  }, [entries]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter((e) => {
      if (status && e.status !== status) return false;
      if (type && e.type !== type) return false;
      if (!q) return true;
      return [e.id, e.type, e.status, e.description].filter(Boolean).join(" ").toLowerCase().includes(q);
    });
  }, [entries, search, status, type]);

  const pendingCount = entries.filter((e) => e.status.toUpperCase().includes("PENDING")).length;
  const totalAmount = filtered.reduce((sum, e) => sum + parseMoney(e.amount), 0);

  const onGenerate = async () => {
    setGenerating(true);
    try {
      await runAction("Ledger entries generated", () => generateLedger());
      setConfirmOpen(false);
      await refetch();
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <AdminActionBar
        title="Ledger generation"
        description="Creates settlement ledger entries for completed paid orders."
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
          <AdminPrimaryButton type="button" disabled={generating} onClick={() => setConfirmOpen(true)}>
            {generating ? "Generating…" : "Generate entries"}
          </AdminPrimaryButton>
        </div>
      </AdminActionBar>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <AdminStat label="Total entries" value={String(entries.length)} sub={`${filtered.length} shown`} />
        <AdminStat
          label="Pending"
          value={String(pendingCount)}
          sub="Ready for payout runs"
          accent={pendingCount > 0 ? "warning" : "default"}
        />
        <AdminStat
          label="Filtered total"
          value={formatGhs(totalAmount)}
          sub={search || status || type ? "Matching entries" : "All visible entries"}
        />
      </div>

      <AdminFilterBar
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <AdminFilterField label="Type" className="min-w-[10rem]">
          <select className={adminInputCls} value={type} onChange={(e) => setType(e.target.value)}>
            {types.map((t) => (
              <option key={t || "all"} value={t}>
                {t ? t.replace(/_/g, " ") : "All types"}
              </option>
            ))}
          </select>
        </AdminFilterField>
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
              placeholder="Type, description, ID…"
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
        loadingMessage="Loading ledger…"
        errorTitle="Couldn't load ledger"
      >
        <AdminDataTable
          title={`${filtered.length} entr${filtered.length === 1 ? "y" : "ies"}`}
          headers={["Type", "Status", "Amount", "Description", "Created"]}
          emptyMessage={search || status || type ? "No entries match this filter" : "No ledger entries yet"}
          rows={filtered.map((e) => [
            <span key="type" className="font-medium">
              {e.type.replace(/_/g, " ")}
            </span>,
            <AdminStatusBadge key="status" status={e.status} />,
            <span key="amount" className="font-medium tabular-nums">
              {formatGhs(parseMoney(e.amount))}
            </span>,
            e.description ?? "—",
            new Date(e.createdAt).toLocaleString(),
          ])}
        />
      </AsyncState>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Generate ledger entries?</AlertDialogTitle>
            <AlertDialogDescription>
              This creates settlement ledger entries for completed paid orders that do not have entries yet.
              Run this after refunds are up to date.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={generating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={generating}
              onClick={(e) => {
                e.preventDefault();
                void onGenerate();
              }}
            >
              {generating ? "Generating…" : "Generate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
