import type { ReactNode } from 'react'
import { H3 } from '@/shared/ui/typography'

type PageHeaderProps = {
  title: string
  action?: ReactNode
}

export function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <H3>{title}</H3>
      {action}
    </div>
  )
}
