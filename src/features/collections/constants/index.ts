export const PAYMENT_METHOD_CONFIG: Record<
  string,
  { label: string; key: string }
> = {
  BANK_TRANSFER: { label: 'Bankarski prenos', key: 'bankTransfer' },
  CASH: { label: 'Gotovina', key: 'cash' },
  COMPENSATION: { label: 'Kompenzacija', key: 'compensation' },
  FACTORING: { label: 'Faktoring', key: 'factoring' },
  OTHER: { label: 'Ostalo', key: 'other' },
}

export const REMINDER_TYPE_CONFIG: Record<
  string,
  { label: string; key: string; color: string }
> = {
  FIRST: { label: 'Prva opomena', key: 'first', color: 'info' },
  SECOND: { label: 'Druga opomena', key: 'second', color: 'warning' },
  THIRD: { label: 'Treća opomena', key: 'third', color: 'destructive' },
  FINAL: { label: 'Finalna opomena', key: 'final', color: 'destructive' },
  CUSTOM: { label: 'Prilagođena', key: 'custom', color: 'muted' },
}

export const AGING_BUCKET_COLORS: Record<string, string> = {
  '0-30': '#10B981',
  '31-60': '#F59E0B',
  '61-90': '#F97316',
  '90+': '#EF4444',
}

export const SEND_VIA_OPTIONS = ['EMAIL', 'SMS', 'POSTAL'] as const
