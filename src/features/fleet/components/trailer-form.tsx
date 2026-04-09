import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/overlay/sheet'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Select } from '@/shared/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'
import type { Trailer, TrailerRequest } from '../types'
import { useCreateTrailer, useUpdateTrailer } from '../api/use-trailer-mutations'

const trailerSchema = z.object({
  regNumber: z.string().min(1),
  type: z.enum(['CURTAIN', 'BOX', 'REFRIGERATED', 'FLATBED', 'TANK', 'CONTAINER']),
  lengthM: z.coerce.number().positive().optional().nullable(),
  capacityKg: z.coerce.number().positive().optional().nullable(),
  year: z.coerce.number().min(1900).max(2100).optional().nullable(),
  ownership: z.enum(['OWNED', 'LEASED', 'RENTED']).optional().nullable(),
})

type TrailerFormData = z.infer<typeof trailerSchema>

type TrailerFormProps = {
  open: boolean
  onClose: () => void
  trailer?: Trailer | null
}

const defaultValues: TrailerFormData = {
  regNumber: '',
  type: 'CURTAIN',
  lengthM: null,
  capacityKg: null,
  year: null,
  ownership: 'OWNED',
}

export function TrailerForm({ open, onClose, trailer }: TrailerFormProps) {
  const { t } = useTranslation('fleet')
  const isEditing = !!trailer

  const createMutation = useCreateTrailer()
  const updateMutation = useUpdateTrailer()
  const isPending = createMutation.isPending || updateMutation.isPending

  const form = useForm<TrailerFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(trailerSchema) as any,
    defaultValues,
  })

  useEffect(() => {
    if (trailer) {
      form.reset({
        regNumber: trailer.regNumber,
        type: trailer.type,
        lengthM: trailer.lengthM,
        capacityKg: trailer.capacityKg,
        year: trailer.year,
        ownership: trailer.ownership,
      })
    } else {
      form.reset(defaultValues)
    }
  }, [trailer, form])

  const onSubmit = async (data: TrailerFormData) => {
    const request: TrailerRequest = {
      regNumber: data.regNumber,
      type: data.type,
      lengthM: data.lengthM ?? undefined,
      capacityKg: data.capacityKg ?? undefined,
      year: data.year ?? undefined,
      ownership: data.ownership ?? undefined,
    }

    if (isEditing) {
      await updateMutation.mutateAsync({ id: trailer.id, data: request })
    } else {
      await createMutation.mutateAsync(request)
    }
    onClose()
  }

  const trailerTypeOptions = (
    ['CURTAIN', 'BOX', 'REFRIGERATED', 'FLATBED', 'TANK', 'CONTAINER'] as const
  ).map((v) => ({ value: v, label: t(`trailers.trailerTypes.${v}`) }))

  const ownershipOptions = (
    ['OWNED', 'LEASED', 'RENTED'] as const
  ).map((v) => ({ value: v, label: t(`trailers.ownershipTypes.${v}`) }))

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? t('common:actions.edit') : t('trailers.addNew')}
          </SheetTitle>
        </SheetHeader>
        <Form form={form} onSubmit={onSubmit} className="space-y-4 p-4">
          <FormField
            control={form.control}
            name="regNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('trailers.regNumber')}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('trailers.type')}</FormLabel>
                  <Select
                    options={trailerTypeOptions}
                    value={field.value}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ownership"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('trailers.ownership')}</FormLabel>
                  <Select
                    options={ownershipOptions}
                    value={field.value ?? undefined}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="lengthM"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('trailers.length')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(e.target.value ? Number(e.target.value) : null)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="capacityKg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('trailers.capacity')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(e.target.value ? Number(e.target.value) : null)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('trailers.year')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(e.target.value ? Number(e.target.value) : null)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common:actions.cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t('common:app.loading') : t('common:actions.save')}
            </Button>
          </div>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
