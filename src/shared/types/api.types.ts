// Spring Boot Page response format
export type PageResponse<T> = {
  content: T[]
  totalPages: number
  totalElements: number
  size: number
  number: number // 0-based page index
  first: boolean
  last: boolean
  empty: boolean
}

// Pagination params for Spring Boot
export type PageParams = {
  page?: number // 0-based
  size?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}

export type SortDirection = 'asc' | 'desc'
