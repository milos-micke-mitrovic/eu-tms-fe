import { useTranslation } from 'react-i18next'
import { ConfirmDialog } from '@/shared/ui'

type UnsavedChangesDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function UnsavedChangesDialog({
  open,
  onOpenChange,
  onConfirm,
}: UnsavedChangesDialogProps) {
  const { t } = useTranslation('common')

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('unsavedChanges.title')}
      description={t('unsavedChanges.description')}
      confirmLabel={t('unsavedChanges.confirm')}
      cancelLabel={t('unsavedChanges.cancel')}
      variant="destructive"
      onConfirm={onConfirm}
    />
  )
}
