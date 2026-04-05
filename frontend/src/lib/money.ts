const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Parse backend money string safely for charts (avoids float drift for display aggregates). */
export function parseMoneyString(value: string): number {
  const n = Number.parseFloat(value)
  return Number.isFinite(n) ? n : 0
}

export function formatCurrency(amount: number | string): string {
  const n = typeof amount === 'string' ? parseMoneyString(amount) : amount
  return currency.format(n)
}
