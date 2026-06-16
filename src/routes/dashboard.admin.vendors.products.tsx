import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Package, Plus, RefreshCw, Search, Store, X } from "lucide-react";
import { AdminProductDetailSheet } from "@/components/admin/AdminProductDetailSheet";
import { CreateAdminProductDialog } from "@/components/admin/CreateAdminProductDialog";
import { listAdminUsers, listStores } from "@/lib/api";
import type { AdminUser } from "@/lib/api/types";
import { parseMoney } from "@/lib/api/client";
import {
  countProductsByVendor,
  fetchAdminVendorCatalog,
  matchesCatalogSearch,
  productsForVendor,
} from "@/lib/admin-vendor-catalog";
import { AsyncState } from "@/components/AsyncState";
import {
  adminInputCls,
  adminUserDisplayName,
  AdminDataTable,
  AdminEmptyState,
  AdminFilterBar,
  AdminFilterField,
  AdminList,
  AdminListItem,
  AdminPageHeader,
  AdminPagination,
  AdminPrimaryButton,
  AdminStat,
  AdminStatusBadge,
  paginateItems,
} from "@/components/admin/admin-ui";
import { formatGhs } from "@/lib/format-money";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/admin/vendors/products")({
  validateSearch: (search: Record<string, unknown>) => ({
    vendorId: typeof search.vendorId === "string" ? search.vendorId : undefined,
    productId: typeof search.productId === "string" ? search.productId : undefined,
  }),
  component: AdminVendorProductsPage,
  head: () => ({ meta: [{ title: "Vendor products — GoMarket Admin" }] }),
});

const PRODUCT_STATUSES = ["", "ACTIVE", "OUT_OF_STOCK", "ARCHIVED"] as const;
const SEARCH_DEBOUNCE_MS = 400;
const DEFAULT_PAGE_SIZE = 10;

