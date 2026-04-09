import type { Table } from '@tanstack/react-table'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { IconButton } from '../button'
import { Select } from '../select'
import { BodySmall } from '../typography'

type DataTablePaginationProps<TData> = {
  table: Table<TData>
  pageSizeOptions?: number[]
  totalCount?: number
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 50, 100],
  totalCount,
}: DataTablePaginationProps<TData>) {
  const { t } = useTranslation('common')
  const { pageIndex, pageSize } = table.getState().pagination
  const pageCount = table.getPageCount()

  // Calculate range
  const total = totalCount ?? table.getFilteredRowModel().rows.length
  const from = total === 0 ? 0 : pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, total)

  // Generate stats text with proper grammar
  const getStatsText = () => {
    if (total === 0) {
      return t('pagination.showingEmpty')
    }
    if (total === 1) {
      return t('pagination.showingSingle')
    }
    return t('pagination.showing', { from, to, total })
  }

  return (
    <div className="flex items-center justify-between gap-2">
      {/* Stats - left side */}
      <BodySmall color="muted" className="shrink-0">
        {getStatsText()}
      </BodySmall>

      {/* Controls - right side */}
      <div className="flex items-center gap-2 sm:gap-6">
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <BodySmall color="muted" className="hidden sm:block">
            {t('pagination.rowsPerPage')}
          </BodySmall>
          <Select
            options={pageSizeOptions.map((size) => ({
              value: String(size),
              label: String(size),
            }))}
            value={String(pageSize)}
            onChange={(value) => table.setPageSize(Number(value))}
            className="w-[70px]"
          />
        </div>

        {/* Page indicator */}
        <BodySmall color="muted" className="hidden sm:block">
          {t('pagination.page', { page: pageIndex + 1, total: pageCount })}
        </BodySmall>

        {/* Navigation buttons */}
        <div className="flex items-center gap-1">
          <IconButton
            variant="outline"
            size="sm"
            className="hidden sm:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            icon={<ChevronsLeft />}
            aria-label={t('pagination.goToFirstPage')}
          />
          <IconButton
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            icon={<ChevronLeft />}
            aria-label={t('pagination.goToPreviousPage')}
          />
          <IconButton
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            icon={<ChevronRight />}
            aria-label={t('pagination.goToNextPage')}
          />
          <IconButton
            variant="outline"
            size="sm"
            className="hidden sm:flex"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
            icon={<ChevronsRight />}
            aria-label={t('pagination.goToLastPage')}
          />
        </div>
      </div>
    </div>
  )
}
