import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Serbian (default)
import commonSr from './locales/sr/common.json'
import navigationSr from './locales/sr/navigation.json'
import authSr from './locales/sr/auth.json'
import fleetSr from './locales/sr/fleet.json'
import partnersSr from './locales/sr/partners.json'
import speditionSr from './locales/sr/spedition.json'
import fuelSr from './locales/sr/fuel.json'
import dashboardSr from './locales/sr/dashboard.json'
import financeSr from './locales/sr/finance.json'

// English (fallback)
import commonEn from './locales/en/common.json'
import navigationEn from './locales/en/navigation.json'
import authEn from './locales/en/auth.json'
import fleetEn from './locales/en/fleet.json'
import partnersEn from './locales/en/partners.json'
import speditionEn from './locales/en/spedition.json'
import fuelEn from './locales/en/fuel.json'
import dashboardEn from './locales/en/dashboard.json'
import financeEn from './locales/en/finance.json'

export const defaultNS = 'common'

export const resources = {
  sr: {
    common: commonSr,
    navigation: navigationSr,
    auth: authSr,
    fleet: fleetSr,
    partners: partnersSr,
    spedition: speditionSr,
    fuel: fuelSr,
    dashboard: dashboardSr,
    finance: financeSr,
  },
  en: {
    common: commonEn,
    navigation: navigationEn,
    auth: authEn,
    fleet: fleetEn,
    partners: partnersEn,
    spedition: speditionEn,
    fuel: fuelEn,
    dashboard: dashboardEn,
    finance: financeEn,
  },
} as const

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('i18n-lang') || 'sr',
  defaultNS,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