function matchesVendorSearch(user: AdminUser, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const profile = user.vendorProfile;
  const haystack = [
    profile?.businessName,
    profile?.contactName,
    profile?.tier,
    user.email,
    user.phone,
    profile?.id,
    user.id,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

function AdminVendorProductsPage() {
  const { vendorId: searchVendorId, productId: searchProductId } = Route.useSearch();
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [vendorSearch, setVendorSearch] = useState("");
  const [productSearchInput, setProductSearchInput] = useState("");
  const [debouncedProductSearch, setDebouncedProductSearch] = useState("");
  const [status, setStatus] = useState("");
  const [storeId, setStoreId] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    if (searchVendorId) setSelectedVendorId(searchVendorId);
  }, [searchVendorId]);

  useEffect(() => {
    if (searchProductId) setSelectedProductId(searchProductId);
  }, [searchProductId]);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedProductSearch(productSearchInput.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [productSearchInput]);

  useEffect(() => {
    setPage(1);
  }, [selectedVendorId, status, storeId, debouncedProductSearch]);

  const {
    data: catalog = [],
    isLoading: catalogLoading,
    isError: catalogError,
    error: catalogQueryError,
    refetch: refetchCatalog,
    isFetching: catalogFetching,
  } = useQuery({
    queryKey: ["admin-vendor-catalog"],
    queryFn: fetchAdminVendorCatalog,
  });

  const {
    data: vendorData,
    isLoading: vendorsLoading,
    isError: vendorsError,
    error: vendorsQueryError,
    refetch: refetchVendors,
    isFetching: vendorsFetching,
  } = useQuery({
    queryKey: ["admin-vendors-catalog"],
    queryFn: () => listAdminUsers({ role: "VENDOR", limit: 100 }),
  });

  const { data: stores = [] } = useQuery({
    queryKey: ["stores"],
    queryFn: () => listStores({ limit: 100 }),
  });

  const vendors = useMemo(
    () => (vendorData?.items ?? []).filter((user) => user.vendorProfile),
    [vendorData?.items],
  );

  const filteredVendors = useMemo(
    () => vendors.filter((user) => matchesVendorSearch(user, vendorSearch)),
    [vendors, vendorSearch],
  );

  const productCounts = useMemo(
    () => countProductsByVendor(catalog, vendors, stores),
    [catalog, vendors, stores],
  );

  const selectedVendor =
    filteredVendors.find((user) => user.id === selectedVendorId) ??
    vendors.find((user) => user.id === selectedVendorId) ??
    null;

  const vendorProducts = useMemo(() => {
    if (!selectedVendor) return catalog;
    return productsForVendor(catalog, selectedVendor, stores);
  }, [catalog, selectedVendor, stores]);

  const filteredProducts = useMemo(() => {
    return vendorProducts.filter((row) => {
      if (status && row.product.status !== status) return false;
      if (storeId && row.product.storeId !== storeId) return false;
      return matchesCatalogSearch(row, debouncedProductSearch);
    });
  }, [vendorProducts, status, storeId, debouncedProductSearch]);

  const selectedProduct =
    filteredProducts.find((row) => row.product.id === selectedProductId) ??
    catalog.find((row) => row.product.id === selectedProductId) ??
    null;

  const paginatedProducts = useMemo(
    () => paginateItems(filteredProducts, page, pageSize),
    [filteredProducts, page, pageSize],
  );

  const activeCount = filteredProducts.filter((row) => row.product.status === "ACTIVE").length;
  const outOfStockCount = filteredProducts.filter((row) => row.product.status === "OUT_OF_STOCK").length;
  const vendorsWithProducts = useMemo(
    () => vendors.filter((user) => (productCounts.get(user.id) ?? 0) > 0).length,
    [vendors, productCounts],
  );

  const hasProductFilters = Boolean(status || storeId || debouncedProductSearch);
  const isLoading = catalogLoading || vendorsLoading;
  const isError = catalogError || vendorsError;
  const error = catalogQueryError ?? vendorsQueryError;
  const isFetching = catalogFetching || vendorsFetching;

  const refetch = () => {
    void refetchCatalog();
    void refetchVendors();
  };

  const clearProductFilters = () => {
    setStatus("");
    setStoreId("");
    setProductSearchInput("");
    setDebouncedProductSearch("");
    setPage(1);
  };

  return (
    <div>
      <AdminPageHeader
        title="Vendor catalog"
        description="Browse products vendors have listed for customers across the marketplace."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted/40 disabled:opacity-60"
            >
              <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
              Refresh
            </button>
            <AdminPrimaryButton type="button" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> New product
            </AdminPrimaryButton>
          </div>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStat
          label="Listed products"
          value={String(catalog.length)}
          sub={`${filteredProducts.length} shown`}
          icon={Package}
        />
        <AdminStat
          label="Active listings"
          value={String(activeCount)}
          sub={`${outOfStockCount} out of stock`}
          accent="primary"
        />
        <AdminStat
          label="Vendors with products"
          value={String(vendorsWithProducts)}
          sub={`${vendors.length} vendor accounts`}
          icon={Store}
        />
        <AdminStat
          label="Stores"
          value={String(stores.length)}
          sub="Marketplace storefronts"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <AdminFilterBar
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <AdminFilterField label="Search vendors" className="min-w-0 flex-1">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  className={cn(adminInputCls, "pl-9")}
                  value={vendorSearch}
                  onChange={(e) => setVendorSearch(e.target.value)}
                  placeholder="Business, contact, email…"
                  autoComplete="off"
                />
              </div>
            </AdminFilterField>
          </AdminFilterBar>

          <AsyncState
            isLoading={isLoading}
            isError={isError}
            error={error}
            onRetry={() => refetch()}
            isRetrying={isFetching && !isLoading}
            loadingMessage="Loading vendor catalog…"
            errorTitle="Couldn't load vendor catalog"
          >
            <AdminList
              emptyMessage={
                vendorSearch ? "No vendors match this search" : "No vendor accounts found"
              }
            >
              <AdminListItem
                onClick={() => setSelectedVendorId(null)}
                title={
                  <span
                    className={cn(
                      "font-semibold",
                      selectedVendorId === null ? "text-primary" : "text-foreground",
                    )}
                  >
                    All vendors
                  </span>
                }
                meta={`${catalog.length} product${catalog.length === 1 ? "" : "s"} across marketplace`}
              />
              {filteredVendors.map((user) => {
                const count = productCounts.get(user.id) ?? 0;
                const isSelected = selectedVendorId === user.id;
                const profile = user.vendorProfile!;
                return (
                  <AdminListItem
                    key={user.id}
                    onClick={() => setSelectedVendorId(user.id)}
                    title={
                      <span
                        className={cn(
                          "font-semibold",
                          isSelected ? "text-primary" : "text-foreground",
                        )}
                      >
                        {adminUserDisplayName(user)}
                      </span>
                    }
                    badges={
                      <>
                        <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                          {count} product{count === 1 ? "" : "s"}
                        </span>
                        <AdminStatusBadge status={profile.approvalStatus} />
                      </>
                    }
                    meta={
                      <>
                        {profile.storeCount} store{profile.storeCount === 1 ? "" : "s"}
                        {profile.contactName ? ` · ${profile.contactName}` : ""}
                      </>
                    }
                  />
                );
              })}
            </AdminList>
          </AsyncState>
        </div>

        <div className="lg:col-span-3">
          <div className="mb-4 rounded-2xl border border-border/60 bg-card px-5 py-4 shadow-[var(--shadow-soft)]">
            <h2 className="font-semibold text-foreground">
              {selectedVendor ? adminUserDisplayName(selectedVendor) : "All vendor products"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {selectedVendor
                ? `Products listed by ${selectedVendor.vendorProfile?.businessName ?? "this vendor"} for customers.`
                : "Every product currently listed on the marketplace, grouped by vendor and store."}
            </p>
          </div>

          <AdminFilterBar
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <AdminFilterField label="Status" className="min-w-[10rem]">
              <select
                className={adminInputCls}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {PRODUCT_STATUSES.map((value) => (
                  <option key={value || "all"} value={value}>
                    {value ? value.replace(/_/g, " ") : "All statuses"}
                  </option>
                ))}
              </select>
            </AdminFilterField>
            <AdminFilterField label="Store" className="min-w-[12rem]">
              <select
                className={adminInputCls}
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
              >
                <option value="">All stores</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </AdminFilterField>
            <AdminFilterField label="Search products" className="min-w-[14rem] flex-1">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  className={cn(adminInputCls, "pl-9 pr-9")}
                  value={productSearchInput}
                  onChange={(e) => setProductSearchInput(e.target.value)}
                  placeholder="Product, store, vendor…"
                  autoComplete="off"
                />
                {productSearchInput ? (
                  <button
                    type="button"
                    onClick={() => {
                      setProductSearchInput("");
                      setDebouncedProductSearch("");
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </AdminFilterField>
            {hasProductFilters ? (
              <button
                type="button"
                onClick={clearProductFilters}
                className="self-end rounded-full border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
              >
                Clear filters
              </button>
            ) : null}
          </AdminFilterBar>

          <CreateAdminProductDialog
            open={createOpen}
            onOpenChange={setCreateOpen}
            stores={stores}
            vendor={selectedVendor}
            onCreated={() => void refetchCatalog()}
            onViewProduct={(id) => {
              setCreateOpen(false);
              setSelectedProductId(id);
            }}
          />

          <AdminProductDetailSheet
            open={selectedProductId !== null}
            productId={selectedProductId}
            preview={selectedProduct}
            onOpenChange={(open) => {
              if (!open) setSelectedProductId(null);
            }}
            onUpdated={() => void refetchCatalog()}
          />

          <AsyncState
            isLoading={isLoading}
            isError={isError}
            error={error}
            onRetry={() => refetch()}
            isRetrying={isFetching && !isLoading}
            loadingMessage="Loading products…"
            errorTitle="Couldn't load products"
          >
            {filteredProducts.length === 0 ? (
              <AdminEmptyState
                message={
                  hasProductFilters
                    ? "No products match the current filters."
                    : selectedVendor
                      ? "This vendor has no listed products yet."
                      : "No products have been listed on the marketplace yet."
                }
              />
            ) : (
              <AdminDataTable
                title={`${filteredProducts.length} product${filteredProducts.length === 1 ? "" : "s"}`}
                headers={["Product", "Vendor", "Store", "Price", "Stock", "Status", ""]}
                rows={paginatedProducts.map(({ product, store, vendor }) => [
                  <div key={`${product.id}-name`}>
                    <p className="font-medium text-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.unit}</p>
                  </div>,
                  vendor ? (
                    <span key={`${product.id}-vendor`} className="text-sm">
                      {vendor.vendorProfile?.businessName ?? adminUserDisplayName(vendor)}
                    </span>
                  ) : (
                    <span key={`${product.id}-vendor`} className="text-sm text-muted-foreground">
                      Unassigned
                    </span>
                  ),
                  <span key={`${product.id}-store`} className="text-sm">
                    {store.name}
                  </span>,
                  formatGhs(parseMoney(product.price)),
                  String(product.stockQty),
                  <AdminStatusBadge key={`${product.id}-status`} status={product.status} />,
                  <button
                    key={`${product.id}-view`}
                    type="button"
                    onClick={() => setSelectedProductId(product.id)}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Edit
                  </button>,
                ])}
                footer={
                  <AdminPagination
                    page={page}
                    pageSize={pageSize}
                    totalItems={filteredProducts.length}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => {
                      setPageSize(size);
                      setPage(1);
                    }}
                  />
                }
              />
            )}
          </AsyncState>
        </div>
      </div>
    </div>
  );
}
