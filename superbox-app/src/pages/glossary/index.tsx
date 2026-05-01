import { View, Text, ScrollView, Input } from '@tarojs/components'
import { useState, useMemo } from 'react'
import Taro from '@tarojs/taro'
import { glossary, totalTerms, type GlossaryItem } from '../../data/glossary'
import { findChapter } from '../../data/chapters'
import './index.scss'

export default function GlossaryPage() {
  const [query, setQuery] = useState('')
  const [activeGroup, setActiveGroup] = useState<string>('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return null
    const matches: { item: GlossaryItem; group: string }[] = []
    for (const g of glossary) {
      for (const item of g.items) {
        const hay = (item.zh + item.en + item.short + (item.twist || '')).toLowerCase()
        if (hay.includes(q)) matches.push({ item, group: g.title })
      }
    }
    return matches
  }, [query])

  function go(ch: number) {
    const found = findChapter(ch)
    const url = found?.chapter.pagePath || `/pages/chapter/index?ch=${ch}`
    Taro.navigateTo({ url })
  }

  return (
    <ScrollView scrollY className='glossary-page'>
      <View className='glossary-hero'>
        <Text className='hero-emoji'>📖</Text>
        <Text className='hero-title'>词汇附录</Text>
        <Text className='hero-subtitle'>
          {totalTerms} 个核心术语 · 中英对照 · 反预期一句话定义
        </Text>
      </View>

      {/* 搜索 */}
      <View className='search-box'>
        <Text className='search-icon'>🔍</Text>
        <Input
          className='search-input'
          placeholder='搜索术语 / 英文 / 关键词'
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
            <Text>全部</Text>
          </View>
          {glossary.map(g => (
            <View
              key={g.id}
              className={`filter-chip ${activeGroup === g.id ? 'active' : ''}`}
              onClick={() => setActiveGroup(g.id)}
            >
              <Text>{g.emoji} {g.title}</Text>
            </View>
          ))}
        </ScrollView>
      ) : null}

      {/* 搜索结果 */}
      {filtered ? (
        <View className='search-results'>
          <Text className='result-meta'>
            {filtered.length === 0 ? '未找到匹配术语' : `匹配 ${filtered.length} 条`}
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
                    第 {ch} 章 →
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
                    <Text className='group-title'>{g.title}</Text>
                    <Text className='group-desc'>{g.desc} · {g.items.length} 条</Text>
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
        <Text>米什金《货币金融学》第 11 版 · 核心术语精选</Text>
      </View>
    </ScrollView>
  )
}
