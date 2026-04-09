import { H4 } from '@/shared/ui/typography'
import { cn } from '@/shared/utils'

type FormSectionProps = {
  title: string
  children: React.ReactNode
  className?: string
  actions?: React.ReactNode
}

export function FormSection({
  title,
  children,
  className,
  actions,
}: FormSectionProps) {
  return (
    <div className={cn('space-y-3 rounded-lg border p-3', className)}>
      <div className="flex items-center justify-between">
        <H4 className="text-primary">{title}</H4>
        {actions}
      </div>
      {children}
    </div>
  )
}
