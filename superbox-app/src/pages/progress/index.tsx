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
import { useT } from '../../i18n'
import './index.scss'

export default function ProgressPage() {
  const { t, toggle } = useT()
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
      title: '清空进度',
      content: '将清空所有学习记录和复习队列,无法恢复',
      confirmText: '清空',
      confirmColor: '#ef4444',
      success(res) {
        if (res.confirm) {
          resetProgress()
          setData(loadProgress())
          Taro.showToast({ title: '已清空', icon: 'success' })
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

      {/* 总览 4 块 */}
      <View className='stat-grid'>
        <View className='stat-card stat-blue'>
          <Text className='stat-num'>{completionPct}%</Text>
          <Text className='stat-label'>完成度</Text>
          <Text className='stat-sub'>{completed}/{totalChapters} 章</Text>
        </View>
        <View className='stat-card stat-green'>
          <Text className='stat-num'>{data.streakDays}</Text>
          <Text className='stat-label'>连续天数</Text>
          <Text className='stat-sub'>{data.lastStudyDate || '今日开始'}</Text>
        </View>
        <View className='stat-card stat-amber'>
          <Text className='stat-num'>{due.length}</Text>
          <Text className='stat-label'>待复习</Text>
          <Text className='stat-sub'>艾宾浩斯到期</Text>
        </View>
        <View className='stat-card stat-purple'>
          <Text className='stat-num'>{Math.round(data.totalMinutes)}</Text>
          <Text className='stat-label'>累计分钟</Text>
          <Text className='stat-sub'>{opened} 章打开过</Text>
        </View>
      </View>

      {/* 进度条 */}
      <View className='progress-bar-block'>
        <View className='progress-bar'>
          <View
            className='progress-bar-fill'
            style={{ width: `${completionPct}%` }}
          ></View>
        </View>
        <Text className='progress-bar-meta'>
          {completionPct === 100
            ? '🎉 全部完成 · 走完了米什金 25 章'
            : `还差 ${totalChapters - completed} 章 · 加油!`}
        </Text>
      </View>

      {/* 待复习 */}
      {due.length > 0 ? (
        <View className='section'>
          <View className='section-header'>
            <Text className='section-title'>⏰ 待复习</Text>
            <Text className='section-meta'>{due.length} 章到期</Text>
          </View>
          <View className='review-list'>
            {due.slice(0, 6).map(item => {
              const ch = findChapter(item.num)?.chapter
              if (!ch) return null
              return (
                <View
                  key={item.num}
                  className='review-card'
                  onClick={() => go(item.num)}
                >
                  <Text className='review-emoji'>{ch.emoji}</Text>
                  <View className='review-body'>
                    <View className='review-row'>
                      <Text className='review-num'>第 {ch.num} 章</Text>
                      <Text className='review-level'>L{item.level}</Text>
                    </View>
                    <Text className='review-title'>{ch.title}</Text>
                  </View>
                  <Text className='review-go'>复习 →</Text>
                </View>
              )
            })}
          </View>
        </View>
      ) : null}

      {/* 章节进度矩阵 */}
      <View className='section'>
        <View className='section-header'>
          <Text className='section-title'>🧭 章节进度</Text>
          <Text className='section-meta'>点击章节快速跳转</Text>
        </View>

        <View className='matrix'>
          {parts.map(part => (
            <View key={part.num} className='matrix-row'>
              <Text className='matrix-part'>第 {part.num} 篇</Text>
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
            <Text className='legend-text'>已完成</Text>
          </View>
          <View className='legend-item'>
            <View className='legend-dot cell-open'></View>
            <Text className='legend-text'>打开过</Text>
          </View>
          <View className='legend-item'>
            <View className='legend-dot cell-locked'></View>
            <Text className='legend-text'>未学</Text>
          </View>
        </View>
      </View>

      {/* 最近活动 */}
      {stats.length > 0 ? (
        <View className='section'>
          <View className='section-header'>
            <Text className='section-title'>🕐 最近活动</Text>
          </View>
          <View className='activity-list'>
            {stats.slice(0, 5).map(s => {
              const ch = findChapter(s.num)?.chapter
              if (!ch) return null
              const ago = formatAgo(s.lastOpenedAt)
              return (
                <View
                  key={s.num}
                  className='activity-card'
                  onClick={() => go(s.num)}
                >
                  <Text className='activity-emoji'>{ch.emoji}</Text>
                  <View className='activity-body'>
                    <View className='activity-row'>
                      <Text className='activity-title'>第 {s.num} 章 · {ch.title}</Text>
                    </View>
                    <View className='activity-meta'>
                      <Text className='activity-time'>{ago}</Text>
                      {s.completed ? (
                        <Text className='tag-done'>✓ 完成</Text>
                      ) : (
                        <Text className='tag-progress'>进行中</Text>
                      )}
                      {typeof s.quizScore === 'number' ? (
                        <Text className='tag-score'>{s.quizScore} 分</Text>
                      ) : null}
                      {s.predictAttempts > 0 ? (
                        <Text className='tag-tries'>{s.predictAttempts} 次预测</Text>
                      ) : null}
                    </View>
                  </View>
                </View>
              )
            })}
          </View>
        </View>
      ) : null}

      {/* 跨章联动测试入口 */}
      <View
        className='cross-test'
        onClick={() => Taro.navigateTo({ url: '/pages/quiz/index' })}
      >
        <Text className='cross-emoji'>🧩</Text>
        <View className='cross-body'>
          <Text className='cross-title'>跨章联动测验</Text>
          <Text className='cross-desc'>把多章知识点放在同一情景里 · 检测真正的迁移能力</Text>
        </View>
        <Text className='cross-arrow'>→</Text>
      </View>

      {/* 危险操作 */}
      <View className='danger-zone'>
        <Button className='reset-btn' onClick={handleReset}>清空所有进度</Button>
      </View>

      <View className='footer-note'>
        <Text>所有数据仅存于设备本地 · 不上传服务器</Text>
      </View>
    </ScrollView>
  )
}

function formatAgo(ts: number): string {
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60000)
  if (m < 1) return '刚刚'
  if (m < 60) return `${m} 分钟前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} 小时前`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d} 天前`
  return new Date(ts).toLocaleDateString()
}
