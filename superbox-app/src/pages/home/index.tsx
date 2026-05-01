import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { parts, totalChapters, mvpCount, type Chapter } from '../../data/chapters'
import { totalTerms } from '../../data/glossary'
import { learningPaths } from '../../data/learning-paths'
import { newsTop10 } from '../../data/news'
import { totalQuizCount } from '../../data/chapter-quiz'
import {
  loadProgress,
  completedCount,
  dueReviews,
  type ProgressData
} from '../../utils/progress'
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
  const [expanded, setExpanded] = useState<Set<number>>(
    new Set(parts.map(p => p.num))
  )
  const [progress, setProgress] = useState<ProgressData | null>(null)

  useEffect(() => {
    setProgress(loadProgress())
  }, [])

  function togglePart(partNum: number) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(partNum)) next.delete(partNum)
      else next.add(partNum)
      return next
    })
  }

  function navigateToChapter(ch: Chapter) {
    const url = ch.pagePath || `/pages/chapter/index?ch=${ch.num}`
    Taro.navigateTo({ url })
  }

  const completed = progress ? completedCount(progress) : 0
  const dueCount = progress ? dueReviews(progress).length : 0
  const completionPct = totalChapters > 0
    ? Math.round((completed / totalChapters) * 100)
    : 0

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

      {/* 进度概览 + 仪表板入口 */}
      {progress && (completed > 0 || dueCount > 0) ? (
        <View
          className='progress-mini'
          onClick={() => Taro.navigateTo({ url: '/pages/progress/index' })}
        >
          <View className='progress-mini-info'>
            <Text className='pm-label'>📊 学习仪表板</Text>
            <View className='pm-bar'>
              <View
                className='pm-bar-fill'
                style={{ width: `${completionPct}%` }}
              ></View>
            </View>
            <Text className='pm-meta'>
              {completed}/{totalChapters} 章完成 · 连续 {progress.streakDays} 天
              {dueCount > 0 ? ` · ⏰ ${dueCount} 章待复习` : ''}
            </Text>
          </View>
          <Text className='pm-arrow'>→</Text>
        </View>
      ) : null}

      {/* 4 大入口 — 新功能 */}
      <View className='entry-grid'>
        <View
          className='entry-tile entry-amber'
          onClick={() => Taro.navigateTo({ url: '/pages/mvp/index' })}
        >
          <Text className='tile-emoji'>⭐</Text>
          <Text className='tile-title'>反预期精选</Text>
          <Text className='tile-meta'>{mvpCount} 章 · 教材没说但市场会教你</Text>
        </View>

        <View
          className='entry-tile entry-blue'
          onClick={() => Taro.navigateTo({ url: '/pages/paths/index' })}
        >
          <Text className='tile-emoji'>🗺️</Text>
          <Text className='tile-title'>学习地图</Text>
          <Text className='tile-meta'>{learningPaths.length} 条路径 · 按思维模块重组</Text>
        </View>

        <View
          className='entry-tile entry-purple'
          onClick={() => Taro.navigateTo({ url: '/pages/quiz/index' })}
        >
          <Text className='tile-emoji'>🧩</Text>
          <Text className='tile-title'>跨章测验</Text>
          <Text className='tile-meta'>{totalQuizCount} 题精选 · 单章 / 跨章 / 随机</Text>
        </View>

        <View
          className='entry-tile entry-green'
          onClick={() => Taro.navigateTo({ url: '/pages/glossary/index' })}
        >
          <Text className='tile-emoji'>📖</Text>
          <Text className='tile-title'>词汇附录</Text>
          <Text className='tile-meta'>{totalTerms} 词条 · 中英对照 · 反预期定义</Text>
        </View>
      </View>

      {/* 当日财经 Top 10 */}
      <View className='news-block'>
        <View className='section-header'>
          <Text className='section-tag'>📰 今日财经 Top 10</Text>
          <Text
            className='section-link'
            onClick={() => Taro.navigateTo({ url: '/pages/news/index' })}
          >
            查看全部 →
          </Text>
        </View>
        <View className='news-mini-list'>
          {newsTop10.slice(0, 3).map(n => (
            <View
              key={n.id}
              className='news-mini'
              onClick={() => Taro.navigateTo({ url: '/pages/news/index' })}
            >
              <Text className='news-mini-rank'>{n.rank}</Text>
              <View className='news-mini-body'>
                <Text className='news-mini-title'>{n.title}</Text>
                <View className='news-mini-tags'>
                  {n.knowledge.slice(0, 2).map((k, i) => (
                    <Text key={i} className='news-mini-tag'>
                      {k.type === 'chapter' ? `Ch${k.ref}` : k.ref}
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 完整目录 · 6 篇 25 章 */}
      <View className='section'>
        <View className='section-header'>
          <Text className='section-tag'>📚 完整目录 · 6 篇 {totalChapters} 章</Text>
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
                  {part.chapters.map(c => {
                    const stat = progress?.chapterStats[c.num]
                    return (
                      <View
                        key={c.num}
                        className={`mini-card mini-${c.tier}`}
                        onClick={() => navigateToChapter(c)}
                      >
                        <Text className='mini-emoji'>{c.emoji}</Text>
                        <View className='mini-body'>
                          <View className='mini-title-row'>
                            <Text className='mini-num'>第 {c.num} 章</Text>
                            {stat?.completed ? (
                              <Text className='mini-status mini-status-done'>✓ 已学</Text>
                            ) : c.tier === 'mvp' ? (
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
                    )
                  })}
                </View>
              ) : null}
            </View>
          )
        })}
      </View>

      <View className='footer-note'>
        <Text>原型 v2 · 米什金教材内容版权属 Pearson</Text>
      </View>
    </ScrollView>
  )
}
