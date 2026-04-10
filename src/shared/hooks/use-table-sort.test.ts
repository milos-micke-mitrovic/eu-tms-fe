import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTableSort } from './use-table-sort'

describe('useTableSort', () => {
  it('returns default sort values', () => {
    const { result } = renderHook(() => useTableSort())
    expect(result.current.sortBy).toBe('createdAt')
    expect(result.current.sortDir).toBe('desc')
    expect(result.current.sorting).toEqual([])
  })

  it('accepts custom defaults', () => {
    const { result } = renderHook(() => useTableSort('name', 'asc'))
    expect(result.current.sortBy).toBe('name')
    expect(result.current.sortDir).toBe('asc')
  })

  it('updates sortBy and sortDir when sorting changes', () => {
    const { result } = renderHook(() => useTableSort())

    act(() => {
      result.current.onSortingChange([{ id: 'make', desc: false }])
    })

    expect(result.current.sortBy).toBe('make')
    expect(result.current.sortDir).toBe('asc')
  })

  it('handles desc sorting', () => {
    const { result } = renderHook(() => useTableSort())

    act(() => {
      result.current.onSortingChange([{ id: 'price', desc: true }])
    })

    expect(result.current.sortBy).toBe('price')
    expect(result.current.sortDir).toBe('desc')
  })

  it('returns defaults when sorting cleared', () => {
    const { result } = renderHook(() => useTableSort('createdAt', 'desc'))

    act(() => {
      result.current.onSortingChange([{ id: 'name', desc: false }])
    })
    expect(result.current.sortBy).toBe('name')

    act(() => {
      result.current.onSortingChange([])
    })
    expect(result.current.sortBy).toBe('createdAt')
    expect(result.current.sortDir).toBe('desc')
  })
})
