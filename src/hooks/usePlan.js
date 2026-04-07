import { useAuth } from './useAuth.js'

const PLAN_FEATURES = {
  patient: {
    free: {
      max_scans: 2,
      pulse: false,
      forecast: false,
      full_recipe: false,
      history: false,
      pdf_export: false,
      messaging: true,
      family: false,
    },
    basic: {
      max_scans: 8,
      pulse: false,
      forecast: true,
      full_recipe: true,
      history: true,
      pdf_export: false,
      messaging: true,
      family: false,
    },
    pro: {
      max_scans: Infinity,
      pulse: true,
      forecast: true,
      full_recipe: true,
      history: true,
      pdf_export: true,
      messaging: true,
      family: false,
    },
    pro_family: {
      max_scans: Infinity,
      pulse: true,
      forecast: true,
      full_recipe: true,
      history: true,
      pdf_export: true,
      messaging: true,
      family: true,
    },
  },
  doctor: {
    free: {
      max_walkins: 10,
      messaging: false,
      analytics: false,
      advanced_analytics: false,
      pdf_export: false,
      priority_map: false,
      branding: false,
    },
    standard: {
      max_walkins: Infinity,
      messaging: true,
      analytics: true,
      advanced_analytics: false,
      pdf_export: true,
      priority_map: false,
      branding: false,
    },
    pro: {
      max_walkins: Infinity,
      messaging: true,
      analytics: true,
      advanced_analytics: true,
      pdf_export: true,
      priority_map: true,
      branding: true,
    },
  },
}

export function usePlan() {
  const { user } = useAuth()

  const role = user?.role || 'patient'
  const plan = user?.plan || 'free'
  const features = PLAN_FEATURES[role]?.[plan] || PLAN_FEATURES[role]?.['free']

  function hasFeature(feature) {
    return features?.[feature] === true
  }

  function canScan(currentCount) {
    const max = features?.max_scans ?? 2
    return currentCount < max
  }

  function canWalkin(currentCount) {
    const max = features?.max_walkins ?? 10
    return currentCount < max
  }

  return {
    plan,
    role,
    features,
    hasFeature,
    canScan,
    canWalkin,
    isPro: plan === 'pro' || plan === 'pro_family',
    isBasic: plan === 'basic',
    isFree: plan === 'free',
    isDoctor: role === 'doctor',
    isPatient: role === 'patient',
  }
}
