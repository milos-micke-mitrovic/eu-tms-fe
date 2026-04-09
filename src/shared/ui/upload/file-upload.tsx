import { useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, X, FileText, AlertCircle } from 'lucide-react'
import { cn } from '@/shared/utils'
import { Button, IconButton } from '../button'
import { Caption } from '../typography'
import { Spinner } from '../spinner'
import { Tooltip, TooltipContent, TooltipTrigger } from '../overlay/tooltip'

type FileUploadProps = {
  /** Current file name(s) to display */
  fileName?: string | string[] | null
  /** Called when file(s) are selected */
  onFileSelect?: (files: File | File[]) => void
  /** Called when file is removed (index for multiple) */
  onRemove?: (index?: number) => void
  /** Whether file is being uploaded */
  loading?: boolean
  /** Additional class name */
  className?: string
  /** Disable the component */
  disabled?: boolean
  /** Error message */
  error?: string
  /** Accepted file formats */
  accept?: string
  /** Max file size in MB */
  maxSizeMB?: number
  /** Label for the upload button */
  buttonLabel?: string
  /** Hint text */
  hint?: string
  /** Variant - compact is inline, default is boxed */
  variant?: 'default' | 'compact'
  /** Allow multiple file selection */
  multiple?: boolean
  /** Max number of files (when multiple is true) */
  maxFiles?: number
}

export function FileUpload({
  fileName,
  onFileSelect,
  onRemove,
  loading = false,
  className,
  disabled = false,
  error,
  accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx',
  maxSizeMB = 10,
  buttonLabel,
  hint,
  variant = 'default',
  multiple = false,
  maxFiles = 10,
}: FileUploadProps) {
  const { t } = useTranslation('common')
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const displayError = error || localError

  // Normalize fileName to array for easier handling
  const fileNames = fileName
    ? Array.isArray(fileName)
      ? fileName
      : [fileName]
    : []

  const handleClick = () => {
    if (!disabled && !loading) {
      inputRef.current?.click()
    }
  }

  const validateFile = useCallback(
    (file: File): string | null => {
      if (file.size > maxSizeMB * 1024 * 1024) {
        return t('fileUpload.fileTooLarge', { size: maxSizeMB })
      }
      return null
    },
    [maxSizeMB, t]
  )

  const processFiles = useCallback(
    (files: File[]) => {
      if (files.length === 0) return

      // Check max files limit
      if (multiple && files.length > maxFiles) {
        setLocalError(t('fileUpload.maxFilesAllowed', { count: maxFiles }))
        return
      }

      // Validate all files
      for (const file of files) {
        const validationError = validateFile(file)
        if (validationError) {
          setLocalError(validationError)
          return
        }
      }

      setLocalError(null)
      if (multiple) {
        onFileSelect?.(files)
      } else {
        onFileSelect?.(files[0])
      }
    },
    [validateFile, onFileSelect, multiple, maxFiles, t]
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processFiles(Array.from(files))
    }
    // Reset input so same file can be selected again
    e.target.value = ''
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled && !loading) {
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

    if (disabled || loading) return

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      if (multiple) {
        processFiles(Array.from(files))
      } else {
        processFiles([files[0]])
      }
    }
  }

  const handleRemove = (e: React.MouseEvent, index?: number) => {
    e.stopPropagation()
    setLocalError(null)
    onRemove?.(index)
  }

  // Hidden file input
  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept={accept}
      onChange={handleFileChange}
      className="hidden"
      disabled={disabled || loading}
      multiple={multiple}
    />
  )

  // Compact variant - inline button with file name(s)
  if (variant === 'compact') {
    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        <div className="flex flex-wrap items-center gap-2">
          {fileInput}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClick}
            disabled={disabled}
            loading={loading}
            prefixIcon={!loading ? <Upload className="h-4 w-4" /> : undefined}
          >
            {buttonLabel || t('fileUpload.upload')}
          </Button>
          {fileNames.length > 0 &&
            !loading &&
            fileNames.map((name, index) => (
              <div
                key={index}
                className="bg-muted flex items-center gap-2 rounded-md px-2.5 py-1.5"
              >
                <FileText className="text-muted-foreground h-4 w-4 shrink-0" />
                <Tooltip delayDuration={500}>
                  <TooltipTrigger asChild>
                    <span className="text-sm max-w-[150px] truncate">{name}</span>
                  </TooltipTrigger>
                  <TooltipContent>{name}</TooltipContent>
                </Tooltip>
                {onRemove && (
                  <IconButton
                    type="button"
                    variant="ghost"
                    size="xs"
                    icon={<X className="h-3.5 w-3.5" />}
                    onClick={(e) => handleRemove(e, multiple ? index : undefined)}
                    aria-label={t('fileUpload.removeFile')}
                    className="text-muted-foreground hover:text-foreground -mr-1"
                  />
                )}
              </div>
            ))}
        </div>
        {displayError && (
          <Caption color="error" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {displayError}
          </Caption>
        )}
        {hint && !displayError && <Caption>{hint}</Caption>}
      </div>
    )
  }

  // Default variant - boxed drop zone
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {fileInput}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative flex min-h-[80px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 transition-colors',
          disabled || loading
            ? 'border-muted-foreground/20 bg-muted/50 cursor-not-allowed'
            : isDragging
              ? 'border-primary bg-primary/5'
              : displayError
                ? 'border-destructive/50 hover:border-destructive'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/30'
        )}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <Spinner size="sm" />
            <Caption>{t('fileUpload.uploading')}</Caption>
          </div>
        ) : fileNames.length > 0 ? (
          <div className="flex flex-col gap-2 w-full">
            {fileNames.map((name, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="bg-muted rounded-lg p-2">
                  <FileText className="text-muted-foreground h-5 w-5" />
                </div>
                <Tooltip delayDuration={500}>
                  <TooltipTrigger asChild>
                    <span className="text-sm font-medium truncate flex-1 min-w-0">
                      {name}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{name}</TooltipContent>
                </Tooltip>
                {onRemove && (
                  <IconButton
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={<X className="h-4 w-4" />}
                    onClick={(e) => handleRemove(e, multiple ? index : undefined)}
                    aria-label={t('fileUpload.removeFile')}
                  />
                )}
              </div>
            ))}
            <Caption className="text-center mt-1">
              {multiple ? t('fileUpload.clickToAddMore') : t('fileUpload.clickToReplace')}
            </Caption>
          </div>
        ) : (
          <>
            <div className="bg-muted rounded-lg p-2">
              <Upload className="text-muted-foreground h-5 w-5" />
            </div>
            <div className="text-center">
              <Caption className="block">
                {isDragging
                  ? t('fileUpload.dropFiles', { count: multiple ? 2 : 1 })
                  : t('fileUpload.clickToUpload', { count: multiple ? 2 : 1 })}
              </Caption>
              {hint && <Caption className="block mt-0.5">{hint}</Caption>}
            </div>
          </>
        )}
      </div>
      {displayError && (
        <Caption color="error" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {displayError}
        </Caption>
      )}
    </div>
  )
}
