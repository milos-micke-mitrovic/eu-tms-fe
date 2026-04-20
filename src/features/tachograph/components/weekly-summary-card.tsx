import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { addDays, format, parseISO } from 'date-fns'
import { Badge } from '@/shared/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui/overlay/tooltip'
import { BodySmall, Caption } from '@/shared/ui/typography'
import { Skeleton } from '@/shared/ui/skeleton'
import { SectionDivider } from '@/shared/components'
import { formatDate } from '@/shared/utils'
import { useTachographWeeklySummary } from '../api'
import { ACTIVITY_COLORS } from '../constants'
import { ViolationsList } from './violations-list'
import type { TachographEntry } from '../types'

type WeeklySummaryCardProps = {
  driverId: number
  weekStart: string
  onEntryClick: (entry: TachographEntry) => void
  onAddEntry: (date: string) => void
}

function minutesToHM(m: number) {
  return `${Math.floor(m / 60)}h ${m % 60}min`
}

function DayColumn({
  date,
  entry,
  onEntryClick,
  onAddEntry,
}: {
  date: string
  entry?: TachographEntry
  onEntryClick: (e: TachographEntry) => void
  onAddEntry: (date: string) => void
}) {
  const { t } = useTranslation('tachograph')
  const dayLabel = format(parseISO(date), 'EEE')
  const dateLabel = format(parseISO(date), 'dd.MM')
  const hasViolations = entry?.violations && entry.violations.length > 0

  const isFuture = parseISO(date) > new Date()

  if (!entry) {
    return (
      <div className="flex flex-col items-center gap-1">
        <Caption className="text-muted-foreground text-xs">{dayLabel}</Caption>
        <Caption
          className={`text-xs ${isFuture ? 'text-muted-foreground/50' : ''}`}
        >
          {dateLabel}
        </Caption>
        {isFuture ? (
          <div className="border-muted-foreground/15 flex h-16 w-full items-center justify-center rounded border border-dashed" />
        ) : (
          <button
            onClick={() => onAddEntry(date)}
            className="border-muted-foreground/30 hover:border-primary hover:bg-muted/50 flex h-16 w-full items-center justify-center rounded border border-dashed transition-colors"
          >
            <Plus className="text-muted-foreground size-4" />
          </button>
        )}
      </div>
    )
  }

  const total =
    entry.drivingMinutes +
    entry.restMinutes +
    entry.otherWorkMinutes +
    entry.availabilityMinutes
  const pct = (v: number) => (total > 0 ? `${(v / total) * 100}%` : '0%')

  return (
    <div className="flex flex-col items-center gap-1">
      <Caption className="text-muted-foreground text-xs">{dayLabel}</Caption>
      <Caption className="text-xs">{dateLabel}</Caption>
      <button
        onClick={() => onEntryClick(entry)}
        className="hover:ring-primary/50 relative flex h-16 w-full flex-col justify-end overflow-hidden rounded border transition-all hover:ring-2"
      >
        <div className="flex h-full w-full flex-col">
          <div
            style={{
              height: pct(entry.drivingMinutes),
              backgroundColor: ACTIVITY_COLORS.driving,
            }}
          />
          <div
            style={{
              height: pct(entry.restMinutes),
              backgroundColor: ACTIVITY_COLORS.rest,
            }}
          />
          <div
            style={{
              height: pct(entry.otherWorkMinutes),
              backgroundColor: ACTIVITY_COLORS.otherWork,
            }}
          />
          <div
            style={{
              height: pct(entry.availabilityMinutes),
              backgroundColor: ACTIVITY_COLORS.availability,
            }}
          />
        </div>
        {hasViolations && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="absolute top-0.5 right-0.5 size-2.5 rounded-full bg-red-500" />
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {entry.violations.length} {t('violations.title').toLowerCase()}
            </TooltipContent>
          </Tooltip>
        )}
      </button>
      <Badge
        variant={entry.status === 'CONFIRMED' ? undefined : 'outline'}
        color={entry.status === 'CONFIRMED' ? 'success' : undefined}
        className="px-1 py-0 text-[10px]"
      >
        {entry.status === 'CONFIRMED' ? t('entry.confirmed') : t('entry.draft')}
      </Badge>
    </div>
  )
}

