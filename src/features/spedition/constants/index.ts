import {
  Fuel, Receipt, Utensils, ParkingSquare, ShieldCheck,
  Landmark, Ship, Wrench, Droplets, Phone, AlertTriangle,
  MapPin, MoreHorizontal,
} from 'lucide-react'
import type { ExpenseCategory, RouteStatus, StopType } from '../types'

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; labelKey: string; icon: typeof Fuel }[] = [
  { value: 'FUEL', labelKey: 'spedition:expenses.categories.FUEL', icon: Fuel },
  { value: 'TOLL_DOMESTIC', labelKey: 'spedition:expenses.categories.TOLL_DOMESTIC', icon: Receipt },
  { value: 'TOLL_INTERNATIONAL', labelKey: 'spedition:expenses.categories.TOLL_INTERNATIONAL', icon: Receipt },
  { value: 'PER_DIEM', labelKey: 'spedition:expenses.categories.PER_DIEM', icon: Utensils },
  { value: 'PARKING', labelKey: 'spedition:expenses.categories.PARKING', icon: ParkingSquare },
  { value: 'VIGNETTE', labelKey: 'spedition:expenses.categories.VIGNETTE', icon: ShieldCheck },
  { value: 'CUSTOMS', labelKey: 'spedition:expenses.categories.CUSTOMS', icon: Landmark },
  { value: 'BORDER_FEE', labelKey: 'spedition:expenses.categories.BORDER_FEE', icon: MapPin },
  { value: 'FERRY', labelKey: 'spedition:expenses.categories.FERRY', icon: Ship },
  { value: 'MAINTENANCE', labelKey: 'spedition:expenses.categories.MAINTENANCE', icon: Wrench },
  { value: 'WASH', labelKey: 'spedition:expenses.categories.WASH', icon: Droplets },
  { value: 'PHONE', labelKey: 'spedition:expenses.categories.PHONE', icon: Phone },
  { value: 'FINE', labelKey: 'spedition:expenses.categories.FINE', icon: AlertTriangle },
  { value: 'OTHER', labelKey: 'spedition:expenses.categories.OTHER', icon: MoreHorizontal },
]

export const EXPENSE_CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  FUEL: '#3B82F6',
  TOLL_DOMESTIC: '#8B5CF6',
  TOLL_INTERNATIONAL: '#A855F7',
  PER_DIEM: '#F59E0B',
  PARKING: '#6B7280',
  VIGNETTE: '#10B981',
  CUSTOMS: '#EF4444',
  BORDER_FEE: '#F97316',
  FERRY: '#06B6D4',
  MAINTENANCE: '#EC4899',
  WASH: '#14B8A6',
  PHONE: '#6366F1',
  FINE: '#DC2626',
  OTHER: '#9CA3AF',
}

export const ROUTE_STATUS_COLORS: Record<RouteStatus, string> = {
  CREATED: 'outline',
  DISPATCHED: 'default',
  IN_TRANSIT: 'secondary',
  COMPLETED: 'default',
  INVOICED: 'secondary',
  PAID: 'default',
  CANCELLED: 'destructive',
}

export const STOP_TYPE_COLORS: Record<StopType, string> = {
  LOADING: 'bg-blue-100 text-blue-700',
  UNLOADING: 'bg-green-100 text-green-700',
  BORDER: 'bg-orange-100 text-orange-700',
  CUSTOMS: 'bg-red-100 text-red-700',
  REST: 'bg-gray-100 text-gray-700',
  FUEL: 'bg-amber-100 text-amber-700',
  OTHER: 'bg-slate-100 text-slate-700',
}

export const CURRENCIES = ['RSD', 'EUR', 'USD', 'CHF', 'GBP', 'BAM', 'TRY'] as const

export const COUNTRY_CODES = [
  { code: 'RS', name: 'Srbija' }, { code: 'DE', name: 'Nemačka' }, { code: 'AT', name: 'Austrija' },
  { code: 'IT', name: 'Italija' }, { code: 'FR', name: 'Francuska' }, { code: 'HU', name: 'Mađarska' },
  { code: 'HR', name: 'Hrvatska' }, { code: 'SI', name: 'Slovenija' }, { code: 'BA', name: 'Bosna i Hercegovina' },
  { code: 'ME', name: 'Crna Gora' }, { code: 'MK', name: 'Severna Makedonija' }, { code: 'AL', name: 'Albanija' },
  { code: 'BG', name: 'Bugarska' }, { code: 'RO', name: 'Rumunija' }, { code: 'GR', name: 'Grčka' },
  { code: 'TR', name: 'Turska' }, { code: 'CZ', name: 'Češka' }, { code: 'SK', name: 'Slovačka' },
  { code: 'PL', name: 'Poljska' }, { code: 'NL', name: 'Holandija' }, { code: 'BE', name: 'Belgija' },
  { code: 'LU', name: 'Luksemburg' }, { code: 'CH', name: 'Švajcarska' }, { code: 'ES', name: 'Španija' },
  { code: 'PT', name: 'Portugalija' }, { code: 'GB', name: 'Velika Britanija' }, { code: 'DK', name: 'Danska' },
  { code: 'SE', name: 'Švedska' }, { code: 'NO', name: 'Norveška' }, { code: 'FI', name: 'Finska' },
  { code: 'UA', name: 'Ukrajina' }, { code: 'MD', name: 'Moldavija' }, { code: 'XK', name: 'Kosovo' },
] as const

export const VALID_NEXT_STATUSES: Record<RouteStatus, RouteStatus[]> = {
  CREATED: ['DISPATCHED', 'CANCELLED'],
  DISPATCHED: ['IN_TRANSIT', 'CANCELLED'],
  IN_TRANSIT: ['COMPLETED', 'CANCELLED'],
  COMPLETED: ['INVOICED'],
  INVOICED: ['PAID'],
  PAID: [],
  CANCELLED: [],
}
