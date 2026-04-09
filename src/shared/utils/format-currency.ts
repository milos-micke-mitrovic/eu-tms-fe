const formatters = new Map<string, Intl.NumberFormat>()

function getFormatter(currency: string): Intl.NumberFormat {
  if (!formatters.has(currency)) {
    formatters.set(
      currency,
      new Intl.NumberFormat('sr-RS', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    )
  }
  return formatters.get(currency)!
}

export function formatCurrency(amount: number | string, currency: string = 'EUR'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return '—'
  return getFormatter(currency).format(num)
}

export function formatCurrencyCompact(amount: number | string, currency: string = 'EUR'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return '—'
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M ${currency}`
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K ${currency}`
  }
  return getFormatter(currency).format(num)
}