export function WeeklySummaryCard({
  driverId,
  weekStart,
  onEntryClick,
  onAddEntry,
}: WeeklySummaryCardProps) {
  const { t } = useTranslation('tachograph')
  const { data, loading } = useTachographWeeklySummary(driverId, weekStart)
  const summary = data?.tachographWeeklySummary

  if (loading) {
    return <Skeleton className="h-64 w-full rounded-lg" />
  }

  if (!summary) {
    return (
      <div className="text-muted-foreground flex h-40 items-center justify-center rounded-lg border text-sm">
        {t('weekly.noEntries')}
      </div>
    )
  }

  const weekDays = Array.from({ length: 7 }, (_, i) =>
    format(addDays(parseISO(weekStart), i), 'yyyy-MM-dd')
  )

  const entryByDate = new Map(summary.entries.map((e) => [e.entryDate, e]))

  const weeklyPercent = Math.round((summary.totalDrivingMinutes / 3360) * 100)
  const weeklyBarColor =
    weeklyPercent > 90 ? '#EF4444' : weeklyPercent > 70 ? '#F59E0B' : '#10B981'

  return (
    <div className="space-y-4 rounded-lg border p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <BodySmall className="font-semibold">
          {t('weekly.title')}: {formatDate(summary.weekStart)} —{' '}
          {formatDate(summary.weekEnd)}
        </BodySmall>
        <Caption className="text-muted-foreground">
          {summary.driverName}
        </Caption>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-md border p-2 text-center">
          <Caption className="text-muted-foreground">
            {t('weekly.drivingTotal')}
          </Caption>
          <BodySmall className="font-medium">
            {minutesToHM(summary.totalDrivingMinutes)}
          </BodySmall>
        </div>
        <div className="rounded-md border p-2 text-center">
          <Caption className="text-muted-foreground">
            {t('weekly.restTotal')}
          </Caption>
          <BodySmall className="font-medium">
            {minutesToHM(summary.totalRestMinutes)}
          </BodySmall>
        </div>
        <div className="rounded-md border p-2 text-center">
          <Caption className="text-muted-foreground">
            {t('weekly.otherWorkTotal')}
          </Caption>
          <BodySmall className="font-medium">
            {minutesToHM(summary.totalOtherWorkMinutes)}
          </BodySmall>
        </div>
        <div className="rounded-md border p-2 text-center">
          <Caption className="text-muted-foreground">
            {t('weekly.daysWithEntries')}
          </Caption>
          <BodySmall className="font-medium">
            {summary.daysWithEntries}/7
          </BodySmall>
        </div>
      </div>

      {/* Weekly driving progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <Caption>{t('weekly.weeklyLimit')}</Caption>
          <Caption>
            {Math.floor(summary.totalDrivingMinutes / 60)}h / 56h (
            {weeklyPercent}%)
          </Caption>
        </div>
        <div className="bg-muted h-2.5 w-full overflow-hidden rounded-full">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(weeklyPercent, 100)}%`,
              backgroundColor: weeklyBarColor,
            }}
          />
        </div>
      </div>

      {/* Day-by-day grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((date) => (
          <DayColumn
            key={date}
            date={date}
            entry={entryByDate.get(date) as TachographEntry | undefined}
            onEntryClick={onEntryClick}
            onAddEntry={onAddEntry}
          />
        ))}
      </div>

      {/* Violations */}
      {summary.violations.length > 0 && (
        <>
          <SectionDivider title={t('violations.title')} />
          <ViolationsList violations={summary.violations} />
        </>
      )}
    </div>
  )
}
