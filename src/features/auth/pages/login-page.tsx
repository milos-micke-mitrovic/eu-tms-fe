import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { TFunction } from 'i18next'
import { toast } from 'sonner'
import { Logo } from '@/shared/components'
import { EMAIL_REGEX } from '@/shared/utils'
import {
  useLogin,
  useAuth,
  getUserDisplayName,
  getDefaultRoute,
  decodeJwt,
  jwtPayloadToUser,
} from '@/features/auth'
import { Mail, Lock, Truck, Route, BarChart3, Shield, ArrowRight } from 'lucide-react'
import { ThemeToggle } from '@/shared/components/theme-toggle'
import { LanguageSwitcher } from '@/shared/components/language-switcher'
import {
  Button,
  H4,
  Body,
  BodySmall,
  Caption,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
} from '@/shared/ui'
import { usePageTitle } from '@/shared/hooks'

const createLoginSchema = (t: TFunction) =>
  z.object({
    email: z.string().regex(EMAIL_REGEX, t('login.validation.emailInvalid')),
    password: z.string().min(1, t('login.validation.passwordRequired')),
  })

type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>

const features = [
  { icon: Truck, labelKey: 'login.features.fleet' },
  { icon: Route, labelKey: 'login.features.routes' },
  { icon: BarChart3, labelKey: 'login.features.expenses' },
  { icon: Shield, labelKey: 'login.features.documents' },
] as const

export function LoginPage() {
  const { t } = useTranslation('auth')
  usePageTitle(t('login.title'))
  const navigate = useNavigate()
  const { login } = useAuth()
  const loginMutation = useLogin()

  const loginSchema = useMemo(() => createLoginSchema(t), [t])

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const response = await loginMutation.mutateAsync({
        email: values.email.trim(),
        password: values.password,
      })
      const payload = decodeJwt(response.accessToken)
      if (!payload) { toast.error(t('login.error.generic')); return }
      const user = jwtPayloadToUser(payload)
      login(user, response.accessToken, response.refreshToken)
      toast.success(t('login.welcomeBack', { name: getUserDisplayName(user) }))
      navigate(getDefaultRoute(user))
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        toast.error(t('login.error.networkError'))
      } else {
        toast.error(t('login.error.invalidCredentials'))
      }
    }
  }

  return (
    <div className="relative flex min-h-screen">
      {/* Background pattern — subtle grid */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] opacity-40 [background-size:24px_24px] dark:bg-[radial-gradient(#4b5563_1px,transparent_1px)]" />

      {/* Top-right controls */}
      <div className="absolute right-4 top-4 z-10 flex items-center gap-1">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>

      {/* Left side - Branding hero */}
      <div className="relative hidden w-[55%] flex-col overflow-hidden lg:flex">
        {/* Gradient background */}
        <div className="from-primary via-primary/95 to-primary/80 absolute inset-0 bg-gradient-to-br" />
        {/* Decorative circles */}
        <div className="bg-primary-foreground/5 absolute -right-32 -top-32 size-96 rounded-full" />
        <div className="bg-primary-foreground/5 absolute -bottom-24 -left-24 size-72 rounded-full" />
        <div className="bg-primary-foreground/5 absolute right-24 bottom-32 size-48 rounded-full" />

        <div className="relative flex flex-1 flex-col justify-between p-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-primary-foreground/15 flex size-12 items-center justify-center rounded-2xl backdrop-blur-sm">
              <Logo size="md" className="text-primary-foreground" />
            </div>
            <div>
              <H4 className="text-primary-foreground tracking-tight">{t('common:app.name')}</H4>
              <Caption className="text-primary-foreground/50 font-mono">v0.1.0</Caption>
            </div>
          </div>

          {/* Hero card */}
          <div className="max-w-xl rounded-2xl border border-white/10 bg-white/10 p-10 shadow-2xl shadow-black/20 backdrop-blur-md">
            <Body className="text-primary-foreground text-2xl leading-snug font-bold tracking-tight">
              {t('login.branding.description')}
            </Body>

            <div className="mt-8 grid grid-cols-2 gap-4">
              {features.map(({ icon: Icon, labelKey }) => (
                <div
                  key={labelKey}
                  className="flex items-center gap-3 rounded-xl bg-white/10 p-4 transition-colors hover:bg-white/15"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                    <Icon className="text-primary-foreground size-4.5" />
                  </div>
                  <BodySmall className="text-primary-foreground/90 font-medium">
                    {t(labelKey, { defaultValue: labelKey.split('.').pop() })}
                  </BodySmall>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <Caption className="text-primary-foreground/40">
            &copy; {new Date().getFullYear()} Skyhard
          </Caption>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="relative flex w-full flex-col items-center justify-center px-6 py-12 lg:w-[45%] lg:px-12">
        {/* Mobile logo */}
        <div className="mb-12 flex items-center gap-3 lg:hidden">
          <div className="bg-primary flex size-12 items-center justify-center rounded-2xl">
            <Logo size="md" className="text-primary-foreground" />
          </div>
          <H4 className="tracking-tight">{t('common:app.name')}</H4>
        </div>

        <div className="bg-background w-full max-w-[420px] rounded-2xl border p-8 shadow-xl dark:border-white/10 dark:shadow-[0_8px_40px_rgba(255,255,255,0.06)]">
          {/* Welcome */}
          <div className="mb-8">
            <Body className="text-foreground text-2xl font-bold tracking-tight">{t('login.title')}</Body>
            <BodySmall className="text-muted-foreground mt-2">{t('login.subtitle')}</BodySmall>
          </div>

          {/* Form */}
          <Form form={form} onSubmit={onSubmit} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t('login.email')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t('login.emailPlaceholder')}
                      prefixIcon={<Mail />}
                      autoComplete="email"
                      autoFocus
                      className="h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t('login.password')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t('login.passwordPlaceholder')}
                      prefixIcon={<Lock />}
                      autoComplete="current-password"
                      className="h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="h-11 w-full text-sm font-semibold"
              loading={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                t('login.submitting')
              ) : (
                <span className="flex items-center gap-2">
                  {t('login.submit')}
                  <ArrowRight className="size-4" />
                </span>
              )}
            </Button>
          </Form>

          {/* Hint */}
          <div className="mt-10 rounded-xl border border-dashed p-4 text-center">
            <Caption className="text-muted-foreground">{t('login.info.hint')}</Caption>
          </div>
        </div>
      </div>
    </div>
  )
}
