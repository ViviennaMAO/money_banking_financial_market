/* 极简 i18n:locale storage + 全局事件 + useT hook
 *
 * 用法:
 *   import { useT } from '../../i18n'
 *   const { t, locale, toggle } = useT()
 *   <Text>{t.hero.tag}</Text>
 *   <View onClick={toggle}>{locale === 'zh' ? 'EN' : '中'}</View>
 *
 * 设计:
 *   - locale 持久化在 Taro.storage(key: lang-v1)
 *   - 切换时通过自定义事件通知所有 useT 实例同步刷新
 *   - 字典在编译时静态导入 zh / en,运行时按 locale 选取
 */

import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { zh } from './zh'
import { en } from './en'

export type Locale = 'zh' | 'en'

const STORAGE_KEY = 'lang-v1'
const EVENT = 'mishkin-locale-change'

const dict = { zh, en } as const

export type Dict = typeof zh

/* ===== 模块级 state ===== */
let currentLocale: Locale = (() => {
  try {
    const v = Taro.getStorageSync(STORAGE_KEY)
    if (v === 'en' || v === 'zh') return v
  } catch {}
  return 'zh'
})()

const listeners = new Set<(l: Locale) => void>()

export function getLocale(): Locale {
  return currentLocale
}

export function setLocale(l: Locale): void {
  if (l === currentLocale) return
  currentLocale = l
  try {
    Taro.setStorageSync(STORAGE_KEY, l)
  } catch {}
  listeners.forEach(fn => fn(l))
}

export function toggleLocale(): void {
  setLocale(currentLocale === 'zh' ? 'en' : 'zh')
}

/* ===== React hook ===== */

export function useT() {
  const [locale, setLocaleState] = useState<Locale>(currentLocale)

  useEffect(() => {
    const listener = (l: Locale) => setLocaleState(l)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  return {
    locale,
    t: dict[locale],
    toggle: () => toggleLocale(),
    set: (l: Locale) => setLocale(l)
  }
}

/* ===== 双语字段选择 helper(给数据层用) ===== */

/**
 * 数据层约定:
 *   { title: '中文', title_en: 'English' }
 * 取值时:
 *   pickL({ title, title_en }, 'title', locale)
 */
export function pickL<T extends Record<string, any>, K extends string>(
  obj: T,
  key: K,
  locale: Locale
): string {
  if (locale === 'en') {
    const enKey = `${key}_en` as keyof T
    const v = obj[enKey]
    if (typeof v === 'string' && v.length > 0) return v
  }
  return (obj as any)[key] || ''
}

/** 构造一个对象,把 {key, key_en} 平摊为按当前 locale 选好的版本 */
export function localized<T extends Record<string, any>>(
  obj: T,
  locale: Locale
): T {
  if (locale === 'zh') return obj
  const result: any = { ...obj }
  for (const k of Object.keys(obj)) {
    if (k.endsWith('_en')) continue
    const enKey = `${k}_en`
    if (typeof obj[enKey] === 'string' && obj[enKey].length > 0) {
      result[k] = obj[enKey]
    }
  }
  return result as T
}
