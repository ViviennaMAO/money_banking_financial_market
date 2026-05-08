import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { mvpChapters, type Chapter } from '../../data/chapters'
import { useT, pickL } from '../../i18n'
import './index.scss'

function fmt(tpl: string, vars: Record<string, string | number>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''))
}

export default function MvpPage() {
  const { t, locale, toggle } = useT()

  function go(ch: Chapter) {
    const url = ch.pagePath || `/pages/chapter/index?ch=${ch.num}`
    Taro.navigateTo({ url })
  }

  const sorted = [...mvpChapters].sort((a, b) => a.num - b.num)

  return (
    <ScrollView scrollY className='mvp-page'>
      <View className='lang-switch' onClick={toggle}>
        <Text className='lang-icon'>🌐</Text>
        <Text className='lang-label'>{t.common.langSwitch}</Text>
      </View>

      <View className='mvp-hero'>
        <Text className='hero-emoji'>⭐</Text>
        <Text className='hero-title'>{t.mvpPage.title}</Text>
        <Text className='hero-subtitle'>
          {fmt(t.mvpPage.subtitleTpl, { n: sorted.length })}
        </Text>
      </View>

      <View className='mvp-list'>
        {sorted.map(c => {
          const chTitle = pickL(c, 'title', locale)
          const chHook = pickL(c, 'hook', locale)
          return (
            <View
              key={c.num}
              className='mvp-card'
              onClick={() => go(c)}
            >
              <View className='card-row'>
                <Text className='card-emoji'>{c.emoji}</Text>
                <View className='card-body'>
                  <View className='card-meta'>
                    <Text className='card-num'>{fmt(t.common.chapter, { n: c.num })}</Text>
                    <Text className='card-stars'>{'⭐'.repeat(c.difficulty)}</Text>
                  </View>
                  <Text className='card-title'>{chTitle}</Text>
                </View>
              </View>
              {chHook ? (
                <View className='card-hook'>
                  <Text className='hook-flag'>⚡</Text>
                  <Text className='hook-text'>{chHook}</Text>
                </View>
              ) : null}
              <Text className='card-cta'>{t.mvpPage.cta}</Text>
            </View>
          )
        })}
      </View>

      <View className='footer-note'>
        <Text>{t.mvpPage.foot}</Text>
      </View>
    </ScrollView>
  )
}
