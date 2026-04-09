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
import { Mail, Lock } from 'lucide-react'
import {
  Button,
  H1,
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

export function LoginPage() {
  const { t } = useTranslation('auth')
  usePageTitle('Login')
  const navigate = useNavigate()
  const { login } = useAuth()
  const loginMutation = useLogin()

  const loginSchema = useMemo(() => createLoginSchema(t), [t])

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const response = await loginMutation.mutateAsync({
        email: values.email.trim(),
        password: values.password,
      })

      const payload = decodeJwt(response.accessToken)
      if (!payload) {
        toast.error(t('login.error.generic'))
        return
      }

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
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="from-primary to-primary/80 hidden w-1/2 flex-col justify-between bg-gradient-to-br p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="bg-primary-foreground/10 flex size-10 items-center justify-center rounded-lg">
            <Logo size="md" className="text-primary-foreground" />
          </div>
          <H4 className="text-primary-foreground">{t('common:app.name')}</H4>
        </div>

        <div className="space-y-6">
          <Body className="text-primary-foreground/80 max-w-md text-lg">
            {t('login.branding.description')}
          </Body>
        </div>

        <Caption className="text-primary-foreground/60">
          &copy; {new Date().getFullYear()} Skyhard. All rights reserved.
        </Caption>
      </div>

      {/* Right side - Login form */}
      <div className="flex w-full flex-col justify-center px-8 py-8 lg:w-1/2 lg:px-16 lg:py-0">
        <div className="mx-auto w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div className="bg-primary flex size-10 items-center justify-center rounded-lg">
              <Logo size="md" className="text-primary-foreground" />
            </div>
            <H4>{t('common:app.name')}</H4>
          </div>

          <div className="mb-8 text-center">
            <H1 className="mb-2">{t('login.title')}</H1>
            <BodySmall color="muted">{t('login.subtitle')}</BodySmall>
          </div>

          <Form form={form} onSubmit={onSubmit} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('login.email')}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t('login.emailPlaceholder')}
                      prefixIcon={<Mail />}
                      autoComplete="email"
                      autoFocus
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
                  <FormLabel>{t('login.password')}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t('login.passwordPlaceholder')}
                      prefixIcon={<Lock />}
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              loading={loginMutation.isPending}
            >
              {loginMutation.isPending
                ? t('login.submitting')
                : t('login.submit')}
            </Button>
          </Form>

          {/* Info hint */}
          <div className="bg-muted/50 mt-8 rounded-lg border p-4">
            <BodySmall color="muted">{t('login.info.hint')}</BodySmall>
          </div>
        </div>
      </div>
    </div>
  )
}
