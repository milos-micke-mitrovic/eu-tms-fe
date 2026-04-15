export type Tenant = {
  id: number
  subdomain: string
  name: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export type TenantRequest = {
  subdomain: string
  name: string
  active?: boolean
}

export type TenantCompany = {
  id: number
  name: string
  pib: string | null
  maticniBroj: string | null
  address: string | null
  city: string | null
  zipCode: string | null
  phone: string | null
  email: string | null
  country: string | null
  createdAt: string
}

export type CreateCompanyRequest = {
  name: string
  pib?: string
  maticniBroj?: string
  address?: string
  city?: string
  zipCode?: string
  phone?: string
  email?: string
  country?: string
}

export type TenantAdmin = {
  id: number
  firstName: string
  lastName: string
  email: string
  role: string
  active: boolean
  companyId: number | null
  companyName: string | null
  createdAt: string
}

export type CreateUserRequest = {
  firstName: string
  lastName: string
  email: string
  password: string
  role: string
  companyId: number
}
