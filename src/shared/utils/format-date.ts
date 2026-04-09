import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns'
import { sr } from 'date-fns/locale'

const defaultLocale = sr

export function formatDate(date: Date | string, formatStr = 'dd.MM.yyyy'): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date

  if (!isValid(parsedDate)) {
    return '—'
  }

  return format(parsedDate, formatStr, { locale: defaultLocale })
}

export function formatDateTime(date: Date | string): string {
  return formatDate(date, 'dd.MM.yyyy HH:mm')
}

export function formatRelative(date: Date | string): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date

  if (!isValid(parsedDate)) {
    return '—'
  }

  return formatDistanceToNow(parsedDate, { addSuffix: true, locale: defaultLocale })
}
