import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Plus, Loader2 } from 'lucide-react'
import { cn } from '@/shared/utils'

type AutocompleteOption = {
  value: string
  label: string
}

type AutocompleteInputProps = {
  value: string
  onChange: (value: string) => void
  options: AutocompleteOption[]
  onSearchChange?: (query: string) => void
  onLabelChange?: (label: string) => void
  placeholder?: string
  creatable?: boolean
  disabled?: boolean
  initialLabel?: string
  loading?: boolean
  debounceMs?: number
  error?: boolean
}

function useDebounce(callback: (value: string) => void, delay: number) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const debouncedFn = useCallback(
    (value: string) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => callback(value), delay)
    },
    [callback, delay]
  )

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return debouncedFn
}

function AutocompleteInput({
  value,
  onChange,
  options,
  onSearchChange,
  onLabelChange,
  placeholder,
  creatable = false,
  disabled = false,
  initialLabel,
  loading = false,
  debounceMs = 300,
  error = false,
}: AutocompleteInputProps) {
  const { t } = useTranslation('common')
  const [inputText, setInputText] = useState('')
  const [selectedLabel, setSelectedLabel] = useState<string | null>(
    initialLabel ?? null
  )
  const [open, setOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [isSearchPending, setIsSearchPending] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const isFocusedRef = useRef(false)

  // Sync selectedLabel when initialLabel changes externally (edit mode / form reset)
  useEffect(() => {
    if (initialLabel !== undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing internal state with external prop
      setSelectedLabel(initialLabel || null)
    }
  }, [initialLabel])

  // When value is cleared externally (form reset), reset internal state
  useEffect(() => {
    if (!value) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing internal state with external prop
      setInputText('')
      setSelectedLabel(null)
    }
  }, [value])

  const debouncedSearch = useDebounce(
    useCallback(
      (text: string) => {
        onSearchChange?.(text)
        setIsSearchPending(false)
      },
      [onSearchChange]
    ),
    debounceMs
  )

  // Reset highlighted index when options change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing keyboard nav state
    setHighlightedIndex(-1)
  }, [options])

  const displayText = selectedLabel !== null ? selectedLabel : inputText

  // Client-side filter to prevent stale cached results from showing
  const filteredOptions =
    inputText.length >= 2
      ? options.filter((o) =>
          o.label.toLowerCase().includes(inputText.trim().toLowerCase())
        )
      : options

  const showCreateOption =
    creatable &&
    inputText.trim().length > 0 &&
    !filteredOptions.some(
      (o) => o.label.toLowerCase() === inputText.trim().toLowerCase()
    )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value
    setInputText(text)
    setSelectedLabel(null)
    if (!text) {
      onChange('')
      onLabelChange?.('')
      setOpen(false)
    } else if (text.length >= 2) {
      // Open immediately with loading state — stays open until blur or selection
      setOpen(true)
    } else {
      setOpen(false)
    }

    if (text.length >= 2) {
      setIsSearchPending(true)
      debouncedSearch(text)
    } else {
      setIsSearchPending(false)
      onSearchChange?.('')
    }
  }

  const handleSelect = (option: AutocompleteOption) => {
    onChange(option.value)
    setSelectedLabel(option.label)
    onLabelChange?.(option.label)
    setInputText('')
    onSearchChange?.('')
    setOpen(false)
  }

  const handleCreate = () => {
    const text = inputText.trim()
    onChange(text)
    onLabelChange?.(text)
    setSelectedLabel(null)
    setOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onChange('')
    onLabelChange?.('')
    setInputText('')
    setSelectedLabel(null)
    onSearchChange?.('')
    setOpen(false)
    inputRef.current?.focus()
  }

  const handleFocus = () => {
    isFocusedRef.current = true
    if (inputText.length >= 2) {
      setOpen(true)
    }
  }

  const handleBlur = () => {
    isFocusedRef.current = false
    // Delay to allow click on suggestion items to register first
    setTimeout(() => {
      if (!isFocusedRef.current) {
        setOpen(false)
      }
    }, 200)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) {
      if (e.key === 'ArrowDown' && inputText.length >= 2) {
        setOpen(true)
      }
      return
    }

    const totalItems = filteredOptions.length + (showCreateOption ? 1 : 0)

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex((prev) => (prev + 1) % totalItems)
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((prev) => (prev <= 0 ? totalItems - 1 : prev - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (
          highlightedIndex >= 0 &&
          highlightedIndex < filteredOptions.length
        ) {
          handleSelect(filteredOptions[highlightedIndex])
        } else if (
          highlightedIndex === filteredOptions.length &&
          showCreateOption
        ) {
          handleCreate()
        }
        break
      case 'Escape':
        setOpen(false)
        break
    }
  }

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-option]')
      items[highlightedIndex]?.scrollIntoView({ block: 'nearest' })
    }
  }, [highlightedIndex])

  const hasValue = selectedLabel !== null || value !== ''
  // Always show dropdown when open — it will display: loading spinner, results, or "no results"
  const showDropdown = open && inputText.length >= 2

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayText}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={error || undefined}
          className={cn(
            'border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
            'placeholder:text-muted-foreground md:text-sm',
            'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
            disabled && 'cursor-not-allowed opacity-50',
            hasValue && 'pr-8'
          )}
        />
        {loading && !hasValue && (
          <Loader2 className="text-muted-foreground absolute top-1/2 right-2.5 size-4 -translate-y-1/2 animate-spin" />
        )}
        {hasValue && !disabled && (
          <button
            type="button"
            onMouseDown={handleClear}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer"
            tabIndex={-1}
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          ref={listRef}
          className="border-border bg-popover absolute top-full right-0 left-0 z-50 mt-1 max-h-48 overflow-y-auto rounded-md border p-1 shadow-md"
        >
          {(isSearchPending || loading) && (
            <div className="text-muted-foreground flex items-center justify-center gap-2 px-2 py-3 text-sm">
              <Loader2 className="size-4 animate-spin" />
            </div>
          )}
          {!isSearchPending &&
            !loading &&
            filteredOptions.length === 0 &&
            !showCreateOption && (
              <div className="text-muted-foreground px-2 py-3 text-center text-sm">
                {t('select.noResults')}
              </div>
            )}
          {!isSearchPending &&
            !loading &&
            filteredOptions.map((option, index) => (
              <button
                key={option.value}
                type="button"
                data-option
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={cn(
                  'flex w-full cursor-pointer items-center truncate rounded-sm px-2 py-1.5 text-left text-sm',
                  highlightedIndex === index
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {option.label}
              </button>
            ))}
          {showCreateOption && (
            <button
              type="button"
              data-option
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleCreate}
              onMouseEnter={() => setHighlightedIndex(options.length)}
              className={cn(
                'text-primary flex w-full cursor-pointer items-center gap-1.5 rounded-sm px-2 py-1.5 text-sm',
                highlightedIndex === options.length
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Plus className="size-3.5 shrink-0" />
              <span className="truncate">Add: {inputText.trim()}</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export {
  AutocompleteInput,
  type AutocompleteInputProps,
  type AutocompleteOption,
}
