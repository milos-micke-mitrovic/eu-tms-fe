import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { RefreshCw, Plus } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { usePageTitle } from '@/shared/hooks'
import { PageHeader, SectionDivider } from '@/shared/components'
import { DataTable } from '@/shared/ui/data-table'
import { DatePicker, Input, Select, Button, Skeleton } from '@/shared/ui'
import { H4, Caption } from '@/shared/ui/typography'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth'
import {
  useExchangeRates,
  useConvertCurrency,
  useManualRateEntry,
  useFetchNbsRates,
} from '../api/use-exchange-rates'
import { apolloClient } from '@/shared/api/apollo-client'
import type { ExchangeRate } from '../types'

const rateColumns: ColumnDef<ExchangeRate, unknown>[] = [
  {
    accessorKey: 'currencyCode',
    header: 'Valuta',
  },
  {
    accessorKey: 'rateToRsd',
    header: 'Kurs',
    cell: ({ getValue }) => getValue<number>().toFixed(4),
  },
  {
    accessorKey: 'rateDate',
    header: 'Datum',
  },
]

const currencyOptions = [
  { value: 'EUR', label: 'EUR' },
  { value: 'USD', label: 'USD' },
  { value: 'GBP', label: 'GBP' },
  { value: 'CHF', label: 'CHF' },
  { value: 'RSD', label: 'RSD' },
]

export function ExchangeRatesPage() {
  const { t } = useTranslation('finance')
  usePageTitle(t('exchangeRates.title'))

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined

  const { data, loading } = useExchangeRates(dateStr)
  const rates = data?.exchangeRates ?? []

  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

  // Converter state
  const [amount, setAmount] = useState<string>('1')
  const [fromCurrency, setFromCurrency] = useState('EUR')
  const convertMutation = useConvertCurrency()

  // Admin: manual rate entry
  const [manualCurrency, setManualCurrency] = useState('EUR')
  const [manualRate, setManualRate] = useState('')
  const [manualDate, setManualDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const manualRateMutation = useManualRateEntry()
  const fetchNbsMutation = useFetchNbsRates()

  const handleConvert = () => {
    const parsed = parseFloat(amount)
    if (isNaN(parsed) || parsed <= 0) return
    convertMutation.mutate({
      amount: parsed,
      fromCurrency,
      toCurrency: 'RSD',
      date: dateStr,
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('exchangeRates.title')} />

      {/* Date picker */}
      <div className="flex items-center gap-4">
        <Caption className="text-muted-foreground">
          {t('exchangeRates.date')}:
        </Caption>
        <DatePicker
          value={selectedDate}
          onChange={(date) =>
            setSelectedDate(
              date instanceof Date ? date : date ? new Date(date) : undefined
            )
          }
        />
      </div>

      {/* Rates table */}
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <DataTable
          columns={rateColumns}
          data={rates}
          pagination={false}
          loading={loading}
        />
      )}

      {/* Currency converter */}
      <div className="space-y-4 rounded-lg border p-6">
        <H4>{t('exchangeRates.converter.title')}</H4>
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <Caption className="text-muted-foreground">
              {t('exchangeRates.converter.amount')}
            </Caption>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-32"
              min={0}
            />
          </div>
          <div className="space-y-1">
            <Caption className="text-muted-foreground">
              {t('exchangeRates.converter.fromCurrency')}
            </Caption>
            <Select
              value={fromCurrency}
              onChange={(val) => setFromCurrency(val)}
              options={currencyOptions}
            />
          </div>
          <Button onClick={handleConvert} disabled={convertMutation.isPending}>
            {t('exchangeRates.converter.convert')}
          </Button>
        </div>

        {convertMutation.data?.convertedAmount != null && (
          <div className="mt-4 flex gap-6">
            <div>
              <Caption className="text-muted-foreground">
                {t('exchangeRates.converter.result')}
              </Caption>
              <H4>
                {Number(convertMutation.data.convertedAmount).toFixed(2)} RSD
              </H4>
            </div>
            <div>
              <Caption className="text-muted-foreground">
                {t('exchangeRates.converter.rate')}
              </Caption>
              <H4>{Number(convertMutation.data.exchangeRate).toFixed(4)}</H4>
            </div>
          </div>
        )}
      </div>

      {/* Admin: Manual rate entry + NBS fetch */}
      {isAdmin && (
        <>
          <SectionDivider
            title={t('exchangeRates.admin.title', {
              defaultValue: 'Administracija',
            })}
          />

          <div className="flex flex-wrap gap-4">
            {/* Fetch from NBS */}
            <Button
              variant="outline"
              onClick={async () => {
                await fetchNbsMutation.mutateAsync()
                apolloClient.refetchQueries({ include: ['GetExchangeRates'] })
                toast.success(
                  t('exchangeRates.admin.nbsFetched', {
                    defaultValue: 'Kursevi preuzeti sa NBS',
                  })
                )
              }}
              disabled={fetchNbsMutation.isPending}
            >
              <RefreshCw className="mr-2 size-4" />
              {fetchNbsMutation.isPending
                ? t('common:app.loading')
                : t('exchangeRates.admin.fetchNbs', {
                    defaultValue: 'Preuzmi sa NBS',
                  })}
            </Button>
          </div>

          {/* Manual rate entry */}
          <div className="space-y-4 rounded-lg border p-6">
            <H4>
              {t('exchangeRates.admin.manualEntry', {
                defaultValue: 'Ručni unos kursa',
              })}
            </H4>
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-1">
                <Caption className="text-muted-foreground">
                  {t('exchangeRates.currencyCode')}
                </Caption>
                <Select
                  value={manualCurrency}
                  onChange={(val) => setManualCurrency(val)}
                  options={currencyOptions.filter((c) => c.value !== 'RSD')}
                />
              </div>
              <div className="space-y-1">
                <Caption className="text-muted-foreground">
                  {t('exchangeRates.rateToRsd')}
                </Caption>
                <Input
                  type="number"
                  step="0.0001"
                  value={manualRate}
                  onChange={(e) => setManualRate(e.target.value)}
                  className="w-40"
                  placeholder="117.1234"
                />
              </div>
              <div className="space-y-1">
                <Caption className="text-muted-foreground">
                  {t('exchangeRates.rateDate')}
                </Caption>
                <DatePicker
                  value={manualDate}
                  onChange={(date) => {
                    if (typeof date === 'string') setManualDate(date)
                    else if (date instanceof Date)
                      setManualDate(format(date, 'yyyy-MM-dd'))
                  }}
                  returnFormat="iso"
                  clearable={false}
                />
              </div>
              <Button
                onClick={async () => {
                  const parsed = parseFloat(manualRate)
                  if (isNaN(parsed) || parsed <= 0) return
                  await manualRateMutation.mutateAsync({
                    currencyCode: manualCurrency,
                    rateToRsd: parsed,
                    rateDate: manualDate,
                  })
                  apolloClient.refetchQueries({ include: ['GetExchangeRates'] })
                  toast.success(t('common:success.saved'))
                  setManualRate('')
                }}
                disabled={manualRateMutation.isPending || !manualRate}
              >
                <Plus className="mr-2 size-4" />
                {manualRateMutation.isPending
                  ? t('common:app.loading')
                  : t('common:actions.add')}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
