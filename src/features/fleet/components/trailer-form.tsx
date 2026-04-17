import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { setFormFieldErrors } from '@/shared/utils'
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
import type { TrailerListItem, TrailerRequest } from '../types'
import {
  useCreateTrailer,
  useUpdateTrailer,
} from '../api/use-trailer-mutations'
import { trailerSchema, type TrailerFormData } from '../schemas'

type TrailerFormProps = {
  open: boolean
  onClose: () => void
  trailer?: TrailerListItem | null
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
        type: trailer.type as TrailerRequest['type'],
        lengthM: trailer.lengthM ?? null,
        capacityKg: trailer.capacityKg ?? null,
        year: trailer.year ?? null,
        ownership:
          (trailer.ownership as TrailerRequest['ownership']) ?? 'OWNED',
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

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: trailer.id, data: request })
      } else {
        await createMutation.mutateAsync(request)
      }
      onClose()
    } catch (error) {
      setFormFieldErrors(error, form.setError)
    }
  }

  const trailerTypeOptions = (
    ['CURTAIN', 'BOX', 'REFRIGERATED', 'FLATBED', 'TANK', 'CONTAINER'] as const
  ).map((v) => ({ value: v, label: t(`trailers.trailerTypes.${v}`) }))

  const ownershipOptions = (['OWNED', 'LEASED', 'RENTED'] as const).map(
    (v) => ({ value: v, label: t(`trailers.ownershipTypes.${v}`) })
  )

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="sm:max-w-lg">
        <Form
          form={form}
          onSubmit={onSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <SheetHeader
            actions={
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending ? t('common:app.loading') : t('common:actions.save')}
              </Button>
            }
          >
            <SheetTitle>
              {isEditing ? t('common:actions.edit') : t('trailers.addNew')}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            <FormField
              control={form.control}
              name="regNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t('trailers.regNumber')}</FormLabel>
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
                    <FormLabel required>{t('trailers.type')}</FormLabel>
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
                          field.onChange(
                            e.target.value ? Number(e.target.value) : null
                          )
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
                          field.onChange(
                            e.target.value ? Number(e.target.value) : null
                          )
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
                          field.onChange(
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
