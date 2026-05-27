'use client'

import { createContext, useContext } from 'react'
import { translations, type Lang } from '@/lib/translations'

export const STORAGE_KEY = 'az-lang'

export interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: typeof translations[Lang]
  showPicker: boolean
  dismissPicker: () => void
}

export const LanguageContext = createContext<LanguageContextValue | null>(null)

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>')
  return ctx
}
