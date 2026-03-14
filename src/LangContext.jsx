import { createContext, useContext, useState } from 'react'
import { T } from './i18n'

const LangContext = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLang] = useState('en')
  const t = T[lang]
  const toggle = () => setLang(l => l === 'en' ? 'roh' : 'en')
  return (
    <LangContext.Provider value={{ lang, t, toggle }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
