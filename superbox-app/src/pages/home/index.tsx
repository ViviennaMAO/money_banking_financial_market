import { View, Text, ScrollView } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import { parts, mvpChapters, totalChapters, mvpCount, basicCount, type Chapter } from '../../data/chapters'
import './index.scss'

const principles = [
  { name: '测试效应', color: 'p-blue' },
  { name: '生成效应', color: 'p-amber' },
  { name: '反预期', color: 'p-red' },
  { name: '必要难度', color: 'p-green' },
  { name: '自解释', color: 'p-purple' },
  { name: '元认知', color: 'p-cyan' }
]

export default function Home() {
  // 默认展开所有篇(用户可自由折叠)
  const [expanded, setExpanded] = useState<Set<number>>(
    new Set(parts.map(p => p.num))
  )

  function togglePart(partNum: number) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(partNum)) next.delete(partNum)
      else next.add(partNum)
      return next
    })
  }

  function navigateToChapter(ch: Chapter, _partNum: number) {
    const url = ch.pagePath || `/pages/chapter/index?ch=${ch.num}`
    Taro.navigateTo({ url })
  }

  return (
    <ScrollView scrollY className='home'>
      {/* Hero */}
      <View className='hero'>
        <Text className='hero-tag'>让米什金的理论 · 在今天的市场上立刻验证</Text>
        <Text className='hero-title'>
          把<Text className='hero-accent'>货币金融学</Text>{'\n'}
          变成你能<Text className='hero-warm'>动手玩</Text>的活教材
        </Text>
      </View>

      {/* 学习科学 6 锚点 */}
      <View className='card principles'>
        <Text className='card-tag'>设计原则 · 6 条学习科学锚点</Text>
        <View className='badges'>
          {principles.map(p => (
            <Text key={p.name} className={`badge ${p.color}`}>{p.name}</Text>
          ))}
        </View>
      </View>

      {/* MVP 三章 · 大卡片(突出反预期) */}
      <View className='section'>
        <View className='section-header'>
          <Text className='section-tag'>⭐ MVP 三章 · 专属互动模拟器</Text>
          <Text className='section-meta'>{mvpCount}/{totalChapters}</Text>
        </View>
        <View className='mvp-list'>
          {mvpChapters.map(c => (
            <View
              key={c.num}
              className='mvp-card'
              onClick={() => navigateToChapter(c, 0)}
            >
              <View className='ch-row'>
                <View>
                  <Text className='ch-num'>第 {c.num} 章</Text>
                  <Text className='ch-title'>{c.title}</Text>
                  <Text className='ch-meta'>
                    {c.duration} · {'⭐'.repeat(c.difficulty)}
                  </Text>
                </View>
                <Text className='ch-emoji'>{c.emoji}</Text>
              </View>
              {c.hook ? <Text className='ch-hook'>{c.hook}</Text> : null}
              <Text className='ch-cta'>立刻试一下 →</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 完整目录 · 6 篇 25 章 */}
      <View className='section'>
        <View className='section-header'>
          <Text className='section-tag'>📖 完整目录 · 6 篇 {totalChapters} 章</Text>
          <Text className='section-meta'>点击篇名展开 / 收起</Text>
        </View>

        {parts.map(part => {
          const isOpen = expanded.has(part.num)
          const mvpInPart = part.chapters.filter(c => c.tier === 'mvp').length
          return (
            <View key={part.num} className='part-block'>
              <View
                className={`part-header ${isOpen ? 'open' : ''}`}
                onClick={() => togglePart(part.num)}
              >
                <View className='part-info'>
                  <Text className='part-title'>第 {part.num} 篇 · {part.title}</Text>
                  <Text className='part-desc'>{part.desc}</Text>
                  <Text className='part-meta'>
                    {part.range} · {part.chapters.length} 章
                    {mvpInPart > 0 ? ` · ${mvpInPart} 章 ⭐ MVP` : ''}
                  </Text>
                </View>
                <Text className='part-arrow'>{isOpen ? '▾' : '▸'}</Text>
              </View>

              {isOpen ? (
                <View className='part-chapters'>
                  {part.chapters.map(c => (
                    <View
                      key={c.num}
                      className={`mini-card mini-${c.tier}`}
                      onClick={() => navigateToChapter(c, part.num)}
                    >
                      <Text className='mini-emoji'>{c.emoji}</Text>
                      <View className='mini-body'>
                        <View className='mini-title-row'>
                          <Text className='mini-num'>第 {c.num} 章</Text>
                          {c.tier === 'mvp' ? (
                            <Text className='mini-status mini-status-mvp'>⭐ 专属</Text>
                          ) : (
                            <Text className='mini-status mini-status-basic'>● 概览版</Text>
                          )}
                        </View>
                        <Text className='mini-title'>{c.title}</Text>
                        <Text className='mini-brief'>{c.brief}</Text>
                        <Text className='mini-stars'>{'⭐'.repeat(c.difficulty)}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          )
        })}
      </View>

      <View className='footer-note'>
        <Text>原型 v1 · 米什金教材内容版权属 Pearson</Text>
      </View>
    </ScrollView>
  )
}
