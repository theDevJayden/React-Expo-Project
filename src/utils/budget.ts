export type BudgetLevel = 'ok' | 'warning' | 'over';

export type BudgetSummary = {
  percent: number;
  level: BudgetLevel;
  remaining: number;
  overBy: number;
  ringFill: number;
};

// 10000000 -> "10.000.000"
export function formatNumber(value: number): string {
  return Math.abs(Math.round(value))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// 10000000 -> "Rp10.000.000"
export function formatRupiah(value: number): string {
  return `Rp${formatNumber(value)}`;
}

// 3200000 -> "+Rp3.200.000", -50000 -> "-Rp50.000"
export function formatSignedRupiah(value: number): string {
  return `${value < 0 ? '-' : '+'}${formatRupiah(value)}`;
}

// Accepts positive whole numbers only. Dots are allowed as thousand
// separators ("10.000.000"). Returns null for anything else.
export function parseBudgetCap(raw: string): number | null {
  const text = raw.trim().replace(/\s/g, '');
  const digits = /^\d{1,3}(\.\d{3})+$/.test(text) ? text.replace(/\./g, '') : text;
  if (!/^\d+$/.test(digits)) return null;
  const value = Number(digits);
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}

// Green up to 75%, amber 76-99%, red at 100% or more (per PRD Feature 4).
// The percentage is floored so it never shows 100% before the cap is reached.
export function getBudgetSummary(spent: number, cap: number): BudgetSummary {
  const percent = Math.floor((spent * 100) / cap);
  const level: BudgetLevel = percent >= 100 ? 'over' : percent > 75 ? 'warning' : 'ok';
  return {
    percent,
    level,
    remaining: cap - spent,
    overBy: Math.max(0, spent - cap),
    ringFill: Math.min(percent, 100) / 100,
  };
}
