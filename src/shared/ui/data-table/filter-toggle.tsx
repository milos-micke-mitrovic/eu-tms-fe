import { useTranslation } from 'react-i18next'
import { SlidersHorizontal } from 'lucide-react'
import { Button } from '../button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '../overlay'

export type FilterConfig = {
  key: string
  labelKey: string // i18n key
}

type FilterToggleProps = {
  filters: FilterConfig[]
  visibleFilters: string[]
  onToggleFilter: (key: string) => void
  namespace?: string
}

export function FilterToggle({
  filters,
  visibleFilters,
  onToggleFilter,
  namespace = 'admin',
}: FilterToggleProps) {
  const { t } = useTranslation(namespace)

  const visibleCount = visibleFilters.length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          {t('filters.toggle')}
          {visibleCount > 0 && (
            <span className="bg-primary text-primary-foreground ml-2 flex h-5 w-5 items-center justify-center rounded-full text-xs">
              {visibleCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        <DropdownMenuLabel>{t('filters.selectFilters')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {filters.map((filter) => (
          <DropdownMenuCheckboxItem
            key={filter.key}
            checked={visibleFilters.includes(filter.key)}
            onCheckedChange={() => onToggleFilter(filter.key)}
          >
            {t(filter.labelKey)}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
