export type PartnerType = 'CLIENT' | 'SUPPLIER' | 'BOTH'

export type Partner = {
  id: number
  name: string
  pib: string | null
  maticniBroj: string | null
  address: string | null
  city: string | null
  country: string | null
  zipCode: string | null
  bankAccount: string | null
  phone: string | null
  email: string | null
  contactPerson: string | null
  partnerType: PartnerType
  notes: string | null
  createdAt: string
  updatedAt: string
}

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

export type PartnerFilter = {
  search?: string
  partnerType?: string
  sortBy?: string
  sortDir?: string
  page?: number
  size?: number
}
