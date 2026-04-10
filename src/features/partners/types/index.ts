// ── Re-export generated types as single source of truth ─────
export type { Partner, PartnerPage } from '@/generated/graphql'

// ── Query result element types ──────────────────────────────
import type { GetPartnersQuery } from '@/generated/graphql'

/** A partner row as returned by the list query */
export type PartnerListItem = GetPartnersQuery['partners']['content'][number]

// ── Union literal types ─────────────────────────────────────
export type PartnerType = 'CLIENT' | 'SUPPLIER' | 'BOTH'

// ── Request types (REST-only) ───────────────────────────────
export type PartnerRequest = {
  name: string
  pib?: string | null
  maticniBroj?: string | null
  address?: string | null
  city?: string | null
  country?: string | null
  zipCode?: string | null
  bankAccount?: string | null
  phone?: string | null
  email?: string | null
  contactPerson?: string | null
  partnerType: PartnerType
  notes?: string | null
}

// ── Filter types ────────────────────────────────────────────
export type PartnerFilter = {
  search?: string
  partnerType?: string
  sortBy?: string
  sortDir?: string
  page?: number
  size?: number
}
