import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { createReview } from "@/lib/api";
import { ApiError } from "@/lib/api/client";
import { RequireCustomer } from "@/components/RequireCustomer";
import { reviewInputCls, ReviewPageHeader, StarRating } from "@/components/reviews/review-ui";

export const Route = createFileRoute("/reviews/new")({
  component: WriteReviewPage,
  head: () => ({ meta: [{ title: "Write a review — GoMarket" }] }),
});

function WriteReviewPage() {
  return (
    <RequireCustomer>
      <WriteReviewForm />
    </RequireCustomer>
  );
}

function WriteReviewForm() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    orderId: "",
    target: "STORE" as "STORE" | "PRODUCT" | "RIDER",
    storeId: "",
    productId: "",
    riderId: "",
    rating: "5",
    comment: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rating = parseInt(form.rating, 10);
    if (!form.orderId.trim() || Number.isNaN(rating) || rating < 1 || rating > 5) {
      toast.error("Enter a delivered order ID and rating between 1 and 5");
      return;
    }
    if (form.target === "STORE" && !form.storeId.trim()) {
      toast.error("Store ID is required for store reviews");
      return;
    }
    if (form.target === "PRODUCT" && !form.productId.trim()) {
      toast.error("Product ID is required for product reviews");
      return;
    }
    if (form.target === "RIDER" && !form.riderId.trim()) {
      toast.error("Rider ID is required for courier reviews");
      return;
    }

    setSubmitting(true);
    try {
      await createReview({
        orderId: form.orderId.trim(),
        target: form.target,
        rating,
        comment: form.comment.trim() || undefined,
        storeId: form.target === "STORE" ? form.storeId.trim() : form.storeId.trim() || undefined,
        productId: form.target === "PRODUCT" ? form.productId.trim() : undefined,
        riderId: form.target === "RIDER" ? form.riderId.trim() : undefined,
      });
      toast.success("Review submitted");
      navigate({ to: "/reviews" });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const ratingNum = parseInt(form.rating, 10) || 0;

  return (
    <div>
      <Link
        to="/reviews"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All reviews
      </Link>

      <ReviewPageHeader
        title="Write a review"
        description="Rate a store, product, or courier from a delivered order."
      />

      <form onSubmit={(e) => void onSubmit(e)} className="space-y-4 rounded-2xl border border-border/60 bg-card p-6">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Delivered order ID</span>
          <input
            className={reviewInputCls}
            value={form.orderId}
            onChange={(e) => setForm((f) => ({ ...f, orderId: e.target.value }))}
            placeholder="Order UUID"
            required
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Review target</span>
          <select
            className={reviewInputCls}
            value={form.target}
            onChange={(e) => setForm((f) => ({ ...f, target: e.target.value as typeof form.target }))}
          >
            <option value="STORE">Store</option>
            <option value="PRODUCT">Product</option>
            <option value="RIDER">Courier</option>
          </select>
        </label>

        {form.target === "STORE" && (
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Store ID</span>
            <input
              className={reviewInputCls}
              value={form.storeId}
              onChange={(e) => setForm((f) => ({ ...f, storeId: e.target.value }))}
              required
            />
          </label>
        )}

        {form.target === "PRODUCT" && (
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Product ID</span>
            <input
              className={reviewInputCls}
              value={form.productId}
              onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
              required
            />
          </label>
        )}

        {form.target === "RIDER" && (
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Rider ID</span>
            <input
              className={reviewInputCls}
              value={form.riderId}
              onChange={(e) => setForm((f) => ({ ...f, riderId: e.target.value }))}
              required
            />
          </label>
        )}

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Rating</span>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={form.rating}
              onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
              className="flex-1"
            />
            <StarRating rating={ratingNum} />
          </div>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Comment (optional)</span>
          <textarea
            className={`${reviewInputCls} min-h-[6rem] resize-y`}
            value={form.comment}
            onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
            placeholder="Share your experience…"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit review"}
        </button>
      </form>
    </div>
  );
}
