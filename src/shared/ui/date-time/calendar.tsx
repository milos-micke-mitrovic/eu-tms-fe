'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { DayPicker, useDayPicker } from 'react-day-picker'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { setMonth, setYear } from 'date-fns'

import { cn } from '@/shared/utils'
import { buttonVariants } from '../button'

const MONTH_KEYS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
] as const

// Context to pass year options to MonthCaption
const YearsContext = React.createContext<number[]>([])

function MonthCaption({
  calendarMonth,
}: {
  calendarMonth: { date: Date }
  displayIndex: number
}) {
  const { t } = useTranslation('common')
  const { goToMonth, previousMonth, nextMonth } = useDayPicker()
  const years = React.useContext(YearsContext)

  const displayYear = calendarMonth.date.getFullYear()
  const displayMonth = calendarMonth.date.getMonth()

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value, 10)
    goToMonth(setMonth(calendarMonth.date, newMonth))
  }

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value, 10)
    goToMonth(setYear(calendarMonth.date, newYear))
  }

  return (
    <div className="flex items-center justify-between w-full px-1">
      {/* Previous month button */}
      <button
        type="button"
        onClick={() => previousMonth && goToMonth(previousMonth)}
        disabled={!previousMonth}
        className={cn(
          buttonVariants({ variant: 'outline' }),
          'size-7 bg-transparent p-0 opacity-50 hover:opacity-100 cursor-pointer disabled:cursor-not-allowed disabled:opacity-30'
        )}
        aria-label={t('calendar.previousMonth')}
      >
        <ChevronLeft className="size-4" />
      </button>

      {/* Month and Year selects */}
      <div className="flex items-center gap-1">
        <div className="relative">
          <select
            value={displayMonth}
            onChange={handleMonthChange}
            className="appearance-none text-sm font-medium bg-transparent pr-5 cursor-pointer outline-none hover:text-primary focus:text-primary"
            aria-label={t('calendar.selectMonth')}
          >
            {MONTH_KEYS.map((monthKey, index) => (
              <option key={monthKey} value={index}>
                {t(`calendar.months.${monthKey}`)}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 size-3.5 opacity-50 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={displayYear}
            onChange={handleYearChange}
            className="appearance-none text-sm font-medium bg-transparent pr-5 cursor-pointer outline-none hover:text-primary focus:text-primary"
            aria-label={t('calendar.selectYear')}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 size-3.5 opacity-50 pointer-events-none" />
        </div>
      </div>

      {/* Next month button */}
      <button
        type="button"
        onClick={() => nextMonth && goToMonth(nextMonth)}
        disabled={!nextMonth}
        className={cn(
          buttonVariants({ variant: 'outline' }),
          'size-7 bg-transparent p-0 opacity-50 hover:opacity-100 cursor-pointer disabled:cursor-not-allowed disabled:opacity-30'
        )}
        aria-label={t('calendar.nextMonth')}
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  )
}

type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  /** Year range for dropdown - defaults to 100 years back from current year */
  yearRange?: { from: number; to: number }
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  yearRange,
  ...props
}: CalendarProps) {
  const currentYear = new Date().getFullYear()
  const startYear = yearRange?.from ?? currentYear - 100
  const endYear = yearRange?.to ?? currentYear + 10

  const years = React.useMemo(() => {
    const result: number[] = []
    for (let year = endYear; year >= startYear; year--) {
      result.push(year)
    }
    return result
  }, [startYear, endYear])

  return (
    <YearsContext.Provider value={years}>
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn('p-3', className)}
        hideNavigation
        classNames={{
          months: 'flex flex-col sm:flex-row gap-2',
          month: 'flex flex-col gap-4',
          month_caption: 'flex justify-center pt-1 relative items-center w-full',
          caption_label: 'text-sm font-medium',
          month_grid: 'w-full border-collapse',
          weekdays: 'flex',
          weekday:
            'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
          week: 'flex w-full mt-2',
          day: cn(
            'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50',
            props.mode === 'range'
              ? '[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
              : '[&:has([aria-selected])]:rounded-md'
          ),
          day_button: cn(
            buttonVariants({ variant: 'ghost' }),
            'size-9 p-0 font-normal aria-selected:opacity-100'
          ),
          range_start: 'day-range-start rounded-l-md',
          range_end: 'day-range-end rounded-r-md',
          selected:
            'bg-primary text-primary-foreground rounded-md hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
          today: 'bg-accent text-accent-foreground rounded-md',
          outside:
            'day-outside text-muted-foreground aria-selected:text-muted-foreground',
          disabled: 'text-muted-foreground opacity-50',
          range_middle:
            'aria-selected:bg-accent aria-selected:text-accent-foreground',
          hidden: 'invisible',
          ...classNames,
        }}
        components={{
          MonthCaption,
        }}
        {...props}
      />
    </YearsContext.Provider>
  )
}

export { Calendar }
