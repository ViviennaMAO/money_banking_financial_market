import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useMemo } from 'react'
import Taro from '@tarojs/taro'
import { ch25Snapshots, type PredictDef } from '../../utils/snapshots'
import { policyExpectation } from '../../utils/formulas'
import SnapshotBar from '../../components/SnapshotBar'
import SliderRow from '../../components/SliderRow'
import PredictModal from '../../components/PredictModal'
import RevealModal from '../../components/RevealModal'
import { useT } from '../../i18n'
import './index.scss'

interface InsightCard {
  emoji: string
  title: string
  year: string
  desc: string
  example: string
}

const insights: InsightCard[] = [
  {
    emoji: '⚡', title: '卢卡斯批判', year: '1976',
    desc: '基于历史数据估计的政策乘数,在政策本身改变后不再适用。',
    example: '例:用 1980 数据估的 QE 通胀效应,在 2008 实测中失效。'
  },
  {
    emoji: '⏰', title: '时间不一致性', year: 'Kydland-Prescott 1977',
    desc: '今天的最优政策 ≠ 明天的最优。央行如果可以"反悔",理性公众会预期反悔。',
    example: '例:Fed 承诺"加息打通胀",但实际 1973-79 屡次让步 → 公众不信任。'
  },
  {
    emoji: '🛡️', title: '可信度溢价', year: 'Barro-Gordon 1983',
    desc: '可信的央行能用更小的政策力度达成相同效果。可信度本身是"政策资本"。',
    example: '例:沃尔克 1982 后,Fed 加息预期一发布就降通胀,不需真加。'
  },
  {
    emoji: '🎯', title: '理性预期', year: 'Lucas-Sargent',
    desc: '公众用所有可用信息预测,政策只有"未预期到"的部分有真实效果。',
    example: '例:Fed "前瞻指引"提前透露意图 → 政策效果在公布瞬间就被定价。'
  }
]

