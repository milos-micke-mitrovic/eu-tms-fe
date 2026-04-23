import { useTranslation } from 'react-i18next'
import { Languages } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/overlay/dropdown-menu'
import { BodySmall } from '@/shared/ui/typography'

const languages = [
  { code: 'sr', label: 'Srpski' },
  { code: 'en', label: 'English' },
] as const

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation('common')
  const currentLang = i18n.language

  const handleChange = (code: string) => {
    i18n.changeLanguage(code)
    localStorage.setItem('i18n-lang', code)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('aria.selectLanguage')}
        >
          <Languages className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map(({ code, label }) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleChange(code)}
            className={currentLang === code ? 'bg-accent' : ''}
          >
            <BodySmall>{label}</BodySmall>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
