const ghs = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
const ghsCompact = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  notation: "compact",
  compactDisplay: "short",
  maximumFractionDigits: 1
});
function formatGhs(amount) {
  return ghs.format(amount);
}
function formatGhsCompact(amount) {
  return ghsCompact.format(amount);
}
export {
  formatGhsCompact as a,
  formatGhs as f
};
