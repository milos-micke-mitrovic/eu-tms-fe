import { useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, X, ImageIcon } from 'lucide-react'
import { cn } from '@/shared/utils'
import { Button, IconButton } from '../button'
import { Caption } from '../typography'

type ImageUploadProps = {
  value?: string | null
  onChange?: (value: string | null) => void
  onFileSelect?: (file: File) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  error?: string
  acceptedFormats?: string[]
  maxSizeMB?: number
  label?: string
  hint?: string
}

const sizeConfig = {
  sm: { container: 'size-12', icon: 'size-5' },
  md: { container: 'size-16', icon: 'size-6' },
  lg: { container: 'size-20', icon: 'size-8' },
}

export function ImageUpload({
  value,
  onChange,
  onFileSelect,
  className,
  size = 'md',
  disabled = false,
  error,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'],
  maxSizeMB = 2,
  label,
  hint,
}: ImageUploadProps) {
  const { t } = useTranslation('common')
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const displayError = error || localError

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click()
    }
  }

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!acceptedFormats.includes(file.type)) {
        return t('imageUpload.invalidFormat', {
          formats: acceptedFormats.map((f) => f.split('/')[1]).join(', '),
        })
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        return t('imageUpload.fileTooLarge', { size: maxSizeMB })
      }
      return null
    },
    [acceptedFormats, maxSizeMB, t]
  )

  const processFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file)
      if (validationError) {
        setLocalError(validationError)
        return
      }

      setLocalError(null)
      onFileSelect?.(file)

      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        onChange?.(reader.result as string)
      }
      reader.readAsDataURL(file)
    },
    [validateFile, onChange, onFileSelect]
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
    // Reset input so same file can be selected again
    e.target.value = ''
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (disabled) return

    const file = e.dataTransfer.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(null)
    setLocalError(null)
  }

  const { container: containerSize, icon: iconSize } = sizeConfig[size]

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-sm leading-none font-medium">{label}</label>
      )}

      <div className="flex items-center gap-4">
        {/* Preview/Upload area */}
        <div className="relative">
          <div
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'flex items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors',
              containerSize,
              disabled
                ? 'border-muted-foreground/20 bg-muted/50 cursor-not-allowed'
                : isDragging
                  ? 'border-primary bg-primary/5 cursor-pointer'
                  : displayError
                    ? 'border-destructive/50 hover:border-destructive cursor-pointer'
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50 cursor-pointer'
            )}
          >
            {value ? (
              <img
                src={value}
                alt={t('imageUpload.imagePreview')}
                className="size-full object-contain p-1"
              />
            ) : (
              <div className="text-muted-foreground flex flex-col items-center justify-center">
                {isDragging ? (
                  <Upload className={iconSize} />
                ) : (
                  <ImageIcon className={iconSize} />
                )}
              </div>
            )}
          </div>
          {value && !disabled && (
            <IconButton
              type="button"
              variant="outline"
              size="xs"
              icon={<X className="size-3" />}
              onClick={handleRemove}
              className="absolute -top-1.5 -right-1.5 size-5 rounded-full shadow-md"
              aria-label={t('imageUpload.removeImage')}
            />
          )}
        </div>

        {/* Upload button */}
        <div className="flex flex-col gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClick}
            disabled={disabled}
            prefixIcon={<Upload />}
          >
            {value ? t('imageUpload.change') : t('imageUpload.upload')}
          </Button>
          {hint && <Caption>{hint}</Caption>}
        </div>

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {displayError && <Caption color="error">{displayError}</Caption>}
    </div>
  )
}
