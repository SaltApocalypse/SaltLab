import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en'
import zh from './locales/zh'

export type Lang = 'en' | 'zh'

export const LANG_STORAGE_KEY = 'saltlab.lang'

/** 支持的语言选项（label 使用语言母语名） */
export const LANGUAGES: { value: Lang; label: string }[] = [
  { value: 'zh', label: '中文' },
  { value: 'en', label: 'English' },
]

/** 当前语言 */
export function getCurrentLang(): Lang {
  return i18n.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

/** 初始语言：优先 localStorage，其次浏览器语言，最后回退 en */
function getInitialLang(): Lang {
  if (typeof window === 'undefined') return 'en'
  const saved = window.localStorage.getItem(LANG_STORAGE_KEY)
  if (saved === 'en' || saved === 'zh') return saved
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
  },
  lng: getInitialLang(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

/** 切换语言并持久化到 localStorage */
export function changeLanguage(lang: Lang) {
  i18n.changeLanguage(lang)
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(LANG_STORAGE_KEY, lang)
  }
}

export default i18n
