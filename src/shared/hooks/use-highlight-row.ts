import { useState, useCallback, useMemo } from 'react'
import { useLocation } from 'react-router-dom'

type HighlightState = {
  id: string | number | null
  name: string | null
}

/**
 * Manages row highlighting from two sources:
 * 1. Navigation state (dashboard → target page) via highlightId or highlightName
 * 2. Closing a detail drawer (returns focus to the row)
 */
export function useHighlightRow(): [
  HighlightState,
  (id: string | number | null) => void,
] {
  const location = useLocation()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const state = location.state as any
  const navId = state?.highlightId ?? null
  const navName = state?.highlightName ?? null

  const [drawerClosedId, setDrawerClosedId] = useState<string | number | null>(
    null
  )

  const highlight = useMemo<HighlightState>(
    () =>
      drawerClosedId != null
        ? { id: drawerClosedId, name: null }
        : { id: navId, name: navName },
    [drawerClosedId, navId, navName]
  )

  const onDrawerClose = useCallback((id: string | number | null) => {
    if (id != null) setDrawerClosedId(id)
  }, [])

  return [highlight, onDrawerClose]
}
