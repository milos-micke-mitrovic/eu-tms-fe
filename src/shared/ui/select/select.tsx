'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, ChevronDown, X, Plus } from 'lucide-react'

import { cn } from '@/shared/utils'
import { Label } from '../label'
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
import { Tooltip, TooltipContent, TooltipTrigger } from '../overlay/tooltip'

type Option = {
  value: string
  label: string
  disabled?: boolean
}

type SelectProps = {
  label?: string
  helperText?: string
  error?: string
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  options: Option[]
  value?: string
  onChange?: (value: string) => void
  onSearchChange?: (value: string) => void
  disabled?: boolean
  searchable?: boolean
  clearable?: boolean
  /** Allow users to type and create custom values */
  creatable?: boolean
  name?: string
  id?: string
  className?: string
}

function Select({
  label,
  helperText,
  error,
  placeholder,
  searchPlaceholder,
  emptyText,
  options,
  value,
  onChange,
  onSearchChange,
  disabled,
  searchable = false,
  clearable = false,
  creatable = false,
  name,
  id,
  className,
}: SelectProps) {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const resolvedPlaceholder = placeholder ?? t('select.placeholder')
  const resolvedSearchPlaceholder =
    searchPlaceholder ?? t('select.searchPlaceholder')
  const resolvedEmptyText = emptyText ?? t('select.noResults')
  const selectId = id || name

  // For creatable, also check if value matches a custom typed value
  const selectedOption = options.find((opt) => opt.value === value)
  const displayLabel =
    selectedOption?.label || (value && creatable ? value : undefined)
  const showClearButton = clearable && value && !disabled

  // Check if search value matches any existing option (case-insensitive)
  const searchMatchesOption = options.some(
    (opt) =>
      opt.label.toLowerCase() === searchValue.toLowerCase() ||
      opt.value.toLowerCase() === searchValue.toLowerCase()
  )
  const showCreateValueOption =
    isCreating && searchValue.trim() && !searchMatchesOption

  // Reset creating mode when popover closes
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setIsCreating(false)
      setSearchValue('')
    }
  }

  const selectElement = (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={selectId}
          role="combobox"
          aria-expanded={open}
          aria-invalid={!!error}
          disabled={disabled}
          className={cn(
            'border-input flex h-9 w-full min-w-0 cursor-pointer items-center justify-between gap-2 overflow-hidden rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
            'data-[state=open]:border-ring data-[state=open]:ring-ring/50 data-[state=open]:ring-[3px]',
            error && 'border-destructive ring-destructive/20',
            !selectedOption && 'text-muted-foreground'
          )}
        >
          {displayLabel ? (
            <Tooltip delayDuration={500}>
              <TooltipTrigger asChild onClick={(e) => e.preventDefault()}>
                <span className="min-w-0 truncate text-sm">{displayLabel}</span>
              </TooltipTrigger>
              <TooltipContent>{displayLabel}</TooltipContent>
            </Tooltip>
          ) : (
            <BodySmall as="span" truncate className="min-w-0">
              {resolvedPlaceholder}
            </BodySmall>
          )}
          <div className="flex items-center gap-1">
            {showClearButton && (
              <span
                role="button"
                tabIndex={-1}
                aria-label={t('select.clearSelection')}
                onClick={(e) => {
                  e.stopPropagation()
                  onChange?.('')
                }}
                className="text-muted-foreground hover:text-foreground inline-flex size-5 items-center justify-center rounded-sm"
              >
                <X className="size-3" />
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
        <Command shouldFilter={!isCreating}>
          {(searchable || isCreating) && (
            <CommandInput
              placeholder={
                isCreating
                  ? t('select.typeCustomValue')
                  : resolvedSearchPlaceholder
              }
              className="h-9"
              value={searchValue}
              onValueChange={(v) => {
                setSearchValue(v)
                onSearchChange?.(v)
              }}
              autoFocus={isCreating}
            />
          )}
          <CommandList>
            {!showCreateValueOption && !isCreating && (
              <CommandEmpty>{resolvedEmptyText}</CommandEmpty>
            )}
            {isCreating && !showCreateValueOption && (
              <CommandEmpty>{t('select.typeToCreate')}</CommandEmpty>
            )}
            <CommandGroup>
              {showCreateValueOption && (
                <CommandItem
                  value={searchValue}
                  onSelect={() => {
                    onChange?.(searchValue.trim())
                    setSearchValue('')
                    setIsCreating(false)
                    setOpen(false)
                  }}
                  className="text-primary"
                >
                  <Plus className="mr-2 size-4" />
                  <BodySmall as="span">
                    {t('select.create', { value: searchValue.trim() })}
                  </BodySmall>
                </CommandItem>
              )}
              {!isCreating &&
                options
                  .filter(
                    (option) =>
                      !searchable ||
                      !searchValue ||
                      option.label
                        .toLowerCase()
                        .includes(searchValue.toLowerCase())
                  )
                  .map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      disabled={option.disabled}
                      onSelect={() => {
                        onChange?.(option.value)
                        setSearchValue('')
                        setOpen(false)
                      }}
                      title={option.label}
                    >
                      <BodySmall as="span" truncate>
                        {option.label}
                      </BodySmall>
                      {value === option.value && (
                        <Check className="ml-auto size-4" />
                      )}
                    </CommandItem>
                  ))}
              {creatable && !isCreating && (
                <CommandItem
                  value="__create_new__"
                  onSelect={() => setIsCreating(true)}
                  className="text-primary"
                >
                  <Plus className="mr-2 size-4" />
                  <BodySmall as="span">{t('select.createNew')}</BodySmall>
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )

  // If no form field props, return just the select
  if (!label && !helperText && !error) {
    return <div className={cn('min-w-0', className)}>{selectElement}</div>
  }

  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
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

export { Select, type Option as SelectOption }
