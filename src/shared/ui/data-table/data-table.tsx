import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
} from '@tanstack/react-table'
import { useState, useRef, useEffect, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Inbox, SearchX } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../table'
import { Spinner } from '../spinner'
import { BodySmall, Caption } from '../typography'
import { DataTablePagination } from './data-table-pagination'

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pagination?: boolean
  pageSize?: number
  pageIndex?: number
  pageSizeOptions?: number[]
  manualPagination?: boolean
  pageCount?: number
  totalCount?: number
  onPaginationChange?: (pagination: PaginationState) => void
  manualSorting?: boolean
  sorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void
  loading?: boolean
  isLoading?: boolean
  emptyText?: string
  emptyDescription?: string
  emptyAction?: ReactNode
  isFiltered?: boolean
  onClearFilters?: () => void
  onRowClick?: (row: TData) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination = true,
  pageSize: initialPageSize = 10,
  pageIndex: initialPageIndex = 0,
  pageSizeOptions = [10, 20, 50, 100],
  manualPagination = false,
  pageCount,
  totalCount,
  onPaginationChange,
  manualSorting = false,
  sorting: externalSorting,
  onSortingChange,
  loading = false,
  isLoading = false,
  emptyText,
  emptyDescription,
  emptyAction,
  isFiltered = false,
  onClearFilters,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const { t } = useTranslation('common')
  const resolvedEmptyText = emptyText ?? t('table.noResults')
  const [internalSorting, setInternalSorting] = useState<SortingState>([])
  const sorting = externalSorting ?? internalSorting
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: initialPageIndex,
    pageSize: initialPageSize,
  })

  const isTableLoading = loading || isLoading

  // Keep previous data visible during loading
  const previousDataRef = useRef<TData[]>(data)
  useEffect(() => {
    if (!isTableLoading && data.length > 0) {
      previousDataRef.current = data
    }
  }, [data, isTableLoading])

  // Use previous data while loading, current data otherwise
  const displayData =
    isTableLoading && data.length === 0 ? previousDataRef.current : data

  const table = useReactTable({
    data: displayData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: pagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: !manualSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: (updater) => {
      const newSorting =
        typeof updater === 'function' ? updater(sorting) : updater
      if (!externalSorting) setInternalSorting(newSorting)
      onSortingChange?.(newSorting)
    },
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === 'function' ? updater(paginationState) : updater
      setPaginationState(newPagination)
      onPaginationChange?.(newPagination)
    },
    manualPagination,
    manualSorting,
    pageCount: manualPagination ? pageCount : undefined,
    state: {
      sorting,
      columnFilters,
      pagination: paginationState,
    },
  })

  const showEmptyState = !isTableLoading && !table.getRowModel().rows?.length

  return (
    <div className="flex max-h-full min-h-0 flex-col gap-4">
      <div className="relative min-h-0 overflow-auto rounded-md border">
        <Table>
          <TableHeader className="bg-background sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={
                    onRowClick ? 'hover:bg-muted/50 cursor-pointer' : undefined
                  }
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48" />
              </TableRow>
            )}
          </TableBody>
        </Table>
        {/* Loading overlay with backdrop */}
        {isTableLoading && (
          <div className="bg-background/60 absolute inset-0 top-10 flex items-center justify-center">
            <Spinner />
          </div>
        )}
        {/* Empty state */}
        {showEmptyState && (
          <div className="pointer-events-none absolute inset-0 top-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="bg-muted mb-1 rounded-full p-3">
                {isFiltered ? (
                  <SearchX className="text-muted-foreground size-6" />
                ) : (
                  <Inbox className="text-muted-foreground size-6" />
                )}
              </div>
              <BodySmall className="font-medium">
                {isFiltered ? t('table.noResults') : resolvedEmptyText}
              </BodySmall>
              {!isFiltered && emptyDescription && (
                <Caption className="text-muted-foreground max-w-xs text-center">
                  {emptyDescription}
                </Caption>
              )}
              <div className="pointer-events-auto mt-2">
                {isFiltered && onClearFilters ? (
                  <button
                    onClick={onClearFilters}
                    className="text-primary text-sm font-medium hover:underline"
                  >
                    {t('actions.clear')}
                  </button>
                ) : (
                  emptyAction
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {pagination && (
        <DataTablePagination
          table={table}
          pageSizeOptions={pageSizeOptions}
          totalCount={totalCount}
        />
      )}
    </div>
  )
}
