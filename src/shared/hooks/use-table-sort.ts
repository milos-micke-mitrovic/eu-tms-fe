import { useState, useCallback } from 'react'
import type { SortingState } from '@tanstack/react-table'

export function useTableSort(defaultSortBy = 'createdAt', defaultSortDir: 'asc' | 'desc' = 'desc') {
  const [sorting, setSorting] = useState<SortingState>([])

  const sortBy = sorting[0]?.id ?? defaultSortBy
  const sortDir = sorting[0]?.desc === false ? 'asc' : sorting[0]?.desc === true ? 'desc' : defaultSortDir

  const onSortingChange = useCallback((newSorting: SortingState) => {
    setSorting(newSorting)
  }, [])

  return { sorting, onSortingChange, sortBy, sortDir }
}
