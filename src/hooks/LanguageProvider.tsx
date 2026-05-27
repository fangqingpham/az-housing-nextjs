'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { translations, type Lang } from '@/lib/translations'
import { LanguageContext, STORAGE_KEY } from '@/hooks/useLanguage'

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
      <LanguageContext.Provider
        value={{ lang: 'en', setLang, t: translations['en'], showPicker: false, dismissPicker }}
      >
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
