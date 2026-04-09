import type { Column } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/shared/utils'
import { Button } from '../button'

type DataTableColumnHeaderProps<TData, TValue> = {
  column: Column<TData, TValue>
  title: string
  className?: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  // Toggle sorting: unsorted → asc → desc → unsorted
  const handleSort = () => {
    const currentSort = column.getIsSorted()
    if (currentSort === false) {
      column.toggleSorting(false) // Set to asc
    } else if (currentSort === 'asc') {
      column.toggleSorting(true) // Set to desc
    } else {
      column.clearSorting() // Clear sorting
    }
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8"
        onClick={handleSort}
      >
        <span>{title}</span>
        {column.getIsSorted() === 'desc' ? (
          <ArrowDown className="ml-2 size-4" />
        ) : column.getIsSorted() === 'asc' ? (
          <ArrowUp className="ml-2 size-4" />
        ) : (
          <ChevronsUpDown className="text-muted-foreground/70 ml-2 size-4" />
        )}
      </Button>
    </div>
  )
}
