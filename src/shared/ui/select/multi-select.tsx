'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, ChevronDown, X } from 'lucide-react'

import { cn } from '@/shared/utils'
import { Label } from '../label'
import { Badge } from '../badge'
import { Caption, BodySmall } from '../typography'
import { Popover, PopoverContent, PopoverTrigger } from '../overlay/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../overlay/command'

type Option = {
  value: string
  label: string
  disabled?: boolean
}

type MultiSelectProps = {
  label?: string
  helperText?: string
  error?: string
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  options: Option[]
  value?: string[]
  onChange?: (value: string[]) => void
  disabled?: boolean
  searchable?: boolean
  clearable?: boolean
  name?: string
  id?: string
  className?: string
  maxDisplay?: number
}

function MultiSelect({
  label,
  helperText,
  error,
  placeholder,
  searchPlaceholder,
  emptyText,
  options,
  value = [],
  onChange,
  disabled,
  searchable = true,
  clearable = true,
  name,
  id,
  className,
  maxDisplay = 3,
}: MultiSelectProps) {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const selectId = id || name

  const resolvedPlaceholder = placeholder ?? t('select.placeholder')
  const resolvedSearchPlaceholder = searchPlaceholder ?? t('select.searchPlaceholder')
  const resolvedEmptyText = emptyText ?? t('select.noResults')

  const selectedOptions = options.filter((opt) => value.includes(opt.value))
  const showClearButton = clearable && value.length > 0 && !disabled

  const handleSelect = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue]
    onChange?.(newValue)
  }

  const handleRemove = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(value.filter((v) => v !== optionValue))
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.([])
  }

  const selectElement = (
    <Popover open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) setSearch('')
      }}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={selectId}
          role="combobox"
          aria-expanded={open}
          aria-invalid={!!error}
          disabled={disabled}
          className={cn(
            'border-input flex min-h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-1.5 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
            'data-[state=open]:border-ring data-[state=open]:ring-ring/50 data-[state=open]:ring-[3px]',
            error && 'border-destructive ring-destructive/20'
          )}
        >
          <div className="flex flex-1 flex-wrap gap-1">
            {selectedOptions.length === 0 && (
              <BodySmall as="span" color="muted">{resolvedPlaceholder}</BodySmall>
            )}
            {selectedOptions.slice(0, maxDisplay).map((option) => (
              <Badge
                key={option.value}
                variant="secondary"
                className="gap-1 pr-0.5"
              >
                <BodySmall as="span" truncate>{option.label}</BodySmall>
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={t('select.remove', { label: option.label })}
                  onClick={(e) => handleRemove(option.value, e)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleRemove(option.value, e as unknown as React.MouseEvent)
                    }
                  }}
                  className="hover:bg-muted flex size-4 items-center justify-center rounded-sm"
                >
                  <X className="size-3" />
                </span>
              </Badge>
            ))}
            {selectedOptions.length > maxDisplay && (
              <Badge variant="secondary">
                +{selectedOptions.length - maxDisplay}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {showClearButton && (
              <span
                role="button"
                tabIndex={0}
                aria-label={t('select.clearAll')}
                onClick={handleClear}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleClear(e as unknown as React.MouseEvent)
                  }
                }}
                className="text-muted-foreground hover:text-foreground flex items-center justify-center rounded-sm"
              >
                <X className="size-4" />
              </span>
            )}
            <ChevronDown className="size-4 shrink-0 opacity-50" />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="!w-[var(--radix-popover-trigger-width)] p-0"
      >
        <Command>
          {searchable && (
            <CommandInput
              placeholder={resolvedSearchPlaceholder}
              className="h-9"
              value={search}
              onValueChange={setSearch}
            />
          )}
          <CommandList>
            <CommandEmpty>{resolvedEmptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  disabled={option.disabled}
                  onSelect={() => handleSelect(option.value)}
                >
                  <div
                    className={cn(
                      'mr-2 flex size-4 items-center justify-center rounded-sm border',
                      value.includes(option.value)
                        ? 'border-primary bg-primary'
                        : 'border-input opacity-50'
                    )}
                  >
                    {value.includes(option.value) && (
                      <Check className="size-3 text-white" />
                    )}
                  </div>
                  <BodySmall as="span" truncate>{option.label}</BodySmall>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )

  // If no form field props, return just the select
  if (!label && !helperText && !error) {
    return <div className={className}>{selectElement}</div>
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <Label htmlFor={selectId} className={cn(error && 'text-destructive')}>
          {label}
        </Label>
      )}

      {selectElement}

      {error && (
        <Caption id={`${selectId}-error`} color="error">
          {error}
        </Caption>
      )}

      {helperText && !error && (
        <Caption id={`${selectId}-helper`}>{helperText}</Caption>
      )}
    </div>
  )
}

export { MultiSelect, type Option as MultiSelectOption }
