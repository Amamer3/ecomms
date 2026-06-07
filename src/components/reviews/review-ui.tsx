import type { ReactNode } from "react";

export const reviewInputCls =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export function ReviewPageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <header className="mb-8">
      <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
    </header>
  );
}

export function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5 text-amber-500" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? "opacity-100" : "opacity-25"}>
          ★
        </span>
      ))}
    </span>
  );
}

export function ReviewTargetBadge({ target }: { target: string }) {
  return (
    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium uppercase">{target}</span>
  );
}

export function ReviewList({ reviews }: { reviews: { id: string; target: string; rating: number; comment?: string | null; createdAt: string }[] }) {
  if (reviews.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
        No reviews match these filters.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
      {reviews.map((r) => (
        <li key={r.id} className="px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <ReviewTargetBadge target={r.target} />
            <StarRating rating={r.rating} />
          </div>
          {r.comment && <p className="mt-2 text-sm text-foreground">{r.comment}</p>}
          <p className="mt-2 text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</p>
        </li>
      ))}
    </ul>
  );
}

export function ReviewDetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
