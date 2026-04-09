import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { BodySmall, Caption } from '@/shared/ui/typography'

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
      <div className="bg-muted mb-3 rounded-full p-4">
        <Icon className="text-muted-foreground size-7" />
      </div>
      <BodySmall className="font-medium">{title}</BodySmall>
      {description && (
        <Caption className="text-muted-foreground mt-1 max-w-xs">{description}</Caption>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
