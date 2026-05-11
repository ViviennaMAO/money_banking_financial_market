import { View, Text, ScrollView, Input } from '@tarojs/components'
import { useState, useMemo } from 'react'
import Taro from '@tarojs/taro'
import { glossary, totalTerms, type GlossaryItem } from '../../data/glossary'
import { findChapter } from '../../data/chapters'
import { useT, pickL } from '../../i18n'
import './index.scss'

function fmt(tpl: string, vars: Record<string, string | number>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''))
}

export default function GlossaryPage() {
  const { t, locale, toggle } = useT()
  const [query, setQuery] = useState('')
  const [activeGroup, setActiveGroup] = useState<string>('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return null
    const matches: { item: GlossaryItem; group: string }[] = []
    for (const g of glossary) {
      const groupTitle = pickL(g, 'title', locale)
      for (const item of g.items) {
        const hay = (item.zh + item.en + item.short + (item.twist || '')).toLowerCase()
        if (hay.includes(q)) matches.push({ item, group: groupTitle })
      }
    }
    return matches
  }, [query, locale])

  function go(ch: number) {
    const found = findChapter(ch)
    const url = found?.chapter.pagePath || `/pages/chapter/index?ch=${ch}`
    Taro.navigateTo({ url })
  }

  return (
    <ScrollView scrollY className='glossary-page'>
      <View className='lang-switch' onClick={toggle}>
        <Text className='lang-icon'>🌐</Text>
        <Text className='lang-label'>{t.common.langSwitch}</Text>
      </View>

      <View className='glossary-hero'>
        <Text className='hero-emoji'>📖</Text>
        <Text className='hero-title'>{t.glossaryPage.title}</Text>
        <Text className='hero-subtitle'>
          {fmt(t.glossaryPage.subtitleTpl, { n: totalTerms })}
        </Text>
      </View>

      {/* 搜索 */}
      <View className='search-box'>
        <Text className='search-icon'>🔍</Text>
        <Input
          className='search-input'
          placeholder={t.glossaryPage.searchPlaceholder}
          value={query}
          onInput={e => setQuery(e.detail.value)}
        />
        {query ? (
          <Text className='search-clear' onClick={() => setQuery('')}>×</Text>
        ) : null}
      </View>

      {/* 分组筛选 */}
      {!query ? (
        <ScrollView scrollX className='group-filter' showScrollbar={false}>
          <View
            className={`filter-chip ${activeGroup === 'all' ? 'active' : ''}`}
            onClick={() => setActiveGroup('all')}
          >
            <Text>{t.glossaryPage.filterAll}</Text>
          </View>
          {glossary.map(g => (
            <View
              key={g.id}
              className={`filter-chip ${activeGroup === g.id ? 'active' : ''}`}
              onClick={() => setActiveGroup(g.id)}
            >
              <Text>{g.emoji} {pickL(g, 'title', locale)}</Text>
            </View>
          ))}
        </ScrollView>
      ) : null}

      {/* 搜索结果 */}
      {filtered ? (
        <View className='search-results'>
          <Text className='result-meta'>
            {filtered.length === 0 ? t.glossaryPage.notFound : fmt(t.glossaryPage.matched, { n: filtered.length })}
          </Text>
          {filtered.map(({ item, group }) => (
            <View key={item.zh} className='term-card'>
              <View className='term-head'>
                <Text className='term-zh'>{item.zh}</Text>
                <Text className='term-tag'>{group}</Text>
              </View>
              <Text className='term-en'>{item.en}</Text>
              <Text className='term-short'>{item.short}</Text>
              {item.twist ? (
                <View className='term-twist'>
                  <Text className='twist-flag'>⚡</Text>
                  <Text className='twist-text'>{item.twist}</Text>
                </View>
              ) : null}
              <View className='term-chapters'>
                {item.chapters.map(ch => (
                  <Text
                    key={ch}
                    className='ch-link'
                    onClick={() => go(ch)}
                  >
                    {fmt(t.glossaryPage.chapterLink, { n: ch })}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </View>
      ) : (
        // 分组浏览
        <View className='groups-view'>
          {glossary
            .filter(g => activeGroup === 'all' || activeGroup === g.id)
            .map(g => (
              <View key={g.id} className='group-block'>
                <View className='group-head'>
                  <Text className='group-emoji'>{g.emoji}</Text>
                  <View className='group-info'>
                    <Text className='group-title'>{pickL(g, 'title', locale)}</Text>
                    <Text className='group-desc'>{pickL(g, 'desc', locale)} · {g.items.length}</Text>
                  </View>
                </View>
                <View className='term-list'>
                  {g.items.map(item => (
                    <View key={item.zh} className='term-card'>
                      <View className='term-head'>
                        <Text className='term-zh'>{item.zh}</Text>
                      </View>
                      <Text className='term-en'>{item.en}</Text>
                      <Text className='term-short'>{item.short}</Text>
                      {item.twist ? (
                        <View className='term-twist'>
                          <Text className='twist-flag'>⚡</Text>
                          <Text className='twist-text'>{item.twist}</Text>
                        </View>
                      ) : null}
                      <View className='term-chapters'>
                        {item.chapters.map(ch => (
                          <Text
                            key={ch}
                            className='ch-link'
                            onClick={() => go(ch)}
                          >
                            第 {ch} 章 →
                          </Text>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))}
        </View>
      )}

      <View className='footer-note'>
        <Text>{t.glossaryPage.foot}</Text>
      </View>
    </ScrollView>
  )
}
