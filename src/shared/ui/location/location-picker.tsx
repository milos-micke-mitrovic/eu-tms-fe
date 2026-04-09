import { useState, useCallback, useRef, lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { MapPin, Search, X, Loader2 } from 'lucide-react'
import { cn } from '@/shared/utils'
import { Button, IconButton } from '../button'
import { Input } from '../input'
import { Label } from '../label'
import { Caption, BodySmall } from '../typography'
import { Spinner } from '../spinner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../overlay/dialog'

// Lazy load the map component to reduce initial bundle size
const LazyMapContent = lazy(() => import('./location-picker-map'))

type LatLng = {
  lat: number
  lng: number
}

type LocationPickerProps = {
  /** Current location value (address string) */
  value?: string
  /** Called when location is selected */
  onChange?: (address: string, coordinates?: LatLng) => void
  /** Placeholder text for input */
  placeholder?: string
  /** Label for the input */
  label?: string
  /** Whether the field is required */
  required?: boolean
  /** Error message */
  error?: string
  /** Disabled state */
  disabled?: boolean
  /** Additional class name */
  className?: string
}

type SearchResult = {
  display_name: string
  lat: string
  lon: string
}

export function LocationPicker({
  value,
  onChange,
  placeholder = 'Enter location...',
  label,
  required,
  error,
  disabled,
  className,
}: LocationPickerProps) {
  const { t } = useTranslation('common')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<LatLng | null>(null)
  const [selectedAddress, setSelectedAddress] = useState('')
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Search for addresses using Nominatim
  const searchAddress = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    setHasSearched(false)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      )
      if (!response.ok) {
        throw new Error('Search request failed')
      }
      const data: SearchResult[] = await response.json()
      setSearchResults(data)
      setHasSearched(true)
    } catch (error) {
      console.error('Search failed:', error)
      setSearchResults([])
      setHasSearched(true)
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Debounced search
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchAddress(query)
    }, 300)
  }

  // Reverse geocode to get address from coordinates
  const reverseGeocode = useCallback(async (latlng: LatLng) => {
    setIsReverseGeocoding(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      )
      const data = await response.json()
      if (data.display_name) {
        setSelectedAddress(data.display_name)
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error)
      setSelectedAddress(`${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`)
    } finally {
      setIsReverseGeocoding(false)
    }
  }, [])

  // Handle map click
  const handleMapClick = useCallback(
    (latlng: LatLng) => {
      setSelectedPosition(latlng)
      reverseGeocode(latlng)
      setSearchResults([])
    },
    [reverseGeocode]
  )

  // Handle search result selection
  const handleResultSelect = (result: SearchResult) => {
    const position = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    }
    setSelectedPosition(position)
    setSelectedAddress(result.display_name)
    setSearchResults([])
    setSearchQuery('')
  }

  // Handle confirm
  const handleConfirm = () => {
    if (selectedAddress) {
      onChange?.(selectedAddress, selectedPosition || undefined)
      setDialogOpen(false)
    }
  }

  // Reset state when dialog opens
  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (open) {
      setSearchQuery('')
      setSearchResults([])
      setHasSearched(false)
      setSelectedPosition(null)
      setSelectedAddress(value || '')
    }
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <Label>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <div className="flex gap-2">
        <Input
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setDialogOpen(true)}
          disabled={disabled}
          aria-label={t('locationPicker.pickOnMap')}
        >
          <MapPin className="h-4 w-4" />
        </Button>
      </div>
      {error && <Caption color="error">{error}</Caption>}

      <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('locationPicker.selectLocation')}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search input */}
            <div className="relative" style={{ zIndex: 'var(--z-dropdown)' }}>
              <div className="relative">
                <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder={t('locationPicker.searchPlaceholder')}
                  className="pl-9 pr-9"
                />
                {searchQuery && (
                  <IconButton
                    type="button"
                    variant="ghost"
                    size="xs"
                    icon={<X className="h-3.5 w-3.5" />}
                    onClick={() => {
                      setSearchQuery('')
                      setSearchResults([])
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    aria-label={t('locationPicker.clearSearch')}
                  />
                )}
              </div>

              {/* Search results dropdown */}
              {(searchResults.length > 0 || isSearching || (hasSearched && searchQuery.length >= 3)) && (
                <div className="border-border bg-popover absolute left-0 right-0 top-full mt-1 max-h-[200px] overflow-y-auto rounded-md border shadow-lg" style={{ zIndex: 'var(--z-popover)' }}>
                  {isSearching ? (
                    <Caption color="muted" className="flex items-center gap-2 p-3">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t('locationPicker.searching')}
                    </Caption>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((result, index) => (
                      <button
                        key={index}
                        type="button"
                        className="hover:bg-muted w-full px-3 py-2 text-left text-sm"
                        onClick={() => handleResultSelect(result)}
                      >
                        {result.display_name}
                      </button>
                    ))
                  ) : (
                    <Caption color="muted" className="p-3">
                      {t('locationPicker.noResults')}
                    </Caption>
                  )}
                </div>
              )}
            </div>

            {/* Map - Lazy loaded */}
            <div className="border-border relative h-[350px] overflow-hidden rounded-md border" style={{ zIndex: 1 }}>
              <Suspense
                fallback={
                  <div className="flex h-full items-center justify-center">
                    <Spinner size="lg" />
                  </div>
                }
              >
                <LazyMapContent
                  selectedPosition={selectedPosition}
                  onLocationSelect={handleMapClick}
                />
              </Suspense>
            </div>

            {/* Selected address display */}
            {(selectedAddress || isReverseGeocoding) && (
              <div className="bg-muted rounded-md p-3">
                <Caption className="mb-1">
                  {t('locationPicker.selectedLocation')}
                </Caption>
                {isReverseGeocoding ? (
                  <Caption color="muted" className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('locationPicker.gettingAddress')}
                  </Caption>
                ) : (
                  <BodySmall>{selectedAddress}</BodySmall>
                )}
              </div>
            )}

            <Caption>
              {t('locationPicker.helpText')}
            </Caption>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              {t('actions.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedAddress || isReverseGeocoding}
            >
              {t('locationPicker.confirmLocation')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
