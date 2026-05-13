const ghs = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const ghsCompact = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  notation: "compact",
  compactDisplay: "short",
  maximumFractionDigits: 1,
});

/** Format an amount in Ghana Cedis (GHS). */
export function formatGhs(amount: number): string {
  return ghs.format(amount);
}

/** Compact GHS for large headline figures (e.g. GMV). */
export function formatGhsCompact(amount: number): string {
  return ghsCompact.format(amount);
}
