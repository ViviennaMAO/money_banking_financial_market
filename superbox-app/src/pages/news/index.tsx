import { View, Text, ScrollView } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import { newsTop10, newsCategoryLabel, type NewsItem } from '../../data/news'
import { findChapter } from '../../data/chapters'
import { useT } from '../../i18n'
import './index.scss'

export default function NewsPage() {
  const { t, toggle } = useT()
  const [active, setActive] = useState<NewsItem | null>(null)

  function open(item: NewsItem) {
    setActive(item)
  }
  function back() {
    setActive(null)
  }

  function goKnowledge(k: NewsItem['knowledge'][number]) {
    if (k.type === 'chapter') {
      const ch = findChapter(Number(k.ref))?.chapter
      const url = ch?.pagePath || `/pages/chapter/index?ch=${k.ref}`
      Taro.navigateTo({ url })
    } else if (k.type === 'glossary') {
      Taro.navigateTo({ url: '/pages/glossary/index' })
    } else if (k.type === 'path') {
      Taro.navigateTo({ url: '/pages/paths/index' })
    }
  }

  if (active) {
    return (
      <ScrollView scrollY className='news-page'>
        <View className='back-bar' onClick={back}>
          <Text>← 返回 Top 10</Text>
        </View>

        <View className='detail-head'>
          <View className='detail-meta'>
            <Text className='detail-rank'>#{active.rank}</Text>
            <Text className='detail-cat'>{newsCategoryLabel[active.category]}</Text>
            <Text className='detail-date'>{active.date}</Text>
          </View>
          <Text className='detail-title'>{active.title}</Text>
          <Text className='detail-summary'>{active.summary}</Text>
        </View>

        <View className='detail-body'>
          <Text className='detail-tag'>📰 深度分析</Text>
          {active.body.split('\n\n').map((para, i) => (
            <Text key={i} className='detail-para'>{para}</Text>
          ))}
        </View>

        <View className='detail-twist'>
          <Text className='twist-flag'>⚡ 反预期</Text>
          <Text className='twist-text'>{active.twist}</Text>
        </View>

        <View className='detail-knowledge'>
          <Text className='kn-tag'>🎓 涉及知识点 · 点击进入学习</Text>
          {active.knowledge.map((k, i) => (
            <View
              key={i}
              className='kn-card'
              onClick={() => goKnowledge(k)}
            >
              <View className='kn-info'>
                <Text className='kn-type'>
                  {k.type === 'chapter' ? `第 ${k.ref} 章` : k.type === 'glossary' ? `词条 · ${k.ref}` : `路径 · ${k.ref}`}
                </Text>
                <Text className='kn-why'>{k.why}</Text>
              </View>
              <Text className='kn-arrow'>→</Text>
            </View>
          ))}
        </View>

        <View className='footer-note'>
          <Text>新闻为模拟版 · 数据基于 2024-25 真实事件改编</Text>
        </View>
      </ScrollView>
    )
  }

  return (
    <ScrollView scrollY className='news-page'>
      <View className='lang-switch' onClick={toggle}>
        <Text className='lang-icon'>🌐</Text>
        <Text className='lang-label'>{t.common.langSwitch}</Text>
      </View>

      <View className='news-hero'>
        <Text className='hero-emoji'>📰</Text>
        <Text className='hero-title'>{t.newsPage.title}</Text>
        <Text className='hero-subtitle'>{t.newsPage.subtitle}</Text>
        <Text className='hero-date'>{newsTop10[0].date}</Text>
      </View>

      <View className='news-list'>
        {newsTop10.map(item => (
          <View
            key={item.id}
            className='news-card'
            onClick={() => open(item)}
          >
            <View className='news-rank'>{item.rank}</View>
            <View className='news-body'>
              <View className='news-meta'>
                <Text className='news-cat'>{newsCategoryLabel[item.category]}</Text>
                <Text className='news-emoji'>{item.emoji}</Text>
              </View>
              <Text className='news-title'>{item.title}</Text>
              <Text className='news-summary'>{item.summary}</Text>
              <View className='news-footer'>
                <View className='kn-pills'>
                  {item.knowledge.slice(0, 3).map((k, i) => (
                    <Text key={i} className='kn-pill'>
                      {k.type === 'chapter' ? `Ch${k.ref}` : k.type === 'glossary' ? k.ref : k.ref}
                    </Text>
                  ))}
                </View>
                <Text className='news-go'>展开 →</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View className='footer-note'>
        <Text>每日推送 · 真实事件改编模拟版</Text>
      </View>
    </ScrollView>
  )
}