export default function Ch25Page() {
  const { t, locale, toggle } = useT()
  const S = (zh: string, en: string) => (locale === 'en' ? en : zh)
  const [params, setParams] = useState({
    policyStrength: 30, expectedness: 65, credibility: 75
  })
  const [note, setNote] = useState('')
  const [flash, setFlash] = useState(false)
  const [predict, setPredict] = useState<PredictDef | null>(null)
  const [reveal, setReveal] = useState<{ headline: string; msg: string; correct: boolean } | null>(null)
  const [pendingSnap, setPendingSnap] = useState<string | null>(null)

  const result = useMemo(
    () => policyExpectation(params.policyStrength, params.expectedness, params.credibility),
    [params]
  )

  function loadSnapshot(key: string) {
    const s = ch25Snapshots[key]
    if (s.predict) {
      setPredict(s.predict)
      setPendingSnap(key)
      return
    }
    applySnapshot(key)
  }

  function applySnapshot(key: string) {
    const s = ch25Snapshots[key]
    setParams({
      policyStrength: s.policyStrength,
      expectedness: s.expectedness,
      credibility: s.credibility
    })
    setNote(s.note)
    if (s.flash) {
      setFlash(true)
      setTimeout(() => setFlash(false), 2100)
    }
  }

  function onPredictAnswer(idx: number) {
    if (!predict) return
    const correct = idx === predict.correctIdx
    setReveal({ headline: predict.revealHeadline, msg: predict.revealMsg, correct })
    setPredict(null)
  }

  function onRevealClose() {
    setReveal(null)
    if (pendingSnap) { applySnapshot(pendingSnap); setPendingSnap(null) }
  }

  Taro.useShareAppMessage(() => ({
    title: `第 25 章 · 政策实际效果 ${result.rationalActual.toFixed(1)} vs 模型预测 ${result.basePredict.toFixed(1)}`,
    path: '/pages/ch25/index'
  }))

  // 视觉宽度归一化
  const maxAbs = Math.max(Math.abs(result.basePredict), Math.abs(result.rationalActual), 1)
  const baseWidth = Math.abs(result.basePredict) / maxAbs * 100
  const realWidth = Math.abs(result.rationalActual) / maxAbs * 100

  return (
    <ScrollView scrollY className='ch25'>
      <View className='lang-switch' onClick={toggle}>
        <Text className='lang-icon'>🌐</Text>
        <Text className='lang-label'>{t.common.langSwitch}</Text>
      </View>

      <View className='page-header'>
        <Text className='page-title'>{S('🧠 卢卡斯批判 · 政策预期', '🧠 Lucas Critique · Policy Expectations')}</Text>
        <Text className='page-meta'>{S('第 25 章', 'Chapter 25')}</Text>
      </View>

      <SnapshotBar
        items={[
          { key: '1979pre', label: '1979 前 Burns' },
          { key: '1982', label: '1982 沃尔克' },
          { key: '2008', label: '2008 QE1 ⚡', accent: 'danger' },
          { key: '2020', label: '2020 FAIT' },
          { key: 'today', label: '今天', accent: 'primary' }
        ]}
        onSelect={loadSnapshot}
      />

      {/* 预测 vs 实际对比 */}
      <View className={`compare-card ${flash ? 'flash' : ''}`}>
        <Text className='compare-tag'>📊 经典模型预测 vs 理性预期下实际</Text>

        <View className='predict-row predict-classic'>
          <Text className='predict-label'>📚 经典模型预测</Text>
          <View className='predict-bar-wrap'>
            <View className={`predict-bar bar-classic ${result.basePredict < 0 ? 'neg' : ''}`} style={{ width: `${baseWidth}%` }}></View>
          </View>
          <Text className='predict-value classic'>
            {result.basePredict >= 0 ? '+' : ''}{result.basePredict.toFixed(1)}
          </Text>
        </View>

        <View className='predict-row predict-real'>
          <Text className='predict-label'>🌍 理性预期实际</Text>
          <View className='predict-bar-wrap'>
            <View className={`predict-bar bar-real ${result.rationalActual < 0 ? 'neg' : ''}`} style={{ width: `${realWidth}%` }}></View>
          </View>
          <Text className='predict-value real'>
            {result.rationalActual >= 0 ? '+' : ''}{result.rationalActual.toFixed(1)}
          </Text>
        </View>

        <View className={`surprise-row ${result.modelMisses ? 'miss-bad' : 'miss-ok'}`}>
          <Text className='surprise-label'>{result.modelMisses ? '⚠ 模型大幅误判' : '✓ 模型预测大致准确'}</Text>
          <Text className='surprise-value'>
            偏差: {result.surprise >= 0 ? '+' : ''}{result.surprise.toFixed(1)}
          </Text>
        </View>

        <View className='effectiveness-row'>
          <Text className='eff-label'>政策实际有效性</Text>
          <View className='eff-bar-wrap'>
            <View className={`eff-bar ${result.effectiveness > 60 ? 'eff-good' : result.effectiveness > 30 ? 'eff-mid' : 'eff-low'}`} style={{ width: `${result.effectiveness}%` }}></View>
          </View>
          <Text className='eff-value'>{result.effectiveness.toFixed(0)}%</Text>
        </View>
      </View>

      {note ? <Text className='ch25-note'>{note}</Text> : null}

      <View className='panel'>
        <Text className='panel-tag'>调政策三个维度</Text>
        <SliderRow label='政策力度(- 紧缩 / + 宽松)' value={params.policyStrength} unit='' min={-100} max={100} step={5}
          onChange={v => setParams(p => ({ ...p, policyStrength: Math.round(v) }))} />
        <SliderRow label='公众预期度' value={params.expectedness} unit='%' min={0} max={100} step={5}
          onChange={v => setParams(p => ({ ...p, expectedness: Math.round(v) }))} />
        <SliderRow label='央行可信度' value={params.credibility} unit='%' min={0} max={100} step={5}
          onChange={v => setParams(p => ({ ...p, credibility: Math.round(v) }))} />
      </View>

      {/* 4 大洞察 */}
      <View className='insights-card'>
        <Text className='insights-tag'>📚 现代宏观四大洞察</Text>
        {insights.map((ins, i) => (
          <View key={i} className='ins-item'>
            <Text className='ins-emoji'>{ins.emoji}</Text>
            <View className='ins-body'>
              <View className='ins-header'>
                <Text className='ins-title'>{ins.title}</Text>
                <Text className='ins-year'>{ins.year}</Text>
              </View>
              <Text className='ins-desc'>{ins.desc}</Text>
              <Text className='ins-example'>{ins.example}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* 哲学启示 */}
      <View className='philo-card'>
        <Text className='philo-tag'>🌟 这一章的哲学启示</Text>
        <Text className='philo-text'>
          整个货币金融学的"模型时代"在 1976 卢卡斯批判后被根本性重塑。
        </Text>
        <Text className='philo-bullet'>
          • **从 IS-LM 到 DSGE**:现代宏观从结构方程转向"动态随机一般均衡",显式建模预期。
        </Text>
        <Text className='philo-bullet'>
          • **从政策乘数到反应函数**:Fed 不再发布"M2 增速目标",而是发布"反应函数"(泰勒规则、点阵图)— 让公众预期可锚。
        </Text>
        <Text className='philo-bullet'>
          • **可信度优于力度**:可信的央行用预期管理就能实现政策效果,沃尔克 1982 后的 Fed 是模板。
        </Text>
        <Text className='philo-emp'>
          理论的真正力量不在"预测",而在"重塑公众的预期结构"。
        </Text>
      </View>

      <Text className='hint'>💡 切「2008 QE1 ⚡」→ 猜实际通胀 → 揭示历史模型在新政策下失效。</Text>

      {predict ? <PredictModal def={predict} onAnswer={onPredictAnswer} /> : null}
      {reveal ? <RevealModal headline={reveal.headline} msg={reveal.msg} correct={reveal.correct} onClose={onRevealClose} /> : null}
    </ScrollView>
  )
}
