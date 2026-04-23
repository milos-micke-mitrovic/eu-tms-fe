import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2, Inbox } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/ui/overlay/dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Select } from '@/shared/ui/select'
import { Switch } from '@/shared/ui/switch'
import { Badge } from '@/shared/ui/badge'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'
import { Caption, BodySmall } from '@/shared/ui/typography'
import {
  useCollectionRules,
  useCreateRule,
  useUpdateRule,
  useDeleteRule,
} from '../api'
import { REMINDER_TYPE_CONFIG, SEND_VIA_OPTIONS } from '../constants'
import type { CollectionRule } from '../types'

const ruleSchema = z.object({
  daysAfterDue: z.coerce.number().int().min(1),
  reminderType: z.string().min(1),
  sendVia: z.string().min(1),
  enabled: z.boolean(),
  emailSubjectTemplate: z.string().min(1),
  emailBodyTemplate: z.string().min(1),
})

type RuleFormValues = z.infer<typeof ruleSchema>

export function CollectionRulesSettings() {
  const { t } = useTranslation('collections')
  const { data: rules, isLoading } = useCollectionRules()
  const createRule = useCreateRule()
  const updateRule = useUpdateRule()
  const deleteRule = useDeleteRule()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<CollectionRule | null>(null)

  const form = useForm<RuleFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(ruleSchema) as any,
    defaultValues: {
      daysAfterDue: 30,
      reminderType: 'FIRST',
      sendVia: 'EMAIL',
      enabled: true,
      emailSubjectTemplate: '',
      emailBodyTemplate: '',
    },
  })

  const openCreate = () => {
    setEditingRule(null)
    form.reset({
      daysAfterDue: 30,
      reminderType: 'FIRST',
      sendVia: 'EMAIL',
      enabled: true,
      emailSubjectTemplate: '',
      emailBodyTemplate: '',
    })
    setDialogOpen(true)
  }

  const openEdit = (rule: CollectionRule) => {
    setEditingRule(rule)
    form.reset({
      daysAfterDue: rule.daysAfterDue,
      reminderType: rule.reminderType,
      sendVia: rule.sendVia,
      enabled: rule.enabled,
      emailSubjectTemplate: rule.emailSubjectTemplate,
      emailBodyTemplate: rule.emailBodyTemplate,
    })
    setDialogOpen(true)
  }

  const reminderTypeOptions = Object.entries(REMINDER_TYPE_CONFIG).map(
    ([value, cfg]) => ({
      value,
      label: t(`reminderType.${cfg.key}`),
    })
  )

  const sendViaOptions = SEND_VIA_OPTIONS.map((v) => ({
    value: v,
    label: t(`sendVia.${v.toLowerCase()}`),
  }))

  const onSubmit = (values: RuleFormValues) => {
    if (editingRule) {
      updateRule.mutate(
        { id: editingRule.id, data: values },
        { onSuccess: () => setDialogOpen(false) }
      )
    } else {
      createRule.mutate(values, {
        onSuccess: () => setDialogOpen(false),
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <BodySmall className="font-semibold">{t('rules.title')}</BodySmall>
        <Button variant="outline" size="sm" onClick={openCreate}>
          <Plus className="mr-1 size-3.5" />
          {t('rules.add')}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : !rules || rules.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-md border border-dashed py-12">
          <Inbox className="text-muted-foreground size-8" />
          <Caption className="text-muted-foreground">
            {t('rules.empty')}
          </Caption>
          <Button variant="outline" size="sm" onClick={openCreate}>
            <Plus className="mr-1 size-3.5" />
            {t('rules.add')}
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {rules.map((rule) => {
            const typeCfg = REMINDER_TYPE_CONFIG[rule.reminderType]
            return (
              <div
                key={rule.id}
                className="flex items-center justify-between rounded-md border px-4 py-3"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <BodySmall className="font-medium">
                      {rule.daysAfterDue} {t('rules.daysAfterDue')}
                    </BodySmall>
                    <Caption className="text-muted-foreground">
                      {rule.emailSubjectTemplate}
                    </Caption>
                  </div>
                  <Badge
                    color={
                      (typeCfg?.color as
                        | 'info'
                        | 'warning'
                        | 'destructive'
                        | 'muted') ?? 'muted'
                    }
                  >
                    {typeCfg
                      ? t(`reminderType.${typeCfg.key}`)
                      : rule.reminderType}
                  </Badge>
                  <Badge color={rule.enabled ? 'success' : 'muted'}>
                    {rule.enabled ? t('rules.enabled') : t('rules.disabled')}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => openEdit(rule)}
                    aria-label={t('common:aria.editItem')}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive size-7"
                    onClick={() => deleteRule.mutate(rule.id)}
                    disabled={deleteRule.isPending}
                    aria-label={t('common:aria.deleteItem')}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Rule form dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingRule ? t('rules.edit') : t('rules.add')}
            </DialogTitle>
          </DialogHeader>
          <Form form={form} onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="daysAfterDue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('rules.daysAfterDueLabel')}</FormLabel>
                  <Input type="number" min={1} {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reminderType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('reminder.type')}</FormLabel>
                  <Select
                    options={reminderTypeOptions}
                    value={field.value}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sendVia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('reminder.sentVia')}</FormLabel>
                  <Select
                    options={sendViaOptions}
                    value={field.value}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3">
                  <FormLabel>{t('rules.enabledLabel')}</FormLabel>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="emailSubjectTemplate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('rules.subjectTemplate')}</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="emailBodyTemplate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('rules.bodyTemplate')}</FormLabel>
                  <Textarea rows={4} {...field} />
                  <Caption className="text-muted-foreground">
                    {t('rules.templateHelp')}
                  </Caption>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                {t('common:actions.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={createRule.isPending || updateRule.isPending}
              >
                {t('common:actions.save')}
              </Button>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
