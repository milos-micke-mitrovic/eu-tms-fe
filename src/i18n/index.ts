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
import reportsSr from './locales/sr/reports.json'
import permitsSr from './locales/sr/permits.json'
import tenantsSr from './locales/sr/tenants.json'
import usersSr from './locales/sr/users.json'
import tachographSr from './locales/sr/tachograph.json'
import payrollSr from './locales/sr/payroll.json'
import collectionsSr from './locales/sr/collections.json'

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
import reportsEn from './locales/en/reports.json'
import permitsEn from './locales/en/permits.json'
import tenantsEn from './locales/en/tenants.json'
import usersEn from './locales/en/users.json'
import tachographEn from './locales/en/tachograph.json'
import payrollEn from './locales/en/payroll.json'
import collectionsEn from './locales/en/collections.json'

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
    reports: reportsSr,
    permits: permitsSr,
    tenants: tenantsSr,
    users: usersSr,
    tachograph: tachographSr,
    payroll: payrollSr,
    collections: collectionsSr,
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
    reports: reportsEn,
    permits: permitsEn,
    tenants: tenantsEn,
    users: usersEn,
    tachograph: tachographEn,
    payroll: payrollEn,
    collections: collectionsEn,
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
