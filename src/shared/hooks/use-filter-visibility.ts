import { useState, useCallback, useEffect } from 'react'

const STORAGE_PREFIX = 'filter-visibility-'

type UseFilterVisibilityOptions = {
  storageKey: string
  defaultVisible: string[]
}

export function useFilterVisibility({
  storageKey,
  defaultVisible,
}: UseFilterVisibilityOptions) {
  const fullKey = `${STORAGE_PREFIX}${storageKey}`

  // Initialize from localStorage or use defaults
  const [visibleFilters, setVisibleFilters] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(fullKey)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {
      // Invalid JSON, use defaults
    }
    return defaultVisible
  })

  // Persist to localStorage when visibility changes
  useEffect(() => {
    try {
      localStorage.setItem(fullKey, JSON.stringify(visibleFilters))
    } catch {
      // localStorage might be full or disabled
    }
  }, [fullKey, visibleFilters])

  const toggleFilter = useCallback((filterKey: string) => {
    setVisibleFilters((prev) => {
      if (prev.includes(filterKey)) {
        return prev.filter((key) => key !== filterKey)
      }
      return [...prev, filterKey]
    })
  }, [])

  const isFilterVisible = useCallback(
    (filterKey: string) => visibleFilters.includes(filterKey),
    [visibleFilters]
  )

  const resetToDefaults = useCallback(() => {
    setVisibleFilters(defaultVisible)
  }, [defaultVisible])

  return {
    visibleFilters,
    toggleFilter,
    isFilterVisible,
    resetToDefaults,
  }
}
