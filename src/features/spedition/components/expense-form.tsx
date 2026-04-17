import { useEffect, useState, useCallback } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Pencil, Zap } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/overlay/dialog'
import { Button, IconButton } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Select } from '@/shared/ui/select'
import { DatePicker } from '@/shared/ui/date-time/date-picker'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'
import { Caption } from '@/shared/ui/typography'
import { formatCurrency, setFormFieldErrors } from '@/shared/utils'
import { httpClient } from '@/shared/api/http-client'
import { EXPENSE_CATEGORIES, CURRENCIES } from '../constants'
import { useCreateExpense, useUpdateExpense } from '../api/use-expenses'
import type { RouteExpense, ExpenseRequest } from '../types'
import { format } from 'date-fns'
import { expenseSchema, type ExpenseFormData } from '../schemas'

type ExchangeRateResponse = {
  currencyCode: string
  rateToRsd: number
  rateDate: string
}

type ExpenseFormProps = {
  open: boolean
  onClose: () => void
  routeId: string
  expense?: RouteExpense | null
}

// Simple cache to avoid re-fetching rates for same currency
const rateCache = new Map<string, ExchangeRateResponse>()

export function ExpenseForm({
  open,
  onClose,
  routeId,
  expense,
}: ExpenseFormProps) {
  const { t } = useTranslation('spedition')
  const isEditing = !!expense

  const createMutation = useCreateExpense()
  const updateMutation = useUpdateExpense()
  const isPending = createMutation.isPending || updateMutation.isPending

  const [manualOverride, setManualOverride] = useState(false)
  const [isRateLoading, setIsRateLoading] = useState(false)
  const [fetchedRate, setFetchedRate] = useState<ExchangeRateResponse | null>(
    null
  )

  const form = useForm<ExpenseFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(expenseSchema) as any,
    defaultValues: {
      category: '',
      amount: 0,
      currency: 'RSD',
      exchangeRate: null,
      description: '',
      expenseDate: format(new Date(), 'yyyy-MM-dd'),
    },
  })

  const handleReset = useCallback(() => {
    if (expense) {
      form.reset({
        category: expense.category,
        amount: expense.amount,
        currency: expense.currency,
        exchangeRate: expense.exchangeRate,
        description: expense.description ?? '',
        expenseDate: expense.expenseDate,
      })
    } else {
      form.reset({
        category: '',
        amount: 0,
        currency: 'RSD',
        exchangeRate: null,
        description: '',
        expenseDate: format(new Date(), 'yyyy-MM-dd'),
      })
    }
    setManualOverride(false)
    setFetchedRate(null)
  }, [expense, form])

  useEffect(() => {
    handleReset()
  }, [handleReset])

  // Live RSD calculation
  const amount = useWatch({ control: form.control, name: 'amount' })
  const currency = useWatch({ control: form.control, name: 'currency' })
  const exchangeRate = useWatch({ control: form.control, name: 'exchangeRate' })
  const showExchangeRate = currency !== 'RSD'
  const calculatedRsd =
    showExchangeRate && amount && exchangeRate ? amount * exchangeRate : null

  const rateUnavailable =
    showExchangeRate && !isRateLoading && !fetchedRate?.rateToRsd

  // Fetch rate for a given currency — called from event handlers, not effects
  const fetchRate = useCallback(
    async (curr: string) => {
      if (!curr || curr === 'RSD') {
        setFetchedRate(null)
        return
      }

      // Check cache first
      const cached = rateCache.get(curr)
      if (cached) {
        setFetchedRate(cached)
        form.setValue('exchangeRate', cached.rateToRsd)
        return
      }

      setIsRateLoading(true)
      try {
        const data = await httpClient.get<ExchangeRateResponse>(
          `/exchange-rates/latest/${curr}`
        )
        rateCache.set(curr, data)
        setFetchedRate(data)
        if (data?.rateToRsd) {
          form.setValue('exchangeRate', data.rateToRsd)
        } else {
          setManualOverride(true)
        }
      } catch {
        setFetchedRate(null)
        setManualOverride(true)
      } finally {
        setIsRateLoading(false)
      }
    },
    [form]
  )

  // Handle currency change — fetch rate and reset manual override
  const handleCurrencyChange = useCallback(
    (newCurrency: string) => {
      form.setValue('currency', newCurrency)
      form.setValue('exchangeRate', null)
      setManualOverride(false)
      setFetchedRate(null)
      fetchRate(newCurrency)
    },
    [form, fetchRate]
  )

  // Fetch rate on initial load if editing with a non-RSD currency
  useEffect(() => {
    if (expense?.currency && expense.currency !== 'RSD') {
      fetchRate(expense.currency)
    }
    // Only run on expense change, not on every fetchRate ref change
  }, [expense])

  const onSubmit = async (data: ExpenseFormData) => {
    const request: ExpenseRequest = {
      routeId: Number(routeId),
      category: data.category,
      amount: data.amount,
      currency: data.currency,
      exchangeRate: data.exchangeRate ?? undefined,
      amountRsd: calculatedRsd ?? undefined,
      description: data.description || undefined,
      expenseDate: data.expenseDate,
    }

    try {
      if (isEditing && expense) {
        await updateMutation.mutateAsync({ id: expense.id, data: request })
      } else {
        await createMutation.mutateAsync(request)
      }
      onClose()
    } catch (error) {
      setFormFieldErrors(error, form.setError)
    }
  }

  const categoryOptions = EXPENSE_CATEGORIES.map((c) => ({
    value: c.value,
    label: t(c.labelKey),
  }))

  const currencyOptions = CURRENCIES.map((c) => ({ value: c, label: c }))

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('common:actions.edit') : t('expenses.addNew')}
          </DialogTitle>
        </DialogHeader>
        <Form form={form} onSubmit={onSubmit} className="space-y-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('expenses.category')}</FormLabel>
                <Select
                  options={categoryOptions}
                  value={field.value}
                  onChange={field.onChange}
                  searchable
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('expenses.amount')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('expenses.currency')}</FormLabel>
                  <Select
                    options={currencyOptions}
                    value={field.value}
                    onChange={handleCurrencyChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {showExchangeRate && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="exchangeRate"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>
                        {t('expenses.exchangeRate', { currency })}
                      </FormLabel>
                      {!rateUnavailable && (
                        <IconButton
                          type="button"
                          variant="ghost"
                          size="xs"
                          icon={
                            manualOverride ? (
                              <Zap className="size-3.5" />
                            ) : (
                              <Pencil className="size-3.5" />
                            )
                          }
                          onClick={() => {
                            const newValue = !manualOverride
                            setManualOverride(newValue)
                            if (!newValue && fetchedRate?.rateToRsd) {
                              form.setValue(
                                'exchangeRate',
                                fetchedRate.rateToRsd
                              )
                            }
                          }}
                          aria-label={
                            manualOverride
                              ? t('expenses.autoRate')
                              : t('expenses.manualRate')
                          }
                          className="text-muted-foreground hover:text-foreground -mr-1"
                        />
                      )}
                    </div>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.0001"
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                        readOnly={!manualOverride}
                        disabled={isRateLoading}
                        className={
                          !manualOverride
                            ? 'bg-muted cursor-default'
                            : undefined
                        }
                      />
                    </FormControl>
                    {rateUnavailable && (
                      <Caption className="text-warning">
                        {t('expenses.exchangeRateUnavailable')}
                      </Caption>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col justify-end">
                <Caption className="text-muted-foreground mb-1">
                  {t('common:actions.inRsd')}
                </Caption>
                <div className="bg-muted flex h-9 items-center rounded-md px-3 text-sm font-medium">
                  {calculatedRsd != null
                    ? formatCurrency(calculatedRsd, 'RSD')
                    : '—'}
                </div>
              </div>
            </div>
          )}

          <FormField
            control={form.control}
            name="expenseDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('expenses.date')}</FormLabel>
                <DatePicker
                  value={field.value}
                  onChange={(d) => field.onChange(d ?? '')}
                  returnFormat="iso"
                  clearable
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('expenses.description')}</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common:actions.cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t('common:app.loading') : t('common:actions.save')}
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
