export const COUNTRY_CODES = [
  { code: 'AT', name: 'Austrija' },
  { code: 'DE', name: 'Nemačka' },
  { code: 'IT', name: 'Italija' },
  { code: 'FR', name: 'Francuska' },
  { code: 'HU', name: 'Mađarska' },
  { code: 'RO', name: 'Rumunija' },
  { code: 'BG', name: 'Bugarska' },
  { code: 'HR', name: 'Hrvatska' },
  { code: 'SI', name: 'Slovenija' },
  { code: 'BA', name: 'Bosna i Hercegovina' },
  { code: 'ME', name: 'Crna Gora' },
  { code: 'MK', name: 'Severna Makedonija' },
  { code: 'AL', name: 'Albanija' },
  { code: 'GR', name: 'Grčka' },
  { code: 'TR', name: 'Turska' },
  { code: 'CZ', name: 'Češka' },
  { code: 'SK', name: 'Slovačka' },
  { code: 'PL', name: 'Poljska' },
  { code: 'BE', name: 'Belgija' },
  { code: 'NL', name: 'Holandija' },
  { code: 'CH', name: 'Švajcarska' },
  { code: 'UA', name: 'Ukrajina' },
  { code: 'RU', name: 'Rusija' },
  { code: 'BY', name: 'Belorusija' },
] as const

export const PERMIT_STATUS_COLORS: Record<
  string,
  {
    variant: 'default' | 'secondary' | 'outline' | 'destructive'
    label: string
  }
> = {
  AVAILABLE: { variant: 'default', label: 'Dostupna' },
  ASSIGNED: { variant: 'secondary', label: 'Dodeljena' },
  IN_USE: { variant: 'outline', label: 'U upotrebi' },
  EXPIRED: { variant: 'destructive', label: 'Istekla' },
  USED: { variant: 'outline', label: 'Iskorišćena' },
}
