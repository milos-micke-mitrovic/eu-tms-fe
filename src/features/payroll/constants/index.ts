export const PAYROLL_STATUS_CONFIG = {
  DRAFT: { label: 'Nacrt', color: 'muted' as const },
  CONFIRMED: { label: 'Potvrđen', color: 'info' as const },
  PAID: { label: 'Isplaćen', color: 'success' as const },
} as const

export const ADVANCE_TYPE_CONFIG = {
  ADVANCE: { label: 'Akontacija', color: 'warning' as const },
  DEDUCTION: { label: 'Odbitak', color: 'destructive' as const },
  BONUS: { label: 'Bonus', color: 'success' as const },
  FINE: { label: 'Kazna', color: 'destructive' as const },
  LOAN_REPAYMENT: { label: 'Otplata', color: 'muted' as const },
} as const
