import { View, Text, ScrollView, Button } from '@tarojs/components'
import { useState, useMemo } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import {
  getChapterQuiz,
  randomQuiz,
  totalQuizCount,
  type QuizQuestion
} from '../../data/chapter-quiz'
import { findChapter, parts } from '../../data/chapters'
import { markQuiz } from '../../utils/progress'
import './index.scss'

type Mode = 'menu' | 'running' | 'result'

const LEVEL_LABEL: Record<QuizQuestion['level'], string> = {
  recall: '回忆',
  apply: '应用',
  analyze: '分析',
  synth: '综合'
}

export default function QuizPage() {
  const router = useRouter()
  const chParam = router.params.ch ? Number(router.params.ch) : undefined

  // 题目集合
  const initial = useMemo(() => {
    if (chParam) return getChapterQuiz(chParam)
    return []
  }, [chParam])

  const [questions, setQuestions] = useState<QuizQuestion[]>(initial)
  const [mode, setMode] = useState<Mode>(chParam ? 'running' : 'menu')
  const [picks, setPicks] = useState<(number | null)[]>(
    initial.map(() => null)
  )
  const [revealed, setRevealed] = useState<boolean[]>(
    initial.map(() => false)
  )

  function pick(qi: number, oi: number) {
    if (revealed[qi]) return
    setPicks(prev => prev.map((p, i) => (i === qi ? oi : p)))
  }

  function reveal(qi: number) {
    setRevealed(prev => prev.map((r, i) => (i === qi ? true : r)))
  }

  function startCrossPart(partNum?: number, count = 8) {
    const fromChapters = partNum
      ? parts.find(p => p.num === partNum)?.chapters.map(c => c.num)
      : undefined
    const qs = randomQuiz(count, fromChapters)
    setQuestions(qs)
    setPicks(qs.map(() => null))
    setRevealed(qs.map(() => false))
    setMode('running')
  }

  function startSingle(ch: number) {
    const qs = getChapterQuiz(ch)
    setQuestions(qs)
    setPicks(qs.map(() => null))
    setRevealed(qs.map(() => false))
    setMode('running')
  }

  function finish() {
    const correctCount = questions.reduce(
      (sum, q, i) => sum + (picks[i] === q.answer ? 1 : 0),
      0
    )
    const score = Math.round((correctCount / questions.length) * 100)
    if (chParam) markQuiz(chParam, score)
    setMode('result')
    setRevealed(questions.map(() => true))
  }

  function backToMenu() {
    setMode('menu')
    setQuestions([])
    setPicks([])
    setRevealed([])
  }

  // ============ 渲染 ============

  if (mode === 'menu') {
    return (
      <ScrollView scrollY className='quiz-page'>
        <View className='quiz-hero'>
          <Text className='hero-emoji'>🧩</Text>
          <Text className='hero-title'>跨章联动测验</Text>
          <Text className='hero-subtitle'>
            题库共 {totalQuizCount} 题 · 25 章 × 5 题精选
          </Text>
        </View>

        <View className='mode-section'>
          <Text className='mode-title'>🎲 随机抽题</Text>
          <View className='mode-grid'>
            <View className='mode-card mode-blue' onClick={() => startCrossPart(undefined, 8)}>
              <Text className='mode-name'>全章随机 8 题</Text>
              <Text className='mode-desc'>从 25 章 125 题中抽 8 道,检测综合掌握度</Text>
            </View>
            <View className='mode-card mode-purple' onClick={() => startCrossPart(undefined, 15)}>
              <Text className='mode-name'>全章随机 15 题</Text>
              <Text className='mode-desc'>更长形式,接近期末考体验</Text>
            </View>
          </View>
        </View>

        <View className='mode-section'>
          <Text className='mode-title'>📚 按篇抽题</Text>
          <View className='mode-grid'>
            {parts.map(p => (
              <View
                key={p.num}
                className='mode-card mode-amber'
                onClick={() => startCrossPart(p.num, 6)}
              >
                <Text className='mode-name'>第 {p.num} 篇 · 6 题</Text>
                <Text className='mode-desc'>{p.title}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className='mode-section'>
          <Text className='mode-title'>🎯 单章精练</Text>
          <Text className='mode-tip'>每章 5 道高质量精选题</Text>
          <View className='ch-grid'>
            {parts.flatMap(p => p.chapters).map(c => (
              <View
                key={c.num}
                className='ch-tile'
                onClick={() => startSingle(c.num)}
              >
                <Text className='ch-tile-emoji'>{c.emoji}</Text>
                <Text className='ch-tile-num'>第 {c.num} 章</Text>
              </View>
            ))}
          </View>
        </View>

        <View className='footer-note'>
          <Text>4 个题目层级:回忆 / 应用 / 分析 / 综合</Text>
        </View>
      </ScrollView>
    )
  }

  // result mode
  if (mode === 'result') {
    const correctCount = questions.reduce(
      (sum, q, i) => sum + (picks[i] === q.answer ? 1 : 0),
      0
    )
    const score = Math.round((correctCount / questions.length) * 100)
    return (
      <ScrollView scrollY className='quiz-page'>
        <View className={`result-hero score-${tier(score)}`}>
          <Text className='result-emoji'>{scoreEmoji(score)}</Text>
          <Text className='result-score'>{score} 分</Text>
          <Text className='result-meta'>
            {correctCount} / {questions.length} 道正确
          </Text>
          <Text className='result-comment'>{scoreComment(score)}</Text>
        </View>

        {/* 详细解析 */}
        <View className='review-list'>
          {questions.map((q, qi) => {
            const correct = picks[qi] === q.answer
            return (
              <View key={q.id} className={`review-item ${correct ? 'ok' : 'no'}`}>
                <View className='review-row'>
                  <Text className='review-no'>第 {qi + 1} 题</Text>
                  <Text className='review-tag'>第 {q.ch} 章 · {LEVEL_LABEL[q.level]}</Text>
                  <Text className='review-icon'>{correct ? '✓' : '✗'}</Text>
                </View>
                <Text className='review-q'>{q.question}</Text>
                <View className='review-opts'>
                  {q.options.map((opt, oi) => {
                    const isAnswer = oi === q.answer
                    const isPicked = oi === picks[qi]
                    let cls = 'opt-default'
                    if (isAnswer) cls = 'opt-correct'
                    else if (isPicked) cls = 'opt-wrong'
                    return (
                      <View key={oi} className={`opt ${cls}`}>
                        <Text>{opt}</Text>
                      </View>
                    )
                  })}
                </View>
                <View className='review-explain'>
                  <Text className='explain-flag'>💡</Text>
                  <Text className='explain-text'>{q.explain}</Text>
                </View>
              </View>
            )
          })}
        </View>

        <View className='action-row'>
          {chParam ? (
            <Button className='action-btn primary' onClick={() => Taro.navigateBack()}>
              返回章节
            </Button>
          ) : (
            <Button className='action-btn primary' onClick={backToMenu}>
              再来一组
            </Button>
          )}
        </View>
      </ScrollView>
    )
  }

  // running mode
  const allAnswered = picks.every(p => p !== null)
  const ch = chParam ? findChapter(chParam) : null

  return (
    <ScrollView scrollY className='quiz-page'>
      <View className='running-hero'>
        <Text className='running-title'>
          {ch ? `第 ${ch.chapter.num} 章 · ${ch.chapter.title}` : '跨章测验'}
        </Text>
        <Text className='running-meta'>{questions.length} 题 · 答完点提交查看解析</Text>
      </View>

      <View className='q-list'>
        {questions.map((q, qi) => (
          <View key={q.id} className='q-block'>
            <View className='q-head'>
              <Text className='q-no'>{qi + 1}</Text>
              <Text className='q-tag'>第 {q.ch} 章 · {LEVEL_LABEL[q.level]}</Text>
              {revealed[qi] ? (
                <Text className={`q-mark ${picks[qi] === q.answer ? 'ok' : 'no'}`}>
                  {picks[qi] === q.answer ? '✓' : '✗'}
                </Text>
              ) : null}
            </View>
            <Text className='q-stem'>{q.question}</Text>
            <View className='q-opts'>
              {q.options.map((opt, oi) => {
                const picked = picks[qi] === oi
                let cls = ''
                if (revealed[qi]) {
                  if (oi === q.answer) cls = 'opt-correct'
                  else if (picked) cls = 'opt-wrong'
                } else if (picked) cls = 'opt-picked'
                return (
                  <View
                    key={oi}
                    className={`opt ${cls}`}
                    onClick={() => pick(qi, oi)}
                  >
                    <Text>{opt}</Text>
                  </View>
                )
              })}
            </View>
            {revealed[qi] ? (
              <View className='q-explain'>
                <Text className='explain-flag'>💡</Text>
                <Text className='explain-text'>{q.explain}</Text>
              </View>
            ) : (
              <Text
                className={`q-reveal ${picks[qi] === null ? 'disabled' : ''}`}
                onClick={() => picks[qi] !== null && reveal(qi)}
              >
                {picks[qi] === null ? '请先选择' : '查看解析 →'}
              </Text>
            )}
          </View>
        ))}
      </View>

      <View className='action-row'>
        <Button
          className={`action-btn primary ${allAnswered ? '' : 'disabled'}`}
          onClick={() => allAnswered && finish()}
        >
          提交并查看总评 →
        </Button>
        <Button className='action-btn secondary' onClick={backToMenu}>
          返回选择
        </Button>
      </View>
    </ScrollView>
  )
}

function tier(score: number): 'high' | 'mid' | 'low' {
  if (score >= 80) return 'high'
  if (score >= 60) return 'mid'
  return 'low'
}

function scoreEmoji(score: number): string {
  if (score >= 90) return '🏆'
  if (score >= 80) return '🎯'
  if (score >= 60) return '✓'
  return '🌱'
}

function scoreComment(score: number): string {
  if (score >= 90) return '掌握度极高 — 已可以教别人了'
  if (score >= 80) return '熟练 · 偶尔失手是认知边界,值得回看错题'
  if (score >= 60) return '及格 · 概念已 get,深度待加强'
  return '还在路上 · 推荐先看错题对应的章节'
}
