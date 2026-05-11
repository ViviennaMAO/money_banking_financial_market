import { View, Text, ScrollView, Button } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import {
  loadProgress,
  dueReviews,
  completedCount,
  openedCount,
  resetProgress,
  type ProgressData
} from '../../utils/progress'
import { findChapter, parts, totalChapters } from '../../data/chapters'
import { useT, pickL } from '../../i18n'
import './index.scss'

function fmt(tpl: string, vars: Record<string, string | number>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''))
}

export default function ProgressPage() {
  const { t, locale, toggle } = useT()
  const [data, setData] = useState<ProgressData>(loadProgress())

  useEffect(() => {
    setData(loadProgress())
  }, [])

  function go(ch: number) {
    const found = findChapter(ch)
    const url = found?.chapter.pagePath || `/pages/chapter/index?ch=${ch}`
    Taro.navigateTo({ url })
  }

  function handleReset() {
    Taro.showModal({
      title: t.progressPage.resetTitle,
      content: t.progressPage.resetContent,
      cancelText: t.progressPage.resetCancel,
      confirmText: t.progressPage.resetConfirm,
      confirmColor: '#ef4444',
      success(res) {
        if (res.confirm) {
          resetProgress()
          setData(loadProgress())
          Taro.showToast({ title: t.progressPage.resetDone, icon: 'success' })
        }
      }
    })
  }

  const completed = completedCount(data)
  const opened = openedCount(data)
  const completionPct = totalChapters > 0
    ? Math.round((completed / totalChapters) * 100)
    : 0
  const due = dueReviews(data)
  const stats = Object.values(data.chapterStats).sort(
    (a, b) => b.lastOpenedAt - a.lastOpenedAt
  )

  function formatAgo(ts: number): string {
    const diff = Date.now() - ts
    const m = Math.floor(diff / 60000)
    if (m < 1) return t.progressPage.timeJustNow
    if (m < 60) return fmt(t.progressPage.timeMinAgo, { n: m })
    const h = Math.floor(m / 60)
    if (h < 24) return fmt(t.progressPage.timeHrAgo, { n: h })
    const d = Math.floor(h / 24)
    if (d < 30) return fmt(t.progressPage.timeDayAgo, { n: d })
    return new Date(ts).toLocaleDateString()
  }

  return (
    <ScrollView scrollY className='progress-page'>
      <View className='lang-switch' onClick={toggle}>
        <Text className='lang-icon'>🌐</Text>
        <Text className='lang-label'>{t.common.langSwitch}</Text>
      </View>

      {/* Hero */}
      <View className='progress-hero'>
        <Text className='hero-emoji'>📊</Text>
        <Text className='hero-title'>{t.progressPage.title}</Text>
        <Text className='hero-subtitle'>{t.progressPage.subtitle}</Text>
      </View>

      {/* 4 stat cards */}
      <View className='stat-grid'>
        <View className='stat-card stat-blue'>
          <Text className='stat-num'>{completionPct}%</Text>
          <Text className='stat-label'>{t.progressPage.statCompletion}</Text>
          <Text className='stat-sub'>{fmt(t.progressPage.statCompletionSub, { done: completed, total: totalChapters })}</Text>
        </View>
        <View className='stat-card stat-green'>
          <Text className='stat-num'>{data.streakDays}</Text>
          <Text className='stat-label'>{t.progressPage.statStreak}</Text>
          <Text className='stat-sub'>{data.lastStudyDate || t.progressPage.statStreakSubEmpty}</Text>
        </View>
        <View className='stat-card stat-amber'>
          <Text className='stat-num'>{due.length}</Text>
          <Text className='stat-label'>{t.progressPage.statDue}</Text>
          <Text className='stat-sub'>{t.progressPage.statDueSub}</Text>
        </View>
        <View className='stat-card stat-purple'>
          <Text className='stat-num'>{Math.round(data.totalMinutes)}</Text>
          <Text className='stat-label'>{t.progressPage.statMinutes}</Text>
          <Text className='stat-sub'>{fmt(t.progressPage.statMinutesSub, { n: opened })}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View className='progress-bar-block'>
        <View className='progress-bar'>
          <View
            className='progress-bar-fill'
            style={{ width: `${completionPct}%` }}
          ></View>
        </View>
        <Text className='progress-bar-meta'>
          {completionPct === 100
            ? t.progressPage.barFull
            : fmt(t.progressPage.barPartial, { n: totalChapters - completed })}
        </Text>
      </View>

      {/* Due review */}
      {due.length > 0 ? (
        <View className='section'>
          <View className='section-header'>
            <Text className='section-title'>{t.progressPage.sectionDue}</Text>
            <Text className='section-meta'>{fmt(t.progressPage.dueMeta, { n: due.length })}</Text>
          </View>
          <View className='review-list'>
            {due.slice(0, 6).map(item => {
              const ch = findChapter(item.num)?.chapter
              if (!ch) return null
              const chTitle = pickL(ch, 'title', locale)
              return (
                <View
                  key={item.num}
                  className='review-card'
                  onClick={() => go(item.num)}
                >
                  <Text className='review-emoji'>{ch.emoji}</Text>
                  <View className='review-body'>
                    <View className='review-row'>
                      <Text className='review-num'>{fmt(t.common.chapter, { n: ch.num })}</Text>
                      <Text className='review-level'>{fmt(t.progressPage.levelTpl, { n: item.level })}</Text>
                    </View>
                    <Text className='review-title'>{chTitle}</Text>
                  </View>
                  <Text className='review-go'>{t.progressPage.review} →</Text>
                </View>
              )
            })}
          </View>
        </View>
      ) : null}

      {/* Chapter matrix */}
      <View className='section'>
        <View className='section-header'>
          <Text className='section-title'>{t.progressPage.sectionMatrix}</Text>
          <Text className='section-meta'>{t.progressPage.matrixHint}</Text>
        </View>

        <View className='matrix'>
          {parts.map(part => (
            <View key={part.num} className='matrix-row'>
              <Text className='matrix-part'>{fmt(t.common.part, { n: part.num })}</Text>
              <View className='matrix-cells'>
                {part.chapters.map(ch => {
                  const stat = data.chapterStats[ch.num]
                  let cls = 'cell-locked'
                  if (stat?.completed) cls = 'cell-done'
                  else if (stat) cls = 'cell-open'
                  return (
                    <View
                      key={ch.num}
                      className={`matrix-cell ${cls}`}
                      onClick={() => go(ch.num)}
                    >
                      <Text className='cell-num'>{ch.num}</Text>
                    </View>
                  )
                })}
              </View>
            </View>
          ))}
        </View>

        <View className='matrix-legend'>
          <View className='legend-item'>
            <View className='legend-dot cell-done'></View>
            <Text className='legend-text'>{t.progressPage.legendDone}</Text>
          </View>
          <View className='legend-item'>
            <View className='legend-dot cell-open'></View>
            <Text className='legend-text'>{t.progressPage.legendOpen}</Text>
          </View>
          <View className='legend-item'>
            <View className='legend-dot cell-locked'></View>
            <Text className='legend-text'>{t.progressPage.legendLocked}</Text>
          </View>
        </View>
      </View>

      {/* Recent activity */}
      {stats.length > 0 ? (
        <View className='section'>
          <View className='section-header'>
            <Text className='section-title'>{t.progressPage.sectionRecent}</Text>
          </View>
          <View className='activity-list'>
            {stats.slice(0, 5).map(s => {
              const ch = findChapter(s.num)?.chapter
              if (!ch) return null
              const ago = formatAgo(s.lastOpenedAt)
              const chTitle = pickL(ch, 'title', locale)
              return (
                <View
                  key={s.num}
                  className='activity-card'
                  onClick={() => go(s.num)}
                >
                  <Text className='activity-emoji'>{ch.emoji}</Text>
                  <View className='activity-body'>
                    <View className='activity-row'>
                      <Text className='activity-title'>{fmt(t.common.chapter, { n: s.num })} · {chTitle}</Text>
                    </View>
                    <View className='activity-meta'>
                      <Text className='activity-time'>{ago}</Text>
                      {s.completed ? (
                        <Text className='tag-done'>{t.progressPage.tagDone}</Text>
                      ) : (
                        <Text className='tag-progress'>{t.progressPage.tagProgress}</Text>
                      )}
                      {typeof s.quizScore === 'number' ? (
                        <Text className='tag-score'>{fmt(t.progressPage.tagScore, { n: s.quizScore })}</Text>
                      ) : null}
                      {s.predictAttempts > 0 ? (
                        <Text className='tag-tries'>{fmt(t.progressPage.tagTries, { n: s.predictAttempts })}</Text>
                      ) : null}
                    </View>
                  </View>
                </View>
              )
            })}
          </View>
        </View>
      ) : null}

      {/* Cross-chapter quiz entry */}
      <View
        className='cross-test'
        onClick={() => Taro.navigateTo({ url: '/pages/quiz/index' })}
      >
        <Text className='cross-emoji'>🧩</Text>
        <View className='cross-body'>
          <Text className='cross-title'>{t.progressPage.crossTestTitle}</Text>
          <Text className='cross-desc'>{t.progressPage.crossTestDesc}</Text>
        </View>
        <Text className='cross-arrow'>→</Text>
      </View>

      {/* Danger zone */}
      <View className='danger-zone'>
        <Button className='reset-btn' onClick={handleReset}>{t.progressPage.resetBtn}</Button>
      </View>

      <View className='footer-note'>
        <Text>{t.progressPage.foot}</Text>
      </View>
    </ScrollView>
  )
}
