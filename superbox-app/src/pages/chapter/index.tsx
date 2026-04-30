import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro, { useDidShow, useShareAppMessage } from '@tarojs/taro'
import { useState } from 'react'
import { findChapter, type Chapter, type Part } from '../../data/chapters'
import { chapterContents, type ChapterContent } from '../../data/chapter-content'
import './index.scss'

export default function ChapterPage() {
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [part, setPart] = useState<Part | null>(null)
  const [content, setContent] = useState<ChapterContent | null>(null)
  const [quizPicked, setQuizPicked] = useState<number | null>(null)

  useDidShow(() => {
    const opts = Taro.getCurrentInstance().router?.params || {}
    const ch = Number(opts.ch || 0)
    const found = findChapter(ch)
    if (found) {
      setChapter(found.chapter)
      setPart(found.part)
      setContent(chapterContents[ch] || null)
      Taro.setNavigationBarTitle({
        title: `第 ${ch} 章 · ${found.chapter.title.slice(0, 12)}`
      }).catch(() => null)
    }
    setQuizPicked(null)
  })

  useShareAppMessage(() => {
    const t = chapter ? `第 ${chapter.num} 章 · ${chapter.title}` : '米什金互动学习'
    return {
      title: t,
      path: `/pages/chapter/index?ch=${chapter?.num || ''}`
    }
  })

  function navigateToChapter(num: number) {
    const found = findChapter(num)
    if (!found) return
    if (found.chapter.implemented && found.chapter.pagePath?.startsWith('/pages/ch')) {
      // MVP 三章用专属页
      Taro.navigateTo({ url: found.chapter.pagePath })
    } else {
      Taro.redirectTo({ url: `/pages/chapter/index?ch=${num}` })
    }
  }

  function goHome() {
    Taro.navigateBack().catch(() =>
      Taro.redirectTo({ url: '/pages/home/index' })
    )
  }

  if (!chapter || !part || !content) {
    return (
      <View className='chapter-loading'>
        <Text className='loading-emoji'>📖</Text>
        <Text className='loading-msg'>章节信息加载中...</Text>
        <Button className='loading-back' onClick={goHome}>返回首页</Button>
      </View>
    )
  }

  return (
    <ScrollView scrollY className='chapter'>
      {/* 章节封面 */}
      <View className='ch-cover'>
        <Text className='ch-part'>第 {part.num} 篇 · {part.title}</Text>
        <Text className='ch-emoji'>{chapter.emoji}</Text>
        <Text className='ch-num'>第 {chapter.num} 章</Text>
        <Text className='ch-title'>{chapter.title}</Text>
        <View className='ch-meta'>
          <Text className='ch-meta-item'>{'⭐'.repeat(chapter.difficulty)}</Text>
          {chapter.duration ? <Text className='ch-meta-item'>{chapter.duration}</Text> : null}
        </View>
      </View>

      {/* 导言 */}
      <View className='ch-intro'>
        <Text className='ch-intro-tag'>📖 章节导言</Text>
        <Text className='ch-intro-text'>{content.intro}</Text>
      </View>

      {/* 概念卡片(横向滚动) */}
      <View className='section'>
        <Text className='section-tag'>核心概念 · {content.concepts.length} 张卡片</Text>
        <ScrollView scrollX className='concept-scroll' enableFlex>
          {content.concepts.map((c, i) => (
            <View key={i} className='concept-card'>
              <Text className='concept-emoji'>{c.emoji}</Text>
              <Text className='concept-title'>{c.title}</Text>
              <Text className='concept-desc'>{c.desc}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* 知识检测 1 题 */}
      <View className='quiz-card'>
        <Text className='quiz-tag'>⚡ 知识检测</Text>
        <Text className='quiz-q'>{content.quiz.question}</Text>
        <View className='quiz-options'>
          {content.quiz.options.map((opt, i) => {
            const isPicked = quizPicked === i
            const isCorrect = i === content.quiz.correctIdx
            const showResult = quizPicked !== null
            const cls = showResult
              ? (isCorrect ? 'opt-correct' : (isPicked ? 'opt-wrong' : ''))
              : (isPicked ? 'opt-picked' : '')
            return (
              <Button
                key={i}
                className={`quiz-opt ${cls}`}
                onClick={() => quizPicked === null && setQuizPicked(i)}
              >
                {opt}
              </Button>
            )
          })}
        </View>
        {quizPicked !== null ? (
          <View className='quiz-result'>
            <Text className={quizPicked === content.quiz.correctIdx ? 'res-correct' : 'res-wrong'}>
              {quizPicked === content.quiz.correctIdx ? '✅ 答对了' : '❌ 再想想'}
            </Text>
            <Text className='res-explanation'>{content.quiz.explanation}</Text>
          </View>
        ) : null}
      </View>

      {/* 学完收获 */}
      <View className='takeaway-card'>
        <Text className='takeaway-tag'>🎯 学完你能带走</Text>
        {content.takeaways.map((t, i) => (
          <View key={i} className='takeaway-item'>
            <Text className='takeaway-num'>{i + 1}</Text>
            <Text className='takeaway-text'>{t}</Text>
          </View>
        ))}
      </View>

      {/* 关联章节 */}
      {content.related.length > 0 ? (
        <View className='related-card'>
          <Text className='related-tag'>🔗 相关章节</Text>
          <View className='related-list'>
            {content.related.map(rNum => {
              const rFound = findChapter(rNum)
              if (!rFound) return null
              return (
                <View
                  key={rNum}
                  className='related-item'
                  onClick={() => navigateToChapter(rNum)}
                >
                  <Text className='related-emoji'>{rFound.chapter.emoji}</Text>
                  <View className='related-body'>
                    <Text className='related-num'>第 {rNum} 章</Text>
                    <Text className='related-title'>{rFound.chapter.title}</Text>
                  </View>
                  <Text className='related-arrow'>→</Text>
                </View>
              )
            })}
          </View>
        </View>
      ) : null}

      {/* v0.2 升级提示 */}
      <View className='upgrade-note'>
        <Text className='upgrade-emoji'>🚀</Text>
        <Text className='upgrade-text'>
          这一章 v0.2 会升级为像 <Text className='emp'>第 14/17/20 章</Text>
          那样的<Text className='emp'>专属互动模拟器</Text>。先掌握核心概念,等深度版本上线。
        </Text>
      </View>

      {/* 底部操作 */}
      <View className='ch-actions'>
        <Button className='ch-btn-back' onClick={goHome}>← 返回目录</Button>
      </View>
    </ScrollView>
  )
}
