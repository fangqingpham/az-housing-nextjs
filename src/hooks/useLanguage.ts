'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { translations, type Lang } from '@/lib/translations'

const STORAGE_KEY = 'az-lang'

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: typeof translations['en']
  showPicker: boolean
  dismissPicker: () => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')
  const [showPicker, setShowPicker] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null
    if (saved === 'en' || saved === 'zh') {
      setLangState(saved)
      setShowPicker(false)
    } else {
      // First visit — show picker after a short delay so the page loads first
      const timer = setTimeout(() => setShowPicker(true), 700)
      return () => clearTimeout(timer)
    }
  }, [])

  const setLang = (newLang: Lang) => {
    setLangState(newLang)
    localStorage.setItem(STORAGE_KEY, newLang)
    setShowPicker(false)
  }

  const dismissPicker = () => setLang('en')

  const t = translations[lang]

  // Avoid hydration mismatch — render English on server / first paint
  if (!mounted) {
    return (
      <LanguageContext.Provider value={{ lang: 'en', setLang, t: translations['en'], showPicker: false, dismissPicker }}>
        {children}
      </LanguageContext.Provider>
    )
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, showPicker, dismissPicker }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>')
  return ctx
}
