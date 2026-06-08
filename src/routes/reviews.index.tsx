import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listReviews } from "@/lib/api";
import { AsyncState } from "@/components/AsyncState";
import { reviewInputCls, ReviewList, ReviewPageHeader } from "@/components/reviews/review-ui";

export const Route = createFileRoute("/reviews/")({
  component: ReviewsListPage,
  head: () => ({ meta: [{ title: "Reviews — GoMarket" }] }),
});

function ReviewsListPage() {
  const [storeId, setStoreId] = useState("");
  const [productId, setProductId] = useState("");
  const [riderId, setRiderId] = useState("");
  const [applied, setApplied] = useState<{ storeId?: string; productId?: string; riderId?: string }>({});

  const { data: reviews = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["reviews", applied],
    queryFn: () =>
      listReviews({
        storeId: applied.storeId,
        productId: applied.productId,
        riderId: applied.riderId,
        limit: 50,
      }),
  });

  const onFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setApplied({
      storeId: storeId.trim() || undefined,
      productId: productId.trim() || undefined,
      riderId: riderId.trim() || undefined,
    });
    void refetch();
  };

  return (
    <div>
      <ReviewPageHeader
        title="Browse reviews"
        description="Read customer ratings for stores, products, or couriers."
      />

      <form
        onSubmit={onFilter}
        className="mb-8 grid gap-4 rounded-2xl border border-border/60 bg-card p-6 sm:grid-cols-3"
      >
        <label className="block sm:col-span-1">
          <span className="mb-1.5 block text-xs font-medium">Store ID</span>
          <input
            className={reviewInputCls}
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            placeholder="Filter by store"
          />
        </label>
        <label className="block sm:col-span-1">
          <span className="mb-1.5 block text-xs font-medium">Product ID</span>
          <input
            className={reviewInputCls}
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="Filter by product"
          />
        </label>
        <label className="block sm:col-span-1">
          <span className="mb-1.5 block text-xs font-medium">Rider ID</span>
          <input
            className={reviewInputCls}
            value={riderId}
            onChange={(e) => setRiderId(e.target.value)}
            placeholder="Filter by courier"
          />
        </label>
        <button
          type="submit"
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground sm:col-span-3"
        >
          Apply filters
        </button>
      </form>

      <AsyncState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => void refetch()}
        isRetrying={isFetching && !isLoading}
        loadingMessage="Loading reviews…"
        errorTitle="Couldn't load reviews"
      >
        <ReviewList reviews={reviews} />
      </AsyncState>
    </div>
  );
}
