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
import { useT, pickL } from '../../i18n'
import './index.scss'

function fmt(tpl: string, vars: Record<string, string | number>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''))
}

export default function Home() {
  const { t, locale, toggle } = useT()
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
      {/* 语言切换按钮 */}
      <View className='lang-switch' onClick={toggle}>
        <Text className='lang-icon'>🌐</Text>
        <Text className='lang-label'>{t.common.langSwitch}</Text>
      </View>

      {/* Hero */}
      <View className='hero'>
        <Text className='hero-tag'>{t.hero.tag}</Text>
        <Text className='hero-title'>
          {locale === 'zh' ? (
            <>把<Text className='hero-accent'>{t.hero.titleAccent1}</Text>{'\n'}
            变成你能<Text className='hero-warm'>{t.hero.titleAccent2}</Text>的活教材</>
          ) : (
            <>Turn <Text className='hero-accent'>{t.hero.titleAccent1}</Text>{'\n'}
            into a hands-on, <Text className='hero-warm'>{t.hero.titleAccent2}</Text> textbook</>
          )}
        </Text>
      </View>

      {/* 进度概览 + 仪表板入口(有进度时显示) */}
      {progress && (completed > 0 || dueCount > 0) ? (
        <View
          className='progress-mini'
          onClick={() => Taro.navigateTo({ url: '/pages/progress/index' })}
        >
          <View className='progress-mini-info'>
            <Text className='pm-label'>{t.progressMini.label}</Text>
            <View className='pm-bar'>
              <View
                className='pm-bar-fill'
                style={{ width: `${completionPct}%` }}
              ></View>
            </View>
            <Text className='pm-meta'>
              {fmt(t.progressMini.summary, { done: completed, total: totalChapters, streak: progress.streakDays })}
              {dueCount > 0 ? fmt(t.progressMini.due, { n: dueCount }) : ''}
            </Text>
          </View>
          <Text className='pm-arrow'>→</Text>
        </View>
      ) : null}

      {/* ==================== 1. 完整目录 ==================== */}
      <View className='section'>
        <View className='section-header'>
          <Text className='section-tag'>{t.features.toc} · {fmt(t.features.tocSub, { n: totalChapters })}</Text>
          <Text className='section-meta'>{t.features.tocMeta}</Text>
        </View>

        {parts.map(part => {
          const isOpen = expanded.has(part.num)
          const mvpInPart = part.chapters.filter(c => c.tier === 'mvp').length
          const partTitle = pickL(part, 'title', locale)
          const partDesc = pickL(part, 'desc', locale)
          return (
            <View key={part.num} className='part-block'>
              <View
                className={`part-header ${isOpen ? 'open' : ''}`}
                onClick={() => togglePart(part.num)}
              >
                <View className='part-info'>
                  <Text className='part-title'>{fmt(t.common.part, { n: part.num })} · {partTitle}</Text>
                  <Text className='part-desc'>{partDesc}</Text>
                  <Text className='part-meta'>
                    {fmt(t.toc.range, { range: part.range, n: part.chapters.length })}
                    {mvpInPart > 0 ? fmt(t.toc.mvpInPart, { n: mvpInPart }) : ''}
                  </Text>
                </View>
                <Text className='part-arrow'>{isOpen ? '▾' : '▸'}</Text>
              </View>

              {isOpen ? (
                <View className='part-chapters'>
                  {part.chapters.map(c => {
                    const stat = progress?.chapterStats[c.num]
                    const chTitle = pickL(c, 'title', locale)
                    const chBrief = pickL(c, 'brief', locale)
                    return (
                      <View
                        key={c.num}
                        className={`mini-card mini-${c.tier}`}
                        onClick={() => navigateToChapter(c)}
                      >
                        <Text className='mini-emoji'>{c.emoji}</Text>
                        <View className='mini-body'>
                          <View className='mini-title-row'>
                            <Text className='mini-num'>{fmt(t.common.chapter, { n: c.num })}</Text>
                            {stat?.completed ? (
                              <Text className='mini-status mini-status-done'>{t.toc.statusDone}</Text>
                            ) : c.tier === 'mvp' ? (
                              <Text className='mini-status mini-status-mvp'>{t.toc.statusMvp}</Text>
                            ) : (
                              <Text className='mini-status mini-status-basic'>{t.toc.statusBasic}</Text>
                            )}
                          </View>
                          <Text className='mini-title'>{chTitle}</Text>
                          <Text className='mini-brief'>{chBrief}</Text>
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

      {/* ==================== 2. 学习地图 ==================== */}
      <View
        className='feature-card feature-blue'
        onClick={() => Taro.navigateTo({ url: '/pages/paths/index' })}
      >
        <Text className='feat-emoji'>🗺️</Text>
        <View className='feat-body'>
          <Text className='feat-title'>{t.features.paths}</Text>
          <Text className='feat-desc'>{fmt(t.features.pathsDesc, { n: learningPaths.length })}</Text>
          <Text className='feat-meta'>{t.features.pathsMeta}</Text>
        </View>
        <Text className='feat-arrow'>→</Text>
      </View>

      {/* ==================== 3. 反预期精选 ==================== */}
      <View
        className='feature-card feature-amber'
        onClick={() => Taro.navigateTo({ url: '/pages/mvp/index' })}
      >
        <Text className='feat-emoji'>⭐</Text>
        <View className='feat-body'>
          <Text className='feat-title'>{t.features.mvp}</Text>
          <Text className='feat-desc'>{fmt(t.features.mvpDesc, { n: mvpCount })}</Text>
          <Text className='feat-meta'>{t.features.mvpMeta}</Text>
        </View>
        <Text className='feat-arrow'>→</Text>
      </View>

      {/* ==================== 4. 跨章测验 ==================== */}
      <View
        className='feature-card feature-purple'
        onClick={() => Taro.navigateTo({ url: '/pages/quiz/index' })}
      >
        <Text className='feat-emoji'>🧩</Text>
        <View className='feat-body'>
          <Text className='feat-title'>{t.features.quiz}</Text>
          <Text className='feat-desc'>{fmt(t.features.quizDesc, { n: totalQuizCount })}</Text>
          <Text className='feat-meta'>{t.features.quizMeta}</Text>
        </View>
        <Text className='feat-arrow'>→</Text>
      </View>

      {/* ==================== 5. 词汇附录 ==================== */}
      <View
        className='feature-card feature-green'
        onClick={() => Taro.navigateTo({ url: '/pages/glossary/index' })}
      >
        <Text className='feat-emoji'>📖</Text>
        <View className='feat-body'>
          <Text className='feat-title'>{t.features.glossary}</Text>
          <Text className='feat-desc'>{fmt(t.features.glossaryDesc, { n: totalTerms })}</Text>
          <Text className='feat-meta'>{t.features.glossaryMeta}</Text>
        </View>
        <Text className='feat-arrow'>→</Text>
      </View>

      {/* ==================== 6. 今日财经 Top 10 ==================== */}
      <View className='news-block'>
        <View className='section-header'>
          <Text className='section-tag'>{t.features.news}</Text>
          <Text
            className='section-link'
            onClick={() => Taro.navigateTo({ url: '/pages/news/index' })}
          >
            {t.features.newsLink}
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

      <View className='footer-note'>
        <Text>{t.common.bookCopyright}</Text>
      </View>
    </ScrollView>
  )
}
