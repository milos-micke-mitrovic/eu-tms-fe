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
