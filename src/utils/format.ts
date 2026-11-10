/** Thousands separator for lab metrics above 999; plain integers below. */
export function formatScore(value: number): string {
  const n = Math.max(0, Math.round(value));
  if (n < 1000) {
    return String(n);
  }
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** Pocket payout is always shown with one decimal: x3.0 / x1.5 / x1.0 */
export function formatMultiplier(mult: number): string {
  return mult.toFixed(1);
}

export function formatPair(a: number, b: number): string {
  return a + '/' + b;
}

export function percent(part: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round((part / total) * 100)));
}
