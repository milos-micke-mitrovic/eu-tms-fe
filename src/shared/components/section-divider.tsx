import { Caption } from '@/shared/ui/typography'

type SectionDividerProps = {
  title: string
}

export function SectionDivider({ title }: SectionDividerProps) {
  return (
    <div className="flex items-center gap-3 py-6">
      <div className="bg-border h-px flex-1" />
      <Caption className="text-muted-foreground shrink-0 text-xs font-semibold tracking-widest uppercase">
        {title}
      </Caption>
      <div className="bg-border h-px flex-1" />
    </div>
  )
}
