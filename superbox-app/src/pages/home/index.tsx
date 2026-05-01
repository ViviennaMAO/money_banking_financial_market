import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { parts, totalChapters, mvpCount, type Chapter } from '../../data/chapters'
import { totalTerms } from '../../data/glossary'
import { learningPaths } from '../../data/learning-paths'
import { newsTop10 } from '../../data/news'
import { totalQuizCount } from '../../data/chapter-quiz'
import { factorBoards, isBoardConfigured, type FactorBoard } from '../../data/factor-boards'
import {
  loadProgress,
  completedCount,
  dueReviews,
  type ProgressData
} from '../../utils/progress'
import LiveData from '../../components/LiveData'
import './index.scss'

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

  /** 跳转到外部小程序看板 */
  function openBoard(board: FactorBoard) {
    if (!isBoardConfigured(board)) {
      Taro.showModal({
        title: `${board.emoji} ${board.name}`,
        content: '该看板的小程序 appId 还未配置。在 src/data/factor-boards.ts 填入目标 appId,并把同一 appId 加到 app.config.ts 的 navigateToMiniProgramAppIdList 后即可跳转。',
        showCancel: false,
        confirmText: '我知道了'
      })
      return
    }
    Taro.navigateToMiniProgram({
      appId: board.appId,
      path: board.path,
      extraData: board.extraData,
      envVersion: 'release',
      fail: err => {
        Taro.showToast({
          title: `跳转失败:${err?.errMsg || '未知'}`,
          icon: 'none',
          duration: 2500
        })
      }
    })
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

      {/* 进度概览 + 仪表板入口(有进度时显示) */}
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

      {/* ==================== 1. 完整目录 ==================== */}
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

      {/* ==================== 2. 学习地图 ==================== */}
      <View
        className='feature-card feature-blue'
        onClick={() => Taro.navigateTo({ url: '/pages/paths/index' })}
      >
        <Text className='feat-emoji'>🗺️</Text>
        <View className='feat-body'>
          <Text className='feat-title'>学习地图</Text>
          <Text className='feat-desc'>
            打乱原教材顺序 · {learningPaths.length} 条路径按"思维模块"重组
          </Text>
          <Text className='feat-meta'>30 分钟入门 / 利率思维 / 银行倒下 / Fed 工具箱 ...</Text>
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
          <Text className='feat-title'>反预期精选</Text>
          <Text className='feat-desc'>
            {mvpCount} 章 · 每章一个"教材没说,但市场会教你"的瞬间
          </Text>
          <Text className='feat-meta'>历史快照 · 预测先行 · 互动模拟器</Text>
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
          <Text className='feat-title'>跨章测验</Text>
          <Text className='feat-desc'>
            {totalQuizCount} 题精选 · 4 层级(回忆 / 应用 / 分析 / 综合)
          </Text>
          <Text className='feat-meta'>单章精练 / 按篇抽题 / 全章随机</Text>
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
          <Text className='feat-title'>词汇附录</Text>
          <Text className='feat-desc'>
            {totalTerms} 词条 · 中英对照 · 反预期一句话定义
          </Text>
          <Text className='feat-meta'>搜索 · 8 大类 · 直达章节</Text>
        </View>
        <Text className='feat-arrow'>→</Text>
      </View>

      {/* ==================== 6. 今日财经 Top 10 ==================== */}
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

      {/* ==================== 7. 今日核心数据 + 因子看板 ==================== */}
      <View className='live-block'>
        <LiveData
          title='📡 今日核心数据'
          subtitle='FRED 数据每日同步 · 让米什金的理论看到此刻的市场'
          tiles={[
            { id: 'DFF', label: '联邦基金利率' },
            { id: 'DGS10', label: '10 年期美债' },
            { id: 'T10Y2Y', label: '2s10s 利差' },
            { id: 'MORTGAGE30US', label: '30Y 房贷利率' }
          ]}
        />

        {/* 因子看板入口 — 跳转外部小程序 */}
        <View className='boards-block'>
          <View className='boards-head'>
            <Text className='boards-title'>🔗 延伸因子看板</Text>
            <Text className='boards-desc'>跳转到对应小程序,看更细粒度的实时因子</Text>
          </View>
          <View className='boards-list'>
            {factorBoards.map(b => {
              const configured = isBoardConfigured(b)
              return (
                <View
                  key={b.id}
                  className={`board-card ${b.color} ${configured ? '' : 'board-pending'}`}
                  onClick={() => openBoard(b)}
                >
                  <Text className='board-emoji'>{b.emoji}</Text>
                  <View className='board-body'>
                    <Text className='board-name'>{b.name}</Text>
                    <Text className='board-desc'>{b.desc}</Text>
                  </View>
                  <Text className='board-arrow'>{configured ? '↗' : '⚙'}</Text>
                </View>
              )
            })}
          </View>
        </View>
      </View>

      <View className='footer-note'>
        <Text>原型 v2 · 米什金教材内容版权属 Pearson</Text>
      </View>
    </ScrollView>
  )
}
