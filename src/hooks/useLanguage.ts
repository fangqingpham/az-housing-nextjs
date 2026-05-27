'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { translations, type Lang } from '@/lib/translations'

const STORAGE_KEY = 'az-lang'

export interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: typeof translations['en']
  showPicker: boolean
  dismissPicker: () => void
}

export const LanguageContext = createContext<LanguageContextValue | null>(null)

export { STORAGE_KEY }

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>')
  return ctx
}
